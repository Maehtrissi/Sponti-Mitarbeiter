export function welcomeMail(kind: 'customer'|'provider') {
 const provider=kind==='provider';
 const subject=provider?'Willkommen bei Sponti – deine E-Mail ist bestätigt':'Willkommen bei Sponti!';
 const paragraphs=provider?[
  'Deine E-Mail-Adresse ist bestätigt. Schön, dass du mit deinem Unternehmen bei Sponti dabei sein möchtest!',
  'Du kannst dich jetzt in deinem Anbieterkonto anmelden und dein Profil vervollständigen.',
  'Wie geht es weiter? Wir prüfen deine Angaben und melden uns bei dir, um die Zusammenarbeit zu besprechen. Solange dein Konto noch nicht freigegeben ist, bleibt dein Angebot unveröffentlicht. Den aktuellen Status siehst du in deinem Konto.'
 ]:[
  'Deine E-Mail-Adresse ist bestätigt und dein Sponti-Konto ist bereit. Schön, dass du dabei bist!',
  'In deinem Profil kannst du deine Region, Interessen und bevorzugten Zeiten hinterlegen. Dort legst du auch fest, ob und über welche Kanäle du Kursinfos erhalten möchtest.',
  'Du kannst deine Angaben und Einstellungen jederzeit in deinem Konto ändern.'
 ];
 const url='https://sponti-switzerland.ch/'+(provider?'anbieter.html':'profil.html');
 const label=provider?'Zum Anbieterkonto':'Zu meinem Profil';
 const text=['Hallo und willkommen bei Sponti!',...paragraphs,label+': '+url,'Bei Fragen erreichst du uns unter info@sponti-switzerland.ch.','Liebe Grüsse\nDein Sponti-Team','Diese einmalige Nachricht bestätigt deine Kontoerstellung.'].join('\n\n');
 const html=`<!doctype html><html lang="de-CH"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head><body style="margin:0;background:#f6f4ec;color:#123d32;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fffdf6;border-radius:16px"><tr><td style="padding:32px 28px"><p style="margin:0 0 28px;font-size:34px;font-weight:bold">sponti<span style="color:#d75b16">.</span></p><h1 style="font-size:28px;line-height:1.25">Willkommen bei Sponti!</h1>${paragraphs.map(p=>`<p style="font-size:16px;line-height:1.65">${p}</p>`).join('')}<p style="margin:28px 0"><a href="${url}" style="display:inline-block;background:#123d32;color:#fff;padding:15px 24px;border-radius:8px;font-size:16px;text-decoration:none">${label}</a></p><p style="font-size:16px;line-height:1.65">Bei Fragen erreichst du uns unter <a href="mailto:info@sponti-switzerland.ch" style="color:#123d32">info@sponti-switzerland.ch</a>.</p><p style="font-size:16px;line-height:1.65">Liebe Grüsse<br>Dein Sponti-Team</p><p style="border-top:1px solid #d8ded7;padding-top:20px;font-size:12px;line-height:1.5;color:#52675d">Diese einmalige Nachricht bestätigt deine Kontoerstellung.</p></td></tr></table></td></tr></table></body></html>`;
 return {from:'Sponti <info@sponti-switzerland.ch>',reply_to:'info@sponti-switzerland.ch',subject,text,html};
}
