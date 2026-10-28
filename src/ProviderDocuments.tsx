import {useEffect,useState,type FormEvent} from 'react';
import {supabase} from './lib/supabase';
import type {Tables} from './lib/database.types';

type Entry=Tables<'crm_provider_document_register'>;
const types=['Anbietervereinbarung','Angebot','Versicherungsnachweis','Bewilligung / Zertifikat','Sonstiges'];
const availability=['Nein','Teilweise','Ja','Nicht erforderlich'];
const progress=['Noch nicht angefragt','Angefragt','In Bearbeitung','Zur Unterschrift','Abgeschlossen'];

export default function ProviderDocuments({providerId}:{providerId:string}){
 const [rows,setRows]=useState<Entry[]>([]),[editing,setEditing]=useState<Entry|null>(null),[showForm,setShowForm]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function load(){const r=await supabase.from('crm_provider_document_register').select('*').eq('provider_id',providerId).order('updated_at',{ascending:false});if(r.error)throw r.error;setRows(r.data||[]);}
 useEffect(()=>{let active=true;setLoading(true);setRows([]);setShowForm(false);setEditing(null);setError('');supabase.from('crm_provider_document_register').select('*').eq('provider_id',providerId).order('updated_at',{ascending:false}).then(r=>{if(!active)return;if(r.error)setError(r.error.message);else setRows(r.data||[]);setLoading(false);});return()=>{active=false;};},[providerId]);
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=new FormData(e.currentTarget);setBusy(true);setError('');setNotice('');
  const value=(name:string)=>String(form.get(name)||'').trim();
  const data={provider_id:providerId,title:value('title'),document_type:value('document_type'),availability:value('availability'),progress:value('progress'),storage_location:value('storage_location'),responsible_person:value('responsible_person'),prepared_by:value('prepared_by'),notes:value('notes'),updated_at:new Date().toISOString()};
  try{if(!data.title)throw new Error('Bitte eine Bezeichnung eingeben.');const r=editing?await supabase.from('crm_provider_document_register').update(data).eq('id',editing.id).eq('provider_id',providerId).select('id').single():await supabase.from('crm_provider_document_register').insert(data).select('id').single();if(r.error)throw r.error;await load();setShowForm(false);setEditing(null);setNotice('Dokumentstand gespeichert.');}catch(e){setError(e instanceof Error?e.message:'Speichern fehlgeschlagen.');}finally{setBusy(false);}
 }
 return <section className="provider-documents"><h3>Dokumente & Vertragsstand</h3><p className="muted">Hier verwaltest du den Stand der Unterlagen dieses Kursanbieters. Es werden keine Dateien hochgeladen – nur Status, Zuständigkeit und ein Hinweis zum externen Ablageort.</p>
 {error&&<p className="error" role="alert">{error}</p>}{notice&&<p className="notice" role="status">{notice}</p>}
 {!showForm&&<button type="button" disabled={loading} onClick={()=>{setEditing(null);setShowForm(true);setNotice('');}}>Dokumentstand erfassen</button>}
 {showForm&&<form className="document-register-form" key={editing?.id||'new'} onSubmit={save}>
 <fieldset className="profile-field-group"><legend>Unterlage & Bearbeitungsstand</legend><div className="register-fields">
 <label>Bezeichnung<input name="title" required maxLength={200} defaultValue={editing?.title||''} placeholder="z. B. Anbietervereinbarung 2026"/></label>
 <label>Art der Unterlage<select name="document_type" defaultValue={editing?.document_type||types[0]}>{types.map(t=><option key={t}>{t}</option>)}</select></label>
 <label>Liegt uns die Unterlage vor?<select name="availability" defaultValue={editing?.availability||'Nein'}>{availability.map(t=><option key={t}>{t}</option>)}</select></label>
 <label>Bearbeitungsstand<select name="progress" defaultValue={editing?.progress||progress[0]}>{progress.map(t=><option key={t}>{t}</option>)}</select></label>
 </div></fieldset>
 <fieldset className="profile-field-group"><legend>Ablage & Zuständigkeit</legend><div className="register-fields">
 <label className="register-wide">Wo ist die Unterlage abgelegt?<input name="storage_location" maxLength={1000} defaultValue={editing?.storage_location||''} placeholder="z. B. Firmenlaufwerk / Verträge / Anbieter oder Ordner im Büro"/><small>Nur den Ablagehinweis eintragen, keine Vertragsinhalte oder Zugangsdaten.</small></label>
 <label>Verantwortliche Person<input name="responsible_person" maxLength={200} defaultValue={editing?.responsible_person||''} placeholder="Wer kümmert sich um den nächsten Schritt?"/></label>
 <label>Unterlage erstellt / bearbeitet von<input name="prepared_by" maxLength={200} defaultValue={editing?.prepared_by||''} placeholder="Name der Person oder externen Stelle"/></label>
 <label className="register-wide">Nächster Schritt / interne Notiz<textarea name="notes" maxLength={2000} defaultValue={editing?.notes||''} placeholder="z. B. Unterschrift beim Anbieter nachfragen"/></label>
 </div></fieldset>
 <div className="row-actions"><button disabled={busy}>{busy?'Speichern …':'Dokumentstand speichern'}</button><button type="button" className="secondary" disabled={busy} onClick={()=>{setShowForm(false);setEditing(null);setError('');}}>Abbrechen</button></div></form>}
 {loading?<p>Dokumentstände werden geladen …</p>:rows.length===0?<p className="muted">Noch kein Dokumentstand erfasst. Halte hier beispielsweise fest, ob die Anbietervereinbarung bereits unterschrieben vorliegt.</p>:<div className="document-register-list">{rows.map(r=><article className="document-register-card" key={r.id}><div className="register-card-heading"><div><small>{r.document_type}</small><h4>{r.title}</h4></div><button type="button" className="secondary" disabled={busy} onClick={()=>{setEditing(r);setShowForm(true);setError('');setNotice('');}}>Bearbeiten</button></div><dl className="register-data">
 <div><dt>Unterlage vorhanden</dt><dd>{r.availability}</dd></div><div><dt>Bearbeitungsstand</dt><dd>{r.progress}</dd></div>
 <div className="register-wide"><dt>Ablageort</dt><dd>{r.storage_location||'Noch nicht eingetragen'}</dd></div>
 <div><dt>Verantwortlich</dt><dd>{r.responsible_person||'Noch nicht zugeteilt'}</dd></div><div><dt>Erstellt / bearbeitet von</dt><dd>{r.prepared_by||'Noch nicht eingetragen'}</dd></div>
 {r.notes&&<div className="register-wide"><dt>Nächster Schritt / Notiz</dt><dd>{r.notes}</dd></div>}</dl><small className="muted">Stand aktualisiert am {new Date(r.updated_at).toLocaleString('de-CH')}</small></article>)}</div>}
 </section>;
}
