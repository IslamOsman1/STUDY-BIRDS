import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import type { InvoiceItem, PaymentProofItem, User } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency, formatDate } from "../../utils/format";

export const AdminStudentFinancialsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProofItem[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    invoiceNumber: "",
    description: "",
    amount: "",
    dueDate: "",
    category: "application-fee",
  });

  useEffect(() => {
    Promise.all([adminService.getStudentFinancials(), adminService.getStudents()])
      .then(([financials, studentItems]) => {
        setInvoices(financials.invoices);
        setPaymentProofs(financials.paymentProofs);
        setStudents(studentItems.filter((item) => item.role === "student"));
      })
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل البيانات المالية للطلاب." : "Unable to load student financials.")));
  }, [isArabic]);

  const handleCreateInvoice = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError("");
    try {
      const created = await adminService.createStudentInvoice({
        studentId: form.studentId,
        invoiceNumber: form.invoiceNumber,
        description: form.description,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        category: form.category as InvoiceItem["category"],
      });
      setInvoices((current) => [created, ...current]);
      setForm({
        studentId: "",
        invoiceNumber: "",
        description: "",
        amount: "",
        dueDate: "",
        category: "application-fee",
      });
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر إصدار الفاتورة." : "Unable to create invoice."));
    } finally {
      setCreating(false);
    }
  };

  const handleProofStatus = async (id: string, status: PaymentProofItem["status"]) => {
    const updated = await adminService.reviewPaymentProof(id, { status });
    setPaymentProofs((current) => current.map((item) => (item._id === id ? updated : item)));
    if (updated.invoice?._id) {
      setInvoices((current) => current.map((item) => (item._id === updated.invoice?._id ? { ...item, status: updated.invoice.status } : item)));
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "مالية الطلاب" : "Student Financials"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "مراجعة الفواتير وإثباتات الدفع الخاصة بالطلاب." : "Review student invoices and uploaded payment proofs."}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="panel p-6">
        <h2 className="text-2xl font-semibold text-slate-900">{isArabic ? "الفواتير" : "Invoices"}</h2>
        <form onSubmit={handleCreateInvoice} className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2 xl:grid-cols-3">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "الطالب" : "Student"}</span>
            <select value={form.studentId} onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring">
              <option value="">{isArabic ? "اختر الطالب" : "Select student"}</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} - {student.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "رقم الفاتورة" : "Invoice Number"}</span>
            <input value={form.invoiceNumber} onChange={(event) => setForm((current) => ({ ...current, invoiceNumber: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "الوصف" : "Description"}</span>
            <input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "المبلغ" : "Amount"}</span>
            <input type="number" min="0" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "تاريخ الاستحقاق" : "Due Date"}</span>
            <input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "الفئة" : "Category"}</span>
            <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring">
              <option value="application-fee">{isArabic ? "رسوم التقديم" : "Application Fee"}</option>
              <option value="tuition">{isArabic ? "رسوم دراسية" : "Tuition"}</option>
              <option value="service">{isArabic ? "خدمة" : "Service"}</option>
              <option value="housing">{isArabic ? "سكن" : "Housing"}</option>
              <option value="other">{isArabic ? "أخرى" : "Other"}</option>
            </select>
          </label>
          <button type="submit" disabled={creating} className="w-fit rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white xl:col-span-3">
            {creating ? (isArabic ? "جارٍ الإصدار..." : "Creating...") : isArabic ? "إصدار فاتورة" : "Create Invoice"}
          </button>
        </form>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{isArabic ? "الطالب" : "Student"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "رقم الفاتورة" : "Invoice #"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الوصف" : "Description"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "المبلغ" : "Amount"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الاستحقاق" : "Due Date"}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="border-t border-slate-100">
                  <td className="px-4 py-4">{invoice.student?.name || "--"}</td>
                  <td className="px-4 py-4">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-4">{invoice.description}</td>
                  <td className="px-4 py-4">{formatCurrency(invoice.amount)}</td>
                  <td className="px-4 py-4">{invoice.status}</td>
                  <td className="px-4 py-4">{formatDate(invoice.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-2xl font-semibold text-slate-900">{isArabic ? "إثباتات الدفع" : "Payment Proofs"}</h2>
        <div className="mt-6 space-y-4">
          {paymentProofs.map((proof) => (
            <article key={proof._id} className="rounded-3xl bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{proof.student?.name || "--"} • {proof.invoice?.invoiceNumber || "--"}</p>
                  <p className="mt-1 text-sm text-slate-500">{proof.fileName} • {formatDate(proof.createdAt)}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{proof.status}</span>
              </div>
              {proof.reviewNote ? <p className="mt-3 text-sm text-slate-600">{proof.reviewNote}</p> : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={proof.filePath} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                  {isArabic ? "عرض الملف" : "View file"}
                </a>
                <button type="button" onClick={() => handleProofStatus(proof._id, "approved")} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                  {isArabic ? "اعتماد" : "Approve"}
                </button>
                <button type="button" onClick={() => handleProofStatus(proof._id, "rejected")} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
                  {isArabic ? "رفض" : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
