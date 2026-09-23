const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { studentHome } = require('../src/utils/studentHome');

const now = new Date('2026-09-23T12:00:00Z');
const inDays = days => new Date(now.getTime() + days * 86400000);
const program = { title: 'Physiotherapy', applicationDeadline: inDays(20), university: { name: 'Istanbul University', city: 'Istanbul', country: { name: 'Turkey' } } };
const app = (extra = {}) => ({ _id: 'a1', program, status: 'under-review', detailedStatus: 'under-review', statusTimeline: [], createdAt: now, ...extra });
const finalAdmission = extra => app({ status: 'accepted', detailedStatus: 'final-admission', ...extra });

test('the context card follows where the student is in the journey', () => {
  const context = input => studentHome(input, now).context.key;
  assert.equal(context({}), 'start');
  assert.equal(context({ applications: [app()], nextAction: { code: 'document-correction', destination: 'documents' } }), 'documents');
  assert.equal(context({ applications: [app()] }), 'in-progress');
  assert.equal(context({ applications: [finalAdmission()] }), 'visa');
  assert.equal(context({ applications: [finalAdmission({ visaCase: { status: 'approved' } })] }), 'travel');
  assert.equal(context({ applications: [finalAdmission({ visaCase: { status: 'approved' } })], arrivals: [{ status: 'submitted', arrivalDate: inDays(12) }] }), 'departure');
  assert.equal(context({ applications: [finalAdmission()], arrivals: [{ status: 'submitted', arrivalDate: inDays(-2) }] }), 'registration');
  assert.equal(context({ applications: [finalAdmission({ postAdmission: { registration: { status: 'completed' } } })], arrivals: [{ status: 'completed', arrivalDate: inDays(-20) }] }), 'settled');
  // A draft arrival request doesn't count as a planned trip.
  assert.equal(context({ applications: [finalAdmission({ visaCase: { status: 'approved' } })], arrivals: [{ status: 'draft', arrivalDate: inDays(5) }] }), 'travel');
  // The documents card sends the student to the exact place of the missing item.
  assert.equal(studentHome({ applications: [app()], nextAction: { code: 'documents-required', destination: 'applications' } }, now).context.destination, 'applications');
});

test('status card, journey, progress, sections and recent activity', () => {
  const home = studentHome({
    user: { name: 'أحمد' },
    applications: [
      app({ _id: 'old', detailedStatus: 'rejected', status: 'rejected', createdAt: inDays(-90) }),
      app({ statusTimeline: [{ status: 'submitted', changedAt: inDays(-10) }, { status: 'preliminary-accepted', changedAt: inDays(-1) }] }),
    ],
    documents: [
      { _id: 'd1', type: 'transcript', detailedStatus: 'rejected', reviewNote: 'غير واضح', reviewedAt: inDays(-3) },
      { _id: 'd2', type: 'passport', detailedStatus: 'approved' },
      { _id: 'd3', type: 'passport', detailedStatus: 'uploaded' },
    ],
    invoices: [{ _id: 'i1', status: 'unpaid', dueDate: inDays(-2), amount: 500, description: 'رسوم التسجيل' }],
    nextAction: { code: 'track-application', titleAr: 'متابعة طلبك', titleEn: 'Track', destination: 'applications', waiting: true },
    journeys: [{ applicationId: 'a1', stages: [{ status: 'completed' }, { status: 'waiting' }, { status: 'not-required' }, { status: 'action-required' }] }],
    openTickets: 2, unreadNotifications: 4,
  }, now);
  assert.equal(home.greeting.name, 'أحمد');
  // The active application represents the journey, not the rejected one.
  assert.deepEqual(home.currentJourney, { applicationId: 'a1', country: 'Turkey', city: 'Istanbul', university: 'Istanbul University', program: 'Physiotherapy' });
  assert.equal(home.progressPercent, 33);
  assert.equal(home.statusCard.labelAr, 'قيد المراجعة');
  assert.equal(home.statusCard.nextStepAr, 'متابعة طلبك');
  assert.equal(home.statusCard.waiting, true);
  assert.deepEqual(home.sections.documents, { total: 3, approved: 1, needsAction: 1, underReview: 1 });
  assert.deepEqual([home.sections.payments.unpaid, home.sections.payments.overdue, home.sections.payments.nextDueAmount], [1, 1, 500]);
  assert.equal(home.sections.support.openTickets, 2);
  assert.equal(home.sections.notifications.unread, 4);
  assert.equal(home.sections.visa, null);
  // Website review codes in the timeline read as plain Arabic.
  assert.deepEqual(home.sections.recentActivity.map(item => item.titleAr), ['Physiotherapy: قبول مبدئي', 'كشف الدرجات: مرفوض', 'Physiotherapy: تم التقديم']);
  assert.deepEqual(home.quickActions.map(item => item.key), ['programs', 'universities', 'applications', 'upload-document', 'consultation', 'visa', 'travel', 'accommodation', 'payments', 'support', 'bird-ai']);
});

test('important dates: upcoming and overdue items with a countdown, most urgent first', () => {
  const home = studentHome({
    applications: [finalAdmission({
      visaCase: { status: 'submitted', appointment: { date: inDays(5) } },
      studiesStartAt: inDays(60),
      postAdmission: { housing: { status: 'in-progress', dueAt: inDays(40) }, registration: { status: 'completed', dueAt: inDays(3) } },
    }), app({ _id: 'a2', detailedStatus: 'documents-missing', status: 'draft' })],
    invoices: [{ _id: 'i1', status: 'unpaid', dueDate: inDays(-1), description: 'القسط الأول' }, { _id: 'i2', status: 'paid', dueDate: inDays(2) }],
    arrivals: [{ _id: 'r1', status: 'submitted', arrivalDate: inDays(25) }],
    bookings: [{ _id: 'b1', status: 'confirmed', moveInDate: inDays(26) }, { _id: 'b2', status: 'cancelled', moveInDate: inDays(1) }],
    consultations: [{ _id: 'c1', startsAt: inDays(2) }],
    documents: [{ _id: 'd1', type: 'passport', detailedStatus: 'approved', expiresAt: inDays(45) }, { _id: 'd2', type: 'transcript', detailedStatus: 'approved', expiresAt: inDays(400) }],
  }, now);
  const dates = home.importantDates.map(item => [item.key, item.daysLeft, item.critical]);
  assert.deepEqual(dates, [
    ['payment-due', -1, true],
    ['consultation', 2, true],
    ['visa-appointment', 5, true],
    ['application-deadline', 20, false],
    ['arrival', 25, false],
    ['housing-start', 26, false],
    ['stage-housing', 40, false],
    ['document-expiry', 45, false],
  ]);
  assert.equal(home.importantDates[0].overdue, true);
  assert.equal(home.importantDates[0].titleAr, 'استحقاق دفعة: القسط الأول');
  // Completed stages, paid invoices, cancelled housing and far-off expiries are left out;
  // the list is capped at 8, so the later study start is dropped here.
  assert.ok(!home.importantDates.some(item => ['stage-registration', 'studies-start'].includes(item.key)));
});

test('overview returns the home payload built from the student\'s real records', async () => {
  process.env.JWT_SECRET = 'student-home-test';
  const { MongoMemoryServer } = require(path.join(process.env.STUDY_BIRDS_TEST_TOOLS, 'node_modules/mongodb-memory-server-core'));
  const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  let server;
  try {
    await mongoose.connect(mongo.getUri());
    const User = require('../src/models/User');
    const Country = require('../src/models/Country');
    const University = require('../src/models/University');
    const Program = require('../src/models/Program');
    const Application = require('../src/models/Application');
    const ArrivalServiceRequest = require('../src/models/ArrivalServiceRequest');
    const student = await User.create({ name: 'Ahmad', email: 'ahmad@example.test' });
    const other = await User.create({ name: 'Other', email: 'other@example.test' });
    const staff = await User.create({ name: 'Staff', email: 'staff@example.test', role: 'employee', permissions: ['applications'] });
    const country = await Country.create({ name: 'Turkey', code: 'TR' });
    const university = await University.create({ name: 'Istanbul University', city: 'Istanbul', country: country._id });
    const physio = await Program.create({ title: 'Physiotherapy', university: university._id, degreeLevel: 'bachelor', fieldOfStudy: 'Health' });
    const application = await Application.create({ student: student._id, program: physio._id, university: university._id, status: 'accepted', detailedStatus: 'final-admission', visaCase: { status: 'approved' } });
    const arrivalDate = new Date(Date.now() + 10 * 86400000);
    await ArrivalServiceRequest.create({ student: student._id, arrivalDate, status: 'submitted' });
    // Another student's trip must never leak into this home screen.
    await ArrivalServiceRequest.create({ student: other._id, arrivalDate: new Date(Date.now() + 3 * 86400000), status: 'submitted' });
    server = await new Promise(resolve => { const s = require('../src/app').listen(0, '127.0.0.1', () => resolve(s)); });
    const call = async (method, endpoint, user, body, expected = 200) => {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api${endpoint}`, { method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt.sign({ userId: user._id }, process.env.JWT_SECRET)}` },
        body: body ? JSON.stringify(body) : undefined });
      const data = await response.json(); assert.equal(response.status, expected, JSON.stringify(data)); return data;
    };

    // Staff record the first day of classes with the registration stage.
    const studiesStart = new Date(Date.now() + 30 * 86400000).toISOString();
    await call('PATCH', `/applications/${application._id}/post-admission`, staff,
      { stage: 'registration', status: 'in-progress', note: 'التسجيل عند الوصول', studiesStartAt: 'not-a-date', version: 0 }, 400);
    const staged = await call('PATCH', `/applications/${application._id}/post-admission`, staff,
      { stage: 'registration', status: 'in-progress', note: 'التسجيل عند الوصول', studiesStartAt: studiesStart, version: 0 });
    assert.equal(staged.studiesStartAt, studiesStart);

    const { home } = await call('GET', '/students/overview', student);
    assert.equal(home.greeting.name, 'Ahmad');
    assert.equal(home.context.key, 'departure');
    assert.equal(home.currentJourney.city, 'Istanbul');
    assert.equal(home.statusCard.labelAr, 'قبول نهائي');
    assert.deepEqual(home.importantDates.map(item => [item.key, item.daysLeft]), [['arrival', 10], ['studies-start', 30]]);
    assert.equal(home.sections.visa.labelAr, 'صدرت التأشيرة');
    assert.equal(home.sections.travel.arrivalDate, arrivalDate.toISOString());
    assert.equal(home.quickActions.length, 11);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect(); await mongo.stop();
  }
});
