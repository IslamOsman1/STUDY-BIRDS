const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require(path.join(process.env.STUDY_BIRDS_TEST_TOOLS, 'node_modules/mongodb-memory-server-core'));

test('accommodation listings and bookings are staff-managed, scoped and versioned', async () => {
  process.env.JWT_SECRET = 'accommodation-isolated-test';
  const mongo = await MongoMemoryServer.create({ instance: { ip: '127.0.0.1' } });
  let server;
  try {
    await mongoose.connect(mongo.getUri());
    const User = require('../src/models/User');
    const University = require('../src/models/University');
    const AccommodationListing = require('../src/models/AccommodationListing');
    const student = await User.create({ name: 'Student', email: 'student@example.test' });
    const other = await User.create({ name: 'Other Student', email: 'other@example.test' });
    const housingOfficer = await User.create({ name: 'Housing Officer', email: 'housing@example.test', role: 'employee', permissions: ['housing'] });
    const admissions = await User.create({ name: 'Admissions', email: 'admissions@example.test', role: 'employee', permissions: ['applications'] });
    const university = await University.create({ name: 'Test University', country: new mongoose.Types.ObjectId(), city: 'City' });
    server = await new Promise(resolve => { const s = require('../src/app').listen(0, '127.0.0.1', () => resolve(s)); });
    async function call(method, endpoint, user, body, expected = 200) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api${endpoint}`, { method,
        headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${jwt.sign({ userId: user._id }, process.env.JWT_SECRET)}` } : {}) },
        body: body ? JSON.stringify(body) : undefined });
      const data = await response.json(); assert.equal(response.status, expected, JSON.stringify(data)); return data;
    }

    // Only the 'housing' section can manage the catalog; general admissions staff cannot.
    await call('GET', '/admin/accommodation-listings', null, null, 401);
    await call('GET', '/admin/accommodation-listings', admissions, null, 403);
    await call('GET', '/admin/accommodation-listings', student, null, 403);
    assert.deepEqual(await call('GET', '/admin/accommodation-listings', housingOfficer), []);

    const listingPayload = { title: 'Shared apartment near campus', type: 'shared', university: String(university._id),
      distanceFromCampusKm: 1.2, amenities: ['WiFi', 'Laundry'], price: 250, currency: 'USD', rules: 'No smoking', capacity: 3, isActive: true };
    await call('POST', '/admin/accommodation-listings', admissions, listingPayload, 403);
    for (const invalid of [{ type: 'castle' }, { university: 'not-an-id' }, { price: -1 }, { capacity: 1.5 }, { title: '' }]) {
      await call('POST', '/admin/accommodation-listings', housingOfficer, { ...listingPayload, ...invalid }, 400);
    }
    const created = await call('POST', '/admin/accommodation-listings', housingOfficer, listingPayload, 201);
    assert.equal(created.title, listingPayload.title);
    assert.equal(created.university.name, 'Test University');

    const hiddenListing = await AccommodationListing.create({ title: 'Hidden single room', type: 'single', university: university._id, price: 100, capacity: 1, isActive: false });

    // Students can browse only active listings.
    await call('GET', '/accommodation/listings', null, null, 401);
    const publicListings = await call('GET', '/accommodation/listings', student);
    assert.equal(publicListings.length, 1);
    assert.equal(publicListings[0]._id, created._id);
    assert.ok(!publicListings.some(l => l._id === String(hiddenListing._id)));

    // A student books it.
    await call('POST', '/accommodation/bookings', null, { listingId: created._id }, 401);
    await call('POST', '/accommodation/bookings', student, { listingId: 'invalid' }, 400);
    await call('POST', '/accommodation/bookings', student, { listingId: hiddenListing._id }, 404);
    const booking = await call('POST', '/accommodation/bookings', student, { listingId: created._id, moveInDate: '2099-09-01T00:00:00.000Z', notes: 'قريب من الجامعة رجاءً' }, 201);
    assert.equal(booking.status, 'pending');

    // A student can only have one active request at a time.
    await call('POST', '/accommodation/bookings', student, { listingId: created._id }, 409);

    // Isolation: another student never sees this booking; housing officer sees everyone's.
    const otherMine = await call('GET', '/accommodation/bookings/mine', other);
    assert.equal(otherMine.length, 0);
    const mine = await call('GET', '/accommodation/bookings/mine', student);
    assert.equal(mine.length, 1);
    await call('GET', '/admin/accommodation-bookings', admissions, null, 403);
    const staffBookings = await call('GET', '/admin/accommodation-bookings', housingOfficer);
    assert.equal(staffBookings.length, 1);
    assert.equal(staffBookings[0].student.name, 'Student');

    // Only the housing officer can confirm, with a version check.
    await call('PATCH', `/admin/accommodation-bookings/${booking._id}`, admissions, { status: 'confirmed', version: 0 }, 403);
    await call('PATCH', `/admin/accommodation-bookings/${booking._id}`, housingOfficer, { status: 'confirmed', version: 5 }, 409);
    const confirmed = await call('PATCH', `/admin/accommodation-bookings/${booking._id}`, housingOfficer, { status: 'confirmed', staffNote: 'جاهزة من الأول', version: 0 });
    assert.equal(confirmed.status, 'confirmed');
    assert.equal(confirmed.history.length, 2);

    // The student can still cancel a confirmed booking.
    const cancelled = await call('POST', `/accommodation/bookings/${booking._id}/cancel`, student, { version: confirmed.__v });
    assert.equal(cancelled.status, 'cancelled');
    await call('POST', `/accommodation/bookings/${booking._id}/cancel`, student, { version: cancelled.__v }, 409);

    // Now the student is free to book again.
    await call('POST', '/accommodation/bookings', student, { listingId: created._id }, 201);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect(); await mongo.stop();
  }
});
