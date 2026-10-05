import {useEffect,useState,type FormEvent} from 'react';
import {supabase} from './lib/supabase';
import type {Tables} from './lib/database.types';

type DocumentRow=Tables<'crm_provider_documents'>;
const types=['Angebot','Anbietervereinbarung','Versicherungsnachweis','Bewilligung / Zertifikat','Sonstiges'];
const fmt=(bytes:number)=>bytes<1024*1024?`${Math.max(1,Math.round(bytes/1024))} KB`:`${(bytes/1024/1024).toFixed(1)} MB`;

export default function ProviderDocuments({providerId}:{providerId:string}){
 const [rows,setRows]=useState<DocumentRow[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function load(){setLoading(true);const r=await supabase.from('crm_provider_documents').select('*').eq('provider_id',providerId).order('created_at',{ascending:false});setLoading(false);if(r.error)throw r.error;setRows(r.data||[]);}
 useEffect(()=>{load().catch(e=>setError(e.message));},[providerId]);
 async function upload(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError('');setNotice('');
  const form=new FormData(e.currentTarget),file=form.get('file') as File,type=String(form.get('document_type')||''),valid=String(form.get('valid_until')||'');
  try{
   if(!file?.size)throw new Error('Bitte eine Datei auswählen.');
   if(file.size>15728640)throw new Error('Die Datei darf höchstens 15 MB gross sein.');
   const allowed=['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','image/jpeg','image/png'];
   if(!allowed.includes(file.type))throw new Error('Erlaubt sind PDF, Word, JPG und PNG.');
   const safe=file.name.replace(/[^a-zA-Z0-9._-]+/g,'_').slice(-180),path=`${providerId}/${crypto.randomUUID()}-${safe}`;
   const up=await supabase.storage.from('provider-documents').upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw up.error;
   const meta=await supabase.from('crm_provider_documents').insert({provider_id:providerId,file_name:file.name,storage_path:path,document_type:type,mime_type:file.type,file_size:file.size,valid_until:valid||null});
   if(meta.error){await supabase.storage.from('provider-documents').remove([path]);throw meta.error;}
   (e.currentTarget as HTMLFormElement).reset();await load();setNotice('Dokument gespeichert.');
  }catch(e){setError(e instanceof Error?e.message:'Upload fehlgeschlagen.');}finally{setBusy(false);}
 }
 async function open(row:DocumentRow){
  setError('');const r=await supabase.storage.from('provider-documents').createSignedUrl(row.storage_path,60);
  if(r.error){setError(r.error.message);return;}window.open(r.data.signedUrl,'_blank','noopener,noreferrer');
 }
 async function remove(row:DocumentRow){
  if(!window.confirm(`${row.file_name} wirklich löschen?`))return;setBusy(true);setError('');setNotice('');
  try{const f=await supabase.storage.from('provider-documents').remove([row.storage_path]);if(f.error)throw f.error;const m=await supabase.from('crm_provider_documents').delete().eq('id',row.id);if(m.error)throw m.error;await load();setNotice('Dokument gelöscht.');}catch(e){setError(e instanceof Error?e.message:'Löschen fehlgeschlagen.');}finally{setBusy(false);}
 }
 return <section className="provider-documents"><h3>Dokumente</h3><p className="muted">Verträge, Angebote und Nachweise dieses Kursanbieters. Dateien sind privat und nur für CRM-Mitarbeiter zugänglich.</p>
 {error&&<p className="error" role="alert">{error}</p>}{notice&&<p className="notice" role="status">{notice}</p>}
 <form className="document-upload" onSubmit={upload}><label>Dokumenttyp<select name="document_type" required>{types.map(t=><option key={t}>{t}</option>)}</select></label><label>Gültig bis (optional)<input name="valid_until" type="date"/></label><label className="document-file">Datei<input name="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png" required/></label><button disabled={busy}>{busy?'Speichern …':'Dokument hochladen'}</button></form>
 {loading?<p>Dokumente werden geladen …</p>:rows.length===0?<p className="muted">Noch keine Dokumente hinterlegt.</p>:<div className="document-list">{rows.map(r=><article key={r.id}><div><strong>{r.file_name}</strong><small>{r.document_type} · {fmt(r.file_size)} · hochgeladen am {new Date(r.created_at).toLocaleDateString('de-CH')}{r.valid_until?` · gültig bis ${new Date(r.valid_until+'T00:00:00').toLocaleDateString('de-CH')}`:''}</small></div><div className="row-actions"><button type="button" className="secondary" onClick={()=>open(r)}>Öffnen / herunterladen</button><button type="button" className="danger" disabled={busy} onClick={()=>remove(r)}>Löschen</button></div></article>)}</div>}
 </section>;
}