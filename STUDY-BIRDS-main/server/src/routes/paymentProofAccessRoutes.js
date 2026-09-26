const router = require('express').Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const { hasSection } = require('../middleware/employeeAccess');
const asyncHandler = require('../utils/asyncHandler');
const PaymentProof = require('../models/PaymentProof');
const ParentLink = require('../models/ParentLink');
const { documentDownloadLink } = require('../utils/privateDocumentStorage');

router.post('/:id/access', protect, asyncHandler(async (req, res) => {
  res.set({ 'Cache-Control': 'no-store', 'Pragma': 'no-cache', 'Referrer-Policy': 'no-referrer' });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Payment proof not found' });
  const proof = await PaymentProof.findById(req.params.id).select('+storage').lean();
  if (!proof) return res.status(404).json({ message: 'Payment proof not found' });
  let allowed = String(proof.student) === String(req.user._id) || hasSection(req.user, 'student-financials');
  if (!allowed && req.user.role === 'parent') allowed = Boolean(await ParentLink.exists({ parent: req.user._id, student: proof.student, status: 'approved' }));
  if (!allowed) return res.status(404).json({ message: 'Payment proof not found' });
  if (!proof.storage?.publicId || proof.storage.deliveryType !== 'authenticated') return res.status(409).json({ message: 'This legacy proof has not been migrated to private storage' });
  res.json(documentDownloadLink(proof.storage));
}));
module.exports = router;
