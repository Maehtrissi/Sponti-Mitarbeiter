# Mitarbeiter-Anmeldung

Die App nutzt Supabase Auth im Projekt `ehifskiigrfpxeiruyxr`.
Zugang ist nur mit E-Mail/Passwort und `app_metadata.sponti_employee: true` möglich.
Eine öffentliche Registrierung ist in dieser App nicht enthalten. Ein normales
Supabase-Konto oder benutzeränderbare `user_metadata` reichen nicht für den Zugang.

Konten werden von der Administration in Supabase Auth eingerichtet.
Die Mitarbeiter-Freigabe darf nur über einen vertrauenswürdigen Admin-Zugang
(z. B. Supabase Admin API mit `auth.admin.updateUserById`) gesetzt werden.
Ein Service-Role-Schlüssel darf niemals in die Website oder das Repository gelangen.
Passwörter werden durch die jeweiligen Benutzer bzw. die Administration vergeben.

GitHub Pages liefert weiterhin öffentliche statische Dateien. Der Login schützt
die Oberfläche; vertrauliche Daten dürfen nicht in Quellcode oder Build-Dateien
stehen. Der derzeitige Datenbestand ist `src/data/mockData.ts` und besteht aus
Beispieldaten. Vor dem Anschluss echter Daten muss der Zugriff zusätzlich durch
Supabase RLS mit einer Mitarbeiterberechtigungsprüfung geschützt werden.

Prüfung: `node --experimental-strip-types --test src/lib/employeeAccess.test.ts`
Build: `npm ci && npm run build`
