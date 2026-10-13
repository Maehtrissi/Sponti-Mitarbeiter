import {useEffect,useState,type FormEvent} from 'react';
import {supabase} from './lib/supabase';
import type {Tables,TablesInsert} from './lib/database.types';
import './news.css';

type News = Tables<'homepage_news'>;
type Draft = {id?:string;title:string;body:string;label:string;link_url:string;status:string;priority:number};
const blank=():Draft=>({title:'',body:'',label:'Neu',link_url:'',status:'draft',priority:0});
const categories=['Neu','Kurse','Aktion','Info'];
const site='https://sponti-switzerland.ch';
function checkLink(raw:string) {
  const value=raw.trim();
  if (!value) return '';
  if (!(value.startsWith('/')&&!value.startsWith('//')) && !value.startsWith('https://')) {
    throw new Error('Bitte verwende einen Link mit https:// oder einen internen Pfad wie /kurse.html.');
  }
  try {
    const parsed=new URL(value,site);
    if(parsed.protocol!=='https:') throw new Error('invalid');
    return value;
  } catch {
    throw new Error('Der Link ist nicht gültig.');
  }
}
export default function NewsCRM(){
  const [items,setItems]=useState<News[]>([]);
  const [editor,setEditor]=useState<Draft|null>(null);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  async function reload(){
    const {data,error:loadError}=await supabase.from('homepage_news').select('*')
      .order('priority',{ascending:false}).order('created_at',{ascending:false});
    if(loadError)throw loadError;
    setItems(data||[]);
  }
  useEffect(()=>{let active=true;reload().catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
  async function perform(fn:()=>Promise<void>){
    setBusy(true);setError('');setNotice('');
    try{await fn();}catch(e){setError(e instanceof Error?e.message:'Änderung konnte nicht gespeichert werden.');}
    finally{setBusy(false);}
  }
  function open(item?:News){
    setError('');setNotice('');
    setEditor(item?{id:item.id,title:item.title,body:item.body,label:item.label,link_url:item.link_url,status:item.status,priority:item.priority}:blank());
  }
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!editor)return;
    await perform(async()=>{
      const payload:TablesInsert<'homepage_news'>={
        title:editor.title.trim(),body:editor.body.trim(),label:editor.label,
        link_url:checkLink(editor.link_url),status:editor.status,
        priority:Number(editor.priority),updated_at:new Date().toISOString()
      };
      if(!payload.title||payload.title.length>100)throw new Error('Bitte einen Titel mit maximal 100 Zeichen eingeben.');
      if((payload.body||'').length>280)throw new Error('Der Kurztext darf maximal 280 Zeichen lang sein.');
      if(!Number.isInteger(payload.priority)||payload.priority<0||payload.priority>100)throw new Error('Priorität muss zwischen 0 und 100 liegen.');
      const result=editor.id
        ?await supabase.from('homepage_news').update(payload).eq('id',editor.id).select('id').single()
        :await supabase.from('homepage_news').insert(payload).select('id').single();
      if(result.error)throw result.error;
      await reload();setEditor(null);
      setNotice(payload.status==='published'?'News veröffentlicht – auf der Startseite sichtbar.':'News als Entwurf gespeichert.');
    });
  }
  async function toggle(item:News){
    const published=item.status==='published';
    await perform(async()=>{
      const result=await supabase.from('homepage_news')
        .update({status:published?'draft':'published',updated_at:new Date().toISOString()})
        .eq('id',item.id).select('id').single();
      if(result.error)throw result.error;
      await reload();setNotice(published?'News von der Startseite entfernt.':'News veröffentlicht.');
    });
  }
  async function remove(item:News){
    if(!window.confirm(`„${item.title}“ dauerhaft löschen?`))return;
    await perform(async()=>{
      const result=await supabase.from('homepage_news').delete().eq('id',item.id).select('id').single();
      if(result.error)throw result.error;
      await reload();if(editor?.id===item.id)setEditor(null);
      setNotice('News gelöscht.');
    });
  }
  return <section className="panel news-crm">
    <div className="news-crm-top">
      <div>
        <h2>News auf der Sponti-Startseite</h2>
        <p className="muted">Hier verwaltest du das Board neben dem Titel auf sponti-switzerland.ch. Nur veröffentlichte Einträge sind öffentlich sichtbar. Höhere Prioritäten erscheinen zuerst.</p>
      </div>
      <button type="button" disabled={busy} onClick={()=>open()}>+ Neue News</button>
    </div>
    {error&&<p className="error" role="alert">{error}</p>}
    {notice&&<p className="notice" role="status">{notice}</p>}
    {editor&&<form className="news-crm-editor" onSubmit={save}>
      <div className="news-crm-top"><h3>{editor.id?'News bearbeiten':'Neue News erstellen'}</h3><button type="button" className="secondary" disabled={busy} onClick={()=>setEditor(null)}>Abbrechen</button></div>
      <label>Titel<input required maxLength={100} value={editor.title} onChange={e=>setEditor({...editor,title:e.target.value})} placeholder="Zum Beispiel: Neue Kurse in Zug" /></label>
      <label>Kurztext<textarea maxLength={280} rows={3} value={editor.body} onChange={e=>setEditor({...editor,body:e.target.value})} placeholder="Worum geht es?" /></label>
      <div className="news-crm-fields">
        <label>Kategorie<select value={editor.label} onChange={e=>setEditor({...editor,label:e.target.value})}>{categories.map(label=><option key={label}>{label}</option>)}</select></label>
        <label>Status<select value={editor.status} onChange={e=>setEditor({...editor,status:e.target.value})}><option value="draft">Entwurf</option><option value="published">Veröffentlicht</option></select></label>
        <label>Priorität (0–100)<input type="number" min={0} max={100} step={1} value={editor.priority} onChange={e=>setEditor({...editor,priority:Number(e.target.value)})}/></label>
      </div>
      <label>Link (optional)<input type="text" maxLength={2048} value={editor.link_url} onChange={e=>setEditor({...editor,link_url:e.target.value})} placeholder="/kurse.html oder https://..." /></label>
      <p className="muted">Bei einem Link kann man die News direkt anklicken. Ohne Link erscheint sie als Information.</p>
      <button disabled={busy} type="submit">{busy?'Speichern …':editor.status==='published'?'News speichern & veröffentlichen':'Entwurf speichern'}</button>
    </form>}
    {loading?<p role="status">News werden geladen …</p>:items.length===0?<div className="empty"><h2>Noch keine News</h2><p>Erstelle deine erste Nachricht für das Board auf der Sponti-Startseite.</p></div>:<div className="news-crm-list">
      {items.map(item=><article key={item.id} className="news-crm-item">
        <div className="news-crm-item-copy">
          <div className="news-crm-meta"><span className={item.status==='published'?'news-crm-published':'news-crm-draft'}>{item.status==='published'?'Veröffentlicht':'Entwurf'}</span><span>{item.label}</span><span>Priorität {item.priority}</span></div>
          <h3>{item.title}</h3>
          {item.body&&<p>{item.body}</p>}
          {item.link_url&&<small>Link: {item.link_url}</small>}
        </div>
        <div className="row-actions">
          <button type="button" className="secondary" disabled={busy} onClick={()=>open(item)}>Bearbeiten</button>
          <button type="button" className="secondary" disabled={busy} onClick={()=>toggle(item)}>{item.status==='published'?'Verbergen':'Veröffentlichen'}</button>
          <button type="button" className="danger" disabled={busy} onClick={()=>remove(item)}>Löschen</button>
        </div>
      </article>)}
    </div>}
  </section>;
}
