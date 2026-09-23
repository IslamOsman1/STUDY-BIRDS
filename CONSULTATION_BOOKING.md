# Consultation bookings — 23 September 2026

Local implementation; no Render deployment or production database changes were performed.

## Implemented

- Staff with the explicit `consultations` permission publish their own availability. Admins can publish for any active employee with that permission. Employees see only their slots and bookings.
- Student selects a consultant, mode (online/phone/office), date and available slot. Each appointment lasts 30 minutes, starts on a UTC half-hour boundary and can be published up to 90 days ahead. Interfaces display device-local time and identify the timezone.
- Unique indexes and MongoDB transactions prevent double booking of a slot and concurrent appointments for the same student. Confirmation notifications, reservation claims and booking records commit together.
- A student can cancel or reschedule a future booking. Version checks reject stale updates. An unsuccessful reschedule retains the original reservation. The old consultant is notified when a student changes consultants. Authorized staff can cancel their own bookings; admins can cancel any.
- Meeting link and instructions are disclosed to the booked student and authorized staff, not in the public availability list. Cancellation hides the meeting link from the student's booking list; external meeting links already known to a user cannot be revoked by this API.
- Student and staff web pages: `/student/consultations`, `/admin/consultations`; sidebar permission controls and employee permissions editor use the new permission.
- Flutter's active consultation entry now uses real bookings, shows errors without claiming success, and includes confirmed bookings in its calendar. Tapping an in-app student consultation notification opens the appointments screen.
- An optional scheduler creates internal reminders for bookings within the next hour, with a transactional marker to prevent duplicate sends across workers. Cancellation and rescheduling invalidate the old reminder target. Already-created notification history remains visible.

## Deployment dependencies

1. Deploy the backend and web changes together with the updated Flutter app. New collections are `consultationslots` and `consultationbookings`.
2. MongoDB must support transactions (replica set or supported sharded cluster). Tests use a disposable local one-node replica set. A standalone production server will return 503 for booking operations; do not enable this feature until configured.
3. Allow Mongoose to create the declared unique indexes before serving reservations. Routes await model initialization. If production disables automatic indexing, provision the indexes from `server/src/models/Consultation.js` through the normal database migration process before releasing the feature.
4. Grant the `consultations` permission to active consultant employee accounts through existing employee administration, then publish future availability with real meeting links/contact details. No permissions or slots are seeded automatically.
5. Set `CONSULTATION_REMINDERS_ENABLED=true` only when ready to run internal reminders; default is disabled. Scheduler checks every 60 seconds. This does not deliver Push, SMS or email.

## Tests and limits

`server/tests/consultationBooking.test.js` covers auth, staff isolation, invalid/past/off-grid slots, duplicate availability, simultaneous booking conflict, same-student time conflicts and rollback, stale edits, cancellation, failed and successful rescheduling, consultant changes, inactive consultants, meeting-link visibility and reminder deduplication. Run alongside existing server tests using the repository's isolated MongoDB test tooling.

Flutter tests in `test/consultation_booking_test.dart` cover confirmation before writes, real booking endpoint, failed reschedule preserving the original, cancellation, unavailable API and calendar inclusion. No test sends production requests or schedules actual consultations.

PRD 27 and 99 remain **partial**: no Google/Apple calendar synchronization, automatic meeting-provider creation/revocation, Push/SMS/email reminders, consultation outcome notes, recurring availability, variable appointment lengths or staff appointment management inside Flutter yet. Staff management is available in the web dashboard. Student Flutter strings are Arabic; web labels support Arabic/English. Paid consultations and service orders are separate remaining work. Booking history is unpaginated up to 200 rows; available/staff slots up to 500 rows.
