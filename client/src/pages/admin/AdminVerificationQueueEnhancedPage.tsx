import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Search, XCircle } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { VerificationDocumentItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { AdminConfirmationModal } from "../../components/admin/AdminConfirmationModal";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { AdminToastViewport } from "../../components/admin/AdminToastViewport";
import { useAdminToasts } from "../../hooks/useAdminToasts";

const PAGE_SIZE = 6;

interface ReviewTarget {
  item: VerificationDocumentItem;
  status: VerificationDocumentItem["status"];
}

export const AdminVerificationQueueEnhancedPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<VerificationDocumentItem[]>([]);
  const [filter, setFilter] = useState<VerificationDocumentItem["status"] | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const { toasts, pushToast, dismissToast } = useAdminToasts();

  useEffect(() => {
    adminService
      .getVerificationDocuments()
      .then((data) => {
        setItems(data);
        setNotes(data.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item._id]: item.reviewNote || "" }), {}));
      })
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل قائمة التوثيق." : "Unable to load verification queue.")));
  }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus = filter === "all" || item.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        [item.agent?.name || "", item.agent?.email || "", item.type, item.fileName].join(" ").toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [filter, items, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = useMemo(() => filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredItems, page]);

  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleReview = async () => {
    if (!reviewTarget) {
      return;
    }

    setReviewing(true);
    try {
      const updated = await adminService.reviewVerificationDocument(reviewTarget.item._id, {
        status: reviewTarget.status,
        reviewNote: notes[reviewTarget.item._id] || "",
      });
      setItems((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      pushToast(isArabic ? "تم تحديث حالة التوثيق." : "Verification status updated.", "success");
      setReviewTarget(null);
    } catch (issue) {
      const message = getErrorMessage(issue, isArabic ? "تعذر تحديث الحالة." : "Unable to update verification status.");
      setError(message);
      pushToast(message, "error");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "طابور توثيق الوكلاء" : "Verification Queue"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "راجع ملفات التوثيق وحدّث حالة الحساب." : "Review agent verification files and update account status."}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "بحث" : "Search"}</span>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "ابحث باسم الوكيل أو البريد أو نوع المستند" : "Search by agent, email, or document type"} className="w-full border-none p-0 outline-none" />
              </div>
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الحالة" : "Status"}</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value as VerificationDocumentItem["status"] | "all")} className="w-full border-none bg-transparent p-0 outline-none">
                <option value="all">{isArabic ? "كل الحالات" : "All statuses"}</option>
                <option value="pending">{isArabic ? "قيد المراجعة" : "Pending"}</option>
                <option value="approved">{isArabic ? "مقبول" : "Approved"}</option>
                <option value="rejected">{isArabic ? "مرفوض" : "Rejected"}</option>
              </select>
            </label>
          </div>
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
                <textarea value={notes[item._id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [item._id]: event.target.value }))} rows={4} placeholder={isArabic ? "سبب الرفض أو ملاحظات المراجعة" : "Review note or rejection reason"} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <button type="button" onClick={() => setReviewTarget({ item, status: "pending" })} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                    <Clock3 className="h-4 w-4" />
                    {isArabic ? "تعليق" : "Pending"}
                  </button>
                  <button type="button" onClick={() => setReviewTarget({ item, status: "approved" })} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
                    <CheckCircle2 className="h-4 w-4" />
                    {isArabic ? "قبول" : "Approve"}
                  </button>
                  <button type="button" onClick={() => setReviewTarget({ item, status: "rejected" })} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white">
                    <XCircle className="h-4 w-4" />
                    {isArabic ? "رفض" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {filteredItems.length === 0 ? <div className="panel px-6 py-12 text-center text-sm text-slate-500">{isArabic ? "لا توجد طلبات توثيق مطابقة." : "No verification documents match your filters."}</div> : null}
      </div>

      <AdminPagination page={page} totalPages={totalPages} totalItems={filteredItems.length} pageSize={PAGE_SIZE} isArabic={isArabic} onPageChange={setPage} />

      <AdminConfirmationModal
        open={Boolean(reviewTarget)}
        title={isArabic ? "تأكيد الإجراء" : "Confirm action"}
        description={
          isArabic
            ? `سيتم تحديث حالة مستند ${reviewTarget?.item.agent?.name || ""} إلى ${reviewTarget?.status || ""}.`
            : `The document status for ${reviewTarget?.item.agent?.name || "this agent"} will be updated to ${reviewTarget?.status || ""}.`
        }
        confirmLabel={isArabic ? "تأكيد" : "Confirm"}
        cancelLabel={isArabic ? "إلغاء" : "Cancel"}
        loading={reviewing}
        onConfirm={handleReview}
        onClose={() => !reviewing && setReviewTarget(null)}
      />
      <AdminToastViewport items={toasts} onDismiss={dismissToast} />
    </div>
  );
};
