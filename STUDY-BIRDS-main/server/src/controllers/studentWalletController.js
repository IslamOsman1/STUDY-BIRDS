const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const StudentReferral = require("../models/StudentReferral");
const StudentWalletEntry = require("../models/StudentWalletEntry");
const Invoice = require("../models/Invoice");
const { ensureReferralCode, getWalletBalance } = require("../utils/studentWallet");

// ---- Student: their own wallet ------------------------------------------

const getMyWallet = asyncHandler(async (req, res) => {
  const [referralCode, balance, referrals, transactions] = await Promise.all([
    ensureReferralCode(req.user._id),
    getWalletBalance(req.user._id),
    StudentReferral.find({ referrer: req.user._id })
      .populate("referredUser", "name")
      .sort({ createdAt: -1 })
      .lean(),
    StudentWalletEntry.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
  ]);
  res.json({
    referralCode,
    balance,
    referrals: referrals.map((r) => ({
      _id: r._id,
      name: r.referredUser?.name || "طالب",
      status: r.status,
      createdAt: r.createdAt,
      qualifiedAt: r.qualifiedAt,
    })),
    transactions,
  });
});

// Fix: use a MongoDB session+transaction so the balance check and the debit
// entry creation are atomic — eliminating the concurrent-overdraft race.
const redeemWalletCredit = asyncHandler(async (req, res) => {
  const { invoiceId, amount } = req.body;
  if (
    !mongoose.isValidObjectId(invoiceId) ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return res.status(400).json({ message: "Invalid redemption request" });
  }

  const session = await mongoose.startSession();
  let responsePayload;

  try {
    await session.withTransaction(async () => {
      // All reads and writes inside the transaction use the same session.
      const invoice = await Invoice.findOne({
        _id: invoiceId,
        student: req.user._id,
      }).session(session);

      if (!invoice) {
        const e = new Error("Invoice not found");
        e.statusCode = 404;
        throw e;
      }
      if (invoice.status !== "unpaid") {
        const e = new Error("This invoice can no longer accept credit");
        e.statusCode = 409;
        throw e;
      }
      const remaining = invoice.amount - invoice.walletCreditApplied;
      if (amount > remaining) {
        const e = new Error("Amount exceeds what is still owed on this invoice");
        e.statusCode = 400;
        throw e;
      }

      // Balance read is inside the transaction — prevents another concurrent
      // transaction from reading the same (pre-debit) balance.
      const [balanceResult] = await StudentWalletEntry.aggregate([
        { $match: { student: new mongoose.Types.ObjectId(req.user._id) } },
        {
          $group: {
            _id: null,
            balance: {
              $sum: {
                $cond: [
                  { $eq: ["$direction", "credit"] },
                  "$amount",
                  { $multiply: ["$amount", -1] },
                ],
              },
            },
          },
        },
      ]).session(session);

      const balance = balanceResult?.balance || 0;
      if (amount > balance) {
        const e = new Error("Insufficient wallet balance");
        e.statusCode = 409;
        throw e;
      }

      // Optimistic-lock on walletCreditApplied ensures a single invoice isn't
      // double-credited even outside a transaction.
      const invoiceUpdate =
        amount >= remaining
          ? { $inc: { walletCreditApplied: amount }, $set: { status: "paid", reviewedAt: new Date() } }
          : { $inc: { walletCreditApplied: amount } };

      const [updatedInvoice] = await Promise.all([
        Invoice.findOneAndUpdate(
          {
            _id: invoice._id,
            status: "unpaid",
            walletCreditApplied: invoice.walletCreditApplied,
          },
          invoiceUpdate,
          { new: true, session }
        ),
        StudentWalletEntry.create(
          [
            {
              student: req.user._id,
              direction: "debit",
              kind: "redemption",
              amount,
              relatedInvoice: invoice._id,
              notes: `سداد جزئي/كامل لفاتورة ${invoice.invoiceNumber}`,
            },
          ],
          { session }
        ),
      ]);

      if (!updatedInvoice) {
        const e = new Error("Invoice changed. Refresh and retry.");
        e.statusCode = 409;
        throw e;
      }

      const [newBalanceResult] = await StudentWalletEntry.aggregate([
        { $match: { student: new mongoose.Types.ObjectId(req.user._id) } },
        {
          $group: {
            _id: null,
            balance: {
              $sum: {
                $cond: [
                  { $eq: ["$direction", "credit"] },
                  "$amount",
                  { $multiply: ["$amount", -1] },
                ],
              },
            },
          },
        },
      ]).session(session);

      responsePayload = {
        invoice: updatedInvoice,
        balance: newBalanceResult?.balance || 0,
      };
    });

    res.json(responsePayload);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ message: err.message });
  } finally {
    await session.endSession();
  }
});

// ---- Staff: manual adjustments (mounted under /admin/student-financials,
// gated by the existing 'student-financials' section) --------------------

const getWalletEntriesAdmin = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.student && mongoose.isValidObjectId(req.query.student)) {
    query.student = req.query.student;
  }
  const entries = await StudentWalletEntry.find(query)
    .populate("student", "name email")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();
  res.json(entries);
});

const createWalletAdjustmentAdmin = asyncHandler(async (req, res) => {
  const { studentId, direction, amount, notes = "" } = req.body;
  if (
    !mongoose.isValidObjectId(studentId) ||
    !["credit", "debit"].includes(direction) ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    typeof notes !== "string" ||
    !notes.trim() ||
    notes.length > 500
  ) {
    return res.status(400).json({ message: "Invalid wallet adjustment" });
  }
  if (direction === "debit" && amount > (await getWalletBalance(studentId))) {
    return res
      .status(409)
      .json({ message: "Adjustment would leave a negative balance" });
  }
  const entry = await StudentWalletEntry.create({
    student: studentId,
    direction,
    kind: "adjustment",
    amount,
    notes: notes.trim(),
    createdBy: req.user._id,
  });
  res.status(201).json(entry);
});

module.exports = {
  getMyWallet,
  redeemWalletCredit,
  getWalletEntriesAdmin,
  createWalletAdjustmentAdmin,
};
