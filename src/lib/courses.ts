export const courseCategories:Record<string,string>={'yoga-wellness':'Yoga & Wellness','kochen-geniessen':'Kochen & Geniessen','kunst-handwerk':'Kunst & Handwerk','fotografie-design':'Fotografie & Design','tanz-bewegung':'Tanz & Bewegung','natur-draussen':'Natur & Draussen'};
export const courseRegions:Record<string,string>={zug:'Zug',zuerich:'Zürich',luzern:'Luzern',schwyz:'Schwyz',aargau:'Aargau',andere:'Andere Region'};
export function toLocalInput(iso:string){const d=new Date(iso);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
export function coursePayload(input:Record<string,unknown>){
 const text=(key:string,max:number,required=false)=>{const value=String(input[key]??'').trim();if(value.length>max||(required&&!value))throw new Error('Bitte Titel, Ort und gültige Kursangaben ausfüllen.');return value;};
 const title=text('title',200,true),description=text('description',4000),venue=text('venue',300,true),booking_url=text('booking_url',2048);
 if(booking_url){let url:URL;try{url=new URL(booking_url);}catch{throw new Error('Bitte einen gültigen Buchungslink angeben.');}if(!['https:','http:'].includes(url.protocol)||!url.hostname||url.username||url.password||/\s/.test(booking_url))throw new Error('Der Buchungslink muss mit https:// oder http:// beginnen.');}
 const category=String(input.category),region=String(input.region),status=String(input.status);
 if(!Object.hasOwn(courseCategories,category)||!Object.hasOwn(courseRegions,region)||!['draft','published'].includes(status))throw new Error('Ungültige Kategorie, Region oder Sichtbarkeit.');
 const date=new Date(String(input.starts_at)),price=Number(input.price),seats=Number(input.seats);
 if(!Number.isFinite(date.getTime())||String(input.price).trim()===''||!Number.isFinite(price)||price<0||price>99999999.99||String(input.seats).trim()===''||!Number.isInteger(seats)||seats<0||seats>100000)throw new Error('Bitte einen gültigen Termin, Preis und freie Plätze angeben.');
 if(status==='published'&&(date.getTime()<=Date.now()||seats===0))throw new Error('Veröffentlichte Kurse brauchen einen zukünftigen Termin und freie Plätze.');
 const provider_id=String(input.provider_id||'')||null;
 if(provider_id&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(provider_id))throw new Error('Ungültiger Kursanbieter.');
 return {title,description,venue,booking_url,category,region,status,starts_at:date.toISOString(),price:Math.round(price*100)/100,seats,provider_id};
}
