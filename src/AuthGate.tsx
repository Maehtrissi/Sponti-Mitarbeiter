import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { hasEmployeeAccess } from './lib/employeeAccess';
import './auth.css';

const Dashboard = lazy(() => import('./SupabaseCRM'));

type MfaMode = 'none' | 'setup' | 'verify' | 'ready';

export default function AuthGate() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mfaMode, setMfaMode] = useState<MfaMode>('none');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');

  const checkMfa = useCallback(async () => {
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) throw factorsError;
    const verified = factors.totp.find(f => f.status === 'verified');
    if (!verified) {
      setFactorId('');
      setMfaMode('setup');
      return;
    }
    setFactorId(verified.id);
    const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError) throw assuranceError;
    setMfaMode(assurance.currentLevel === 'aal2' ? 'ready' : 'verify');
  }, []);

  useEffect(() => {
    let active = true;
    let version = 0;
    const verify = async () => {
      const current = ++version;
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (!active || current !== version) return;
        let allowed = !authError && hasEmployeeAccess(data.user);
        if (allowed) {
          const access = await supabase.rpc('crm_is_employee');
          if (!active || current !== version) return;
          allowed = !access.error && access.data === true;
        }
        if (!allowed) {
          setUser(null);
          setMfaMode('none');
          if (!authError && data.user) setError('Dein Konto ist noch nicht für den Mitarbeiterbereich freigeschaltet.');
        } else {
          setUser(data.user);
          await checkMfa();
        }
      } catch {
        if (active && current === version) {
          setUser(null);
          setError('Die Anmeldung konnte nicht geprüft werden. Bitte versuche es erneut.');
        }
      } finally {
        if (active && current === version) setChecking(false);
      }
    };
    void verify();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        ++version;
        setUser(null);
        setMfaMode('none');
        setChecking(false);
      } else {
        setTimeout(() => { if (active) void verify(); }, 0);
      }
    });
    return () => { active = false; ++version; subscription.unsubscribe(); };
  }, [checkMfa]);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) {
        setError('Anmeldung fehlgeschlagen. Prüfe deine E-Mail-Adresse und dein Passwort.');
      } else if (!hasEmployeeAccess(data.user)) {
        setUser(null);
        await supabase.auth.signOut({ scope: 'local' });
        setError('Dein Konto ist noch nicht für den Mitarbeiterbereich freigeschaltet.');
      }
    } catch {
      setError('Keine Verbindung möglich. Bitte versuche es erneut.');
    } finally {
      setPassword('');
      setBusy(false);
    }
  };

  const beginEnrollment = async () => {
    setBusy(true);
    setError('');
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp', friendlyName: 'Sponti Mitarbeiter',
      });
      if (enrollError) throw enrollError;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
    } catch {
      setError('QR-Code konnte nicht erstellt werden. Bitte erneut versuchen.');
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !/^\\d{6}$/.test(code)) return;
    setBusy(true);
    setError('');
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId, challengeId: challenge.id, code,
      });
      if (verifyError) throw verifyError;
      setCode('');
      setQrCode('');
      await checkMfa();
    } catch {
      setError('Code ungültig oder abgelaufen. Bitte den aktuellen Code eingeben.');
    } finally {
      setBusy(false);
    }
  };

  if (checking) return <div className="auth-page" role="status">Anmeldung wird geprüft …</div>;
  if (user && mfaMode === 'ready') return (
    <Suspense fallback={<div className="auth-page">Dashboard wird geladen …</div>}>
      <Dashboard />
    </Suspense>
  );
  if (user && (mfaMode === 'setup' || mfaMode === 'verify')) return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="mfa-title">
        <a className="auth-brand" href="/">Sponti <span>Mitarbeiter</span></a>
        <h1 id="mfa-title">{mfaMode === 'setup' ? 'Google Authenticator einrichten' : 'Sicherheitscode eingeben'}</h1>
        {mfaMode === 'setup' && !qrCode && (
          <>
            <p>Schütze deinen Mitarbeiterzugang mit einem zusätzlichen Sicherheitscode. Dein bisheriges Passwort bleibt gleich.</p>
            <button className="auth-submit" type="button" disabled={busy} onClick={beginEnrollment}>
              {busy ? 'QR-Code wird erstellt …' : 'QR-Code erstellen'}
            </button>
          </>
        )}
        {mfaMode === 'setup' && qrCode && (
          <>
            <p>Öffne Google Authenticator auf deinem Handy und scanne diesen QR-Code. Gib danach den sechsstelligen Code ein.</p>
            <img src={qrCode} alt="QR-Code für die Einrichtung von Google Authenticator" style={{ display: 'block', width: 220, maxWidth: '100%', margin: '16px auto' }} />
          </>
        )}
        {(mfaMode === 'verify' || Boolean(qrCode)) && (
          <form onSubmit={confirmCode}>
            <label htmlFor="mfa-code">Sechsstelliger Sicherheitscode</label>
            <input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\\D/g, ''))} disabled={busy} />
            <button className="auth-submit" type="submit" disabled={busy || code.length !== 6}>
              {busy ? 'Wird geprüft …' : 'Code bestätigen'}
            </button>
          </form>
        )}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="button" onClick={() => void supabase.auth.signOut()} style={{ marginTop: 18 }}>Abmelden</button>
      </section>
    </main>
  );
  if (user) return <div className="auth-page" role="status">Sicherheitsprüfung wird vorbereitet …</div>;
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <a className="auth-brand" href="/">Sponti <span>Mitarbeiter</span></a>
        <p className="auth-eyebrow">Dein Mitarbeiterbereich</p>
        <h1 id="login-title">Willkommen zurück.</h1>
        <p className="auth-intro">Melde dich mit deinem freigeschalteten Mitarbeiterkonto an.</p>
        <form onSubmit={signIn}>
          <label htmlFor="login-email">E-Mail-Adresse</label>
          <input id="login-email" name="email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="deine@email.ch" disabled={busy} />
          <label htmlFor="login-password">Passwort</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Anmelden …' : 'Anmelden'}</button>
        </form>
        <p className="auth-help">Noch keinen Zugang oder Passwort vergessen? Wende dich an die Sponti-Administration.</p>
      </section>
    </main>
  );
}
