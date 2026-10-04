import test from 'node:test';
import assert from 'node:assert/strict';
import {coursePayload,toLocalInput} from './courses.ts';
const base={title:'Yoga',description:'',category:'yoga-wellness',region:'zug',venue:'Studio Zug',starts_at:new Date(Date.now()+86400000).toISOString(),price:'12.50',seats:'4',booking_url:'',status:'draft',provider_id:''};
test('draft, price, seats and optional provider are mapped',()=>{const c=coursePayload(base);assert.equal(c.status,'draft');assert.equal(c.price,12.5);assert.equal(c.seats,4);assert.equal(c.provider_id,null);});
test('past or full courses cannot be published',()=>{assert.throws(()=>coursePayload({...base,status:'published',starts_at:'2020-01-01'}));assert.throws(()=>coursePayload({...base,status:'published',seats:'0'}));assert.equal(coursePayload({...base,seats:'0'}).status,'draft');});
test('booking URLs reject executable protocols and credentials',()=>{for(const booking_url of ['javascript:alert(1)','https://user:pass@example.com','https://example.com/a b'])assert.throws(()=>coursePayload({...base,booking_url}));assert.equal(coursePayload({...base,booking_url:'https://example.com/book'}).booking_url,'https://example.com/book');});
test('negative or fractional seats, empty numeric fields and invalid categories are rejected',()=>{for(const value of [{seats:'1.5'},{price:'-2'},{seats:''},{price:''},{category:'unknown'}])assert.throws(()=>coursePayload({...base,...value}));});
test('local editor preserves appointment timestamp',()=>{const minuteDate=new Date(base.starts_at);minuteDate.setSeconds(0,0);assert.equal(new Date(toLocalInput(minuteDate.toISOString())).getTime(),minuteDate.getTime());});
