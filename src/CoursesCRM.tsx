import {useEffect,useState,type FormEvent} from 'react';
import {supabase} from './lib/supabase';
import type {Tables,TablesInsert} from './lib/database.types';
import {courseCategories,courseRegions,coursePayload,toLocalInput} from './lib/courses';
type Course=Tables<'courses'>;
type Provider={id:string;company:string;crm_status:string;archived_at:string|null};
const blank=()=>({title:'',description:'',category:'kunst-handwerk',region:'zug',venue:'',starts_at:'',price:'0',seats:'1',booking_url:'',provider_id:'',status:'draft'});
type Editor=ReturnType<typeof blank>&{id?:string};
const date=(v:string)=>new Date(v).toLocaleString('de-CH',{timeZone:'Europe/Zurich',dateStyle:'medium',timeStyle:'short'});
export default function CoursesCRM(){
 const [courses,setCourses]=useState<Course[]>([]),[providers,setProviders]=useState<Provider[]>([]),[editor,setEditor]=useState<Editor|null>(null);
 const [query,setQuery]=useState(''),[filter,setFilter]=useState('active'),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
 async function reload(){
  const rows:Course[]=[];
  for(let offset=0;;offset+=500){const r=await supabase.from('courses').select('*').order('starts_at').order('id').range(offset,offset+499);if(r.error)throw r.error;rows.push(...r.data);if(r.data.length<500)break;}
  setCourses(rows);
  const p=await supabase.from('Kursanbieter').select('id,company,crm_status,archived_at').eq('crm_status','Partner').is('archived_at',null).order('company');if(p.error)throw p.error;setProviders(p.data);
 }
 useEffect(()=>{reload().catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 async function perform(action:()=>Promise<void>){setBusy(true);setError('');setNotice('');try{await action();}catch(e){setError(e instanceof Error?e.message:'Kurs konnte nicht gespeichert werden.');}finally{setBusy(false);}}
 async function save(e:FormEvent){e.preventDefault();if(!editor)return;await perform(async()=>{
  const payload=coursePayload(editor) as TablesInsert<'courses'>;
  const r=editor.id?await supabase.from('courses').update(payload).eq('id',editor.id).select('id').single():await supabase.from('courses').insert(payload).select('id').single();
  if(r.error)throw r.error;await reload();setEditor(null);setNotice(payload.status==='published'?'Kurs gespeichert. Er erscheint auf der Website, solange der Termin bevorsteht und Plätze frei sind.':'Kurs als Entwurf gespeichert.');
 });}
 function edit(c:Course){setError('');setNotice('');setEditor({...c,starts_at:toLocalInput(c.starts_at),price:String(c.price),seats:String(c.seats),provider_id:c.provider_id||''});}
 async function change(c:Course,action:'publish'|'unpublish'|'archive'|'restore'){
  if(action==='publish'&&(new Date(c.starts_at).getTime()<=Date.now()||c.seats===0)){setError('Zum Veröffentlichen braucht der Kurs einen zukünftigen Termin und freie Plätze.');return;}
  if(action==='publish'&&!window.confirm(`„${c.title}“ auf der Website veröffentlichen?`))return;
  if(action==='archive'&&!window.confirm(`„${c.title}“ löschen? Der Kurs wird archiviert und von der Website entfernt.`))return;
  await perform(async()=>{const update=action==='publish'?{status:'published'}:action==='unpublish'?{status:'draft'}:action==='archive'?{archived_at:new Date().toISOString(),status:'draft'}:{archived_at:null,status:'draft'};
   const r=await supabase.from('courses').update(update).eq('id',c.id).select('id').single();if(r.error)throw r.error;await reload();setNotice(action==='archive'?'Kurs archiviert.':action==='restore'?'Kurs als Entwurf wiederhergestellt.':action==='publish'?'Kurs veröffentlicht.':'Kurs wieder als Entwurf gespeichert.');
  });
 }
 const visible=courses.filter(c=>(filter==='archived'?!!c.archived_at:!c.archived_at&&(filter==='active'||c.status===filter))&&`${c.title} ${c.venue}`.toLowerCase().includes(query.toLowerCase()));
 return <section className="panel courses-crm"><p>Erfasse Kurse und entscheide, welche auf <a href="https://sponti-switzerland.ch/kurse.html" target="_blank" rel="noopener noreferrer">Kurse entdecken ↗</a> erscheinen. Entwürfe bleiben intern. Termine und Uhrzeiten werden auf der Website in Schweizer Zeit angezeigt.</p>
 {error&&<p role="alert" className="error">{error}</p>}{notice&&<p role="status" className="notice">{notice}</p>}
 {editor?<form onSubmit={save}><div className="toolbar"><h2>{editor.id?'Kurs bearbeiten':'Neuer Kurs'}</h2><button type="button" className="secondary" disabled={busy} onClick={()=>setEditor(null)}>Abbrechen</button></div>
 <fieldset disabled={busy} className="course-fields"><div className="form-grid">
 <label>Kurstitel<input required maxLength={200} value={editor.title} onChange={e=>setEditor({...editor,title:e.target.value})}/></label>
 <label>Kursanbieter (optional)<select value={editor.provider_id} onChange={e=>setEditor({...editor,provider_id:e.target.value})}><option value="">Ohne Zuordnung</option>{editor.provider_id&&!providers.some(p=>p.id===editor.provider_id)&&<option value={editor.provider_id}>Bisheriger Anbieter (nicht mehr bestätigt)</option>}{providers.map(p=><option key={p.id} value={p.id}>{p.company}</option>)}</select></label>
 <label>Kategorie<select value={editor.category} onChange={e=>setEditor({...editor,category:e.target.value})}>{Object.entries(courseCategories).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
 <label>Region<select value={editor.region} onChange={e=>setEditor({...editor,region:e.target.value})}>{Object.entries(courseRegions).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
 <label>Adresse / Treffpunkt<input required maxLength={300} value={editor.venue} onChange={e=>setEditor({...editor,venue:e.target.value})}/></label>
 <label>Datum und Uhrzeit (deine lokale Zeit)<input required type="datetime-local" value={editor.starts_at} onChange={e=>setEditor({...editor,starts_at:e.target.value})}/></label>
 <label>Preis pro Person (CHF)<input required type="number" min="0" max="99999999.99" step="0.01" value={editor.price} onChange={e=>setEditor({...editor,price:e.target.value})}/></label>
 <label>Freie Plätze<input required type="number" min="0" max="100000" step="1" value={editor.seats} onChange={e=>setEditor({...editor,seats:e.target.value})}/></label>
 <label>Buchungslink (optional)<input type="url" maxLength={2048} placeholder="https://…" value={editor.booking_url} onChange={e=>setEditor({...editor,booking_url:e.target.value})}/></label>
 <label>Sichtbarkeit<select value={editor.status} onChange={e=>setEditor({...editor,status:e.target.value})}><option value="draft">Entwurf – nur im CRM</option><option value="published">Veröffentlicht – auf der Website</option></select></label>
 </div><label>Beschreibung<textarea maxLength={4000} value={editor.description} onChange={e=>setEditor({...editor,description:e.target.value})}/></label><p className="muted">Mit Buchungslink führt der Button direkt zur Buchung beim Anbieter. Ohne Link können Interessierte Sponti beitreten und Kursinfos erhalten.</p><button>{busy?'Speichern …':'Kurs speichern'}</button></fieldset></form>:
 <><div className="toolbar"><input aria-label="Kurse suchen" placeholder="Kurs oder Ort suchen …" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Kurse filtern" value={filter} onChange={e=>setFilter(e.target.value)}><option value="active">Alle aktiven Kurse</option><option value="draft">Entwürfe</option><option value="published">Veröffentlicht</option><option value="archived">Archiv</option></select><button disabled={busy||loading} onClick={()=>{setEditor(blank());setError('');setNotice('');}}>+ Kurs hinzufügen</button></div>
 {loading?<p role="status">Kurse werden geladen …</p>:<><div className="table-wrap"><table><thead><tr><th>Kurs</th><th>Termin / Ort</th><th>Preis / Plätze</th><th>Status</th><th>Aktionen</th></tr></thead><tbody>{visible.map(c=><tr key={c.id}><td><strong>{c.title}</strong><small>{courseCategories[c.category]||c.category}</small></td><td>{date(c.starts_at)}<small>{c.venue} · {courseRegions[c.region]}</small></td><td>CHF {Number(c.price).toFixed(2)}<small>{c.seats} Plätze</small></td><td><span className="badge">{c.archived_at?'Archiviert':c.status==='draft'?'Entwurf':new Date(c.starts_at).getTime()<=Date.now()?'Abgelaufen':c.seats===0?'Ausgebucht':'Veröffentlicht'}</span></td><td><div className="row-actions">{c.archived_at?<button className="secondary" disabled={busy} onClick={()=>change(c,'restore')}>Wiederherstellen</button>:<><button className="secondary" disabled={busy} onClick={()=>edit(c)}>Bearbeiten</button><button disabled={busy} onClick={()=>change(c,c.status==='draft'?'publish':'unpublish')}>{c.status==='draft'?'Veröffentlichen':'Zurück zu Entwurf'}</button><button className="danger" disabled={busy} onClick={()=>change(c,'archive')}>Löschen</button></>}</div></td></tr>)}</tbody></table></div>{visible.length===0&&<div className="empty"><h2>Noch keine passenden Kurse</h2><p>Füge deinen ersten Kurs hinzu oder ändere den Filter.</p></div>}<p className="muted">{visible.length} Kurse</p></>}
 </>}
 </section>;
}
