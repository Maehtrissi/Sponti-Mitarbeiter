import {useEffect,useState} from 'react';
import {supabase} from './lib/supabase';
import type {Json} from './lib/database.types';
type Photo={id:string;storage_path:string};
type Media={linked:boolean;media_user_id?:string;profile:Record<string,unknown>;photos?:Photo[]};
const bucket=supabase.storage.from('provider-gallery');
const url=(path:string)=>bucket.getPublicUrl(path).data.publicUrl;
export default function CRMProviderMedia({providerId}:{providerId:string}){
 const [data,setData]=useState<Media|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 useEffect(()=>{let active=true;setData(null);setError('');Promise.resolve(supabase.rpc('crm_profile_editor',{p_kind:'provider',p_contact_id:providerId,p_changes:null})).then(r=>{if(!active)return;if(r.error)setError(r.error.message);else setData(r.data as unknown as Media);}).catch(e=>{if(active)setError(String(e));});return()=>{active=false;};},[providerId]);
 async function update(changes:Record<string,unknown>){const r=await supabase.rpc('crm_profile_editor',{p_kind:'provider',p_contact_id:providerId,p_changes:changes as Json});if(r.error)throw r.error;setData(r.data as unknown as Media);}
 async function upload(file:File|undefined,target:'logo_path'|'banner_path'|'gallery'){
  if(!file||!data?.media_user_id)return;setError('');setNotice('');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024||!file.size){setError('Bitte ein JPG-, PNG- oder WebP-Bild bis 5 MB auswählen.');return;}
  if(target==='gallery'&&(data.photos?.length||0)>=5){setError('Maximal fünf Galeriefotos pro Anbieter.');return;}
  setBusy(true);const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';const path=data.media_user_id+'/'+target+'-'+crypto.randomUUID()+'.'+ext;
  let uploaded=false,attached=false;
  try{const r=await bucket.upload(path,file,{contentType:file.type,upsert:false});if(r.error)throw r.error;uploaded=true;await update(target==='gallery'?{_add_photo:path}:{[target]:path});attached=true;setNotice('Bild gespeichert und im Anbieterprofil aktualisiert.');}
  catch(e){if(uploaded&&!attached)await bucket.remove([path]);setError(e instanceof Error?e.message:'Bild konnte nicht gespeichert werden.');}finally{setBusy(false);}
 }
 async function remove(target:'logo_path'|'banner_path'|'gallery',photo?:Photo){
  if(!window.confirm(target==='gallery'?'Dieses Foto aus dem Anbieterprofil entfernen?':'Dieses Profilbild entfernen?'))return;
  setBusy(true);setError('');setNotice('');
  try{await update(target==='gallery'?{_remove_photo:photo!.id}:{[target]:null});setNotice('Bild aus dem Profil entfernt.');}
  catch(e){setError(e instanceof Error?e.message:'Entfernen fehlgeschlagen.');}finally{setBusy(false);}
 }
 return <section className="crm-provider-media" aria-busy={busy}><h3>Logo, Profilbanner & Bildergalerie</h3><p className="muted">Diese Bilder erscheinen im öffentlichen Anbieterprofil. JPG, PNG oder WebP, jeweils höchstens 5 MB. Bildänderungen werden sofort gespeichert.</p>
 {error&&<p role="alert" className="error">{error}</p>}{notice&&<p role="status" className="notice">{notice}</p>}
 {!data?!error&&<p>Bilder werden geladen …</p>:!data.linked?<p className="muted">Für Bilder muss der Anbieter zuerst mit seinem Anbieterkonto verknüpft sein.</p>:<>
 <div className="crm-media-identity">{(['logo_path','banner_path'] as const).map(key=>{const path=typeof data.profile[key]==='string'?data.profile[key] as string:'';const name=key==='logo_path'?'Logo':'Profilbanner';return <article key={key} className={'crm-media-card '+(key==='logo_path'?'is-logo':'is-banner')}><h4>{name}</h4>{path?<img src={url(path)} alt={name}/>:<div className="crm-media-empty">{key==='logo_path'?'Noch kein Logo':'Sponti-Standardbanner wird verwendet'}</div>}<label>{path?name+' ersetzen':name+' hinzufügen'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';void upload(file,key);}}/></label>{path&&<button type="button" className="secondary" disabled={busy} onClick={()=>remove(key)}>{name} entfernen</button>}</article>;})}</div>
 <h4>Einblicke · {data.photos?.length||0} von 5 Bildern</h4><p className="muted">Zeige Räume, Kursmomente oder Beispiele aus dem Angebot.</p>
 <div className="crm-media-gallery">{data.photos?.map(photo=><article className="crm-media-card" key={photo.id}><a href={url(photo.storage_path)} target="_blank" rel="noopener noreferrer"><img src={url(photo.storage_path)} alt="Galeriebild des Anbieters"/></a><button type="button" className="secondary" disabled={busy} onClick={()=>remove('gallery',photo)}>Foto entfernen</button></article>)}</div>
 <label>Galeriefoto hinzufügen<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy||(data.photos?.length||0)>=5} onChange={e=>{const file=e.target.files?.[0];e.target.value='';void upload(file,'gallery');}}/></label>
 </>}
 </section>;
}
