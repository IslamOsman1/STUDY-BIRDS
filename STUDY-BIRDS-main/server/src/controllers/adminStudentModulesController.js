const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const Application = require("../models/Application");
const Document = require("../models/Document");
const Invoice = require("../models/Invoice");
const PaymentProof = require("../models/PaymentProof");
const ArrivalServiceRequest = require("../models/ArrivalServiceRequest");
const FavoriteItem = require("../models/FavoriteItem");
const OrientationTestResult = require("../models/OrientationTestResult");
const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const { hydrateApplicationsWithStudentProfiles } = require("../utils/hydrateApplications");

const getStudentFinancialsAdmin = asyncHandler(async (req, res) => {
  const [invoices, paymentProofs] = await Promise.all([
    Invoice.find()
      .populate("student", "name email")
      .populate("application", "status")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 }),
    PaymentProof.find()
      .populate("student", "name email")
      .populate("invoice", "invoiceNumber description amount status")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 }),
  ]);

  res.json({ invoices, paymentProofs });
});

const getStudentDocumentsAdmin = asyncHandler(async (req, res) => {
  const documents = await Document.find()
    .populate("student", "name email")
    .sort({ createdAt: -1 });

  res.json(documents);
});

const getStudentNotificationsAdmin = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  res.json(notifications);
});

const getStudentDetailsAdmin = asyncHandler(async (req, res) => {
  const student = await User.findOne({ _id: req.params.id, role: "student" }).select("-password").lean();

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  const [profile, applications, documents, invoices, paymentProofs, arrivalRequest, favorites, orientationResult, supportTickets, notifications] = await Promise.all([
    StudentProfile.findOne({ user: student._id }).lean(),
    Application.find({ student: student._id })
      .populate({
        path: "program",
        populate: { path: "university", populate: { path: "country" } },
      })
      .populate("documents")
      .populate("statusTimeline.changedBy", "name role")
      .sort({ createdAt: -1 }),
    Document.find({ student: student._id }).sort({ createdAt: -1 }).lean(),
    Invoice.find({ student: student._id })
      .populate("application", "status")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .lean(),
    PaymentProof.find({ student: student._id })
      .populate("invoice", "invoiceNumber description amount status")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .lean(),
    ArrivalServiceRequest.findOne({ student: student._id }).populate("updatedBy", "name email").lean(),
    FavoriteItem.find({ student: student._id })
      .populate({
        path: "university",
        select: "name city language tuitionRange country",
        populate: { path: "country", select: "name code slug" },
      })
      .populate({
        path: "program",
        select: "title language tuition duration degreeLevel university",
        populate: {
          path: "university",
          select: "name city country",
          populate: { path: "country", select: "name code slug" },
        },
      })
      .sort({ createdAt: -1 })
      .lean(),
    OrientationTestResult.findOne({ student: student._id }).populate("reviewedBy", "name email").lean(),
    SupportTicket.find({ user: student._id, requesterRole: "student" })
      .populate("user", "name email role")
      .populate("replies.user", "name email role")
      .sort({ updatedAt: -1 })
      .lean(),
    Notification.find({ user: student._id }).sort({ createdAt: -1 }).limit(12).lean(),
  ]);

  res.json({
    student: {
      ...student,
      profile: profile || null,
    },
    applications: await hydrateApplicationsWithStudentProfiles(applications),
    documents,
    invoices,
    paymentProofs,
    arrivalRequest,
    favorites,
    orientationResult,
    supportTickets,
    notifications,
  });
});

const createStudentInvoiceAdmin = asyncHandler(async (req, res) => {
  const studentId = String(req.body.studentId || "").trim();
  const invoiceNumber = String(req.body.invoiceNumber || "").trim();
  const description = String(req.body.description || "").trim();
  const amount = Number(req.body.amount || 0);

  if (!studentId || !invoiceNumber || !description || !amount) {
    res.status(400);
    throw new Error("Student, invoice number, description, and amount are required");
  }

  const invoice = await Invoice.create({
    student: studentId,
    application: req.body.applicationId || undefined,
    invoiceNumber,
    description,
    amount,
    dueDate: req.body.dueDate || null,
    status: req.body.status || "unpaid",
    invoiceUrl: String(req.body.invoiceUrl || "").trim(),
    category: req.body.category || "other",
    adminNote: String(req.body.adminNote || "").trim(),
  });

  await Notification.create({
    user: studentId,
    title: "New invoice created",
    message: `A new invoice (${invoiceNumber}) has been added to your account.`,
    type: "info",
  });

  res.status(201).json(await Invoice.findById(invoice._id).populate("student", "name email"));
});

const updateStudentInvoiceAdmin = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  if (req.body.invoiceNumber !== undefined) invoice.invoiceNumber = String(req.body.invoiceNumber || "").trim();
  if (req.body.description !== undefined) invoice.description = String(req.body.description || "").trim();
  if (req.body.amount !== undefined) invoice.amount = Number(req.body.amount || 0);
  if (req.body.dueDate !== undefined) invoice.dueDate = req.body.dueDate || null;
  if (req.body.status !== undefined) invoice.status = req.body.status;
  if (req.body.invoiceUrl !== undefined) invoice.invoiceUrl = String(req.body.invoiceUrl || "").trim();
  if (req.body.category !== undefined) invoice.category = req.body.category;
  if (req.body.adminNote !== undefined) invoice.adminNote = String(req.body.adminNote || "").trim();
  invoice.reviewedAt = new Date();
  invoice.reviewedBy = req.user._id;
  await invoice.save();

  await Notification.create({
    user: invoice.student,
    title: "Invoice updated",
    message: `Invoice ${invoice.invoiceNumber} is now marked as ${invoice.status}.`,
    type: invoice.status === "rejected" ? "warning" : "info",
  });

  res.json(await Invoice.findById(invoice._id).populate("student", "name email").populate("reviewedBy", "name email"));
});

const reviewPaymentProofAdmin = asyncHandler(async (req, res) => {
  const proof = await PaymentProof.findById(req.params.id).populate("invoice");
  if (!proof) {
    res.status(404);
    throw new Error("Payment proof not found");
  }

  const nextStatus = String(req.body.status || "").trim();
  if (!["approved", "rejected", "pending"].includes(nextStatus)) {
    res.status(400);
    throw new Error("Invalid payment proof status");
  }

  proof.status = nextStatus;
  proof.reviewNote = String(req.body.reviewNote || "").trim();
  proof.reviewedAt = new Date();
  proof.reviewedBy = req.user._id;
  await proof.save();

  const invoice = await Invoice.findById(proof.invoice?._id || proof.invoice);
  if (invoice) {
    invoice.status = nextStatus === "approved" ? "paid" : nextStatus === "rejected" ? "rejected" : "pending-confirmation";
    invoice.reviewedAt = new Date();
    invoice.reviewedBy = req.user._id;
    await invoice.save();
  }

  await Notification.create({
    user: proof.student,
    title: "Payment proof reviewed",
    message: `Your payment proof has been ${nextStatus}.`,
    type: nextStatus === "rejected" ? "warning" : "success",
  });

  res.json(await PaymentProof.findById(proof._id).populate("student", "name email").populate("invoice", "invoiceNumber description amount status").populate("reviewedBy", "name email"));
});

const getArrivalRequestsAdmin = asyncHandler(async (req, res) => {
  const items = await ArrivalServiceRequest.find()
    .populate("student", "name email")
    .populate("updatedBy", "name email")
    .sort({ updatedAt: -1 });
  res.json(items);
});

const updateArrivalRequestAdmin = asyncHandler(async (req, res) => {
  const item = await ArrivalServiceRequest.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Arrival request not found");
  }

  if (req.body.status !== undefined) item.status = req.body.status;
  if (req.body.adminNote !== undefined) item.adminNote = String(req.body.adminNote || "").trim();
  item.updatedBy = req.user._id;
  await item.save();

  await Notification.create({
    user: item.student,
    title: "Arrival request updated",
    message: `Your arrival services request is now ${item.status}.`,
    type: "info",
  });

  res.json(await ArrivalServiceRequest.findById(item._id).populate("student", "name email").populate("updatedBy", "name email"));
});

const getStudentFavoritesAdmin = asyncHandler(async (req, res) => {
  const items = await FavoriteItem.find()
    .populate("student", "name email")
    .populate({
      path: "university",
      select: "name city language tuitionRange country",
      populate: { path: "country", select: "name code slug" },
    })
    .populate({
      path: "program",
      select: "title language tuition duration degreeLevel university",
      populate: {
        path: "university",
        select: "name city country",
        populate: { path: "country", select: "name code slug" },
      },
    })
    .sort({ createdAt: -1 });
  res.json(items);
});

const getOrientationResultsAdmin = asyncHandler(async (req, res) => {
  const items = await OrientationTestResult.find()
    .populate("student", "name email")
    .populate("reviewedBy", "name email")
    .sort({ updatedAt: -1 });
  res.json(items);
});

const updateOrientationResultAdmin = asyncHandler(async (req, res) => {
  const item = await OrientationTestResult.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Orientation result not found");
  }

  if (req.body.recommendationSummary !== undefined) item.recommendationSummary = String(req.body.recommendationSummary || "").trim();
  if (req.body.adminNote !== undefined) item.adminNote = String(req.body.adminNote || "").trim();
  if (Array.isArray(req.body.suggestedFields)) item.suggestedFields = req.body.suggestedFields;
  if (Array.isArray(req.body.suggestedCountries)) item.suggestedCountries = req.body.suggestedCountries;
  item.reviewedBy = req.user._id;
  await item.save();

  await Notification.create({
    user: item.student,
    title: "Orientation guidance updated",
    message: "Your orientation test guidance has been updated by the admissions team.",
    type: "info",
  });

  res.json(await OrientationTestResult.findById(item._id).populate("student", "name email").populate("reviewedBy", "name email"));
});

module.exports = {
  getStudentDetailsAdmin,
  getStudentDocumentsAdmin,
  getStudentNotificationsAdmin,
  getStudentFinancialsAdmin,
  createStudentInvoiceAdmin,
  updateStudentInvoiceAdmin,
  reviewPaymentProofAdmin,
  getArrivalRequestsAdmin,
  updateArrivalRequestAdmin,
  getStudentFavoritesAdmin,
  getOrientationResultsAdmin,
  updateOrientationResultAdmin,
};
