import {useEffect, useState, type FormEvent, type ReactNode} from 'react';
import './crm.css';
import {categories,isApprovedProvider,isProviderRequest} from './lib/crmMapping';
import ProviderDocuments from './ProviderDocuments';

type Contact = {id: string; kind: 'customer'|'provider'; name: string; email: string; phone: string; company: string; interest: string; channel: string; offer_type: string; status: string; message: string; source: string; created_at: string; archived_at?:string|null; website_url?:string;location?:string};
type ProviderCourse={id:string;title:string;starts_at:string;venue:string;status:string};
type CourseContext={providerId?:string;create?:boolean;assign?:boolean};
type Note = {id:string; body:string; author:string; created_at:string};
type Task = {id:string; title:string; due_date:string; done:number; contact_name:string|null; contact_id:string|null};
type Session = {email:string; csrf:string};
type InternalFile = {id:string; name:string; mime_type:string; size:number; uploaded_by:string; created_at:string};
const statuses = {customer:['Aktiv','Pausiert'], provider:['Neu','Kontaktiert','Gespräch','Partner','Abgelehnt']};
const blank = (kind:Contact['kind']):Contact => ({id:'',kind,name:'',email:'',phone:'',company:'',interest:'',channel:'',offer_type:'',status:statuses[kind][0],message:'',source:'CRM',created_at:''});
export type CRMRequest = <T>(path:string, csrf?:string, method?:string, data?:unknown)=>Promise<T>;
async function serverApi<T>(path:string, csrf='', method='GET', data?:unknown):Promise<T> {
  const response = await fetch(`/api/${path}`, {method, credentials:'same-origin', headers:{...(data ? {'Content-Type':'application/json'} : {}), ...(csrf ? {'X-CSRF-Token':csrf} : {})}, body:data ? JSON.stringify(data):undefined});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Verbindung fehlgeschlagen.');
  return result;
}
const date = (value:string) => new Date(value).toLocaleDateString('de-CH');
function download(data:unknown, name:string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const link = document.createElement('a'); link.href=url; link.download=name; link.click(); URL.revokeObjectURL(url);
}
export default function IndependentCRM({request=serverApi,storageLabel='Eigene Datenbank',allowImport=true,coursesSection}:{request?:CRMRequest;storageLabel?:string;allowImport?:boolean;coursesSection?:ReactNode|((context:CourseContext)=>ReactNode)}) {
  const api = request;
  const [session,setSession] = useState<Session|null>(null);
  const [checking,setChecking] = useState(true);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [busy,setBusy] = useState(false);
  const [contacts,setContacts] = useState<Contact[]>([]);
  const [tasks,setTasks] = useState<Task[]>([]);
  const [tab,setTab] = useState('Übersicht');
  const [courseContext,setCourseContext]=useState<CourseContext>({});
  const [providerCourses,setProviderCourses]=useState<ProviderCourse[]>([]),[providerCoursesLoading,setProviderCoursesLoading]=useState(false),[providerCoursesError,setProviderCoursesError]=useState('');
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState('');
  const [selected,setSelected] = useState<Contact|null>(null);
  const [notes,setNotes] = useState<Note[]>([]);
  const [noteBody,setNoteBody] = useState('');
  const [editor,setEditor] = useState<Contact|null>(null);
  const [taskForm,setTaskForm] = useState(false);
  const [importKind,setImportKind] = useState<Contact['kind']>('customer');
  const [files,setFiles] = useState<InternalFile[]>([]);
  useEffect(()=> {api<Session>('session').then(setSession).catch(e=>setError(e.message)).finally(()=>setChecking(false));},[]);
  async function reload() {
    const [c,t] = await Promise.all([api<Contact[]>('contacts'),api<Task[]>('tasks')]);
    setContacts(c); setTasks(t);
  }
  useEffect(()=> {if(session) reload().catch(e=>setError(e.message));},[session]);
  useEffect(()=> {
    setNotes([]); setNoteBody('');
    if(!selected) return;
    let active=true;
    api<Note[]>(`contacts/${selected.id}/notes`).then(n=>{if(active) setNotes(n);}).catch(e=>{if(active) setError(e.message);});
    return ()=>{active=false;};
  },[selected?.id]);
  useEffect(()=>{
    setProviderCourses([]);setProviderCoursesError('');setProviderCoursesLoading(false);
    if(selected?.kind!=='provider'||!coursesSection)return;
    let active=true;setProviderCoursesLoading(true);
    api<ProviderCourse[]>(`contacts/${selected.id}/courses`).then(rows=>{if(active)setProviderCourses(rows);}).catch(e=>{if(active)setProviderCoursesError(e.message);}).finally(()=>{if(active)setProviderCoursesLoading(false);});
    return ()=>{active=false;};
  },[selected?.id,!!coursesSection]);
  useEffect(()=> {
    if(!selected && !editor && !taskForm) return;
    const previous = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(()=>document.querySelector<HTMLElement>('[role="dialog"] input, [role="dialog"] textarea, [role="dialog"] button')?.focus(),0);
    function keyboard(e:KeyboardEvent) {
      if(e.key==='Escape' && !busy) {setSelected(null);setEditor(null);setTaskForm(false);}
      if(e.key==='Tab') {
        const elements = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"] button:not(:disabled), [role="dialog"] input:not(:disabled), [role="dialog"] select:not(:disabled), [role="dialog"] textarea:not(:disabled)'));
        const first=elements[0], last=elements[elements.length-1];
        if(e.shiftKey && document.activeElement===first) {e.preventDefault();last?.focus();}
        else if(!e.shiftKey && document.activeElement===last) {e.preventDefault();first?.focus();}
      }
    }
    document.addEventListener('keydown',keyboard);
    return ()=>{clearTimeout(timer);document.removeEventListener('keydown',keyboard);previous?.focus();};
  },[!!selected,!!editor,taskForm,busy]);
  async function perform(action:()=>Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try {await action();} catch(e) {setError(e instanceof Error ? e.message:'Vorgang fehlgeschlagen.');} finally {setBusy(false);}
  }
  function chooseTab(value:string) {setTab(value);setQuery('');setFilter('');setCourseContext({}); if(value==='Dateien') api<InternalFile[]>('files').then(setFiles).catch(e=>setError(e.message));}
  async function uploadInternalFile(file:File) {
    if(file.size>1500000) throw new Error('Die Datei darf höchstens 1,5 MB gross sein.');
    const bytes=new Uint8Array(await file.arrayBuffer()); let binary='';
    for(let i=0;i<bytes.length;i+=0x8000) binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
    await api('files',session!.csrf,'POST',{name:file.name,mime_type:file.type||'application/octet-stream',content:btoa(binary)});
    setFiles(await api<InternalFile[]>('files')); setNotice('Datei hochgeladen.');
  }
  async function downloadInternalFile(file:InternalFile) {
    const response=await fetch(`/api/files/${file.id}/download`,{credentials:'same-origin'}); if(!response.ok) throw new Error('Datei konnte nicht heruntergeladen werden.');
    const blob=await response.blob(), url=URL.createObjectURL(blob), link=document.createElement('a'); link.href=url; link.download=file.name; link.click(); URL.revokeObjectURL(url);
  }
  function openProviderCourses(contact:Contact,create=false,assign=false){chooseTab('Kurse');setCourseContext({providerId:contact.id.slice('provider:'.length),create,assign});setSelected(null);}
  async function login(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget);
    await perform(async()=>setSession(await api<Session>('login','','POST',{email:form.get('email'),password:form.get('password')})));
  }
  if(checking) return <div className="crm login"><p>Sponti wird geladen …</p></div>;
  if(!session) return <div className="crm login"><form onSubmit={login} className="login-card"><span className="brand">sponti<span>↗</span></span><p className="eyebrow">DEIN ARBEITSPLATZ</p><h1>Alles an einem Ort.</h1><p>Kunden betreuen. Anbieter begleiten. Gemeinsam mehr ermöglichen.</p><label>E-Mail<input name="email" type="email" autoComplete="username" required /></label><label>Passwort<input name="password" type="password" autoComplete="current-password" required /></label>{error && <p role="alert" className="error">{error}</p>}<button disabled={busy}>{busy?'Anmelden …':'Anmelden →'}</button></form></div>;
  const customers=contacts.filter(c=>c.kind==='customer'&&!c.archived_at), providers=contacts.filter(isApprovedProvider);
  const requests=contacts.filter(isProviderRequest);
  const pendingRequests=requests.filter(c=>c.status!=='Abgelehnt');
  const openTasks=tasks.filter(t=>!t.done);
  const kind = tab==='Kursanbieter'||tab==='Anfragen'?'provider':'customer';
  const visible=contacts.filter(c=>(tab==='Archiv'?!!c.archived_at:tab==='Kursanbieter'?isApprovedProvider(c):tab==='Anfragen'?isProviderRequest(c):c.kind===kind&&!c.archived_at) && (!filter || c.status===filter || c.channel===filter || (c.channel==='Beides' && (filter==='WhatsApp' || filter==='E-Mail'))) && `${c.name} ${c.company} ${c.email} ${c.phone} ${c.interest} ${c.location||''}`.toLowerCase().includes(query.toLowerCase()));
  async function saveContact(e:FormEvent) {
    e.preventDefault(); if(!editor) return;
    await perform(async()=> {
      await api(editor.id?`contacts/${editor.id}`:'contacts',session!.csrf,editor.id?'PUT':'POST',editor);
      await reload();
      if(editor.kind==='provider') chooseTab(editor.status==='Partner'?'Kursanbieter':'Anfragen');
      setEditor(null);setSelected(null);setNotice('Kontakt gespeichert.');
    });
  }
  async function approveProvider(contact:Contact) {
    if(!window.confirm(`${contact.company||contact.name} als Kursanbieter bestätigen? Das Unternehmen wird danach unter Kursanbieter geführt.`)) return;
    await perform(async()=> {
      await api(`contacts/${contact.id}/approve`,session!.csrf,'POST',{});
      await reload();setSelected(null);setEditor(null);
      setNotice(`${contact.company||contact.name} wurde bestätigt und zu den Kursanbietern verschoben.`);
    });
  }
  async function archiveContact(contact:Contact,restore=false) {
    if(!restore && !window.confirm(`${contact.company||contact.name} löschen? Der Kontakt wird ins Archiv verschoben und kann wiederhergestellt werden.`)) return;
    await perform(async()=> {
      await api(`contacts/${contact.id}${restore?'/restore':''}`,session!.csrf,restore?'POST':'DELETE',{});
      await reload();setSelected(null);setEditor(null);
      setNotice(restore?'Kontakt wiederhergestellt.':'Kontakt gelöscht und ins Archiv verschoben.');
    });
  }
  const input = (key:keyof Contact,label:string,type='text',required=false) => <label>{label}<input type={type} value={editor?.[key] || ''} required={required} maxLength={key==='website_url'?2048:key==='location'?300:500} onChange={e=>setEditor(v=>v?{...v,[key]:e.target.value}:v)} /></label>;
  const select = (key:keyof Contact,label:string,options:string[]) => <label>{label}<select value={editor?.[key]||''} onChange={e=>setEditor(v=>v?{...v,[key]:e.target.value}:v)}>{options.map(o=><option key={o} value={o}>{o||'Keine Angabe'}</option>)}</select></label>;
  return <div className="crm workspace">
    <aside><a className="brand" href="#" onClick={e=>{e.preventDefault();chooseTab('Übersicht');}}>sponti<span>↗</span></a><p className="eyebrow">MITARBEITERBEREICH</p><nav className="nav-groups"><div className="nav-group"><span className="nav-heading">ÜBERSICHT</span><button className={tab==='Übersicht'?'active':''} onClick={()=>chooseTab('Übersicht')}>Übersicht</button></div><div className="nav-group"><span className="nav-heading">KURSE &amp; ANBIETER</span>{['Kunden','Anfragen','Kursanbieter',...(coursesSection?['Kurse']:[]),'Archiv'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>chooseTab(t)}>{t}<span>{t==='Kunden'?customers.length:t==='Kursanbieter'?providers.length:t==='Anfragen'?pendingRequests.length:''}</span></button>)}</div><div className="nav-group"><span className="nav-heading">ORGANISATION</span><button className={tab==='Aufgaben'?'active':''} onClick={()=>chooseTab('Aufgaben')}>Aufgaben<span>{openTasks.length}</span></button></div><div className="nav-group"><span className="nav-heading">DATEIEN &amp; DATEN</span><button className={tab==='Dateien'?'active':''} onClick={()=>chooseTab('Dateien')}>Dateien</button><button className={(tab==='Datenübernahme'||tab==='Datenexport')?'active':''} onClick={()=>chooseTab(allowImport?'Datenübernahme':'Datenexport')}>{allowImport?'Datenübernahme':'Datenexport'}</button></div></nav><div className="account"><small>{session.email}</small><button className="secondary" disabled={busy} onClick={()=>perform(async()=>{await api('logout',session.csrf,'POST',{});setSession(null);setContacts([]);setTasks([]);setSelected(null);setEditor(null);})}>Abmelden</button></div></aside>
    <main><header><div><p className="eyebrow">SPONTI CRM</p><h1>{tab}</h1></div><span className="connection">● {storageLabel}</span></header>
      {error && <div role="alert" className="error">{error}</div>}{notice && <div role="status" className="notice">{notice}</div>}
      {tab==='Übersicht' && <><div className="stats">{[['Kunden',customers.length],['Kursanbieter',providers.length],['Offene Anfragen',pendingRequests.length],['Offene Aufgaben',openTasks.length]].map(([title,count])=><article key={title}><span>{title}</span><strong>{count}</strong></article>)}</div><div className="split"><section className="panel"><h2>Als Nächstes</h2>{openTasks.length===0?<p className="muted">Alles erledigt. Erstelle eine Aufgabe für deinen nächsten Kontakt.</p>:openTasks.slice(0,6).map(t=><div className="task" key={t.id}><div><strong>{t.title}</strong><small>{t.contact_name||'Allgemein'} · {date(t.due_date)}</small></div><button className="secondary" onClick={()=>chooseTab('Aufgaben')}>Ansehen →</button></div>)}<button onClick={()=>{chooseTab('Aufgaben');setTaskForm(true);}}>Aufgabe erstellen</button></section><section className="panel"><h2>Neue Anfragen</h2>{pendingRequests.length===0?<p className="muted">Keine offenen Anfragen. Neue Unternehmen erscheinen hier, sobald sie das Formular ausfüllen.</p>:pendingRequests.slice(0,5).map(c=><button className="contact-row" key={c.id} onClick={()=>setSelected(c)}><span><strong>{c.company||c.name}</strong><small>{c.name} · {c.interest||'Keine Kategorie'}</small></span><span className="badge">{c.status}</span></button>)}</section></div></>}
      {(tab==='Kunden'||tab==='Kursanbieter'||tab==='Anfragen'||tab==='Archiv') && <section className="panel">{tab==='Anfragen'&&<p className="muted">Neue Unternehmen bleiben hier, während ihr Kontakt aufnehmt und die Zusammenarbeit prüft. Erst nach eurer Bestätigung erscheinen sie unter Kursanbieter.</p>}<div className="toolbar"><input aria-label="Kontakte suchen" placeholder="Name, E-Mail, Telefonnummer oder Interesse suchen …" value={query} onChange={e=>setQuery(e.target.value)} /><select aria-label="Kontakte filtern" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">Alle Kontakte</option>{[...(tab==='Anfragen'?statuses.provider.filter(s=>s!=='Partner'):tab==='Kursanbieter'?['Partner']:statuses[kind]),...(kind==='customer'?['WhatsApp','E-Mail','Beides']:[])].map(s=><option key={s}>{s}</option>)}</select>{tab!=='Archiv'&&<button onClick={()=>setEditor(blank(kind))}>+ {kind==='customer'?'Kunde':'Anbieter'}</button>}</div><div className="table-wrap"><table><thead><tr><th>{kind==='customer'?'Name':'Unternehmen / Kontakt'}</th><th>Kontakt</th><th>{tab==='Archiv'?'Interessen / Kursangebot':kind==='customer'?'Interessen / Kanal':'Kursangebot'}</th><th>Status</th><th>Aktionen</th></tr></thead><tbody>{visible.map(c=><tr key={c.id}><td><button className="text-button" onClick={()=>setSelected(c)}>{c.company||c.name}</button>{c.kind==='provider'&&<><small>{c.name}</small>{coursesSection&&<small>Standort: {c.location||'Noch nicht angegeben'}</small>}</>}</td><td>{c.email}<small>{c.phone||'Keine Telefonnummer'}</small></td><td>{c.kind==='customer'?c.interest:c.offer_type}<small>{c.kind==='customer'?c.channel:c.interest}</small></td><td><span className="badge">{c.status}</span></td><td><div className="row-actions">{c.archived_at?<button className="secondary" disabled={busy} onClick={()=>archiveContact(c,true)}>Wiederherstellen</button>:<>{isProviderRequest(c)&&<button disabled={busy} onClick={()=>approveProvider(c)}>Bestätigen</button>}<button className="secondary" disabled={busy} onClick={()=>setEditor({...c})}>Bearbeiten</button><button className="danger" disabled={busy} onClick={()=>archiveContact(c)}>Löschen</button></>}</div></td></tr>)}</tbody></table></div>{visible.length===0&&<div className="empty"><h2>{tab==='Archiv'?'Dein Archiv ist leer':'Noch keine passenden Kontakte'}</h2><p>{tab==='Archiv'?'Gelöschte Kontakte erscheinen hier und können wiederhergestellt werden.':'Erfasse einen Kontakt oder passe die Suche an.'}</p></div>}<p className="muted">{visible.length} Kontakte</p></section>}
      {tab==='Kurse'&&(typeof coursesSection==='function'?coursesSection(courseContext):coursesSection)}
      {tab==='Dateien'&&<section className="panel files-panel"><div className="toolbar"><div><h2>Interne Dateien</h2><p className="muted">Zentrale Ablage für Dokumente, Vorlagen und andere interne Dateien.</p></div><label className="file-upload-button">+ Datei hochladen<input type="file" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file) perform(()=>uploadInternalFile(file));}}/></label></div>{files.length===0?<div className="empty"><h2>Noch keine Dateien</h2><p>Lade hier eure ersten internen Dokumente hoch.</p></div>:<div className="internal-file-list">{files.map(file=><article key={file.id}><div><strong>{file.name}</strong><small>{(file.size/1024).toFixed(file.size<10240?1:0)} KB · {file.uploaded_by} · {date(file.created_at)}</small></div><div className="row-actions"><button className="secondary" onClick={()=>perform(()=>downloadInternalFile(file))}>Herunterladen</button><button className="danger" onClick={()=>{if(window.confirm(`${file.name} wirklich löschen?`)) perform(async()=>{await api(`files/${file.id}`,session!.csrf,'DELETE',{});setFiles(await api<InternalFile[]>('files'));setNotice('Datei gelöscht.');});}}>Löschen</button></div></article>)}</div>}</section>}
      {tab==='Aufgaben'&&<section className="panel"><div className="toolbar"><h2>Deine nächsten Schritte</h2><button onClick={()=>setTaskForm(true)}>+ Aufgabe</button></div>{tasks.length===0&&<p className="empty">Noch keine Aufgaben.</p>}{tasks.map(t=><div className={`task ${t.done?'completed':''}`} key={t.id}><label className="task-check"><input type="checkbox" checked={!!t.done} disabled={busy} onChange={()=>perform(async()=>{await api(`tasks/${t.id}`,session.csrf,'PUT',{done:!t.done});await reload();})}/><span><strong>{t.title}</strong><small>{t.contact_name||'Allgemein'} · fällig am {date(t.due_date)}</small></span></label>{!t.done&&t.due_date<new Date().toLocaleDateString('en-CA')&&<span className="badge">Überfällig</span>}</div>)}</section>}
      {(tab==='Datenübernahme'||tab==='Datenexport')&&<section className="panel import">{allowImport&&<><h2>Bestehende Kontakte übernehmen</h2><p>Exportiere die Tabelle „Kunden - Users“ oder „Kursanbieter“ aus Supabase als CSV. Vorhandene E-Mail-Adressen werden innerhalb desselben Kontakttyps übersprungen.</p><label>Kontakttyp<select value={importKind} onChange={e=>setImportKind(e.target.value as Contact['kind'])}><option value="customer">Kunden</option><option value="provider">Kursanbieter</option></select></label><label className="file-label">CSV auswählen<input type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file) perform(async()=>{if(file.size>1500000) throw new Error('Die Datei darf höchstens 1,5 MB gross sein.');const csv=await file.text();const result=await api<{added:number;skipped:number}>('import',session.csrf,'POST',{kind:importKind,csv});await reload();setNotice(`${result.added} Kontakte übernommen, ${result.skipped} bereits vorhanden.`);});}}/></label><p className="muted">Alle Zeilen werden geprüft. Bei ungültigen Angaben wird der Import vollständig abgebrochen.</p><hr/></>}<h2>Daten exportieren</h2><p>Der JSON-Export enthält Kontakte, Notizen und Aufgaben. Bewahre die Datei sicher auf.</p><button className="secondary" disabled={busy} onClick={()=>perform(async()=>download(await api('export'),`sponti-crm-${new Date().toISOString().slice(0,10)}.json`))}>Daten herunterladen</button></section>}
    </main>
    {selected&&!editor&&<div className="overlay" onClick={()=>setSelected(null)}><section role="dialog" aria-modal="true" aria-labelledby="contact-title" className="dialog" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Schliessen" onClick={()=>setSelected(null)}>×</button><p className="eyebrow">{selected.kind==='customer'?'KUNDE':'KURSANBIETER'}</p><h2 id="contact-title">{selected.company||selected.name}</h2><p>{selected.name}</p><dl>{[['E-Mail',selected.email],['Telefon',selected.phone],...(selected.kind==='provider'&&coursesSection?[['Standort',selected.location||'']]:[]),['Interessen',selected.interest],['Kontaktkanal',selected.channel],['Kursangebot',selected.offer_type],['Status',selected.status],['Quelle',selected.source],['Nachricht',selected.message]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'—'}</dd></div>)}</dl>{selected.kind==='provider'&&coursesSection&&<section className="provider-courses"><h3>Zugeordnete Kurse</h3>{providerCoursesError?<p className="error" role="alert">{providerCoursesError}</p>:providerCoursesLoading?<p role="status">Kurse werden geladen …</p>:providerCourses.length===0?<p className="muted">Diesem Anbieter sind noch keine Kurse zugeordnet.</p>:<ul>{providerCourses.map(c=><li key={c.id}><strong>{c.title}</strong><small>{date(c.starts_at)} · {c.venue} · {c.status==='draft'?'Entwurf':'Veröffentlicht'}</small></li>)}</ul>}<div className="row-actions"><button className="secondary" onClick={()=>openProviderCourses(selected)}>Kurse verwalten</button>{isApprovedProvider(selected)&&<><button onClick={()=>openProviderCourses(selected,true)}>+ Kurs hinzufügen</button><button className="secondary" onClick={()=>openProviderCourses(selected,false,true)}>Bestehenden Kurs zuordnen</button></>}</div>{!isApprovedProvider(selected)&&<p className="muted">Bestätige zuerst den Anbieter, um ihm neue Kurse zuzuordnen.</p>}</section>}{selected.kind==='provider'&&<ProviderDocuments providerId={selected.id.slice('provider:'.length)}/>}{selected.archived_at?<button className="secondary" disabled={busy} onClick={()=>archiveContact(selected,true)}>Wiederherstellen</button>:<div className="row-actions">{isProviderRequest(selected)&&<button disabled={busy} onClick={()=>approveProvider(selected)}>Als Kursanbieter bestätigen</button>}<button className="secondary" onClick={()=>setEditor({...selected})}>Kontakt bearbeiten</button><button className="danger" disabled={busy} onClick={()=>archiveContact(selected)}>Kontakt löschen</button></div>}<h3>Notizen</h3><form onSubmit={e=>{e.preventDefault();perform(async()=>{await api(`contacts/${selected.id}/notes`,session.csrf,'POST',{body:noteBody});setNotes(await api(`contacts/${selected.id}/notes`));setNoteBody('');});}}><label>Neue Notiz<textarea value={noteBody} onChange={e=>setNoteBody(e.target.value)} required maxLength={4000}/></label><button disabled={busy}>Notiz speichern</button></form>{notes.map(n=><article className="note" key={n.id}><p>{n.body}</p><small>{n.author} · {date(n.created_at)}</small></article>)}</section></div>}
    {editor&&<div className="overlay"><form role="dialog" aria-modal="true" aria-labelledby="editor-title" className="dialog" onSubmit={saveContact}><button type="button" className="close" aria-label="Schliessen" onClick={()=>setEditor(null)}>×</button><h2 id="editor-title">{editor.id?'Kontakt bearbeiten':'Neuer Kontakt'}</h2><div className="form-grid">{input('name','Name / Kontaktperson','text',true)}{editor.kind==='provider'&&input('company','Unternehmen','text',true)}{editor.kind==='provider'&&coursesSection&&input('location','Standort / Adresse')}{input('email','E-Mail','email',true)}{input('phone',editor.kind==='provider'?'Telefonnummer (optional)':'Telefon','tel')}{editor.kind==='provider'?select('interest','Kategorie',['',...categories]):input('interest','Interessen')}{select('status','Status',editor.kind==='provider'&&editor.status!=='Partner'?statuses.provider.filter(s=>s!=='Partner'):statuses[editor.kind])}{editor.kind==='customer'?select('channel','Gewünschter Kontaktkanal',['','WhatsApp','E-Mail','Beides']):select('offer_type','Kursangebot',['','Einzelne Kurse','Mehrere Kurse','Beides'])}</div><label>Nachricht<textarea value={editor.message} maxLength={4000} onChange={e=>setEditor({...editor,message:e.target.value})}/></label>{error&&<p className="error" role="alert">{error}</p>}<button disabled={busy}>{busy?'Speichern …':'Kontakt speichern'}</button></form></div>}
    {taskForm&&<div className="overlay"><form role="dialog" aria-modal="true" aria-labelledby="task-title" className="dialog" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);perform(async()=>{await api('tasks',session.csrf,'POST',{title:f.get('title'),due_date:f.get('due_date'),contact_id:f.get('contact_id')});await reload();setTaskForm(false);setNotice('Aufgabe gespeichert.');});}}><button type="button" className="close" aria-label="Schliessen" onClick={()=>setTaskForm(false)}>×</button><h2 id="task-title">Neue Aufgabe</h2><label>Was steht an?<input name="title" required maxLength={500}/></label><label>Fällig am<input name="due_date" type="date" required/></label><label>Kontakt<select name="contact_id"><option value="">Allgemeine Aufgabe</option>{contacts.filter(c=>!c.archived_at).map(c=><option key={c.id} value={c.id}>{c.company||c.name} · {c.email}</option>)}</select></label>{error&&<p role="alert" className="error">{error}</p>}<button disabled={busy}>Aufgabe speichern</button></form></div>}
  </div>;
}
