const router = require('express').Router();
const mongoose = require('mongoose');
const { requireSection } = require('../middleware/employeeAccess');
const asyncHandler = require('../utils/asyncHandler');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { activeDue } = require('../utils/followUpReminders');
router.use(requireSection('applications'));
router.get('/', asyncHandler(async (req,res) => {
  const apps = await Application.find({ ...activeDue(new Date()), assignedAdvisor: req.user._id }).select('followUpDueAt').lean();
  const rows = await Notification.find({ user: req.user._id, reminderApplication: { $in: apps.map(a => a._id) } }).sort({createdAt:-1}).lean();
  const due = new Map(apps.map(a => [String(a._id), a.followUpDueAt.getTime()]));
  res.json(rows.filter(n => due.get(String(n.reminderApplication)) === n.reminderDueAt?.getTime()));
}));
router.patch('/:id/read', asyncHandler(async (req,res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({message:'Reminder not found'});
  const row = await Notification.findOneAndUpdate({ _id: req.params.id, user:req.user._id, reminderApplication:{$exists:true} }, {$set:{isRead:true}}, {new:true});
  if (!row) return res.status(404).json({message:'Reminder not found'});
  res.json({isRead:true});
}));
module.exports = router;
