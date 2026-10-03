import React, { lazy, Suspense, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { hasEmployeeAccess } from './lib/employeeAccess';
import './auth.css';

const Dashboard = lazy(() => import('./App'));

export default function AuthGate() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let version = 0;
    const verify = async () => {
      const current = ++version;
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (!active || current !== version) return;
        const allowed = !authError && hasEmployeeAccess(data.user);
        setUser(allowed ? data.user : null);
        if (!authError && data.user && !allowed) {
          setError('Dein Konto ist noch nicht für den Mitarbeiterbereich freigeschaltet.');
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
        setChecking(false);
      } else {
        // Keep Auth callbacks synchronous to avoid a lock in the Auth client.
        setChecking(true);
        setTimeout(() => { if (active) void verify(); }, 0);
      }
    });
    return () => { active = false; ++version; subscription.unsubscribe(); };
  }, []);

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

  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    // Unmount the dashboard immediately, including any unsaved demo data.
    setUser(null);
    try {
      const { error: authError } = await supabase.auth.signOut({ scope: 'local' });
      if (authError) setError('Die Abmeldung konnte nicht abgeschlossen werden. Bitte erneut abmelden.');
    } catch {
      setError('Die Abmeldung konnte nicht abgeschlossen werden. Bitte erneut versuchen.');
    } finally {
      setBusy(false);
    }
  };

  if (checking) return <div className="auth-page" role="status">Anmeldung wird geprüft …</div>;
  if (user) return (
    <>
      <Suspense fallback={<div className="auth-page" role="status">Dashboard wird geladen …</div>}>
        <Dashboard />
      </Suspense>
      <div className="auth-account">
        <span>{user.email}</span>
        <button onClick={signOut} disabled={busy}>Abmelden</button>
      </div>
    </>
  );
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
