// Retrieval helpers for Bird AI: grounds replies in the platform's own
// knowledge base and the asking student's own application data instead of
// letting the model invent fees, deadlines or policies. Read-only, and only
// ever built from the caller's own data — never another user's.
const Application = require("../models/Application");
const Document = require("../models/Document");
const Invoice = require("../models/Invoice");
const KnowledgeBaseItem = require("../models/KnowledgeBaseItem");
const { studentNextAction } = require("./studentNextAction");

async function buildStudentContext(userId) {
  const [applications, documents, invoices] = await Promise.all([
    Application.find({ student: userId }).populate("program", "title").populate("university", "name").lean(),
    Document.find({ student: userId }).select("type status detailedStatus").lean(),
    Invoice.find({ student: userId }).select("status dueDate amount").lean(),
  ]);
  if (!applications.length) return "لم يقدّم هذا الطالب أي طلب حتى الآن.";
  const lines = applications.map((app) => `- ${app.program?.title || "برنامج"} في ${app.university?.name || "جامعة"}: الحالة ${app.detailedStatus || app.status}`);
  const next = studentNextAction({ applications, documents, invoices });
  lines.push(next ? `الإجراء التالي المطلوب: ${next.titleAr}` : "لا يوجد إجراء عاجل مسجل حاليًا لهذا الطالب.");
  return lines.join("\n");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findRelevantKnowledge(message, limit = 3) {
  const keywords = String(message).toLowerCase().split(/\s+/).filter((w) => w.length >= 3).slice(0, 8);
  if (!keywords.length) return [];
  const regex = new RegExp(keywords.map(escapeRegex).join("|"), "i");
  const items = await KnowledgeBaseItem.find({ published: true, targetRole: { $in: ["all", "student"] }, $or: [{ title: regex }, { summary: regex }, { body: regex }] })
    .select("title summary body").limit(limit).lean();
  return items.map((item) => `- ${item.title}: ${(item.summary || item.body).slice(0, 500)}`);
}

module.exports = { buildStudentContext, findRelevantKnowledge };
