import {useEffect,useState} from 'react';
import {supabase} from './lib/supabase';

// Löschanfragen aus dem Anbieter- und Kundenkonto ("Konto löschen" -> Anfrage + Abmelden).
type Request={id:string;user_id:string;email:string;kind:'provider'|'customer';reason:string;status:'open'|'done'|'rejected';created_at:string;resolved_at:string|null;company:string;upcoming_booked_courses:number};
const when=(v:string)=>new Date(v).toLocaleDateString('de-CH',{dateStyle:'medium'});

export default function DeletionRequestsCRM(){
 const [rows,setRows]=useState<Request[]>([]),[error,setError]=useState(''),[available,setAvailable]=useState(true),[busy,setBusy]=useState('');
 async function load(){
  const r=await supabase.rpc('crm_account_deletion_requests');
  if(r.error){setAvailable(false);return;}
  setAvailable(true);setRows((r.data||[]) as unknown as Request[]);
 }
 useEffect(()=>{void load()},[]);
 async function resolve(row:Request,status:'done'|'rejected'){
  const name=row.company||row.email;
  const text=status==='done'
   ?'Hast du das Konto von «'+name+'» gelöscht?\n\nSo gehst du vor:\n1. '+(row.kind==='provider'?'Den Anbieter im CRM unter Kursanbieter archivieren (seine Kurse verschwinden damit von der Website).':'Den Kunden im CRM unter Kunden archivieren, falls vorhanden.')+'\n2. In Supabase unter Authentication → Users den Benutzer '+row.email+' löschen.\n\nJetzt als erledigt markieren?'
   :'Löschanfrage von «'+name+'» ablehnen? Das Konto bleibt bestehen.';
  if(!window.confirm(text))return;
  setBusy(row.id);setError('');
  const r=await supabase.rpc('crm_resolve_account_deletion',{p_id:row.id,p_status:status});
  setBusy('');
  if(r.error){setError(r.error.message);return;}
  await load();
 }
 const open=rows.filter(r=>r.status==='open');
 if(!available||open.length===0)return null;
 return <section className="panel" style={{border:'1px solid #f0c9a8',background:'#fffaf5'}}>
  <div className="toolbar"><div><h2>Löschanfragen <span className="badge">{open.length}</span></h2><p className="muted">Diese Personen haben im Konto auf «Konto löschen» geklickt und wurden abgemeldet. Lösche das Konto und markiere die Anfrage danach als erledigt.</p></div></div>
  {error&&<p role="alert" className="error">{error}</p>}
  <div className="table-wrap"><table><thead><tr><th>Konto</th><th>Art</th><th>Angefragt</th><th>Hinweis</th><th>Aktion</th></tr></thead><tbody>
   {open.map(r=><tr key={r.id}>
    <td><strong>{r.company||r.email}</strong>{r.company&&<small>{r.email}</small>}</td>
    <td>{r.kind==='provider'?'Kursanbieter':'Kunde'}</td>
    <td>{when(r.created_at)}</td>
    <td>{r.upcoming_booked_courses>0?<span className="status-pill warn">{r.upcoming_booked_courses} kommende{r.upcoming_booked_courses===1?'r Kurs':' Kurse'} mit Buchungen – zuerst absagen und rückerstatten</span>:<span className="muted">Keine kommenden Kurse mit Buchungen</span>}</td>
    <td><div className="row-actions"><button disabled={busy===r.id} onClick={()=>void resolve(r,'done')}>Erledigt</button><button className="secondary" disabled={busy===r.id} onClick={()=>void resolve(r,'rejected')}>Ablehnen</button></div></td>
   </tr>)}
  </tbody></table></div>
 </section>;
}
