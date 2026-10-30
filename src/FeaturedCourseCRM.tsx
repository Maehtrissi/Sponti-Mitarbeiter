import {useEffect,useState} from 'react';
import {supabase} from './lib/supabase';
type Course={id:string;title:string;starts_at:string;status:string;seats:number;archived_at:string|null};
export default function FeaturedCourseCRM(){
 const [courses,setCourses]=useState<Course[]>([]),[choice,setChoice]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 useEffect(()=>{(async()=>{
  const [c,p]=await Promise.all([supabase.from('courses').select('id,title,starts_at,status,seats,archived_at').order('starts_at'),supabase.from('homepage_featured_course').select('course_id').eq('id',1).single()]);
  if(c.error)throw c.error;if(p.error)throw p.error;
  setCourses((c.data||[]) as Course[]);setChoice(p.data?.course_id||'');
 })().catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 const available=courses.filter(c=>!c.archived_at&&c.status==='published'&&c.seats>0&&new Date(c.starts_at).getTime()>Date.now());
 async function save(){setSaving(true);setError('');setSuccess('');try{
  if(choice&&!available.some(c=>c.id===choice))throw Error('Bitte einen aktiven, zukünftigen Kurs wählen.');
  const r=await supabase.from('homepage_featured_course').update({course_id:choice||null}).eq('id',1).select('id').single();
  if(r.error)throw r.error;setSuccess('Die Startseiten-Auswahl wurde gespeichert.');
 }catch(e){setError(e instanceof Error?e.message:'Speichern fehlgeschlagen.')}finally{setSaving(false)}}
 return <section className="panel"><h2>Startseiten-Kurs</h2><p className="muted">Bestimme, welcher Kurs im oberen Bildbereich der Startseite erscheint. Ohne Auswahl oder bei einem abgelaufenen Kurs zeigt Sponti einen allgemeinen Hinweis auf «Kurse entdecken».</p>
 {loading?<p>Lädt …</p>:<><label>Hervorgehobener Kurs<select value={choice} onChange={e=>setChoice(e.target.value)}><option value="">Kein Kurs – allgemeiner Hinweis</option>{choice&&!available.some(c=>c.id===choice)&&<option value={choice}>Bisheriger Kurs (nicht mehr verfügbar)</option>}{available.map(c=><option key={c.id} value={c.id}>{c.title} – {new Date(c.starts_at).toLocaleString('de-CH',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Zurich'})}</option>)}</select></label>
 <div className="row-actions"><button type="button" disabled={saving} onClick={()=>void save()}>{saving?'Speichern …':'Auswahl speichern'}</button><a href="https://sponti-switzerland.ch/" target="_blank" rel="noopener noreferrer">Startseite ansehen ↗</a></div></>}
 {error&&<p role="alert" className="error">{error}</p>}{success&&<p role="status" className="notice">{success}</p>}</section>;
}
