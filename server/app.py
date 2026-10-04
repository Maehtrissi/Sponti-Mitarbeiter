"""Sponti CRM: SQLite persistence, employee-only API and public intake."""
import csv
import hashlib
import io
import json
import os
import re
import secrets
import sqlite3
import time
import uuid
from pathlib import Path
from flask import Flask, abort, g, jsonify, request, send_from_directory
from werkzeug.security import check_password_hash, generate_password_hash

ROOT = Path(__file__).resolve().parent.parent
STATUSES = {'customer': ['Aktiv', 'Pausiert'], 'provider': ['Neu', 'Kontaktiert', 'Gespräch', 'Partner', 'Abgelehnt']}
CHANNELS = ['', 'WhatsApp', 'E-Mail', 'Beides']
OFFERS = ['', 'Einzelne Kurse', 'Mehrere Kurse', 'Beides']

def create_app(config=None):
    app = Flask(__name__, static_folder=None)
    app.config.update(DATABASE=os.environ.get('CRM_DATABASE', str(ROOT / 'private-data/crm.sqlite')),
                      PUBLIC_ORIGIN=os.environ.get('CRM_PUBLIC_ORIGIN', 'http://localhost:3000'),
                      WEBSITE_ORIGIN=os.environ.get('CRM_WEBSITE_ORIGIN', 'https://sponti-switzerland.ch'),
                      COOKIE_SECURE=os.environ.get('CRM_LOCAL_HTTP') != '1', MAX_CONTENT_LENGTH=2 * 1024 * 1024)
    if config:
        app.config.update(config)
    Path(app.config['DATABASE']).parent.mkdir(parents=True, exist_ok=True)

    def db():
        if 'db' not in g:
            g.db = sqlite3.connect(app.config['DATABASE'], timeout=15)
            g.db.row_factory = sqlite3.Row
            g.db.execute('PRAGMA foreign_keys=ON')
        return g.db

    @app.teardown_appcontext
    def close(_):
        connection = g.pop('db', None)
        if connection is not None:
            connection.close()

    with app.app_context():
        db().executescript('''
        PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS employees(id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, employee_id TEXT NOT NULL REFERENCES employees(id), csrf TEXT NOT NULL, expires REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS contacts(id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('customer','provider')), name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '', interest TEXT NOT NULL DEFAULT '', channel TEXT NOT NULL DEFAULT '', offer_type TEXT NOT NULL DEFAULT '', status TEXT NOT NULL, message TEXT NOT NULL DEFAULT '', source TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')), updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
        CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_kind ON contacts(email,kind);
        CREATE TABLE IF NOT EXISTS notes(id TEXT PRIMARY KEY, contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, body TEXT NOT NULL, author TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
        CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY, contact_id TEXT REFERENCES contacts(id) ON DELETE CASCADE, title TEXT NOT NULL, due_date TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
        CREATE TABLE IF NOT EXISTS attempts(bucket TEXT NOT NULL, happened REAL NOT NULL);
        CREATE INDEX IF NOT EXISTS attempts_time ON attempts(happened);
        ''')
        db().commit()

    def throttle(bucket, limit, window):
        now = time.time()
        conn = db()
        conn.execute('DELETE FROM attempts WHERE happened < ?', (now - 3600,))
        count = conn.execute('SELECT count(*) FROM attempts WHERE bucket=? AND happened>?', (bucket, now - window)).fetchone()[0]
        if count >= limit:
            conn.commit()
            abort(429, description='Zu viele Versuche. Bitte später erneut versuchen.')
        conn.execute('INSERT INTO attempts VALUES (?,?)', (bucket, now))
        conn.commit()

    @app.before_request
    def guard():
        if not request.path.startswith('/api/'):
            return
        public = request.path.startswith('/api/public/')
        if request.method == 'OPTIONS' and public:
            return ('', 204)
        if request.method not in ('GET', 'HEAD', 'OPTIONS'):
            expected = app.config['WEBSITE_ORIGIN'] if public else app.config['PUBLIC_ORIGIN']
            if request.headers.get('Origin') != expected:
                abort(403, description='Unzulässiger Ursprung.')
            if not request.is_json:
                abort(415, description='JSON erforderlich.')
        if request.path == '/api/login' or public:
            return
        token = request.cookies.get('crm_session', '')
        hashed = hashlib.sha256(token.encode()).hexdigest()
        session = db().execute('SELECT s.*, e.email FROM sessions s JOIN employees e ON e.id=s.employee_id WHERE token=? AND expires>?', (hashed, time.time())).fetchone()
        if not session:
            abort(401, description='Bitte anmelden.')
        g.employee = session
        if request.method not in ('GET', 'HEAD', 'OPTIONS'):
            if not secrets.compare_digest(request.headers.get('X-CSRF-Token', ''), session['csrf']):
                abort(403, description='Sitzung neu laden und erneut versuchen.')

    @app.after_request
    def headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Referrer-Policy'] = 'same-origin'
        response.headers['Cache-Control'] = 'no-store' if request.path.startswith('/api/') else 'no-cache'
        response.headers['Content-Security-Policy'] = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'"
        if app.config['COOKIE_SECURE']:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000'
        if request.path.startswith('/api/public/') and request.headers.get('Origin') == app.config['WEBSITE_ORIGIN']:
            response.headers['Access-Control-Allow-Origin'] = app.config['WEBSITE_ORIGIN']
            response.headers['Vary'] = 'Origin'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
            response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        return response

    @app.errorhandler(Exception)
    def error(exc):
        from werkzeug.exceptions import HTTPException
        if isinstance(exc, HTTPException):
            return jsonify(error=exc.description), exc.code
        app.logger.exception('CRM request failed')
        return jsonify(error='Speichern fehlgeschlagen. Bitte erneut versuchen.'), 500

    def payload():
        value = request.get_json()
        if not isinstance(value, dict):
            abort(400, description='Ungültige Angaben.')
        return value

    def text(data, key, maximum=500, required=False):
        value = data.get(key, '')
        if not isinstance(value, str) or len(value) > maximum:
            abort(400, description=f'Ungültiges Feld: {key}')
        value = value.strip()
        if required and not value:
            abort(400, description=f'Bitte {key} ausfüllen.')
        return value

    def validate(data, public=False):
        kind = data.get('kind')
        if kind not in STATUSES:
            abort(400, description='Ungültiger Kontakttyp.')
        result = {k: text(data, k, 4000 if k == 'message' else 500, k in ('name', 'email')) for k in ['name', 'email', 'phone', 'company', 'interest', 'channel', 'offer_type', 'message']}
        result['email'] = result['email'].lower()
        if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', result['email']):
            abort(400, description='Bitte gültige E-Mail eingeben.')
        if result['channel'] not in CHANNELS or result['offer_type'] not in OFFERS:
            abort(400, description='Ungültige Auswahl.')
        if public and kind == 'customer' and (not result['phone'] or not result['channel']):
            abort(400, description='Telefonnummer und Kontaktkanal sind erforderlich.')
        if public and kind == 'provider' and (not result['company'] or not result['offer_type']):
            abort(400, description='Unternehmen und Kursangebot sind erforderlich.')
        result['kind'] = kind
        result['status'] = STATUSES[kind][0] if public else data.get('status', STATUSES[kind][0])
        if result['status'] not in STATUSES[kind]:
            abort(400, description='Ungültiger Status.')
        return result

    def insert_contact(data, source):
        identifier = str(uuid.uuid4())
        columns = list(data)
        try:
            db().execute(f"INSERT INTO contacts(id,{','.join(columns)},source) VALUES ({','.join('?' for _ in range(len(columns)+2))})", [identifier, *data.values(), source])
        except sqlite3.IntegrityError:
            abort(409, description='Dieser Kontakt ist bereits vorhanden.')
        return identifier

    def require_contact(identifier):
        if not db().execute('SELECT id FROM contacts WHERE id=?', (identifier,)).fetchone():
            abort(404, description='Kontakt nicht gefunden.')

    @app.post('/api/login')
    def login():
        data = payload()
        email = text(data, 'email', required=True).lower()
        password = text(data, 'password', 1024, required=True)
        # The socket address is safe by default; do not trust arbitrary forwarded headers.
        throttle('login-ip:' + request.remote_addr, 30, 900)
        throttle('login-email:' + email, 10, 900)
        employee = db().execute('SELECT * FROM employees WHERE email=?', (email,)).fetchone()
        if not check_password_hash(employee['password'] if employee else app.config['DUMMY_HASH'], password):
            abort(401, description='E-Mail oder Passwort stimmt nicht.')
        token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        db().execute('DELETE FROM sessions WHERE expires<?', (time.time(),))
        db().execute('INSERT INTO sessions VALUES (?,?,?,?)', (hashlib.sha256(token.encode()).hexdigest(), employee['id'], csrf, time.time() + 28800))
        db().commit()
        response = jsonify(email=email, csrf=csrf)
        response.set_cookie('crm_session', token, httponly=True, secure=app.config['COOKIE_SECURE'], samesite='Strict', max_age=28800, path='/')
        return response

    @app.get('/api/session')
    def session():
        return jsonify(email=g.employee['email'], csrf=g.employee['csrf'])

    @app.post('/api/logout')
    def logout():
        db().execute('DELETE FROM sessions WHERE token=?', (g.employee['token'],))
        db().commit()
        response = jsonify(ok=True)
        response.delete_cookie('crm_session', path='/')
        return response

    @app.get('/api/contacts')
    def contacts():
        return jsonify([dict(r) for r in db().execute('SELECT * FROM contacts ORDER BY created_at DESC, id')])

    @app.post('/api/contacts')
    def add_contact():
        identifier = insert_contact(validate(payload()), 'CRM')
        db().commit()
        return jsonify(id=identifier), 201

    @app.put('/api/contacts/<identifier>')
    def update_contact(identifier):
        require_contact(identifier)
        data = validate(payload())
        current = db().execute('SELECT kind FROM contacts WHERE id=?', (identifier,)).fetchone()
        if current['kind'] != data['kind']:
            abort(400, description='Kontakttyp kann nicht geändert werden.')
        try:
            db().execute(f"UPDATE contacts SET {','.join(k+'=?' for k in data)},updated_at=strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id=?", [*data.values(), identifier])
            db().commit()
        except sqlite3.IntegrityError:
            abort(409, description='Diese E-Mail ist bereits vorhanden.')
        return jsonify(ok=True)

    @app.get('/api/contacts/<identifier>/notes')
    def notes(identifier):
        require_contact(identifier)
        return jsonify([dict(r) for r in db().execute('SELECT * FROM notes WHERE contact_id=? ORDER BY created_at DESC', (identifier,))])

    @app.post('/api/contacts/<identifier>/notes')
    def add_note(identifier):
        require_contact(identifier)
        body = text(payload(), 'body', 4000, True)
        db().execute('INSERT INTO notes(id,contact_id,body,author) VALUES (?,?,?,?)', (str(uuid.uuid4()), identifier, body, g.employee['email']))
        db().commit()
        return jsonify(ok=True), 201

    @app.get('/api/tasks')
    def tasks():
        return jsonify([dict(r) for r in db().execute('SELECT t.*,c.name as contact_name FROM tasks t LEFT JOIN contacts c ON c.id=t.contact_id ORDER BY done,due_date')])

    @app.post('/api/tasks')
    def add_task():
        import datetime
        data = payload()
        title = text(data, 'title', 500, True)
        due = text(data, 'due_date', 10, True)
        try:
            datetime.date.fromisoformat(due)
        except ValueError:
            abort(400, description='Ungültiges Datum.')
        contact = text(data, 'contact_id') or None
        if contact:
            require_contact(contact)
        db().execute('INSERT INTO tasks(id,contact_id,title,due_date) VALUES (?,?,?,?)', (str(uuid.uuid4()), contact, title, due))
        db().commit()
        return jsonify(ok=True), 201

    @app.put('/api/tasks/<identifier>')
    def complete_task(identifier):
        done = payload().get('done')
        if type(done) is not bool:
            abort(400, description='Ungültiger Aufgabenstatus.')
        if db().execute('UPDATE tasks SET done=? WHERE id=?', (int(done), identifier)).rowcount == 0:
            abort(404, description='Aufgabe nicht gefunden.')
        db().commit()
        return jsonify(ok=True)

    @app.get('/api/export')
    def export():
        return jsonify(version=1, contacts=[dict(r) for r in db().execute('SELECT * FROM contacts')], notes=[dict(r) for r in db().execute('SELECT * FROM notes')], tasks=[dict(r) for r in db().execute('SELECT * FROM tasks')])

    @app.post('/api/import')
    def import_csv():
        data = payload()
        kind = data.get('kind')
        if kind not in STATUSES:
            abort(400, description='Ungültiger Typ.')
        content = text(data, 'csv', 1500000, True).lstrip('\ufeff')
        try:
            dialect = csv.Sniffer().sniff(content[:8192], delimiters=',;\t')
            reader = csv.DictReader(io.StringIO(content), dialect=dialect)
        except csv.Error:
            abort(400, description='CSV konnte nicht gelesen werden.')
        mapping = {'name': ['name','Name','contact'], 'email': ['email','Email','E-Mail'], 'phone': ['phone','Phone','Telefon'], 'company': ['company','Unternehmen'], 'interest': ['interest','Interest','category'], 'channel': ['channel','ContactChannel'], 'offer_type': ['offer_type'], 'message': ['message']}
        rows = list(reader)
        if not rows or len(rows) > 5000:
            abort(400, description='Bitte 1 bis 5000 Zeilen importieren.')
        valid = []
        for index, row in enumerate(rows, 2):
            mapped = {key: next((row.get(alias, '') or '' for alias in aliases if alias in row), '') for key, aliases in mapping.items()}
            mapped['kind'] = kind
            try:
                valid.append(validate(mapped))
            except Exception as exc:
                from werkzeug.exceptions import HTTPException
                if isinstance(exc, HTTPException):
                    abort(400, description=f'Zeile {index}: {exc.description}')
                raise
        added = skipped = 0
        for row in valid:
            if db().execute('SELECT id FROM contacts WHERE email=? AND kind=?', (row['email'], kind)).fetchone():
                skipped += 1
            else:
                insert_contact(row, 'Supabase-Import')
                added += 1
        db().commit()
        return jsonify(added=added, skipped=skipped)

    @app.post('/api/public/<kind>')
    def intake(kind):
        throttle('intake:' + request.remote_addr, 20, 3600)
        data = payload()
        if text(data, 'website'):  # Honeypot, optional in website forms.
            return jsonify(ok=True), 201
        if kind not in ('customers', 'providers'):
            abort(404)
        data['kind'] = 'customer' if kind == 'customers' else 'provider'
        row = validate(data, True)
        existing = db().execute('SELECT id FROM contacts WHERE email=? AND kind=?', (row['email'], row['kind'])).fetchone()
        if not existing:
            insert_contact(row, 'Website')
            db().commit()
        # Identical response avoids exposing whether an address already exists.
        return jsonify(ok=True), 201

    @app.get('/')
    @app.get('/<path:path>')
    def frontend(path='index.html'):
        if path.startswith('api/'):
            abort(404)
        if path.startswith(('assets/', 'favicon')):
            return send_from_directory(ROOT / 'dist', path)
        return send_from_directory(ROOT / 'dist', 'index.html')

    app.config['DUMMY_HASH'] = generate_password_hash(secrets.token_urlsafe(32), method='scrypt')

    @app.cli.command('create-admin')
    def create_admin():
        import click
        email = click.prompt('E-Mail').strip().lower()
        password = click.prompt('Neues Passwort', hide_input=True, confirmation_prompt=True)
        if len(password) < 12 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
            raise click.ClickException('Gültige E-Mail und Passwort mit mindestens 12 Zeichen erforderlich.')
        db().execute('INSERT INTO employees VALUES (?,?,?) ON CONFLICT(email) DO UPDATE SET password=excluded.password', (str(uuid.uuid4()), email, generate_password_hash(password, method='scrypt')))
        db().execute('DELETE FROM sessions WHERE employee_id IN (SELECT id FROM employees WHERE email=?)', (email,))
        db().commit()
        click.echo('Zugang gespeichert. Bestehende Sitzungen wurden beendet.')

    @app.cli.command('backup')
    def backup():
        import click
        target = click.prompt('Pfad der Sicherung')
        if Path(target).resolve() == Path(app.config['DATABASE']).resolve():
            raise click.ClickException('Bitte einen anderen Zielpfad wählen.')
        with sqlite3.connect(target) as dest:
            db().backup(dest)
        click.echo('Konsistente Datenbanksicherung erstellt. Sicherung sicher aufbewahren.')

    return app
