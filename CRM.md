# Sponti CRM

## Aktiver Betrieb: Supabase + GitHub Pages

Die Mitarbeiterseite unter https://sponti-switzerland.ch/Sponti-Mitarbeiter/ verwendet
Supabase Auth und die bestehenden Tabellen `Kunden - Users` und `Kursanbieter`.
Die Website-Formulare schreiben weiterhin in diese Tabellen. Das CRM liest daher
bestehende und neue Kontakte direkt. Es werden keine Daten migriert oder dupliziert.

Kontakte lassen sich suchen, filtern, hinzufügen und bearbeiten. Telefonnummer,
Interessen, Kontaktkanal und Kursarten werden erhalten. `crm_status`, `crm_message`
und `crm_source` ergänzen die Kundentabelle; Anbieter erhalten Status, Quelle und
Telefon. `crm_notes` enthält Notizen und `crm_tasks` Aufgaben. Kein simulierter
Nachrichtenversand und keine Veröffentlichung von Kursen aus diesem CRM.

Zugriff erfordert sowohl `app_metadata.sponti_employee = true` als auch einen aktiven
Eintrag in `crm_employees`. Die Freigaben werden nur administrativ gesetzt. Der
bestehende Zugang `info.sponti@gmail.com` wurde übernommen. Anonyme Besucher dürfen
Formulare absenden, aber keine Kundendaten lesen oder bearbeiten. Die neue Oberfläche
verwendet den öffentlichen Publishable-Key; RLS schützt sämtliche Datenzugriffe.

Um einen Mitarbeiter sofort für Datenzugriffe zu sperren, administrativ in
`crm_employees` `active=false` setzen. Zusätzlich Auth-Sitzungen beenden bzw. das
App-Metadatum entfernen. Die Registry-Prüfung greift auch bei noch gültigen JWTs.
Für neue Mitarbeiter: Auth-Benutzer anlegen, das App-Metadatum administrativ setzen
und dessen Benutzer-ID in `crm_employees` mit `active=true` eintragen.

Der Bereich „Datenexport“ lädt Kunden, Anbieter, Notizen und Aufgaben als JSON herunter.
Diese Datei enthält persönliche Daten und muss sicher aufbewahrt werden. Die Datei
ist kein vollständiges Datenbankbackup. Regelmässige Datenbanksicherungen durchführen;
automatische Backups erfordern einen passenden Supabase-Tarif. Der Tarif wurde nicht
geändert. Der Schutz vor bekannten kompromittierten Passwörtern ist im bestehenden
Projekt nicht aktiviert und im Free-Tarif nicht enthalten:
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Deployment: `npm run build` erstellt die aktive Supabase-Version für Pages. Die
GitHub-Aktion prüft Mapping, Mitarbeiterfreigabe, TypeScript und beide Betriebsarten.
`supabase/tests/crm_permissions.sql` prüft Rollenrechte und Speicherung mit Testdaten
in einer Transaktion und rollt diese vollständig zurück. Die Tests brauchen einen
administrativen SQL-Zugang. Die Migrationen dokumentieren die Datenbankänderungen.

## Option für einen späteren eigenen Server



Die Mitarbeiterseite erhält eine zweite Betriebsart mit eigener SQLite-Datenbank,
eigenständiger Mitarbeiteranmeldung und einer Flask-API. In diesem Modus wird
Supabase weder für die Anmeldung noch für Datenzugriffe benötigt.

Funktionen: Kunden und Kursanbieter erfassen/bearbeiten/suchen/filtern, Kontaktkanäle
und Kursarten, Anbieterstatus, Notizen mit Autor/Datum, Aufgaben mit Fälligkeit und
Erledigungsstatus, CSV-Import der bestehenden Supabase-Tabellen und JSON-Export.
Keine Beispieldaten, kein simulierter Nachrichtenversand. E-Mail-/WhatsApp-Versand,
Kursveröffentlichung, Buchungen und automatische Erinnerungen sind nicht integriert.

Die bestehende GitHub-Pages-Version bleibt bis zur Umstellung im bisherigen Modus.
Pages kann keinen Python-Server und keine private SQLite-Datenbank ausführen.

## Lokal starten

Python 3.12+, Node 22+:

```sh
npm ci
python3 -m venv .venv
.venv/bin/pip install -r server/requirements.txt
.venv/bin/python -m flask --app server.app:create_app create-admin
CRM_LOCAL_HTTP=1 .venv/bin/python -m flask --app server.app:create_app run --host 127.0.0.1 --port 5000
```

In einem zweiten Terminal `npm run dev:crm` starten und http://localhost:3000 öffnen.
Das Administrator-Passwort wird interaktiv verdeckt abgefragt und mit scrypt gehasht.
Es gibt kein vorgegebenes Passwort und keine öffentliche Registrierung.
`create-admin` für eine vorhandene E-Mail setzt das Passwort neu und beendet deren
Sitzungen. Lokales HTTP nur für Entwicklung, `CRM_LOCAL_HTTP` nie online setzen.

## Auf einem Server installieren

Ein Server mit Docker, persistentem Speicher und HTTPS wird benötigt. CRM-Oberfläche
und API liegen auf derselben Domain, beispielsweise https://crm.sponti-switzerland.ch.
Der DNS-Eintrag und das Hosting sind noch einzurichten; diese URL ist ein Beispiel.

```sh
export CRM_PUBLIC_ORIGIN=https://crm.sponti-switzerland.ch
docker compose up -d --build
docker compose exec crm python -m flask --app server.app:create_app create-admin
```

Einen HTTPS-Reverse-Proxy vor `127.0.0.1:5000` setzen (z. B. Caddy oder nginx).
Originalen Origin-Header weitergeben, Host auf die CRM-Domain begrenzen. Gunicorn ist
nur lokal am Host veröffentlicht. Das Volume `crm-data` dauerhaft behalten. Bei
benannten Volumes muss der Pfad `/data` dem Container-Nutzer UID 10001 gehören.
In der Proxy-Konfiguration Login und öffentliche Formulare zusätzlich je Client-IP
begrenzen. Die API hat eigene Limits je Socket-IP und E-Mail; hinter einem Proxy
teilen sich Clients die Socket-IP. Keine ungeprüften X-Forwarded-For-Header vertrauen.

Die Anmeldung verwendet zufällige serverseitige Sitzungen (8 Stunden), HttpOnly/
Secure/SameSite-Cookies, CSRF-Token und Origin-Prüfung. API-Daten sind ausschliesslich
für angelegte Mitarbeiter zugänglich. Die öffentlichen Endpunkte sind nur zum
Einreichen, nicht zum Lesen von Kontakten vorgesehen. Zusätzlicher Bot-Schutz kann
bei erhöhtem Spamaufkommen ergänzt werden.

## Supabase schrittweise ablösen

1. Neues CRM auf dem Server installieren und Administrator anlegen.
2. Beide Tabellen in Supabase als CSV exportieren und in „Datenübernahme“ dem richtigen
   Kontakttyp zuordnen. Kunden: `Name,Email,Phone,Interest,ContactChannel`.
   Anbieter: `company,contact,email,offer_type,category,message`.
   Der Import prüft zuerst sämtliche Zeilen. Doppelte E-Mail-Adressen je Kontakttyp
   werden übersprungen; Telefonnummern und Kontaktkanäle bleiben Zeichenketten.
3. Anzahl und Inhalte mit dem Export vergleichen. CSVs sicher aufbewahren.
4. Website-Formulare auf die neue API umstellen. Der Browser bekommt keinen geheimen
   Schlüssel. POST JSON an `https://<CRM-Domain>/api/public/customers` mit
   `name,email,phone,interest,channel`; bzw. `/api/public/providers` mit
   `company,name,email,offer_type,interest,message`. Kundenkanäle: `WhatsApp`,
   `E-Mail`, `Beides`; Kursarten: `Einzelne Kurse`, `Mehrere Kurse`, `Beides`.
   Optionales Honeypot-Feld `website` leer mitsenden. Erfolg nur bei HTTP 201 anzeigen.
   CORS ist auf `https://sponti-switzerland.ch` begrenzt. Die Origin-Prüfung ist kein
   Bot-Schutz; öffentliche Formular-APIs bleiben grundsätzlich öffentlich einreichbar.
5. Während des Übergangs neue Supabase-Einträge nochmals exportieren und importieren,
   bevor die alte Erfassung abgeschaltet wird. Bereits importierte Einträge werden
   übersprungen; Änderungen an bestehenden Kontakten müssen abgeglichen werden.
6. Beide Formulare mit Testdaten prüfen: Telefon, Kanal und Kursart kontrollieren;
   nach Neuladen und erneuter Anmeldung müssen die Daten erhalten bleiben.
7. Konsistente Datenbanksicherung anlegen, Wiederherstellung testen. Erst dann
   Supabase-Abhängigkeit aus Website und alter Anmeldung entfernen und das alte
   Projekt abschalten. Das geschieht nicht automatisch durch diesen Code.

## Sicherungen und Wiederherstellung

```sh
docker compose exec crm python -m flask --app server.app:create_app backup
```

Als Ziel beispielsweise `/data/backup-2026-10-04.sqlite` eingeben und die Datei über
`docker compose cp crm:/data/backup-2026-10-04.sqlite ./backup.sqlite` auf einen
separaten sicheren Speicher kopieren. Die Sicherung enthält auch Passwort-Hashes
und Sitzungen, also vertraulich behandeln. Regelmässige automatisierte Sicherungen
sind vor produktiver Nutzung einzurichten. Der JSON-Export enthält nur die CRM-Daten;
ein JSON-Rückimport ist nicht implementiert und ersetzt die vollständige Sicherung nicht.

Zur Wiederherstellung Container stoppen, Sicherung als `/data/crm.sqlite` im Volume
einspielen, dazugehörige alte `crm.sqlite-wal`/`crm.sqlite-shm` entfernen und Eigentümer
UID 10001 setzen. Vor Neustart Sitzungen aus der wiederhergestellten DB löschen
(`DELETE FROM sessions;`), damit alte Cookies nicht erneut gültig werden. Zuerst mit
einer separaten Testinstallation prüfen, dann den echten Dienst ersetzen.

## Prüfen

```sh
.venv/bin/python -m unittest server.test_app
npm run lint
npm run build:crm
npm run build
```

Die Tests prüfen Zugriffsschutz, CSRF, Origin, Abmeldung, dauerhafte Speicherung,
Notizen, Aufgaben, Importvalidierung, Duplikate und öffentliche Formularvalidierung.

## Kontakte bearbeiten und löschen
In Kunden- und Anbieterlisten gibt es direkte Aktionen zum Bearbeiten und Löschen. Löschen verschiebt Kontakte ins Archiv; dort ist Wiederherstellen möglich. Notizen und Aufgaben bleiben zugeordnet. Es gibt keine automatische oder endgültige Löschung. Archivierte Kontakte sind im vollständigen Export enthalten.

## Anfragen vor der Bestätigung
Website-Anfragen erhalten automatisch den Status `Neu` und erscheinen im Bereich Anfragen. Auch `Kontaktiert`, `Gespräch` und `Abgelehnt` bleiben dort filterbar. Nur `Partner` erscheint unter Kursanbieter. Der Button Bestätigen setzt diesen Status dauerhaft. Unbestätigte Unternehmen können im Editor noch nicht den Status Partner wählen; dafür gibt es die ausdrückliche Bestätigung. Freigaben sind nur für Mitarbeiter möglich, öffentliche Formulare dürfen die Statusspalte nicht setzen. Es werden keine E-Mails versendet und keine Kurse automatisch veröffentlicht.

Kursanbieter können im öffentlichen Formular optional eine Telefonnummer (`phone`) angeben. Sie erscheint in den Anfragen und lässt sich im CRM bearbeiten. Das Website-Feld ist für später vorgesehen und derzeit ausgeblendet. Bereits gespeicherte Website-Daten bleiben erhalten. Die Telefonnummer bestätigt den Anbieter nicht automatisch.


## Kurse verwalten

Im Supabase-CRM enthält „Kurse“ eigene Kurse mit Titel, Beschreibung, Kategorie, Region, Treffpunkt, Termin, Preis in CHF, freien Plätzen und optionalem Buchungslink. Neue Kurse starten als Entwurf; die Zuordnung zu einem bestätigten Anbieter ist optional. Veröffentlichen und Zurück zu Entwurf steuern die öffentliche Sichtbarkeit. Vergangene Termine, ausgebuchte und archivierte Kurse erscheinen öffentlich nicht. Löschen archiviert; Wiederherstellen macht den Kurs wieder zum Entwurf. Der JSON-Export umfasst auch Kurse.

Die öffentliche Seite liest nur öffentliche Kursfelder über RLS und enthält keine Beispielkurse mehr. Die Kursverwaltung ist Teil des aktiven Supabase-Modus. Der alternative SQLite-Modus bleibt für Kontakte, Notizen und Aufgaben bestehen.
