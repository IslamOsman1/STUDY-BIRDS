const { test } = require('node:test');
const assert = require('node:assert/strict');
const { requiredDocumentTypesFor, missingDocumentTypes } = require('../src/utils/applicationRequirements');

test('legacy programs retain three defaults; explicitly empty requirements stay empty', () => {
  assert.equal(requiredDocumentTypesFor({}).length, 3);
  assert.deepEqual(requiredDocumentTypesFor({ requiredDocumentTypes: [] }), []);
  const program = { requiredDocumentTypes: ['transcript'] };
  const requirements = requiredDocumentTypesFor(program);
  requirements.push('passport');
  assert.deepEqual(program.requiredDocumentTypes, ['transcript']);
});

test('rejected, expired, and revision documents cannot satisfy requirements', () => {
  for (const detailedStatus of ['rejected', 'expired', 'needs-revision', 'needs-translation']) {
    assert.deepEqual(missingDocumentTypes(['passport'], [{ type: 'passport', detailedStatus }]), ['passport']);
  }
  assert.deepEqual(missingDocumentTypes(['passport'], [{ type: 'passport', status: 'rejected', detailedStatus: 'uploaded' }]), ['passport']);
  assert.deepEqual(missingDocumentTypes(['passport', 'transcript'], [{ type: 'passport', detailedStatus: 'uploaded' }]), ['transcript']);
});
