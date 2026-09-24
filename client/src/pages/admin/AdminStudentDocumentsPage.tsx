import { DocumentFileLink } from '../../components/DocumentFileLink';
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { DocumentItem } from "../../types";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { StatusExplanation } from "../../components/StatusExplanation";
import { useLanguage } from "../../hooks/useLanguage";
import { useStatusCatalog, type StatusCopy, type StatusInfo } from "../../hooks/useStatusCatalog";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";

const PAGE_SIZE = 8;
// Statuses where the student has to fix something: the reason is required.
const REASON_REQUIRED = new Set(["rejected", "needs-revision", "needs-translation"]);
const toneBadge: Record<string, string> = {
  neutral: "bg-slate-100 text-slate-700", info: "bg-sky-100 text-sky-700", action: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700", danger: "bg-rose-100 text-rose-700",
};
const detailOf = (item: DocumentItem) => item.detailedStatus || ({ pending: "uploaded", verified: "approved", rejected: "rejected" } as Record<string, string>)[item.status] || "uploaded";

export const AdminStudentDocumentsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const catalog = useStatusCatalog();
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState<{ id: string; detailedStatus: string; reviewNote: string; expiresAt: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => adminService
    .getStudentDocuments()
    .then(setItems)
    .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل مستندات الطلاب." : "Unable to load student documents.")));
  useEffect(() => { void load(); }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter === "all" || detailOf(item) === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [item.student?.name, item.student?.email, item.fileName, item.type]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, statusFilter]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const statusLabel = (status: string) => {
    const entry = catalog?.documents[status];
    return entry ? (isArabic ? entry.ar.label : entry.en.label) : status;
  };

  const startReview = (item: DocumentItem) => setReviewing({
    id: item._id, detailedStatus: detailOf(item), reviewNote: item.reviewNote || "",
    expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : "",
  });

  const submitReview = async (item: DocumentItem) => {
    if (!reviewing) return;
    if (REASON_REQUIRED.has(reviewing.detailedStatus) && !reviewing.reviewNote.trim()) {
      setError(isArabic ? "اكتب السبب ليعرف الطالب ما يجب إصلاحه." : "Write the reason so the student knows what to fix.");
      return;
    }
    setBusy(true); setError("");
    try {
      const updated = await adminService.reviewStudentDocument(item._id, {
        detailedStatus: reviewing.detailedStatus, reviewNote: reviewing.reviewNote,
        expiresAt: reviewing.expiresAt ? new Date(`${reviewing.expiresAt}T23:59:59`).toISOString() : null,
        version: item.__v ?? 0,
      });
      setItems((current) => current.map((entry) => (entry._id === item._id ? { ...entry, ...updated } : entry)));
      setReviewing(null);
    } catch (issue) {
      if (axios.isAxiosError(issue) && issue.response?.status === 409) {
        setError(isArabic ? "عدّل زميل هذا المستند للتو. أعدنا تحميل القائمة؛ راجع القرار الجديد ثم أعد المحاولة." : "A colleague just updated this document. The list was reloaded; check the new decision and try again.");
        await load();
      } else {
        setError(getErrorMessage(issue, isArabic ? "تعذر حفظ المراجعة." : "Unable to save the review."));
      }
    } finally {
      setBusy(false);
    }
  };

  const documentStatuses = Object.keys(catalog?.documents || {});

  // Same wording the server will send (statusCatalog.js documentStatusInfo).
  const previewInfo = (status: string, note: string): StatusInfo => {
    const entry = catalog!.documents[status];
    const withReason = (copy: StatusCopy) => ({
      ...copy, meaning: note.trim() && copy.reasonMeaning ? copy.reasonMeaning.replace("{reason}", note.trim()) : copy.meaning,
    });
    return { status, code: entry.code, tone: entry.tone, ar: withReason(entry.ar), en: withReason(entry.en) };
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "مستندات الطلاب" : "Student Documents"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "مراجعة الملفات التي رفعها الطلاب واعتمادها أو طلب تصحيحها." : "Review student uploads, approve them or ask for corrections."}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "بحث" : "Search"}</span>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "ابحث بالطالب أو الملف" : "Search by student or file"} className="w-full border-none bg-transparent p-0 outline-none" />
              </div>
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الحالة" : "Status"}</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full border-none bg-transparent p-0 outline-none">
                <option value="all">{isArabic ? "كل الحالات" : "All statuses"}</option>
                {documentStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
              </select>
            </label>
          </div>
        </div>
        {error ? <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="panel p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{isArabic ? "الطالب" : "Student"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "نوع المستند" : "Document Type"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "اسم الملف" : "File Name"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "التاريخ" : "Date"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الإجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => {
                const open = reviewing?.id === item._id;
                return [
                  <tr key={item._id} className="border-t border-slate-100">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.student?.name || "--"}</p>
                        <p className="text-slate-500">{item.student?.email || "--"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">{item.type}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">{item.fileName}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneBadge[item.statusInfo?.tone || "info"]}`}>
                        {statusLabel(detailOf(item))}
                      </span>
                      {item.reviewNote ? <p className="mt-2 max-w-xs text-xs text-slate-500">{item.reviewNote}</p> : null}
                      {item.expiresAt ? <p className="mt-1 text-xs text-slate-500">{isArabic ? "صالح حتى" : "Valid until"} {formatDate(item.expiresAt)}</p> : null}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <DocumentFileLink className="inline-flex rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700" path={item.filePath}>
                          {isArabic ? "عرض الملف" : "View file"}
                        </DocumentFileLink>
                        <button type="button" className="inline-flex rounded-full bg-slate-950 px-4 py-2 font-medium text-white" onClick={() => (open ? setReviewing(null) : startReview(item))}>
                          {open ? (isArabic ? "إغلاق" : "Close") : (isArabic ? "مراجعة" : "Review")}
                        </button>
                      </div>
                    </td>
                  </tr>,
                  open && reviewing ? (
                    <tr key={`${item._id}-review`} className="bg-slate-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid gap-3 md:grid-cols-3">
                          <label className="text-sm">{isArabic ? "الحالة الجديدة" : "New status"}
                            <select className="mt-1 block w-full rounded-xl border border-slate-300 bg-white p-2" value={reviewing.detailedStatus} onChange={(event) => setReviewing({ ...reviewing, detailedStatus: event.target.value })}>
                              {documentStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                            </select>
                          </label>
                          <label className="text-sm md:col-span-2">
                            {isArabic ? "السبب أو الملاحظة للطالب" : "Reason / note for the student"}
                            {REASON_REQUIRED.has(reviewing.detailedStatus) ? <span className="text-rose-600"> *</span> : null}
                            <textarea rows={2} maxLength={1000} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white p-2"
                              placeholder={isArabic ? "مثال: الختم غير واضح، يرجى إعادة رفعه بصورة واضحة عبر السكانر" : "e.g. The stamp is unreadable, please rescan it clearly"}
                              value={reviewing.reviewNote} onChange={(event) => setReviewing({ ...reviewing, reviewNote: event.target.value })} />
                          </label>
                          <label className="text-sm">{isArabic ? "تاريخ انتهاء الصلاحية (اختياري)" : "Expiry date (optional)"}
                            <input type="date" className="mt-1 block w-full rounded-xl border border-slate-300 bg-white p-2" value={reviewing.expiresAt} onChange={(event) => setReviewing({ ...reviewing, expiresAt: event.target.value })} />
                          </label>
                          <div className="md:col-span-2">
                            <p className="mb-1 text-xs text-slate-500">{isArabic ? "هكذا سيراها الطالب:" : "What the student will see:"}</p>
                            {catalog?.documents[reviewing.detailedStatus] ? <StatusExplanation info={previewInfo(reviewing.detailedStatus, reviewing.reviewNote)} /> : null}
                          </div>
                        </div>
                        <button type="button" disabled={busy} className="mt-3 rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50" onClick={() => void submitReview(item)}>
                          {isArabic ? "حفظ المراجعة وإبلاغ الطالب" : "Save review and notify student"}
                        </button>
                      </td>
                    </tr>
                  ) : null,
                ];
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{isArabic ? "لا توجد مستندات مطابقة." : "No matching documents found."}</div> : null}

        <div className="mt-5">
          <AdminPagination page={page} totalPages={totalPages} totalItems={filteredItems.length} pageSize={PAGE_SIZE} isArabic={isArabic} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
};
