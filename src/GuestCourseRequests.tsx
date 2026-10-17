import {useEffect,useState} from 'react';
import {supabase} from './lib/supabase';

type Request={id:string;course_id:string;guest_name:string;guest_email:string;guest_phone:string;quantity:number;status:string;created_at:string};
export default function GuestCourseRequests(){
 const [rows,setRows]=useState<Request[]>([]),[titles,setTitles]=useState<Record<string,string>>({});
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[error,setError]=useState('');
 async function load(){
  const {data,error}=await supabase.from('guest_course_requests').select('id,course_id,guest_name,guest_email,guest_phone,quantity,status,created_at').order('created_at',{ascending:false}).limit(500);
  if(error)throw error;
  const requests=(data||[]) as Request[];setRows(requests);
  if(requests.length){
   const {data:courses,error:courseError}=await supabase.from('courses').select('id,title').in('id',[...new Set(requests.map(r=>r.course_id))]);
   if(courseError)throw courseError;setTitles(Object.fromEntries((courses||[]).map(c=>[c.id,c.title])));
  }
 }
 useEffect(()=>{load().catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 async function change(id:string,status:string){
  setBusy(id);setError('');
  const {error}=await supabase.from('guest_course_requests').update({status}).eq('id',id);
  if(error)setError(error.message);else await load().catch(e=>setError(e.message));
  setBusy('');
 }
 const pending=rows.filter(r=>r.status==='pending');
 return <section className="panel guest-requests" style={{marginBottom:24}}>
  <h2>Gast-Anmeldungen <span className="badge">{pending.length} offen</span></h2>
  <p className="muted">Anfragen ohne Kundenkonto. Ein Platz ist erst nach deiner Bestätigung verbindlich. Bitte informiere den Gast persönlich über die Bestätigung.</p>
  {loading?<p>Lädt …</p>:error?<p className="error" role="alert">{error}</p>:rows.length===0?<p className="muted">Noch keine Gast-Anmeldungen.</p>:<div className="table-wrap"><table><thead><tr><th>Kurs</th><th>Gast</th><th>Plätze</th><th>Status</th><th>Aktionen</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}>
   <td>{titles[r.course_id]||'Kurs'}<small>{new Date(r.created_at).toLocaleString('de-CH')}</small></td>
   <td><strong>{r.guest_name}</strong><small>{r.guest_email}</small><small>{r.guest_phone}</small><span className="badge">Gast</span></td>
   <td>{r.quantity}</td><td>{r.status==='pending'?'Angefragt':r.status==='confirmed'?'Bestätigt':'Storniert'}</td>
   <td><div className="row-actions">{r.status!=='confirmed'&&<button disabled={busy===r.id} onClick={()=>change(r.id,'confirmed')}>Bestätigen</button>}{r.status!=='cancelled'&&<button className="secondary" disabled={busy===r.id} onClick={()=>change(r.id,'cancelled')}>Stornieren</button>}</div></td>
  </tr>)}</tbody></table></div>}
 </section>;
}
