const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require(path.join(process.env.STUDY_BIRDS_TEST_TOOLS, 'node_modules/mongodb-memory-server-core'));
const {
  APPLICATION_STATUS_COPY, DOCUMENT_STATUS_COPY, documentStatusInfo, applicationStatusInfo,
} = require('../src/constants/statusCatalog');
const { ALL_APPLICATION_DETAILED_STATUSES, ALL_DOCUMENT_DETAILED_STATUSES } = require('../src/constants/roles');

test('every application and document status has student-facing copy and a fixed code', () => {
  const codes = new Set();
  for (const [statuses, copy] of [[ALL_APPLICATION_DETAILED_STATUSES, APPLICATION_STATUS_COPY], [ALL_DOCUMENT_DETAILED_STATUSES, DOCUMENT_STATUS_COPY]]) {
    assert.deepEqual(Object.keys(copy).sort(), [...statuses].sort());
    for (const status of statuses) {
      const entry = copy[status];
      assert.match(entry.code, /^(APP|DOC)_\d{2}_[A-Z_]+$/);
      assert.ok(!codes.has(entry.code), `duplicate code ${entry.code}`);
      codes.add(entry.code);
      for (const lang of ['ar', 'en']) {
        for (const field of ['label', 'meaning', 'nextStep']) {
          const text = entry[lang][field];
          assert.ok(typeof text === 'string' && text.trim().length > 1, `${status}.${lang}.${field}`);
          // The internal code never leaks into what the student reads.
          assert.ok(!text.includes(status) || !status.includes('-'), `${status} leaks into ${lang}.${field}`);
        }
      }
    }
  }
  // Unknown values fall back safely instead of showing a raw code.
  assert.equal(applicationStatusInfo({ detailedStatus: 'mystery' }).ar.label, 'تم التقديم');
  assert.equal(documentStatusInfo({ status: 'verified' }).status, 'approved');
  assert.equal(documentStatusInfo({ detailedStatus: 'rejected', reviewNote: 'الختم غير واضح' }).ar.meaning, 'تم رفض المستند نظرًا لـ: الختم غير واضح');
  assert.equal(documentStatusInfo({ detailedStatus: 'expired', expiresAt: '2026-01-31T00:00:00Z' }).ar.meaning, 'انتهت صلاحية المستند بتاريخ 2026-01-31.');
});

test('staff set all lifecycle statuses and review documents; students read plain-language status', async () => {
  process.env.JWT_SECRET = 'status-system-test';
  const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  let server;
  try {
    await mongoose.connect(mongo.getUri());
    const User = require('../src/models/User');
    const Country = require('../src/models/Country');
    const University = require('../src/models/University');
    const Program = require('../src/models/Program');
    const Application = require('../src/models/Application');
    const Document = require('../src/models/Document');
    const Notification = require('../src/models/Notification');
    const student = await User.create({ name: 'Student', email: 'student@example.test' });
    const admissions = await User.create({ name: 'Admissions', email: 'adm@example.test', role: 'employee', permissions: ['applications'] });
    const reviewer = await User.create({ name: 'Reviewer', email: 'rev@example.test', role: 'employee', permissions: ['student-documents'] });
    const outsider = await User.create({ name: 'Support', email: 'sup@example.test', role: 'employee', permissions: ['support'] });
    const country = await Country.create({ name: 'Turkey', code: 'TR' });
    const university = await University.create({ name: 'Istanbul University', country: country._id });
    const program = await Program.create({ title: 'Medicine', university: university._id, degreeLevel: 'bachelor', fieldOfStudy: 'Medicine' });
    const passport = await Document.create({ student: student._id, type: 'passport', fileName: 'p.pdf', filePath: '/p' });
    const application = await Application.create({ student: student._id, program: program._id, university: university._id, documents: [passport._id] });
    server = await new Promise(resolve => { const s = require('../src/app').listen(0, '127.0.0.1', () => resolve(s)); });
    const token = user => jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    async function call(method, endpoint, user, body, expected = 200) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api${endpoint}`, { method,
        headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${token(user)}` } : {}) },
        body: body ? JSON.stringify(body) : undefined });
      const data = await response.json(); assert.equal(response.status, expected, JSON.stringify(data)); return data;
    }

    // Application: statuses the old review list couldn't reach are now settable.
    await call('PUT', `/applications/${application._id}/status`, outsider, { detailedStatus: 'payment-verification' }, 403);
    await call('PUT', `/applications/${application._id}/status`, admissions, { detailedStatus: 'teleported' }, 400);
    for (const [detailedStatus, legacy] of [['documents-missing', 'draft'], ['payment-verification', 'under-review'], ['visa-preparation', 'accepted']]) {
      const updated = await call('PUT', `/applications/${application._id}/status`, admissions, { detailedStatus, note: 'متابعة' });
      assert.equal(updated.detailedStatus, detailedStatus);
      assert.equal(updated.status, legacy);
      assert.equal(updated.statusInfo.status, detailedStatus);
    }
    // Legacy website actions still work and map to the detailed lifecycle.
    assert.equal((await call('PUT', `/applications/${application._id}/status`, admissions, { status: 'preliminary-accepted' })).detailedStatus, 'conditional-admission');
    const notices = await Notification.find({ user: student._id }).sort({ createdAt: 1 }).lean();
    assert.equal(notices.length, 4);
    assert.equal(notices[1].title, 'تحديث طلبك: التحقق من الدفع');
    assert.match(notices[1].message, /^Medicine — استلمنا إثبات الدفع/);
    for (const notice of notices) assert.doesNotMatch(`${notice.title} ${notice.message}`, /[a-z]+-[a-z]+/, 'no raw status code');

    // The student sees label, meaning and next step, never having to decode a code.
    const [mine] = await call('GET', '/students/applications', student);
    assert.equal(mine.statusInfo.code, 'APP_07_CONDITIONAL_ADMISSION');
    assert.equal(mine.statusInfo.ar.label, 'قبول مبدئي');
    assert.ok(mine.statusInfo.ar.nextStep.length > 10);
    assert.equal(mine.documents[0].statusInfo.ar.label, 'تم الرفع');

    // Document review: any of the 8 statuses; a reason is required when the student must act.
    const [listed] = await call('GET', '/admin/student-documents', reviewer);
    assert.equal(listed.statusInfo.status, 'uploaded');
    await call('PATCH', `/admin/student-documents/${passport._id}`, outsider, { detailedStatus: 'approved', version: listed.__v }, 403);
    for (const detailedStatus of ['rejected', 'needs-revision', 'needs-translation']) {
      await call('PATCH', `/admin/student-documents/${passport._id}`, reviewer, { detailedStatus, version: listed.__v }, 400);
    }
    await call('PATCH', `/admin/student-documents/${passport._id}`, reviewer, { detailedStatus: 'approved', version: 'x' }, 400);
    await call('PATCH', `/admin/student-documents/${passport._id}`, reviewer, { detailedStatus: 'approved', version: listed.__v, expiresAt: '2000-01-01' }, 400);
    const rejected = await call('PATCH', `/admin/student-documents/${passport._id}`, reviewer,
      { detailedStatus: 'rejected', reviewNote: 'الختم غير واضح، أعد رفعه بصورة واضحة عبر السكانر', version: listed.__v });
    assert.equal(rejected.status, 'rejected');
    // A second reviewer working from the old version cannot overwrite that decision.
    await call('PATCH', `/admin/student-documents/${passport._id}`, reviewer, { detailedStatus: 'approved', version: listed.__v }, 409);
    await call('PATCH', `/admin/student-documents/${new mongoose.Types.ObjectId()}`, reviewer, { detailedStatus: 'approved', version: 0 }, 404);

    const [studentDoc] = await call('GET', '/students/documents', student);
    assert.equal(studentDoc.statusInfo.ar.meaning, 'تم رفض المستند نظرًا لـ: الختم غير واضح، أعد رفعه بصورة واضحة عبر السكانر');
    assert.equal(studentDoc.statusInfo.code, 'DOC_05_REJECTED');
    assert.equal(studentDoc.reviewHistory, undefined);
    assert.equal(studentDoc.reviewedBy, undefined);
    const docNotice = await Notification.findOne({ user: student._id, title: /جواز السفر/ }).lean();
    assert.equal(docNotice.title, 'جواز السفر: مرفوض');
    assert.match(docNotice.message, /الختم غير واضح/);

    // Expiry: an approved document with a validity date lapses to "expired" once it passes.
    const approved = await call('PATCH', `/admin/student-documents/${passport._id}`, reviewer,
      { detailedStatus: 'approved', expiresAt: new Date(Date.now() + 86400000).toISOString(), version: rejected.__v });
    assert.equal(approved.status, 'verified');
    assert.equal(approved.reviewHistory.length, 2);
    await Document.updateOne({ _id: passport._id }, { expiresAt: new Date(Date.now() - 1000) });
    const [expired] = await call('GET', '/students/documents', student);
    assert.equal(expired.detailedStatus, 'expired');
    assert.equal(expired.status, 'pending');
    assert.match(expired.statusInfo.ar.meaning, /^انتهت صلاحية المستند بتاريخ \d{4}-\d{2}-\d{2}\.$/);
    const overview = await call('GET', '/students/overview', student);
    assert.equal(overview.recentDocuments[0].statusInfo.status, 'expired');
    assert.equal(overview.recentApplications[0].statusInfo.status, 'conditional-admission');
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect(); await mongo.stop();
  }
});
