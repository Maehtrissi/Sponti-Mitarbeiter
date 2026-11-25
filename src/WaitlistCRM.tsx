import {useEffect,useState} from 'react';
import {supabase} from './lib/supabase';

// Platzanfragen (Warteliste) für ausgebuchte Kurse. Die Vergabe läuft automatisch in der Datenbank:
// Wird ein Platz frei, wird er für die früheste passende Anfrage reserviert und per E-Mail angeboten.
type Entry={id:string;course_id:string;guest_name:string;guest_email:string;guest_phone:string;quantity:number;status:string;offer_expires_at:string|null;held_quantity:number;created_at:string};
const labels:Record<string,string>={waiting:'Wartet',offered:'Platz reserviert',booked:'Gebucht',expired:'Abgelaufen',cancelled:'Gelöscht'};
const fmt=(v:string)=>new Date(v).toLocaleString('de-CH',{dateStyle:'short',timeStyle:'short'});

export default function WaitlistCRM(){
 const [rows,setRows]=useState<Entry[]>([]),[courses,setCourses]=useState<Record<string,{title:string;starts_at:string}>>({});
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[showAll,setShowAll]=useState(false);
 async function load(){
  const since=new Date(Date.now()-30*24*3600*1000).toISOString();
  const {data,error}=await supabase.from('course_waitlist')
   .select('id,course_id,guest_name,guest_email,guest_phone,quantity,status,offer_expires_at,held_quantity,created_at')
   .gte('created_at',since).order('created_at',{ascending:true}).limit(500);
  if(error)throw error;
  const entries=(data||[]) as Entry[];setRows(entries);
  if(entries.length){
   const {data:list,error:courseError}=await supabase.from('courses').select('id,title,starts_at').in('id',[...new Set(entries.map(r=>r.course_id))]);
   if(courseError)throw courseError;
   setCourses(Object.fromEntries((list||[]).map(c=>[c.id,{title:c.title,starts_at:c.starts_at}])));
  }
 }
 useEffect(()=>{load().catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 const active=rows.filter(r=>r.status==='waiting'||r.status==='offered');
 const shown=showAll?[...rows].reverse():active;
 const position=(r:Entry)=>r.status!=='waiting'?null:rows.filter(x=>x.course_id===r.course_id&&x.status==='waiting'&&x.created_at<=r.created_at).length;
 return <section className="panel guest-requests" style={{marginBottom:24}}>
  <h2>Platzanfragen <span className="badge">{active.length} aktiv</span></h2>
  <p className="muted">Kunden, die für einen ausgebuchten Kurs einen Platz angefragt haben. Wird ein Platz frei, reserviert Sponti ihn automatisch für die früheste passende Anfrage (bis 12 Stunden) und schickt den Buchungslink per E-Mail. Du musst nichts bestätigen.</p>
  {loading?<p>Lädt …</p>:error?<p className="error" role="alert">{error}</p>:shown.length===0?<p className="muted">{showAll?'In den letzten 30 Tagen gab es keine Platzanfragen.':'Zurzeit keine offenen Platzanfragen.'}</p>:<div className="table-wrap"><table><thead><tr><th>Kurs</th><th>Kunde</th><th>Plätze</th><th>Status</th></tr></thead><tbody>{shown.map(r=>{const c=courses[r.course_id];const pos=position(r);return <tr key={r.id}>
   <td>{c?.title||'Kurs'}<small>{c?fmt(c.starts_at):''}</small></td>
   <td><strong>{r.guest_name}</strong><small><a href={`mailto:${r.guest_email}`}>{r.guest_email}</a></small>{r.guest_phone&&<small>{r.guest_phone}</small>}<small>Angefragt {fmt(r.created_at)}</small></td>
   <td>{r.quantity}</td>
   <td>{labels[r.status]||r.status}{pos&&<small>Platz {pos} auf der Warteliste</small>}{r.status==='offered'&&r.offer_expires_at&&<small>reserviert bis {fmt(r.offer_expires_at)}</small>}</td>
  </tr>})}</tbody></table></div>}
  {!loading&&!error&&rows.length>0&&<button type="button" className="secondary" onClick={()=>setShowAll(!showAll)}>{showAll?'Nur aktive anzeigen':'Alle der letzten 30 Tage anzeigen'}</button>}
 </section>;
}
