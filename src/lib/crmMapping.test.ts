import assert from 'node:assert/strict';
import test from 'node:test';
import {mapCustomer,mapProvider,contactPayload,contactReference,isApprovedProvider,isProviderRequest} from './crmMapping.ts';

test('keeps phone numbers, channel preferences and existing customer IDs',()=>{
  const person=mapCustomer({id:12,Name:'Anna',Email:'anna@example.org',Phone:'+41 079 012 34 56',ContactChannel:'WhatsApp',Interest:'Yoga'});
  assert.equal(person.id,'customer:12');
  assert.equal(person.phone,'+41 079 012 34 56');
  assert.equal(contactPayload(person,true).ContactChannel,'WhatsApp');
  assert.equal(contactPayload(person,true).Phone,'+41 079 012 34 56');
  assert.deepEqual(contactReference(person.id),{customer_id:12,provider_id:null});
});
test('does not invent consent for legacy customers',()=>{
  const person=mapCustomer({id:1,Name:'Legacy',Email:'legacy@example.org',Phone:null,ContactChannel:null});
  assert.equal(person.channel,'');
  assert.equal(contactPayload(person).ContactChannel,null);
});
test('provider IDs, company and course selections stay distinct from customers',()=>{
  const person=mapProvider({id:'0e8ccf9d-1b77-4a42-8c57-f0de53e3cc42',contact:'Tom',company:'Studio',email:'tom@example.org',category:'Yoga & Wellness',offer_type:'Beides'});
  const payload=contactPayload(person,true);
  assert.equal(payload.company,'Studio');assert.equal(payload.contact,'Tom');assert.equal(payload.offer_type,'Beides');
  assert.equal(payload.crm_source,'CRM');
  assert.equal(contactReference(person.id).customer_id,null);
  assert.throws(()=>contactPayload({...person,offer_type:''}));
  assert.throws(()=>contactPayload({...person,interest:'Unknown'}));
});
test('rejects invalid contact IDs and invalid email addresses',()=>{
  for(const id of ['customer:abc','provider:1','customer:1:extra','customer:9007199254740993']) assert.throws(()=>contactReference(id));
  const person=mapCustomer({id:1,Name:'Test',Email:'invalid'});
  assert.throws(()=>contactPayload(person));
});

test('website submissions remain requests until staff confirm them',()=>{
  const request=mapProvider({id:'0e8ccf9d-1b77-4a42-8c57-f0de53e3cc42',contact:'Tom',company:'Studio',email:'tom@example.org',category:'Yoga & Wellness',offer_type:'Beides'});
  for(const status of ['Neu','Kontaktiert','Gespräch','Abgelehnt']) {
    assert.equal(isProviderRequest({...request,status}),true);
    assert.equal(isApprovedProvider({...request,status}),false);
  }
  const approved={...request,status:'Partner'};
  assert.equal(isApprovedProvider(approved),true);
  assert.equal(isProviderRequest(approved),false);
  assert.equal(isApprovedProvider({...approved,archived_at:'2026-10-04T10:00:00Z'}),false);
  assert.equal(isProviderRequest({...request,archived_at:'2026-10-04T10:00:00Z'}),false);
});
