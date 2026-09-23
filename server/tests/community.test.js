const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require(path.join(process.env.STUDY_BIRDS_TEST_TOOLS, 'node_modules/mongodb-memory-server-core'));

test('community posts are student-authored, staff-moderated, and hidden content is never visible to other students', async () => {
  process.env.JWT_SECRET = 'community-isolated-test';
  const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  let server;
  try {
    await mongoose.connect(mongo.getUri());
    const User = require('../src/models/User');
    const CommunityPost = require('../src/models/CommunityPost');
    const author = await User.create({ name: 'Author', email: 'author@example.test' });
    const other = await User.create({ name: 'Other', email: 'other@example.test' });
    const moderator = await User.create({ name: 'Moderator', email: 'moderator@example.test', role: 'employee', permissions: ['community'] });
    const outsiderStaff = await User.create({ name: 'Support', email: 'support@example.test', role: 'employee', permissions: ['support'] });
    server = await new Promise(resolve => { const s = require('../src/app').listen(0, '127.0.0.1', () => resolve(s)); });
    const token = user => jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    async function call(method, endpoint, user, body, expected = 200) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api${endpoint}`, { method,
        headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${token(user)}` } : {}) },
        body: body ? JSON.stringify(body) : undefined });
      const data = await response.json(); assert.equal(response.status, expected, JSON.stringify(data)); return data;
    }

    // Only students can post; staff and unauthenticated requests are refused.
    await call('POST', '/community/posts', null, { title: 'T', body: 'B' }, 401);
    await call('POST', '/community/posts', moderator, { title: 'T', body: 'B' }, 403);
    for (const invalid of [{ title: '', body: 'B' }, { title: 'T', body: '' }, { title: 'x'.repeat(151), body: 'B' }]) {
      await call('POST', '/community/posts', author, invalid, 400);
    }
    const created = await call('POST', '/community/posts', author, { title: 'أفضل جامعات تركيا؟', body: 'حدا يعرف يرشحلي جامعة؟' }, 201);
    assert.equal(created.author.name, 'Author');

    const list = await call('GET', '/community/posts', other);
    assert.equal(list.length, 1);

    // Comments: one from another student, isolation of unrelated post IDs.
    await call('POST', `/community/posts/${created._id}/comments`, other, { body: 'جامعة إسطنبول ممتازة!' }, 201);
    const thread = await call('GET', `/community/posts/${created._id}`, other);
    assert.equal(thread.comments.length, 1);
    assert.equal(thread.comments[0].author.name, 'Other');
    assert.equal((await call('GET', '/community/posts', author))[0].commentCount, 1);

    // A student can delete their own post but not someone else's.
    await call('DELETE', `/community/posts/${created._id}`, other, null, 404);

    // Staff without the 'community' section cannot moderate; the assigned moderator can.
    await call('GET', '/admin/community-posts', outsiderStaff, null, 403);
    await call('PATCH', `/admin/community-posts/${created._id}`, outsiderStaff, { status: 'hidden' }, 403);
    await call('PATCH', `/admin/community-posts/${created._id}`, moderator, { status: 'invented' }, 400);
    const hidden = await call('PATCH', `/admin/community-posts/${created._id}`, moderator, { status: 'hidden', moderationNote: 'رسالة مكررة' });
    assert.equal(hidden.status, 'hidden');

    // Hidden posts disappear from the student feed and can't be opened or commented on.
    assert.equal((await call('GET', '/community/posts', other)).length, 0);
    await call('GET', `/community/posts/${created._id}`, other, null, 404);
    await call('POST', `/community/posts/${created._id}/comments`, other, { body: 'still here?' }, 404);

    // The moderator's admin view still sees hidden posts, with a note and moderator identity recorded.
    const adminList = await call('GET', '/admin/community-posts', moderator);
    assert.equal(adminList.length, 1);
    assert.equal(adminList[0].moderationNote, 'رسالة مكررة');
    assert.equal(adminList[0].moderatedBy.name, 'Moderator');

    // Un-hiding restores visibility.
    await call('PATCH', `/admin/community-posts/${created._id}`, moderator, { status: 'published' });
    assert.equal((await call('GET', '/community/posts', other)).length, 1);

    // The author can delete their own post; it and its comments disappear.
    await call('DELETE', `/community/posts/${created._id}`, author);
    assert.equal(await CommunityPost.countDocuments(), 0);
    assert.equal((await call('GET', '/community/posts', other)).length, 0);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect(); await mongo.stop();
  }
});
