const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');
const activeDue = now => ({ assignedAdvisor: { $ne: null }, followUpDueAt: { $lte: now, $ne: null }, status: { $ne: 'rejected' }, detailedStatus: { $ne: 'completed' } });
// A deterministic ObjectId makes concurrent scheduler instances and retries idempotent.
const reminderId = app => new mongoose.Types.ObjectId(crypto.createHash('sha256').update(`follow-up:${app._id}:${app.assignedAdvisor}:${app.followUpDueAt.toISOString()}`).digest('hex').slice(0,24));
async function sendFollowUpReminders(now = new Date()) {
  let created = 0;
  const cursor = Application.find(activeDue(now)).select('assignedAdvisor followUpDueAt').lean().cursor({ batchSize: 100 });
  for await (const app of cursor) {
    const advisor = await User.exists({ _id: app.assignedAdvisor, isActive: { $ne: false }, $or: [{ role: 'admin' }, { role: 'employee', permissions: 'applications' }] });
    if (!advisor || !await Application.exists({ ...activeDue(now), _id: app._id, assignedAdvisor: app.assignedAdvisor, followUpDueAt: app.followUpDueAt })) continue;
    try {
      const result = await Notification.updateOne({ _id: reminderId(app) }, { $setOnInsert: {
        user: app.assignedAdvisor, title: 'متابعة طلب متأخرة', message: 'تجاوز طلب مسند إليك موعد المتابعة. افتح الطلب وراجع الإجراء التالي.', type: 'warning',
        link: '/admin/applications', reminderApplication: app._id, reminderDueAt: app.followUpDueAt,
      } }, { upsert: true, runValidators: true });
      created += result.upsertedCount;
    } catch (error) { if (error.code !== 11000) throw error; }
  }
  return { created };
}
function startFollowUpReminderScheduler({ enabled = process.env.FOLLOW_UP_REMINDERS_ENABLED === 'true', intervalMs = Number(process.env.FOLLOW_UP_REMINDERS_INTERVAL_MS || 300000), run = sendFollowUpReminders } = {}) {
  if (!enabled) return () => {};
  if (!Number.isFinite(intervalMs) || intervalMs < 60000) throw new Error('Follow-up reminder interval must be at least 60000ms');
  let running = false, stopped = false;
  const tick = async () => {
    if (running || stopped || mongoose.connection.readyState !== 1) return;
    running = true;
    try { await run(); } catch (error) { console.error('Follow-up reminder scan failed', error.name); } finally { running = false; }
  };
  const timer = setInterval(tick, intervalMs); timer.unref(); void tick();
  return () => { stopped = true; clearInterval(timer); };
}
module.exports = { activeDue, reminderId, sendFollowUpReminders, startFollowUpReminderScheduler };
