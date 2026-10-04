import sqlite3
import tempfile
import unittest
from pathlib import Path
from werkzeug.security import generate_password_hash
from server.app import create_app

class CRMTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.path = str(Path(self.directory.name) / 'crm.sqlite')
        self.config = dict(TESTING=True, DATABASE=self.path, COOKIE_SECURE=False, PUBLIC_ORIGIN='http://localhost:3000')
        self.app = create_app(self.config)
        with sqlite3.connect(self.path) as db:
            db.execute('INSERT INTO employees VALUES (?,?,?)', ('admin', 'test@example.org', generate_password_hash('Test-only-very-long-password')))
        self.client = self.app.test_client()
        self.origin = {'Origin':'http://localhost:3000'}
        r = self.client.post('/api/login', json={'email':'test@example.org','password':'Test-only-very-long-password'}, headers=self.origin)
        self.assertEqual(r.status_code, 200)
        self.headers = {**self.origin,'X-CSRF-Token':r.json['csrf']}
        self.contact = dict(kind='customer', name='Test Person', email='person@example.org', phone='+41790000000', channel='Beides', interest='Kochen')
    def tearDown(self):
        self.directory.cleanup()
    def add(self):
        r=self.client.post('/api/contacts',json=self.contact,headers=self.headers)
        self.assertEqual(r.status_code,201)
        return r.json['id']
    def test_security_and_logout_revokes_copied_cookie(self):
        self.assertEqual(self.app.test_client().get('/api/contacts').status_code,401)
        self.assertEqual(self.client.post('/api/contacts',json=self.contact,headers=self.origin).status_code,403)
        self.assertEqual(self.client.post('/api/contacts',json=self.contact,headers={**self.headers,'Origin':'https://evil.example'}).status_code,403)
        cookie=self.client.get_cookie('crm_session').value
        self.client.post('/api/logout',json={},headers=self.headers)
        copied=self.app.test_client();copied.set_cookie('crm_session',cookie)
        self.assertEqual(copied.get('/api/contacts').status_code,401)
    def test_persistence_notes_tasks_and_update(self):
        identifier=self.add()
        self.contact['status']='Pausiert'
        self.assertEqual(self.client.put('/api/contacts/'+identifier,json=self.contact,headers=self.headers).status_code,200)
        self.client.post(f'/api/contacts/{identifier}/notes',json={'body':'Rückruf vereinbart'},headers=self.headers)
        self.client.post('/api/tasks',json={'title':'Anrufen','due_date':'2026-10-10','contact_id':identifier},headers=self.headers)
        restart=create_app(self.config).test_client()
        restart.set_cookie('crm_session',self.client.get_cookie('crm_session').value)
        self.assertEqual(restart.get('/api/contacts').json[0]['status'],'Pausiert')
        self.assertEqual(restart.get(f'/api/contacts/{identifier}/notes').json[0]['body'],'Rückruf vereinbart')
        task=restart.get('/api/tasks').json[0]
        self.assertEqual(self.client.put('/api/tasks/'+task['id'],json={'done':True},headers=self.headers).status_code,200)
        self.assertEqual(restart.get('/api/tasks').json[0]['done'],1)
    def test_import_validation_atomicity_and_duplicates(self):
        invalid='Name,Email,Phone,Interest,ContactChannel\nA,a@example.org,123,Kochen,Beides\nB,invalid,123,Tanzen,E-Mail\n'
        r=self.client.post('/api/import',json={'kind':'customer','csv':invalid},headers=self.headers)
        self.assertEqual(r.status_code,400)
        self.assertEqual(self.client.get('/api/contacts').json,[])
        valid='Name;Email;Phone;Interest;ContactChannel\nA;a@example.org;123;Kochen;WhatsApp\n'
        r=self.client.post('/api/import',json={'kind':'customer','csv':valid},headers=self.headers)
        self.assertEqual(r.json,{'added':1,'skipped':0})
        r=self.client.post('/api/import',json={'kind':'customer','csv':valid},headers=self.headers)
        self.assertEqual(r.json,{'added':0,'skipped':1})
        c=self.client.get('/api/contacts').json[0]
        self.assertEqual((c['phone'],c['channel']),('123','WhatsApp'))
    def test_provider_import_and_intake_validation(self):
        csv='company,contact,email,offer_type,category,message\nStudio,Anna,anna@example.org,Beides,Yoga,Hallo\n'
        r=self.client.post('/api/import',json={'kind':'provider','csv':csv},headers=self.headers)
        self.assertEqual(r.json['added'],1)
        provider=self.client.get('/api/contacts').json[0]
        self.assertEqual((provider['company'],provider['name'],provider['offer_type']),('Studio','Anna','Beides'))
        headers={'Origin':'https://sponti-switzerland.ch'}
        invalid={**self.contact,'phone':''}
        self.assertEqual(self.client.post('/api/public/customers',json=invalid,headers=headers).status_code,400)
        self.assertEqual(self.client.post('/api/public/customers',json=self.contact,headers=headers).status_code,201)
        self.assertEqual(self.app.test_client().get('/api/contacts').status_code,401)
        self.assertEqual(self.client.post('/api/public/customers',json=self.contact,headers={'Origin':'https://evil.example'}).status_code,403)
    def test_login_throttle_and_cookie_flags(self):
        c=self.app.test_client()
        r=c.post('/api/login',json={'email':'test@example.org','password':'wrong'},headers=self.origin)
        self.assertEqual(r.status_code,401)
        for _ in range(9):
            r=c.post('/api/login',json={'email':'test@example.org','password':'wrong'},headers=self.origin)
        self.assertEqual(r.status_code,429)
        production=create_app({**self.config,'COOKIE_SECURE':True}).test_client()
        r=production.post('/api/login',json={'email':'new@example.org','password':'wrong'},headers=self.origin)
        self.assertEqual(r.status_code,401)
        cookie=self.client.get_cookie('crm_session')
        self.assertTrue(cookie.http_only)
        self.assertEqual(cookie.same_site,'Strict')
    def test_private_files_not_served(self):
        r=self.client.get('/private-data/crm.sqlite')
        self.assertNotIn(b'SQLite format',r.data)
        r.close()
        r=self.client.get('/api/export')
        self.assertNotIn('employees',r.json)
        self.assertNotIn('sessions',r.json)

if __name__=='__main__':
    unittest.main()
