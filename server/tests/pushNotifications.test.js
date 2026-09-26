const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require(path.join(process.env.STUDY_BIRDS_TEST_TOOLS, 'node_modules/mongodb-memory-server-core'));

test('push tokens are registered per device, reassignable, and sending is a safe no-op when disabled', async () => {
  process.env.JWT_SECRET = 'push-isolated-test';
  delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  let server;
  try {
    await mongoose.connect(mongo.getUri());
    const User = require('../src/models/User');
    const Notification = require('../src/models/Notification');
    const PushToken = require('../src/models/PushToken');
    const { sendPushToUser, isPushEnabled } = require('../src/utils/pushNotifications');
    const student = await User.create({ name: 'Student', email: 'student@example.test' });
    const other = await User.create({ name: 'Other', email: 'other@example.test' });
    server = await new Promise(resolve => { const s = require('../src/app').listen(0, '127.0.0.1', () => resolve(s)); });
    async function call(method, endpoint, user, body, expected = 200) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api${endpoint}`, { method,
        headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${jwt.sign({ userId: user._id }, process.env.JWT_SECRET)}` } : {}) },
        body: body ? JSON.stringify(body) : undefined });
      const data = await response.json(); assert.equal(response.status, expected, JSON.stringify(data)); return data;
    }

    assert.equal(isPushEnabled(), false);
    assert.deepEqual(await sendPushToUser(student._id, { title: 't', body: 'b' }), { sent: 0, disabled: true });

    await call('GET', '/push-tokens/status', null, null, 401);
    assert.deepEqual(await call('GET', '/push-tokens/status', student), { enabled: false });

    await call('POST', '/push-tokens', null, { token: 'abc' }, 401);
    for (const invalid of [{ token: '' }, { token: 'x', platform: 'desktop' }, {}]) {
      await call('POST', '/push-tokens', student, invalid, 400);
    }
    await call('POST', '/push-tokens', student, { token: 'device-token-1', platform: 'android' }, 201);
    let stored = await PushToken.findOne({ token: 'device-token-1' }).lean();
    assert.equal(String(stored.user), String(student._id));

    // The same physical device later logs in as a different account — the
    // token moves to that account instead of creating a duplicate row.
    await call('POST', '/push-tokens', other, { token: 'device-token-1', platform: 'android' }, 201);
    stored = await PushToken.findOne({ token: 'device-token-1' }).lean();
    assert.equal(String(stored.user), String(other._id));
    assert.equal(await PushToken.countDocuments({ token: 'device-token-1' }), 1);

    // Deleting only removes the token if the caller currently owns it.
    await call('DELETE', '/push-tokens', student, { token: 'device-token-1' });
    assert.equal(await PushToken.countDocuments({ token: 'device-token-1' }), 1);
    await call('DELETE', '/push-tokens', other, { token: 'device-token-1' });
    assert.equal(await PushToken.countDocuments({ token: 'device-token-1' }), 0);

    // Creating a notification never throws even though the push hook runs.
    await assert.doesNotReject(Notification.create({ user: student._id, title: 'Hi', message: 'Test', type: 'info' }));
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect(); await mongo.stop();
  }
});
