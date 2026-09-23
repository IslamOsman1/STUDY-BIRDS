const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require(path.join(process.env.STUDY_BIRDS_TEST_TOOLS, 'node_modules/mongodb-memory-server-core'));

test('visa case is scoped, staff-controlled, versioned and listed for the Visa Center', async () => {
  process.env.JWT_SECRET = 'visa-case-isolated-test';
  const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  let server;
  try {
    await mongoose.connect(mongo.getUri());
    const User = require('../src/models/User'); const Application = require('../src/models/Application');
    const Program = require('../src/models/Program'); const University = require('../src/models/University');
    const student = await User.create({ name: 'Student', email: 'student@example.test' });
    const other = await User.create({ name: 'Other', email: 'other@example.test' });
    const visaOfficer = await User.create({ name: 'Visa Officer', email: 'visa@example.test', role: 'employee', permissions: ['visa'] });
    const admissions = await User.create({ name: 'Admissions', email: 'admissions@example.test', role: 'employee', permissions: ['applications'] });
    const university = await University.create({ name: 'Test University', country: new mongoose.Types.ObjectId(), city: 'City' });
    const program = await Program.create({ title: 'Computer Science', university: university._id, degreeLevel: 'bachelor', fieldOfStudy: 'Computer Science' });
    const app = await Application.create({ student: student._id, program: program._id, university: university._id, detailedStatus: 'final-admission', requiredDocumentTypes: [] });
    const notEligible = await Application.create({ student: other._id, program: program._id, university: university._id, detailedStatus: 'under-review', requiredDocumentTypes: [] });
    const rejected = await Application.create({ student: other._id, program: program._id, university: university._id, detailedStatus: 'rejected', requiredDocumentTypes: [] });
    server = await new Promise(resolve => { const s = require('../src/app').listen(0, '127.0.0.1', () => resolve(s)); });
    async function call(method, endpoint, user, body, expected = 200) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api${endpoint}`, { method,
        headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${jwt.sign({ userId: user._id }, process.env.JWT_SECRET)}` } : {}) },
        body: body ? JSON.stringify(body) : undefined });
      const data = await response.json(); assert.equal(response.status, expected, JSON.stringify(data)); return data;
    }
    const route = `/applications/${app._id}/visa-case`;

    // Auth and isolation on the single-case endpoint.
    await call('GET', route, null, null, 401);
    await call('GET', route, other, null, 404);
    await call('GET', route, admissions, null, 403);
    const initial = await call('GET', route, student);
    assert.equal(initial.eligible, true);
    assert.equal(initial.status, 'not-started');
    assert.deepEqual(initial.requirements, []);

    // Only a 'visa' permission holder (or admin) can edit; students and general admissions staff cannot.
    const body = {
      status: 'preparing-documents',
      requirements: [{ label: 'ترجمة كشف الدرجات', done: false }, { label: 'صورة جواز السفر', done: true }],
      appointmentDate: '2099-03-01T09:00:00.000Z', appointmentLocation: 'السفارة التركية',
      insuranceProvider: 'Allianz', insurancePolicyNumber: 'POL-1', insuranceExpiresAt: '2099-06-01T00:00:00.000Z',
      notes: 'بانتظار ترجمة كشف الدرجات', version: 0,
    };
    await call('PATCH', route, student, body, 403);
    await call('PATCH', route, admissions, body, 403);
    for (const invalid of [{ status: 'invented' }, { version: -1 }, { requirements: [{ label: '', done: false }] },
      { requirements: 'not-an-array' }, { appointmentDate: 'invalid' }, { insuranceExpiresAt: 'invalid' }]) {
      await call('PATCH', route, visaOfficer, { ...body, ...invalid }, 400);
    }
    const changed = await call('PATCH', route, visaOfficer, body);
    assert.equal(changed.version, 1);
    assert.equal(changed.status, 'preparing-documents');
    assert.equal(changed.requirements.length, 2);
    assert.equal(changed.requirements[1].done, true);
    assert.equal(changed.appointment.location, 'السفارة التركية');
    assert.equal(changed.insurance.provider, 'Allianz');

    // Stale version is rejected.
    await call('PATCH', route, visaOfficer, body, 409);

    const stored = await Application.findById(app._id).lean();
    assert.equal(stored.visaCaseHistory.length, 1);
    assert.equal(String(stored.visaCaseHistory[0].changedBy), String(visaOfficer._id));
    assert.equal(stored.visaCaseHistory[0].fromStatus, 'not-started');
    assert.equal(stored.visaCaseHistory[0].status, 'preparing-documents');

    // A closed application cannot be edited even by the visa officer.
    await Application.updateOne({ _id: app._id }, { $set: { detailedStatus: 'completed' } });
    await call('PATCH', route, visaOfficer, { ...body, version: 1 }, 409);
    await Application.updateOne({ _id: app._id }, { $set: { detailedStatus: 'final-admission' } });

    // The Visa Center list is staff-only and only includes eligible, non-closed applications.
    await call('GET', '/applications/visa-cases', null, null, 401);
    await call('GET', '/applications/visa-cases', student, null, 403);
    await call('GET', '/applications/visa-cases', admissions, null, 403);
    const list = await call('GET', '/applications/visa-cases', visaOfficer);
    const ids = list.map(r => r.applicationId);
    assert.ok(ids.includes(String(app._id)));
    assert.ok(!ids.includes(String(notEligible._id)));
    assert.ok(!ids.includes(String(rejected._id)));
    const row = list.find(r => r.applicationId === String(app._id));
    assert.equal(row.student.name, 'Student');
    assert.equal(row.university, 'Test University');
    assert.equal(row.program, 'Computer Science');
    assert.equal(row.status, 'preparing-documents');
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect(); await mongo.stop();
  }
});
