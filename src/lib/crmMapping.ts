export type CRMContact = {id:string;kind:'customer'|'provider';name:string;email:string;phone:string;company:string;interest:string;channel:string;offer_type:string;status:string;message:string;source:string;created_at:string;archived_at?:string|null};
export const categories = ['Yoga & Wellness','Kochen & Genießen','Kunst & Handwerk','Fotografie & Design','Tanz & Bewegung','Natur & Draußen','Etwas anderes'];
export function contactReference(id:string) {
  const [kind,value,...extra] = id.split(':');
  if(extra.length || !value || !['customer','provider'].includes(kind)) throw new Error('Ungültiger Kontakt.');
  if(kind==='customer'&&(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value)))) throw new Error('Ungültiger Kunde.');
  if(kind==='provider'&&!/^[0-9a-f-]{36}$/i.test(value)) throw new Error('Ungültiger Anbieter.');
  return kind==='customer'?{customer_id:Number(value),provider_id:null}:{customer_id:null,provider_id:value};
}
export function mapCustomer(row:Record<string,unknown>):CRMContact {
  const s=(key:string)=>String(row[key]??'');
  return {id:`customer:${row.id}`,kind:'customer',name:s('Name'),email:s('Email'),phone:s('Phone'),company:'',interest:s('Interest'),channel:s('ContactChannel'),offer_type:'',status:s('crm_status')||'Aktiv',message:s('crm_message'),source:s('crm_source')||'Website',created_at:s('created_at'),archived_at:s('archived_at')||null};
}
export function mapProvider(row:Record<string,unknown>):CRMContact {
  const s=(key:string)=>String(row[key]??'');
  return {id:`provider:${row.id}`,kind:'provider',name:s('contact'),email:s('email'),phone:s('phone'),company:s('company'),interest:s('category'),channel:'',offer_type:s('offer_type'),status:s('crm_status')||'Neu',message:s('message'),source:s('crm_source')||'Website',created_at:s('created_at'),archived_at:s('archived_at')||null};
}
export function contactPayload(contact:CRMContact, creating=false):Record<string,string|null> {
  if(!contact.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) throw new Error('Bitte Name und gültige E-Mail angeben.');
  if(contact.name.trim().length>200 || contact.email.trim().length>254 || contact.phone.length>100 || contact.interest.length>500 || contact.message.length>4000) throw new Error('Ein Feld ist zu lang. Bitte Angaben kürzen.');
  const common={crm_status:contact.status,...(creating?{crm_source:'CRM'}:{})};
  if(contact.kind==='customer') {
    if(!['','WhatsApp','E-Mail','Beides'].includes(contact.channel)) throw new Error('Ungültiger Kontaktkanal.');
    return {...common,Name:contact.name.trim(),Email:contact.email.trim(),Phone:contact.phone.trim(),Interest:contact.interest.trim(),ContactChannel:contact.channel||null,crm_message:contact.message.trim()};
  }
  if(!contact.company.trim() || contact.company.length>200 || !categories.includes(contact.interest) || !['Einzelne Kurse','Mehrere Kurse','Beides'].includes(contact.offer_type)) throw new Error('Bitte Unternehmen, Kategorie und Kursangebot auswählen.');
  return {...common,company:contact.company.trim(),contact:contact.name.trim(),email:contact.email.trim(),phone:contact.phone.trim(),category:contact.interest,offer_type:contact.offer_type,message:contact.message.trim()};
}
