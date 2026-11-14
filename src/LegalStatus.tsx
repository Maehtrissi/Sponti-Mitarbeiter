import {useState,type FormEvent} from 'react';

type Note = {id:string;body:string;author:string;created_at:string};
type Props={kind:'customer'|'provider';notes:Note[];busy:boolean;onSave:(body:string)=>Promise<void>};
const prefix='[AGB-PRÜFSTATUS]';
const options=['Nicht geprüft','Nachweis geprüft','Nachweis fehlt','Klärung erforderlich','Nicht erforderlich'];

export default function LegalStatus({kind,notes,busy,onSave}:Props){
 const [status,setStatus]=useState(options[0]);
 const [version,setVersion]=useState('');
 const [reference,setReference]=useState('');
 const [error,setError]=useState('');
 const entries=notes.filter(n=>n.body.startsWith(prefix));
 const latest=entries[0];
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');
  if(status==='Nachweis geprüft' && (!version.trim() || !reference.trim())){
   setError('Für einen geprüften Nachweis müssen AGB-Version und interne Nachweisreferenz angegeben werden.');return;
  }
  const body=[prefix,`Personengruppe: ${kind==='customer'?'Kunde':'Kursanbieter'}`,`Prüfstatus: ${status}`,`AGB-Version: ${version.trim()||'Unbekannt'}`,`Nachweisreferenz: ${reference.trim()||'Keine'}`].join(' | ');
  await onSave(body);setStatus(options[0]);setVersion('');setReference('');
 }
 return <section className="detail-section">
  <h3>AGB & Freigabestatus</h3>
  <p className="muted">Hier werden nur interne Prüfvermerke gespeichert – keine Verträge oder Dateien. Ein manueller Eintrag ersetzt keinen automatisch protokollierten Nachweis der tatsächlichen AGB-Zustimmung.</p>
  <div className="panel"><strong>Aktueller dokumentierter Prüfstand</strong><p>{latest?latest.body.replace(prefix+' | ',''):'Noch kein Prüfvermerk vorhanden.'}</p>{latest&&<small className="muted">Erfasst: {new Date(latest.created_at).toLocaleString('de-CH')} · {latest.author}</small>}</div>
  <form onSubmit={submit} className="document-register-form">
   <fieldset className="profile-field-group"><legend>Prüfstand aktualisieren</legend><div className="register-fields">
    <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}>{options.map(x=><option key={x}>{x}</option>)}</select></label>
    <label>AGB-Version<input value={version} onChange={e=>setVersion(e.target.value)} maxLength={120} placeholder="z. B. Kunden-AGB 2026-11"/></label>
    <label className="register-wide">Interne Nachweisreferenz (keine Vertragsinhalte)<input value={reference} onChange={e=>setReference(e.target.value)} maxLength={300} placeholder="z. B. ID des protokollierten Registrierungsereignisses"/></label>
   </div></fieldset>
   {error&&<p role="alert" className="error">{error}</p>}
   <button type="submit" disabled={busy}>{busy?'Speichern …':'Prüfstatus speichern'}</button>
  </form>
  {entries.length>0&&<details><summary>Prüfverlauf ({entries.length})</summary>{entries.map(n=><article className="note" key={n.id}><p>{n.body.replace(prefix+' | ','')}</p><small>{n.author} · {new Date(n.created_at).toLocaleString('de-CH')}</small></article>)}</details>}
 </section>;
}
