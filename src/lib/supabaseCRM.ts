import {supabase} from './supabase';
import {hasEmployeeAccess} from './employeeAccess';
import {contactReference,contactPayload,mapCustomer,mapProvider,type CRMContact} from './crmMapping';
import type {TablesInsert,TablesUpdate} from './database.types';
import type {CRMRequest} from '../IndependentCRM';

type TaskRow={id:string;customer_id:string|number|null;provider_id:string|null;title:string;due_date:string;done:boolean;created_at:string};
function check(error:{message:string}|null) {if(error) throw new Error(error.message);}
async function allRows(table:'Kunden - Users'|'Kursanbieter'|'crm_notes'|'crm_tasks'|'courses', order='created_at') {
  const rows:Record<string,unknown>[]=[];
  // Paginate beyond Supabase's default 1000-row response limit.
  for(let offset=0;;offset+=500) {
    const {data,error}=await supabase.from(table).select('*').order(order,{ascending:false}).order('id').range(offset,offset+499);
    check(error); rows.push(...(data||[]));
    if(!data || data.length<500) return rows;
  }
}
async function contacts() {
  const [customers,providers]=await Promise.all([allRows('Kunden - Users'),allRows('Kursanbieter')]);
  return [...customers.map(mapCustomer),...providers.map(mapProvider)].sort((a,b)=>b.created_at.localeCompare(a.created_at));
}
async function taskList() {
  const [rows,people]=await Promise.all([allRows('crm_tasks'),contacts()]);
  const names=new Map(people.map(c=>[c.id,c.company||c.name]));
  return (rows as unknown as TaskRow[]).map(t=>{
    const id=t.customer_id!=null?`customer:${t.customer_id}`:t.provider_id?`provider:${t.provider_id}`:null;
    return {...t,done:t.done?1:0,contact_id:id,contact_name:id?names.get(id)||'Kontakt':null};
  }).sort((a,b)=>a.done-b.done||a.due_date.localeCompare(b.due_date));
}
export const supabaseCRMRequest:CRMRequest=async<T>(path:string,_csrf='',method='GET',payload?:unknown):Promise<T>=> {
  const value=payload as Record<string,unknown>;
  if(path==='session') {
    const {data,error}=await supabase.auth.getUser(); check(error);
    if(!hasEmployeeAccess(data.user)) throw new Error('Kein Mitarbeiterzugang.');
    const access=await supabase.rpc('crm_is_employee');check(access.error);
    if(access.data!==true) throw new Error('Dein CRM-Zugang ist nicht aktiv.');
    return {email:data.user!.email,csrf:''} as T;
  }
  if(path==='logout') {const {error}=await supabase.auth.signOut({scope:'local'});check(error);return {ok:true} as T;}
  if(path==='login') {
    const {data,error}=await supabase.auth.signInWithPassword({email:String(value.email),password:String(value.password)});check(error);
    if(!hasEmployeeAccess(data.user)) {await supabase.auth.signOut({scope:'local'});throw new Error('Kein Mitarbeiterzugang.');}
    return {email:data.user!.email,csrf:''} as T;
  }
  if(path==='contacts'&&method==='GET') return await contacts() as T;
  if(path==='contacts'&&method==='POST') {
    const contact=payload as CRMContact;
    const table=contact.kind==='customer'?'Kunden - Users':'Kursanbieter';
    const values=contactPayload(contact,true);
    const result=contact.kind==='customer'
      ? await supabase.from('Kunden - Users').insert(values as TablesInsert<'Kunden - Users'>).select('id').single()
      : await supabase.from('Kursanbieter').insert(values as TablesInsert<'Kursanbieter'>).select('id').single();
    const {data,error}=result;check(error);
    return {id:`${contact.kind}:${data!.id}`} as T;
  }
  const approvalMatch=path.match(/^contacts\/([^/]+)\/approve$/);
  if(approvalMatch && method==='POST') {
    const reference=contactReference(approvalMatch[1]);
    if(!reference.provider_id) throw new Error('Nur Kursanbieter können bestätigt werden.');
    const {data,error}=await supabase.from('Kursanbieter').update({crm_status:'Partner'}).eq('id',reference.provider_id).is('archived_at',null).select('id').single();
    check(error);if(!data) throw new Error('Anfrage konnte nicht bestätigt werden.');return {ok:true} as T;
  }
  const archiveMatch=path.match(/^contacts\/([^/]+)(\/restore)?$/);
  if(archiveMatch && (method==='DELETE'||(method==='POST'&&archiveMatch[2]))) {
    const id=archiveMatch[1];contactReference(id);
    const update={archived_at:archiveMatch[2]?null:new Date().toISOString()};
    const result=id.startsWith('customer:')
      ? await supabase.from('Kunden - Users').update(update).eq('id',Number(id.split(':')[1])).select('id').single()
      : await supabase.from('Kursanbieter').update(update).eq('id',id.split(':')[1]).select('id').single();
    check(result.error);if(!result.data) throw new Error('Kontakt konnte nicht geändert werden.');return {ok:true} as T;
  }
  const contactMatch=path.match(/^contacts\/([^/]+)(\/notes)?$/);
  if(contactMatch) {
    const id=contactMatch[1], reference=contactReference(id);
    if(contactMatch[2]) {
      if(method==='GET') {
        const {data,error}=await supabase.from('crm_notes').select('*').eq(reference.customer_id!=null?'customer_id':'provider_id',reference.customer_id!=null?reference.customer_id:reference.provider_id!).order('created_at',{ascending:false});check(error);return data as T;
      }
      if(method==='POST') {
        const {error}=await supabase.from('crm_notes').insert({...reference,body:String(value.body||'')});check(error);return {ok:true} as T;
      }
    } else if(method==='PUT') {
      const contact=payload as CRMContact;
      if(!id.startsWith(`${contact.kind}:`)) throw new Error('Kontakttyp kann nicht geändert werden.');
      const table=contact.kind==='customer'?'Kunden - Users':'Kursanbieter';
      const values=contactPayload(contact);
      const result=contact.kind==='customer'
        ? await supabase.from('Kunden - Users').update(values as TablesUpdate<'Kunden - Users'>).eq('id',Number(id.split(':')[1])).select('id').single()
        : await supabase.from('Kursanbieter').update(values as TablesUpdate<'Kursanbieter'>).eq('id',id.split(':')[1]).select('id').single();
      const {data,error}=result;check(error);
      if(!data) throw new Error('Kontakt konnte nicht gespeichert werden.');return {ok:true} as T;
    }
  }
  if(path==='tasks'&&method==='GET') return await taskList() as T;
  if(path==='tasks'&&method==='POST') {
    const reference=value.contact_id?contactReference(String(value.contact_id)):{customer_id:null,provider_id:null};
    const {error}=await supabase.from('crm_tasks').insert({...reference,title:String(value.title||''),due_date:String(value.due_date||'')});check(error);return {ok:true} as T;
  }
  if(path.startsWith('tasks/')&&method==='PUT') {
    const {data,error}=await supabase.from('crm_tasks').update({done:value.done===true}).eq('id',path.split('/')[1]).select('id').single();check(error);
    if(!data) throw new Error('Aufgabe konnte nicht gespeichert werden.');return {ok:true} as T;
  }
  if(path==='export') {
    const [people,notes,tasks,courses]=await Promise.all([contacts(),allRows('crm_notes'),taskList(),allRows('courses')]);
    return {version:2,contacts:people,notes,tasks,courses} as T;
  }
  throw new Error('Diese Funktion ist in diesem CRM nicht verfügbar.');
};
