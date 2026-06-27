import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { VerificationDocumentItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

export const AdminVerificationQueuePage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<VerificationDocumentItem[]>([]);
  const [filter, setFilter] = useState<VerificationDocumentItem["status"] | "all">("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getVerificationDocuments()
      .then((data) => {
        setItems(data);
        setNotes(data.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item._id]: item.reviewNote || "" }), {}));
      })
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل قائمة التوثيق." : "Unable to load verification queue.")));
  }, [isArabic]);

  const visibleItems = useMemo(() => items.filter((item) => filter === "all" || item.status === filter), [filter, items]);

  const handleReview = async (id: string, status: VerificationDocumentItem["status"]) => {
    const updated = await adminService.reviewVerificationDocument(id, { status, reviewNote: notes[id] || "" });
    setItems((current) => current.map((item) => (item._id === id ? updated : item)));
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "طابور توثيق الوكلاء" : "Verification Queue"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "راجع ملفات التوثيق وحدث حالة الحساب." : "Review agent verification files and update account status."}</p>
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value as VerificationDocumentItem["status"] | "all")} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring">
            <option value="all">{isArabic ? "كل الحالات" : "All statuses"}</option>
            <option value="pending">{isArabic ? "قيد المراجعة" : "Pending"}</option>
            <option value="approved">{isArabic ? "مقبول" : "Approved"}</option>
            <option value="rejected">{isArabic ? "مرفوض" : "Rejected"}</option>
          </select>
        </div>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <div className="space-y-4">
        {visibleItems.map((item) => (
          <article key={item._id} className="panel p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">{item.agent?.name || "--"}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.type}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.agent?.email || "--"}</p>
                <a href={item.filePath} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-brand-700">
                  {isArabic ? "فتح المستند" : "Open Document"}
                </a>
              </div>
              <div className="w-full xl:max-w-sm">
                <textarea value={notes[item._id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [item._id]: event.target.value }))} rows={4} placeholder={isArabic ? "سبب الرفض أو ملاحظة المراجعة" : "Review note or rejection reason"} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <button type="button" onClick={() => handleReview(item._id, "pending")} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                    <Clock3 className="h-4 w-4" />
                    {isArabic ? "تعليق" : "Pending"}
                  </button>
                  <button type="button" onClick={() => handleReview(item._id, "approved")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4" />
                    {isArabic ? "قبول" : "Approve"}
                  </button>
                  <button type="button" onClick={() => handleReview(item._id, "rejected")} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white">
                    <XCircle className="h-4 w-4" />
                    {isArabic ? "رفض" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
