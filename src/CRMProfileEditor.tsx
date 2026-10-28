import {useEffect,useState,type FormEvent} from 'react';
import CRMProviderMedia from './CRMProviderMedia';
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
 {key:'email',label:'Kontakt-E-Mail für Sponti',type:'email'},{key:'phone',label:'Interne Telefonnummer'},{key:'location',label:'Adresse'},
 {key:'postal_code',label:'Postleitzahl'},{key:'city',label:'Ort'},
 {key:'website',label:'Website',type:'url'},{key:'category',label:'Kategorie'},
 {key:'description',label:'Kurzbeschreibung',type:'textarea'},{key:'about_text',label:'Über uns',type:'textarea'},{key:'public_email',label:'Öffentliche E-Mail',type:'email'},
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
  Promise.resolve(supabase.rpc('crm_profile_editor',{p_kind:kind,p_contact_id:id,p_changes:null})).then(({data,error})=>{
   if(!active)return;
   if(error){setError(error.message);return;}
   const result=data as unknown as Result;setData(result);setState({...result.profile,...(result.preferences||{})});
  }).catch((e:unknown)=>{if(active)setError(String(e))}).finally(()=>{if(active)setLoading(false)});
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
    payload.specialties=readList('specialties').filter(x=>x.name?.trim()).map(x=>({...x,name:x.name.trim()}));
    payload.social_links=readList('social_links').filter(x=>x.label?.trim()||x.url?.trim()).map(x=>{
     if(!x.label?.trim())throw new Error('Bitte jeden Link beschriften.');
     let url:URL;try{url=new URL(x.url);}catch{throw new Error('Bitte eine vollständige Webadresse für jeden Link eingeben.');}
     if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error('Links müssen mit https:// oder http:// beginnen.');
     return {...x,label:x.label.trim(),url:url.href};
    });
   }
   const {data:result,error}=await supabase.rpc('crm_profile_editor',{p_kind:kind,p_contact_id:id,p_changes:payload as Json});
   if(error)throw error;
   const next=result as unknown as Result;setData(next);setState({...next.profile,...(next.preferences||{})});
   await onSaved();setNotice('Profiländerungen gespeichert.');
  }catch(e){setError(e instanceof Error?e.message:'Speichern fehlgeschlagen');}
  finally{setSaving(false)}
 }
 const field=(f:Field)=> <label key={f.key}>{f.label}
  {f.type==='textarea'?<textarea rows={3} maxLength={f.key==='about_text'?1000:f.key==='internal_notes'||f.key==='description'?3000:undefined} value={string(state[f.key])} onChange={e=>edit(f.key,e.target.value)} />:
  f.type==='select'?<select value={string(state[f.key])} onChange={e=>edit(f.key,e.target.value)}>{f.choices?.map(v=><option key={v} value={v}>{v}</option>)}</select>:
  <input type={f.type||'text'} value={string(state[f.key])} onChange={e=>edit(f.key,e.target.value)} />}
 </label>;
 const readList=(key:string):Record<string,string>[]=>Array.isArray(state[key])?(state[key] as unknown[]).filter(item=>item!==null&&(typeof item==='object'||typeof item==='string')).map(item=>typeof item==='string'?{name:item}:item as Record<string,string>):[];
 const listFields=(key:'specialties'|'social_links')=>{
  const rows=readList(key),isLink=key==='social_links',limit=isLink?20:30;
  const update=(index:number,field:string,value:string)=>edit(key,rows.map((row,i)=>i===index?{...row,[field]:value}:row));
  return <fieldset className="profile-field-group"><legend>{isLink?'Links':'Angebote & Kursarten'}</legend><p className="muted">{isLink?'Website und Buchungslink stehen oben. Weitere Links wie Instagram kannst du hier mit eigener Beschriftung hinzufügen.':'Ergänze die Kursarten und Angebote, die im Anbieterprofil vorgestellt werden.'}</p>
  {rows.map((row,i)=><div className="crm-list-row" key={i}>
   <label>{isLink?'Link-Beschriftung':'Name des Angebots'}<input required maxLength={150} value={(isLink?row.label:row.name)||''} onChange={e=>update(i,isLink?'label':'name',e.target.value)}/></label>
   {isLink?<label>Webadresse<input required type="url" maxLength={2048} value={row.url||''} placeholder="https://…" onChange={e=>update(i,'url',e.target.value)}/></label>:<label>Beschreibung (optional)<textarea maxLength={1000} value={row.description||''} onChange={e=>update(i,'description',e.target.value)}/></label>}
   <div className="row-actions"><button type="button" className="secondary" aria-label={`Eintrag ${i+1} nach oben verschieben`} disabled={i===0} onClick={()=>{const next=[...rows];[next[i-1],next[i]]=[next[i],next[i-1]];edit(key,next);}}>Nach oben</button><button type="button" className="secondary" onClick={()=>edit(key,rows.filter((_,index)=>index!==i))}>Entfernen</button></div>
  </div>)}
  <button type="button" className="secondary" disabled={rows.length>=limit} onClick={()=>edit(key,[...rows,isLink?{label:'',url:''}:{name:'',description:''}])}>{isLink?'+ Link hinzufügen':'+ Angebot hinzufügen'}</button><small className="muted"> {rows.length} von {limit}</small></fieldset>;
 };
 return <section className="crm-profile-editor">
  <h3>Profil vollständig bearbeiten</h3>
  {loading?<p>Profildaten werden geladen …</p>:error&&!data?<p role="alert" className="error">{error}</p>:
  <form onSubmit={save}><fieldset className="crm-profile-all-fields" disabled={saving}>
   {!data?.linked&&<p className="muted">Dieser Kontakt ist noch keinem Benutzerkonto zugeordnet. CRM-Stammdaten können bearbeitet werden; kontogebundene Einstellungen erscheinen nach einer Verknüpfung.</p>}
   {(kind==='customer'?[
 {title:'Persönliche Angaben',description:'Name und Telefonnummer des Kunden.',keys:['name','phone']},
 {title:'Kursinformationen',description:'Der vom Kunden gewählte Kanal für Kursinfos und Angebote.',keys:['channel']}
]:[
 {title:'Unternehmen & Standort',description:'Angaben zur Firma und ihrem Standort.',keys:['company','category','location','postal_code','city']},
 {title:'Kontakt für Sponti',description:'Ansprechperson und interne Telefonnummer für eure Zusammenarbeit.',keys:['contact_name','email','phone']},
 {title:'Öffentliche Kontaktdaten & Links',description:'Diese Angaben gehören zum öffentlichen Anbieterprofil.',keys:['public_email','public_phone','website','booking_url']},
 {title:'Unternehmen vorstellen',description:'Öffentliche Beschreibung für Interessierte.',keys:['description','about_text']},
 {title:'Interne Informationen',description:'Notizen für die Zusammenarbeit, nicht für das öffentliche Profil.',keys:['internal_notes']}
]).map(group=>{const fields=(kind==='customer'?customer:provider.filter(f=>data?.linked||!['postal_code','city','description','about_text','public_email','public_phone','booking_url','internal_notes'].includes(f.key))).filter(f=>group.keys.includes(f.key));return fields.length>0&&<fieldset className="profile-field-group" key={group.title}><legend>{group.title}</legend><p className="muted">{group.description}</p><div className="crm-profile-grid">{fields.map(field)}</div></fieldset>})}
   {kind==='customer'&&data?.linked&&<>
    <h4>Kursinteressen und gewünschte Regionen</h4>
    <div className="crm-profile-grid"><label>Ausgangsort / PLZ<input value={string(state.locality)} onChange={e=>edit('locality',e.target.value)}/></label><label>Umkreis (km)<select value={state.radius_km==null?'':String(state.radius_km)} onChange={e=>edit('radius_km',e.target.value)}>{['','5','10','20','30','50','100'].map(x=><option value={x} key={x}>{x||'Keine Einschränkung'}</option>)}</select></label></div>
    {checkboxes('Gewünschte Kategorien','categories',categories,state,setState)}
    {checkboxes('Gewünschte Regionen','regions',regions,state,setState)}
    {checkboxes('Bevorzugte Wochentage','preferred_days',days,state,setState)}
    {checkboxes('Bevorzugte Tageszeiten','preferred_times',times,state,setState)}
   </>}
   {kind==='provider'&&data?.linked&&<>{listFields('specialties')}{listFields('social_links')}</>}
   {error&&<p className="error" role="alert">{error}</p>}{notice&&<p role="status" className="notice">{notice}</p>}
   <button type="submit" disabled={saving}>{saving?'Speichert …':'Profiländerungen speichern'}</button>
  </fieldset></form>}
  {kind==='provider'&&data&&<CRMProviderMedia key={id} providerId={id}/>}

 </section>;
}
