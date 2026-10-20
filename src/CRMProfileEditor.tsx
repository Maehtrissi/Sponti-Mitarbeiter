import {useEffect,useState,type FormEvent} from 'react';
import {supabase} from './lib/supabase';
import type {Json} from './lib/database.types';

type Props={contactId:string;kind:'customer'|'provider';onSaved:()=>Promise<void>};
type Result={linked:boolean;kind:string;profile:Record<string,unknown>;preferences?:Record<string,unknown>};
type Field={key:string;label:string;type?:'text'|'url'|'email'|'textarea'|'select';choices?:string[]};
const customer:Field[]=[
 {key:'name',label:'Name'},{key:'phone',label:'Telefonnummer'},
 {key:'channel',label:'Kursinfos erhalten über',type:'select',choices:['Keine','WhatsApp','E-Mail','Beides']}
];
const provider:Field[]=[
 {key:'company',label:'Unternehmen'},{key:'contact_name',label:'Kontaktperson'},
 {key:'phone',label:'Interne Telefonnummer'},{key:'location',label:'Adresse'},
 {key:'postal_code',label:'Postleitzahl'},{key:'city',label:'Ort'},
 {key:'website',label:'Website',type:'url'},{key:'category',label:'Kategorie'},
 {key:'about_text',label:'Über uns',type:'textarea'},{key:'public_email',label:'Öffentliche E-Mail',type:'email'},
 {key:'public_phone',label:'Öffentliche Telefonnummer'}, {key:'booking_url',label:'Buchungslink',type:'url'},
 {key:'internal_notes',label:'Interne Notizen',type:'textarea'}
];
const categories=[['yoga-wellness','Yoga & Wellness'],['kochen-geniessen','Kochen & Geniessen'],['kunst-handwerk','Kunst & Handwerk'],['fotografie-design','Fotografie & Design'],['tanz-bewegung','Tanz & Bewegung'],['natur-draussen','Natur & Draussen']];
const regions=[['schweiz','Ganze Schweiz'],['zug','Zug'],['zuerich','Zürich'],['luzern','Luzern'],['schwyz','Schwyz'],['aargau','Aargau'],['andere','Andere Regionen']];
const days=[['mo','Montag'],['di','Dienstag'],['mi','Mittwoch'],['do','Donnerstag'],['fr','Freitag'],['sa','Samstag'],['so','Sonntag']];
const times=[['morning','Vormittag'],['afternoon','Nachmittag'],['evening','Abend']];
function string(value:unknown){return typeof value==='string'?value:''}
function checkboxes(title:string,key:string,options:string[][],state:Record<string,unknown>,setState:(value:Record<string,unknown>)=>void){
 const selected=Array.isArray(state[key])?state[key] as string[]:[];
 const allLabels:Record<string,string>={categories:'Alle möglichen Kurse',regions:'Ganze Schweiz / alle Regionen',preferred_days:'Alle Wochentage',preferred_times:'Alle Tageszeiten'};
 const allSelected=options.every(([value])=>selected.includes(value)) || (key==='regions'&&selected.includes('schweiz'));
 return <fieldset className="crm-profile-checks"><legend>{title}</legend><div>
  <label><input type="checkbox" checked={allSelected} onChange={e=>setState({...state,[key]:e.target.checked?(key==='regions'?['schweiz']:options.map(([value])=>value)):[]})}/><strong>{allLabels[key]||'Alle'}</strong></label>
  {options.filter(([value])=>!(key==='regions'&&value==='schweiz')).map(([value,label])=><label key={value}><input type="checkbox" checked={selected.includes(value)||(key==='regions'&&selected.includes('schweiz'))} onChange={e=>setState({...state,[key]:e.target.checked?[...selected.filter(s=>s!=='schweiz'),value]:selected.filter(s=>s!==value&&s!=='schweiz')})}/>{label}</label>)}
 </div></fieldset>;
}
export default function CRMProfileEditor({contactId,kind,onSaved}:Props){
 const [data,setData]=useState<Result|null>(null);
 const [state,setState]=useState<Record<string,unknown>>({});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const id=contactId.slice(contactId.indexOf(':')+1);
 useEffect(()=>{
  let active=true;setLoading(true);setError('');setData(null);
  supabase.rpc('crm_profile_editor',{p_kind:kind,p_contact_id:id,p_changes:null}).then(({data,error})=>{
   if(!active)return;
   if(error){setError(error.message);return;}
   const result=data as unknown as Result;setData(result);setState({...result.profile,...(result.preferences||{})});
  }).catch(e=>{if(active)setError(String(e))}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[id,kind]);
 const edit=(key:string,value:unknown)=>setState(s=>({...s,[key]:value}));
 async function save(e:FormEvent){
  e.preventDefault();setSaving(true);setError('');setNotice('');
  try{
   const payload:Record<string,unknown>={};
   for(const f of kind==='customer'?customer:provider)payload[f.key]=state[f.key]??'';
   if(kind==='customer'){
    if(data?.linked){
     for(const key of ['locality','radius_km','categories','regions','preferred_days','preferred_times'])payload[key]=state[key]??(key==='radius_km'?'':key==='locality'?'':[]);
    }
   }else if(data?.linked){
    for(const key of ['specialties','social_links']){
     const raw=state['_raw_'+key];
     if(typeof raw==='string'){const parsed=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error('Angebote und Links müssen Listen sein.');payload[key]=parsed;}
     else payload[key]=state[key]??[];
    }
   }
   const {data:result,error}=await supabase.rpc('crm_profile_editor',{p_kind:kind,p_contact_id:id,p_changes:payload as Json});
   if(error)throw error;
   const next=result as unknown as Result;setData(next);setState({...next.profile,...(next.preferences||{})});
   await onSaved();setNotice('Profiländerungen gespeichert.');
  }catch(e){setError(e instanceof Error?e.message:'Speichern fehlgeschlagen');}
  finally{setSaving(false)}
 }
 const field=(f:Field)=> <label key={f.key}>{f.label}
  {f.type==='textarea'?<textarea rows={3} value={string(state[f.key])} onChange={e=>edit(f.key,e.target.value)} />:
  f.type==='select'?<select value={string(state[f.key])} onChange={e=>edit(f.key,e.target.value)}>{f.choices?.map(v=><option key={v} value={v}>{v}</option>)}</select>:
  <input type={f.type||'text'} value={string(state[f.key])} onChange={e=>edit(f.key,e.target.value)} />}
 </label>;
 const jsonField=(key:string,label:string,shape:'array')=><label>{label} (JSON)
  <textarea rows={4} value={string(state['_raw_'+key])||JSON.stringify(state[key]??[],null,2)} onChange={e=>{
   edit('_raw_'+key,e.target.value);
   try{const parsed=JSON.parse(e.target.value);if(Array.isArray(parsed))edit(key,parsed)}catch{/* validation on save */ }
  }} />
 </label>;
 return <section className="crm-profile-editor">
  <h3>Profil vollständig bearbeiten</h3>
  {loading?<p>Profildaten werden geladen …</p>:error&&!data?<p role="alert" className="error">{error}</p>:
  <form onSubmit={save}>
   {!data?.linked&&<p className="muted">Dieser Kontakt ist noch keinem Benutzerkonto zugeordnet. CRM-Stammdaten können bearbeitet werden; kontogebundene Einstellungen erscheinen nach einer Verknüpfung.</p>}
   <div className="crm-profile-grid">{(kind==='customer'?customer:provider.filter(f=>data?.linked||!['postal_code','city','about_text','public_email','public_phone','booking_url','internal_notes'].includes(f.key))).map(field)}</div>
   {kind==='customer'&&data?.linked&&<>
    <h4>Kursinteressen und gewünschte Regionen</h4>
    <div className="crm-profile-grid"><label>Ausgangsort / PLZ<input value={string(state.locality)} onChange={e=>edit('locality',e.target.value)}/></label><label>Umkreis (km)<select value={state.radius_km==null?'':String(state.radius_km)} onChange={e=>edit('radius_km',e.target.value)}>{['','5','10','20','30','50','100'].map(x=><option value={x} key={x}>{x||'Keine Einschränkung'}</option>)}</select></label></div>
    {checkboxes('Gewünschte Kategorien','categories',categories,state,setState)}
    {checkboxes('Gewünschte Regionen','regions',regions,state,setState)}
    {checkboxes('Bevorzugte Wochentage','preferred_days',days,state,setState)}
    {checkboxes('Bevorzugte Tageszeiten','preferred_times',times,state,setState)}
   </>}
   {kind==='provider'&&data?.linked&&<><h4>Angebote und Social Media</h4>
    {jsonField('specialties','Angebote','array')}
    {jsonField('social_links','Social-Media-Links','array')}
    <p className="muted">Logo, Banner und Galerie werden über die bestehende Bildverwaltung des Anbieterkontos verwaltet. Zugangsdaten und Passwörter können hier nicht eingesehen werden.</p>
   </>}
   {error&&<p className="error" role="alert">{error}</p>}{notice&&<p role="status" className="notice">{notice}</p>}
   <button type="submit" disabled={saving}>{saving?'Speichert …':'Profiländerungen speichern'}</button>
  </form>}
 </section>;
}
