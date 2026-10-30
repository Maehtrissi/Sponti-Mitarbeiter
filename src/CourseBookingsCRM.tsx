import {useEffect,useState} from 'react';
import {supabase} from './lib/supabase';
type Booking={id:string;course_id:string;course_title:string;guest_name:string;guest_email:string;guest_phone:string;quantity:number;total_chf:number;booking_status:string;payment_status:string;created_at:string;starts_at:string;venue:string};
type GuestRequest={id:string;course_id:string;guest_name:string;guest_email:string;guest_phone:string;quantity:number;status:string;created_at:string};
type Entry={id:string;course_id:string;course_title:string;guest_name:string;guest_email:string;guest_phone:string;quantity:number;total_chf:number|null;booking_status:string;payment_status:string;created_at:string;starts_at:string;venue:string;source:'Buchung'|'Gastanfrage'};
const date=(v:string)=>v?new Date(v).toLocaleString('de-CH',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Zurich'}):'–';
const statusLabel=(e:Entry)=>e.source==='Gastanfrage'?(e.booking_status==='pending'?'Anfrage offen – kein Platz reserviert':e.booking_status==='confirmed'?'Anfrage bestätigt':'Anfrage storniert'):(e.booking_status==='confirmed'?'Bestätigt':e.booking_status==='pending_payment'?'Zahlung offen':e.booking_status==='cancelled'?'Storniert':e.booking_status==='refunded'?'Rückerstattet':e.booking_status);
export default function CourseBookingsCRM(){
 const [rows,setRows]=useState<Entry[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true),[filter,setFilter]=useState('all'),[query,setQuery]=useState('');
 async function load(){setLoading(true);setError('');try{
  const [bookings,requests,courses]=await Promise.all([
   supabase.rpc('crm_course_bookings'),
   supabase.from('guest_course_requests').select('id,course_id,guest_name,guest_email,guest_phone,quantity,status,created_at').order('created_at',{ascending:false}).limit(500),
   supabase.from('courses').select('id,title,starts_at,venue').limit(1000)
  ]);
  if(bookings.error)throw bookings.error;if(requests.error)throw requests.error;if(courses.error)throw courses.error;
  const byId=new Map((courses.data||[]).map(c=>[c.id,c]));
  const result:Entry[]=[
   ...((bookings.data||[]) as Booking[]).map(b=>({...b,source:'Buchung' as const})),
   ...((requests.data||[]) as GuestRequest[]).map(b=>({id:b.id,course_id:b.course_id,course_title:byId.get(b.course_id)?.title||'Kurs',guest_name:b.guest_name,guest_email:b.guest_email,guest_phone:b.guest_phone,quantity:b.quantity,total_chf:null,booking_status:b.status,payment_status:'not_applicable',created_at:b.created_at,starts_at:byId.get(b.course_id)?.starts_at||'',venue:byId.get(b.course_id)?.venue||'',source:'Gastanfrage' as const}))
  ];
  result.sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());setRows(result);
 }catch(e){setError(e instanceof Error?e.message:'Anmeldungen konnten nicht geladen werden.')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 const visible=rows.filter(r=>(filter==='all'||(filter==='requests'?r.source==='Gastanfrage':filter==='bookings'?r.source==='Buchung':r.booking_status===filter))&&[r.course_title,r.guest_name,r.guest_email,r.id].some(v=>String(v||'').toLowerCase().includes(query.toLowerCase())));
 const exportCsv=()=>{const esc=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';const columns=['source','id','course_title','guest_name','guest_email','guest_phone','quantity','total_chf','booking_status','payment_status','created_at','starts_at','venue'] as const;const csv='\uFEFF'+columns.join(';')+'\r\n'+visible.map(r=>columns.map(k=>esc(r[k])).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='sponti-anmeldungen-'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(url);};
 return <section className="panel"><div className="toolbar"><div><h2>Anmeldungen und Buchungen <span className="badge">{rows.length}</span></h2><p className="muted">Alle Buchungen und bisherigen Gastanfragen in einer Übersicht. Offene Gastanfragen reservieren noch keinen Platz.</p></div><button className="secondary" onClick={()=>void load()} disabled={loading}>Aktualisieren</button></div>
 <div className="toolbar"><input aria-label="Anmeldungen suchen" placeholder="Kurs, Name, E-Mail oder Buchungsnummer" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Anmeldungen filtern" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Alle Einträge</option><option value="bookings">Buchungen</option><option value="requests">Gastanfragen</option><option value="confirmed">Bestätigt</option><option value="pending">Anfrage offen</option><option value="pending_payment">Zahlung offen</option><option value="cancelled">Storniert</option></select><button className="secondary" onClick={exportCsv} disabled={!visible.length}>CSV exportieren</button></div>
 {loading?<p role="status">Anmeldungen werden geladen …</p>:error?<p role="alert" className="error">{error}</p>:!visible.length?<p className="muted">Keine passenden Anmeldungen vorhanden.</p>:<div className="table-wrap"><table><thead><tr><th>Kurs / Termin</th><th>Teilnehmer</th><th>Personen / Betrag</th><th>Art / Status</th><th>Referenz</th></tr></thead><tbody>{visible.map(r=><tr key={r.source+r.id}><td><strong>{r.course_title}</strong><small>{date(r.starts_at)} · {r.venue}</small></td><td><strong>{r.guest_name}</strong><small>{r.guest_email}</small><small>{r.guest_phone}</small></td><td>{r.quantity} Person(en)<small>{r.total_chf===null?'Noch keine verbindliche Buchung':'CHF '+Number(r.total_chf).toFixed(2)}</small></td><td><span className="badge">{r.source}</span><small>{statusLabel(r)}</small><small>{date(r.created_at)}</small></td><td><code>{r.id}</code></td></tr>)}</tbody></table></div>}</section>;
}
