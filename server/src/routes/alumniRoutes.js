// #55-57: Alumni network routes
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const run = require('../utils/asyncHandler');
const AlumniProfile = require('../models/AlumniProfile');
const User = require('../models/User');

const router = express.Router();
router.use(protect);

// Public listing — any authenticated user can browse alumni
router.get('/', run(async (req, res) => {
  const filter = { isPublic: true };
  if (req.query.country) filter.country = { $regex: req.query.country, $options: 'i' };
  if (req.query.mentoring === 'true') filter.openToMentoring = true;
  const rows = await AlumniProfile.find(filter)
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json(rows);
}));

// Get a single alumni profile by user id
router.get('/:userId', run(async (req, res) => {
  const profile = await AlumniProfile.findOne({ user: req.params.userId, isPublic: true }).populate('user', 'name avatar').lean();
  if (!profile) return res.status(404).json({ message: 'Alumni profile not found' });
  res.json(profile);
}));

// Create or update own alumni profile (students only)
router.put('/me', authorize('student'), run(async (req, res) => {
  const { graduationYear, university, country, fieldOfStudy, currentJob, bio, linkedinUrl, openToMentoring, isPublic } = req.body;
  if (bio && bio.length > 1000) return res.status(400).json({ message: 'Bio must be under 1000 characters' });
  if (linkedinUrl && typeof linkedinUrl === 'string' && linkedinUrl.trim()) {
    try {
      const u = new URL(linkedinUrl);
      if (u.protocol !== 'https:') return res.status(400).json({ message: 'LinkedIn URL must use https' });
    } catch { return res.status(400).json({ message: 'Invalid LinkedIn URL' }); }
  }
  const set = {};
  if (graduationYear !== undefined) set.graduationYear = Number(graduationYear) || null;
  if (university !== undefined) set.university = String(university || '').trim().slice(0, 200);
  if (country !== undefined) set.country = String(country || '').trim().slice(0, 100);
  if (fieldOfStudy !== undefined) set.fieldOfStudy = String(fieldOfStudy || '').trim().slice(0, 200);
  if (currentJob !== undefined) set.currentJob = String(currentJob || '').trim().slice(0, 200);
  if (bio !== undefined) set.bio = String(bio || '').trim();
  if (linkedinUrl !== undefined) set.linkedinUrl = String(linkedinUrl || '').trim();
  if (typeof openToMentoring === 'boolean') set.openToMentoring = openToMentoring;
  if (typeof isPublic === 'boolean') set.isPublic = isPublic;
  const profile = await AlumniProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: set },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate('user', 'name avatar');
  res.json(profile);
}));

// Get own alumni profile
router.get('/me/profile', authorize('student'), run(async (req, res) => {
  const profile = await AlumniProfile.findOne({ user: req.user._id }).populate('user', 'name avatar').lean();
  res.json(profile || null);
}));

module.exports = router;
