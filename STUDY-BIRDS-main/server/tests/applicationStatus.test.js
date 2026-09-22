const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Application = require('../src/models/Application');
const Notification = require('../src/models/Notification');
const StudentProfile = require('../src/models/StudentProfile');
const { updateApplicationStatus } = require('../src/controllers/applicationController');

const actions = [
  ['under-review', 'under-review'], ['accepted', 'accepted'],
  ['rejected', 'rejected'], ['submitted', 'submitted'],
  ['preliminary-accepted', 'conditional-admission'],
  ['preliminary-accepted-first-payment', 'payment-required'],
  ['final-accepted', 'final-admission'],
  ['file-completed-accepted', 'completed'],
  ['file-completed-rejected', 'rejected'],
];

test('every admin review action saves, synchronizes detail and returns its timeline', async (t) => {
  // Exercise Mongoose validation and save hooks without a production database.
  t.mock.method(Application.collection, 'updateOne', async () => ({ acknowledged: true, matchedCount: 1 }));
  t.mock.method(Notification, 'create', async () => ({}));
  t.mock.method(StudentProfile, 'find', () => ({ lean: async () => [] }));
  for (const [status, detailedStatus] of actions) {
    const application = Application.hydrate({
      _id: new mongoose.Types.ObjectId(), student: new mongoose.Types.ObjectId(),
      program: new mongoose.Types.ObjectId(), university: new mongoose.Types.ObjectId(),
      status: 'draft', detailedStatus: 'draft', statusTimeline: [],
    });
    t.mock.method(Application, 'findById', () => {
      const query = { populate: () => query, then: (resolve, reject) => Promise.resolve(application).then(resolve, reject) };
      return query;
    });
    let response;
    const res = { json: (value) => { response = value; } };
    await updateApplicationStatus({
      body: { status, note: 'Review note' }, params: { id: String(application._id) },
      user: { _id: new mongoose.Types.ObjectId() },
    }, res, (error) => { throw error; });
    assert.equal(response.status, status);
    assert.equal(response.detailedStatus, detailedStatus);
    assert.equal(response.statusTimeline[0].status, status);
    assert.equal(response.statusTimeline[0].note, 'Review note');
  }
});

test('unknown or missing review statuses return 400 before database access', async (t) => {
  t.mock.method(Application, 'findById', () => { assert.fail('Must validate before querying'); });
  for (const status of [undefined, null, '', 'unknown', '__proto__', ['accepted']]) {
    let statusCode, response;
    const res = {
      status(code) { statusCode = code; return this; },
      json(value) { response = value; },
    };
    await updateApplicationStatus({ body: { status } }, res, (error) => { throw error; });
    assert.equal(statusCode, 400);
    assert.equal(response.message, 'Invalid application status');
  }
});
