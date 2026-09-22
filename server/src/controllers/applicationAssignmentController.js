const mongoose = require('mongoose');
const Application = require('../models/Application');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const eligible = { isActive: { $ne: false }, $or: [{ role: 'admin' }, { role: 'employee', permissions: 'applications' }] };
const getAssignment = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Application not found' });
  const application = await Application.findById(req.params.id).select('assignedAdvisor followUpDueAt __v').lean();
  if (!application) return res.status(404).json({ message: 'Application not found' });
  const advisors = await User.find(eligible).select('name').sort({ name: 1 }).lean();
  res.json({ application, advisors });
});
const updateAssignment = asyncHandler(async (req, res) => {
  const { advisorId, dueAt, version } = req.body;
  if (!mongoose.isValidObjectId(req.params.id) || !Number.isInteger(version) || version < 0 ||
      (advisorId !== null && (typeof advisorId !== 'string' || !mongoose.isValidObjectId(advisorId)))) return res.status(400).json({ message: 'Invalid assignment' });
  const due = dueAt === null ? null : typeof dueAt === 'string' ? new Date(dueAt) : new Date(NaN);
  if ((due && !Number.isFinite(due.getTime())) || (!advisorId && due)) return res.status(400).json({ message: 'Invalid follow-up deadline' });
  if (advisorId && !await User.exists({ _id: advisorId, ...eligible })) return res.status(400).json({ message: 'Choose an active admissions staff member' });
  const application = await Application.findById(req.params.id).lean();
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (application.status === 'rejected' || application.detailedStatus === 'completed') return res.status(409).json({ message: 'Closed application cannot be reassigned' });
  const updated = await Application.findOneAndUpdate({ _id: application._id, __v: version, status: application.status, detailedStatus: application.detailedStatus }, {
    $set: { assignedAdvisor: advisorId, followUpDueAt: due }, $inc: { __v: 1 },
    $push: { assignmentHistory: { advisor: advisorId, dueAt: due, changedBy: req.user._id, changedAt: new Date() } },
  }, { new: true, runValidators: true }).select('assignedAdvisor followUpDueAt __v');
  if (!updated) return res.status(409).json({ message: 'Application changed. Refresh and try again.' });
  res.json(updated);
});
module.exports = { getAssignment, updateAssignment };
