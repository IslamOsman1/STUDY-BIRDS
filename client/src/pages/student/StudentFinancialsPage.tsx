import { useEffect, useState } from "react";
import { Download, Upload } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { DOCUMENT_UPLOAD_ACCEPT } from "../../constants/upload";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";
import { studentService } from "../../services/studentService";
import type { StudentFinancialsResponse } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency, formatDate } from "../../utils/format";

export const StudentFinancialsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [data, setData] = useState<StudentFinancialsResponse | null>(null);
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState("");

  const loadFinancials = () =>
    studentService
      .getFinancials()
      .then(setData)
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل البيانات المالية." : "Unable to load financial data.")));

  useEffect(() => {
    loadFinancials();
  }, [isArabic]);

  const handleProofUpload = async (invoiceId: string, file: File | null) => {
    if (!file) return;
    setUploadingId(invoiceId);
    setError("");
    try {
      await studentService.uploadPaymentProof(invoiceId, { file });
      await loadFinancials();
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر رفع إثبات الدفع." : "Unable to upload payment proof."));
    } finally {
      setUploadingId("");
    }
  };

  if (error && !data) {
    return <EmptyState title={isArabic ? "تعذر التحميل" : "Unable to load"} description={error} />;
  }

  if (!data) {
    return <div className="panel flex min-h-[300px] items-center justify-center p-8 text-sm text-slate-500">{isArabic ? "جارٍ تحميل الشؤون المالية..." : "Loading financials..."}</div>;
  }

  const summaryCards = [
    { label: isArabic ? "المبالغ المستحقة" : "Outstanding", value: formatCurrency(data.summary.outstandingAmount) },
    { label: isArabic ? "بانتظار التأكيد" : "Pending Confirmation", value: formatCurrency(data.summary.pendingConfirmationAmount) },
    { label: isArabic ? "المدفوع" : "Paid", value: formatCurrency(data.summary.paidAmount) },
    { label: isArabic ? "عدد الفواتير" : "Invoices", value: data.summary.invoiceCount },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "المالية والفواتير" : "Financials & Invoices"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "تابع الفواتير وارفع إثبات الدفع لكل دفعة." : "Track invoices and upload proof of payment for each item."}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <div className="mt-6 space-y-4">
          {data.invoices.length ? (
            data.invoices.map((invoice) => (
              <article key={invoice._id} className="rounded-3xl bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{invoice.invoiceNumber}</p>
                    <p className="mt-1 text-sm text-slate-500">{invoice.description}</p>
                    <p className="mt-2 text-xs text-slate-500">{isArabic ? "تاريخ الاستحقاق:" : "Due Date:"} {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(invoice.amount)}</p>
                    <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${invoice.status === "paid" ? "bg-emerald-100 text-emerald-700" : invoice.status === "rejected" ? "bg-rose-100 text-rose-700" : invoice.status === "pending-confirmation" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
                {invoice.adminNote ? <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">{invoice.adminNote}</p> : null}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {invoice.invoiceUrl ? (
                    <a href={invoice.invoiceUrl.startsWith("http") ? invoice.invoiceUrl : getApiAssetUrl(invoice.invoiceUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                      <Download className="h-4 w-4" />
                      {isArabic ? "تحميل الفاتورة" : "Download Invoice"}
                    </a>
                  ) : null}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white">
                    <Upload className="h-4 w-4" />
                    {uploadingId === invoice._id ? (isArabic ? "جارٍ الرفع..." : "Uploading...") : isArabic ? "رفع إثبات الدفع" : "Upload Proof"}
                    <input type="file" accept={DOCUMENT_UPLOAD_ACCEPT} className="hidden" onChange={(event) => handleProofUpload(invoice._id, event.target.files?.[0] || null)} />
                  </label>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title={isArabic ? "لا توجد فواتير بعد" : "No invoices yet"} description={isArabic ? "ستظهر الفواتير الصادرة من الإدارة هنا." : "Invoices issued by admin will appear here."} />
          )}
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-2xl font-semibold text-slate-900">{isArabic ? "إثباتات الدفع المرفوعة" : "Uploaded Payment Proofs"}</h2>
        <div className="mt-6 space-y-3">
          {data.paymentProofs.length ? (
            data.paymentProofs.map((proof) => (
              <div key={proof._id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{proof.fileName}</p>
                    <p className="mt-1 text-sm text-slate-500">{proof.invoice?.invoiceNumber || "--"} • {formatDate(proof.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${proof.status === "approved" ? "bg-emerald-100 text-emerald-700" : proof.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{proof.status}</span>
                </div>
                {proof.reviewNote ? <p className="mt-3 text-sm text-slate-600">{proof.reviewNote}</p> : null}
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">{isArabic ? "لا توجد إثباتات دفع بعد." : "No payment proofs uploaded yet."}</div>
          )}
        </div>
      </section>
    </div>
  );
};
