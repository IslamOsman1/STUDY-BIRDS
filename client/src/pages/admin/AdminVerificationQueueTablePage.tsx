import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Search, XCircle } from "lucide-react";
import { adminService } from "../../services/adminService";
import { getDownloadableAssetUrl } from "../../lib/api";
import type { AdminPartnerItem, VerificationDocumentItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { AdminConfirmationModal } from "../../components/admin/AdminConfirmationModal";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { AdminToastViewport } from "../../components/admin/AdminToastViewport";
import { useAdminToasts } from "../../hooks/useAdminToasts";

const PAGE_SIZE = 6;

interface VerificationQueueRow {
  _id: string;
  agent: VerificationDocumentItem["agent"] | Pick<AdminPartnerItem, "_id" | "name" | "email">;
  type: VerificationDocumentItem["type"] | "not-uploaded";
  fileName: string;
  filePath?: string;
  status: VerificationDocumentItem["status"] | "not-uploaded";
  reviewNote?: string;
  sourceDocumentId?: string;
}

interface ReviewTarget {
  item: VerificationQueueRow;
  status: VerificationDocumentItem["status"];
}

export const AdminVerificationQueueTablePage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<VerificationQueueRow[]>([]);
  const [filter, setFilter] = useState<VerificationQueueRow["status"] | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<VerificationDocumentItem["status"]>("approved");
  const [bulkOpen, setBulkOpen] = useState(false);
  const { toasts, pushToast, dismissToast } = useAdminToasts();

  useEffect(() => {
    Promise.all([adminService.getVerificationDocuments(), adminService.getPartners()])
      .then(([documents, partners]) => {
        const rowsFromDocuments: VerificationQueueRow[] = documents.map((item) => ({
          _id: item._id,
          agent: item.agent || { _id: "", name: "--", email: "--" },
          type: item.type,
          fileName: item.fileName,
          filePath: item.filePath,
          status: item.status,
          reviewNote: item.reviewNote || "",
          sourceDocumentId: item._id,
        }));

        const partnerIdsWithDocuments = new Set(documents.map((item) => item.agent?._id).filter(Boolean));
        const rowsWithoutDocuments: VerificationQueueRow[] = partners
          .filter((partner) => !partnerIdsWithDocuments.has(partner._id))
          .map((partner) => ({
            _id: `agent-${partner._id}`,
            agent: { _id: partner._id, name: partner.name, email: partner.email },
            type: "not-uploaded",
            fileName: isArabic ? "لم يتم رفع مستند بعد" : "No document uploaded yet",
            status: "not-uploaded",
            reviewNote: partner.profile?.verificationReason || "",
          }));

        const rows = [...rowsFromDocuments, ...rowsWithoutDocuments];
        setItems(rows);
        setNotes(rows.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item._id]: item.reviewNote || "" }), {}));
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

  useEffect(() => {
    setSelectedIds((current) => current.filter((documentId) => filteredItems.some((item) => item._id === documentId)));
  }, [filteredItems]);

  const allVisibleSelected = visibleItems.length > 0 && visibleItems.every((item) => selectedIds.includes(item._id));

  const toggleSelection = (documentId: string) => {
    setSelectedIds((current) => (current.includes(documentId) ? current.filter((value) => value !== documentId) : [...current, documentId]));
  };

  const toggleSelectVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((value) => !visibleItems.some((item) => item._id === value)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleItems.map((item) => item._id)])));
  };

  const handleReview = async () => {
    if (!reviewTarget?.item.sourceDocumentId) {
      return;
    }

    setReviewing(true);
    try {
      const updated = await adminService.reviewVerificationDocument(reviewTarget.item.sourceDocumentId, {
        status: reviewTarget.status,
        reviewNote: notes[reviewTarget.item._id] || "",
      });
      setItems((current) =>
        current.map((item) =>
          item.sourceDocumentId === updated._id
            ? {
                ...item,
                type: updated.type,
                fileName: updated.fileName,
                filePath: updated.filePath,
                status: updated.status,
                reviewNote: updated.reviewNote || "",
              }
            : item
        )
      );
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

  const handleBulkReview = async () => {
    setReviewing(true);
    try {
      const updatedDocuments = await Promise.all(
        selectedIds
          .map((documentId) => items.find((item) => item._id === documentId))
          .filter((item): item is VerificationQueueRow => Boolean(item?.sourceDocumentId))
          .map((item) =>
            adminService.reviewVerificationDocument(item.sourceDocumentId!, {
            status: bulkStatus,
            reviewNote: notes[item._id] || "",
          })
        )
      );
      const map = new Map(updatedDocuments.map((document) => [document._id, document]));
      setItems((current) =>
        current.map((item) =>
          item.sourceDocumentId && map.has(item.sourceDocumentId)
            ? {
                ...item,
                type: map.get(item.sourceDocumentId)!.type,
                fileName: map.get(item.sourceDocumentId)!.fileName,
                filePath: map.get(item.sourceDocumentId)!.filePath,
                status: map.get(item.sourceDocumentId)!.status,
                reviewNote: map.get(item.sourceDocumentId)!.reviewNote || "",
              }
            : item
        )
      );
      setSelectedIds([]);
      setBulkOpen(false);
      pushToast(isArabic ? "تم تحديث المستندات المحددة." : "Selected documents updated.", "success");
    } catch (issue) {
      const message = getErrorMessage(issue, isArabic ? "تعذر تحديث المستندات المحددة." : "Unable to update selected documents.");
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
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "عرض جدولي احترافي مع مراجعات جماعية لمستندات التوثيق." : "Professional table view with bulk review actions for verification documents."}</p>
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
                <option value="not-uploaded">{isArabic ? "بدون مستند" : "No document"}</option>
              </select>
            </label>
          </div>
        </div>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectVisible} />
              {isArabic ? "تحديد الصفحة" : "Select page"}
            </label>
            <span className="text-sm text-slate-500">{isArabic ? `${selectedIds.length} محدد` : `${selectedIds.length} selected`}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value as VerificationDocumentItem["status"])} className="rounded-full border border-slate-200 px-3 py-2 text-sm outline-none">
              <option value="approved">{isArabic ? "اعتماد المحدد" : "Approve selected"}</option>
              <option value="rejected">{isArabic ? "رفض المحدد" : "Reject selected"}</option>
              <option value="pending">{isArabic ? "إرجاع كمعلق" : "Set selected pending"}</option>
            </select>
            <button type="button" disabled={selectedIds.filter((id) => items.find((item) => item._id === id)?.sourceDocumentId).length === 0} onClick={() => setBulkOpen(true)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {isArabic ? "تنفيذ جماعي" : "Bulk apply"}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الوكيل" : "Agent"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "نوع المستند" : "Document Type"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "اسم الملف" : "File"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "ملاحظة" : "Review Note"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item._id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={selectedIds.includes(item._id)} onChange={() => toggleSelection(item._id)} />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.agent?.name || "--"}</p>
                      <p className="mt-1 text-slate-500">{item.agent?.email || "--"}</p>
                    </div>
                  </td>
                    <td className="px-4 py-4 text-slate-600">{item.type === "not-uploaded" ? (isArabic ? "لم يرفع بعد" : "Not uploaded") : item.type}</td>
                    <td className="px-4 py-4">
                      {item.filePath ? (
                        <a href={getDownloadableAssetUrl(item.filePath)} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                          {item.fileName}
                        </a>
                      ) : (
                        <span className="text-slate-400">{item.fileName}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {item.status === "not-uploaded" ? (isArabic ? "بدون مستند" : "No document") : item.status}
                      </span>
                    </td>
                  <td className="px-4 py-4">
                    <textarea value={notes[item._id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [item._id]: event.target.value }))} rows={3} placeholder={isArabic ? "ملاحظات المراجعة" : "Review note"} className="min-w-[220px] rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:ring" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="grid gap-2">
                      <button type="button" disabled={!item.sourceDocumentId} onClick={() => setReviewTarget({ item, status: "approved" })} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">
                        <CheckCircle2 className="h-4 w-4" />
                        {isArabic ? "قبول" : "Approve"}
                      </button>
                      <button type="button" disabled={!item.sourceDocumentId} onClick={() => setReviewTarget({ item, status: "pending" })} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40">
                        <Clock3 className="h-4 w-4" />
                        {isArabic ? "تعليق" : "Pending"}
                      </button>
                      <button type="button" disabled={!item.sourceDocumentId} onClick={() => setReviewTarget({ item, status: "rejected" })} className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">
                        <XCircle className="h-4 w-4" />
                        {isArabic ? "رفض" : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {filteredItems.length === 0 ? <div className="panel px-6 py-12 text-center text-sm text-slate-500">{isArabic ? "لا توجد طلبات توثيق مطابقة." : "No verification documents match your filters."}</div> : null}

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
      <AdminConfirmationModal
        open={bulkOpen}
        title={isArabic ? "تأكيد التحديث الجماعي" : "Confirm bulk update"}
        description={isArabic ? `سيتم تحديث ${selectedIds.length} مستند/مستندات إلى الحالة ${bulkStatus}.` : `${selectedIds.length} selected document(s) will be updated to ${bulkStatus}.`}
        confirmLabel={isArabic ? "تأكيد" : "Confirm"}
        cancelLabel={isArabic ? "إلغاء" : "Cancel"}
        loading={reviewing}
        onConfirm={handleBulkReview}
        onClose={() => !reviewing && setBulkOpen(false)}
      />
      <AdminToastViewport items={toasts} onDismiss={dismissToast} />
    </div>
  );
};
