const { test } = require('node:test');
const assert = require('node:assert/strict');
const { studentNextAction } = require('../src/utils/studentNextAction');

test('overdue invoice precedes document correction; paid invoices never prompt payment', () => {
  const data = { documents: [{ _id: 'd', detailedStatus: 'rejected', type: 'passport' }], invoices: [
    { _id: 'paid', status: 'paid', dueDate: '2020-01-01' },
    { _id: 'due', status: 'unpaid', dueDate: '2021-01-01', description: 'Tuition' },
  ] };
  assert.equal(studentNextAction(data).entityId, 'due');
  data.invoices[1].status = 'paid';
  assert.equal(studentNextAction(data).code, 'document-correction');
});

test('proof pending review requests waiting, not another payment', () => {
  const result = studentNextAction({ invoices: [{ _id: 'invoice', status: 'pending-confirmation' }] });
  assert.equal(result.code, 'payment-review');
  assert.equal(result.waiting, true);
});

test('closed application documents do not block an active application unless shared', () => {
  const data = { applications: [
    { _id: 'old', detailedStatus: 'rejected', documents: ['d'] },
    { _id: 'new', detailedStatus: 'draft', documents: [] },
  ], documents: [{ _id: 'd', detailedStatus: 'rejected' }] };
  assert.equal(studentNextAction(data).code, 'complete-application');
  data.applications[1].documents.push('d');
  assert.equal(studentNextAction(data).code, 'document-correction');
});

test('missing invoice is a team action; pending application is not declared approved', () => {
  const data = { applications: [{ _id: 'a', detailedStatus: 'payment-required' }] };
  assert.equal(studentNextAction(data).destination, 'support');
  data.applications[0].detailedStatus = 'under-review';
  assert.equal(studentNextAction(data).waiting, true);
  assert.equal(data.applications[0].detailedStatus, 'under-review');
});

test('empty account gets discovery; closed applications get outcome review', () => {
  assert.equal(studentNextAction({}).destination, 'catalog');
  assert.equal(studentNextAction({ applications: [{ status: 'rejected' }] }).code, 'review-applications');
});

test('urgency and due date ranking is stable without mutating input', () => {
  const data = { invoices: [
    { _id: 'later', status: 'unpaid', dueDate: '2030-03-02' },
    { _id: 'first', status: 'unpaid', dueDate: '2030-03-01' },
  ] };
  const original = JSON.stringify(data);
  assert.equal(studentNextAction(data, new Date('2030-01-01')).entityId, 'first');
  assert.equal(JSON.stringify(data), original);
});

test('application requirements only count documents attached to that application', () => {
  const data = { applications: [{ _id: 'a', detailedStatus: 'submitted', requiredDocumentTypes: ['transcript'], documents: [] }],
    documents: [{ _id: 'd', type: 'transcript', detailedStatus: 'approved' }] };
  assert.equal(studentNextAction(data).code, 'documents-required');
  data.applications[0].documents = ['d'];
  assert.equal(studentNextAction(data).code, 'track-application');
});
