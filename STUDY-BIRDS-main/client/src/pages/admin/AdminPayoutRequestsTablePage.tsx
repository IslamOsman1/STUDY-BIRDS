import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Landmark, Search, XCircle } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { PayoutRequestItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { AdminConfirmationModal } from "../../components/admin/AdminConfirmationModal";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { AdminToastViewport } from "../../components/admin/AdminToastViewport";
import { useAdminToasts } from "../../hooks/useAdminToasts";
import { formatCurrency } from "../../utils/format";

const PAGE_SIZE = 6;

interface PayoutTarget {
  item: PayoutRequestItem;
  status: PayoutRequestItem["status"];
}

export const AdminPayoutRequestsTablePage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<PayoutRequestItem[]>([]);
  const [filter, setFilter] = useState<PayoutRequestItem["status"] | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [updateTarget, setUpdateTarget] = useState<PayoutTarget | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<PayoutRequestItem["status"]>("approved");
  const [bulkOpen, setBulkOpen] = useState(false);
  const { toasts, pushToast, dismissToast } = useAdminToasts();

  useEffect(() => {
    adminService
      .getPayoutRequests()
      .then((data) => {
        setItems(data);
        setNotes(data.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item._id]: item.reviewNote || "" }), {}));
      })
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل طلبات السحب." : "Unable to load payout requests.")));
  }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = filter === "all" || item.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        [item.agent?.name || "", item.agent?.email || "", item.method, item.payoutDetails].join(" ").toLowerCase().includes(normalizedQuery);
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
    setSelectedIds((current) => current.filter((requestId) => filteredItems.some((item) => item._id === requestId)));
  }, [filteredItems]);

  const allVisibleSelected = visibleItems.length > 0 && visibleItems.every((item) => selectedIds.includes(item._id));

  const toggleSelection = (requestId: string) => {
    setSelectedIds((current) => (current.includes(requestId) ? current.filter((value) => value !== requestId) : [...current, requestId]));
  };

  const toggleSelectVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((value) => !visibleItems.some((item) => item._id === value)));
      return;
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...visibleItems.map((item) => item._id)])));
  };

  const handleUpdate = async () => {
    if (!updateTarget) {
      return;
    }

    setUpdating(true);
    try {
      const updated = await adminService.updatePayoutRequestStatus(updateTarget.item._id, {
        status: updateTarget.status,
        reviewNote: notes[updateTarget.item._id] || "",
      });
      setItems((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      pushToast(isArabic ? "تم تحديث طلب السحب." : "Payout request updated.", "success");
      setUpdateTarget(null);
    } catch (issue) {
      const message = getErrorMessage(issue, isArabic ? "تعذر تحديث الطلب." : "Unable to update payout request.");
      setError(message);
      pushToast(message, "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkUpdate = async () => {
    setUpdating(true);
    try {
      const updatedRequests = await Promise.all(
        selectedIds.map((requestId) =>
          adminService.updatePayoutRequestStatus(requestId, {
            status: bulkStatus,
            reviewNote: notes[requestId] || "",
          })
        )
      );
      const map = new Map(updatedRequests.map((request) => [request._id, request]));
      setItems((current) => current.map((item) => (map.has(item._id) ? map.get(item._id)! : item)));
      setSelectedIds([]);
      setBulkOpen(false);
      pushToast(isArabic ? "تم تحديث الطلبات المحددة." : "Selected payout requests updated.", "success");
    } catch (issue) {
      const message = getErrorMessage(issue, isArabic ? "تعذر تحديث الطلبات المحددة." : "Unable to update selected payout requests.");
      setError(message);
      pushToast(message, "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "طلبات سحب الأرباح" : "Payout Requests"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "عرض جدولي مع تحديثات فردية وجماعية لطلبات السحب." : "Table view with single and bulk status updates for payout requests."}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "بحث" : "Search"}</span>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "ابحث باسم الوكيل أو البريد أو وسيلة الدفع" : "Search by agent, email, or payout method"} className="w-full border-none p-0 outline-none" />
              </div>
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الحالة" : "Status"}</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value as PayoutRequestItem["status"] | "all")} className="w-full border-none bg-transparent p-0 outline-none">
                <option value="all">{isArabic ? "كل الحالات" : "All statuses"}</option>
                <option value="pending">{isArabic ? "قيد المراجعة" : "Pending"}</option>
                <option value="approved">{isArabic ? "معتمد" : "Approved"}</option>
                <option value="rejected">{isArabic ? "مرفوض" : "Rejected"}</option>
                <option value="paid">{isArabic ? "مدفوع" : "Paid"}</option>
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
            <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value as PayoutRequestItem["status"])} className="rounded-full border border-slate-200 px-3 py-2 text-sm outline-none">
              <option value="approved">{isArabic ? "اعتماد المحدد" : "Approve selected"}</option>
              <option value="paid">{isArabic ? "تعيين كمدفوع" : "Mark selected paid"}</option>
              <option value="pending">{isArabic ? "إرجاع كمعلق" : "Set selected pending"}</option>
              <option value="rejected">{isArabic ? "رفض المحدد" : "Reject selected"}</option>
            </select>
            <button type="button" disabled={selectedIds.length === 0} onClick={() => setBulkOpen(true)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
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
                <th className="px-4 py-3 font-medium">{isArabic ? "المبلغ" : "Amount"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الطريقة" : "Method"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "ملاحظات" : "Notes"}</th>
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
                  <td className="px-4 py-4 text-slate-600">{formatCurrency(item.amount)}</td>
                  <td className="px-4 py-4 text-slate-600">{item.method}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <textarea value={notes[item._id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [item._id]: event.target.value }))} rows={3} placeholder={isArabic ? "ملاحظات المراجعة" : "Review note"} className="min-w-[220px] rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:ring" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="grid gap-2">
                      <button type="button" onClick={() => setUpdateTarget({ item, status: "approved" })} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                        <CheckCircle2 className="h-4 w-4" />
                        {isArabic ? "اعتماد" : "Approve"}
                      </button>
                      <button type="button" onClick={() => setUpdateTarget({ item, status: "paid" })} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
                        <Landmark className="h-4 w-4" />
                        {isArabic ? "مدفوع" : "Paid"}
                      </button>
                      <button type="button" onClick={() => setUpdateTarget({ item, status: "rejected" })} className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white">
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

      {filteredItems.length === 0 ? <div className="panel px-6 py-12 text-center text-sm text-slate-500">{isArabic ? "لا توجد طلبات مطابقة." : "No payout requests match your filters."}</div> : null}

      <AdminPagination page={page} totalPages={totalPages} totalItems={filteredItems.length} pageSize={PAGE_SIZE} isArabic={isArabic} onPageChange={setPage} />

      <AdminConfirmationModal
        open={Boolean(updateTarget)}
        title={isArabic ? "تأكيد تحديث الطلب" : "Confirm payout update"}
        description={
          isArabic
            ? `سيتم تحديث طلب ${updateTarget?.item.agent?.name || ""} إلى الحالة ${updateTarget?.status || ""}.`
            : `The payout request for ${updateTarget?.item.agent?.name || "this agent"} will be updated to ${updateTarget?.status || ""}.`
        }
        confirmLabel={isArabic ? "تأكيد" : "Confirm"}
        cancelLabel={isArabic ? "إلغاء" : "Cancel"}
        loading={updating}
        onConfirm={handleUpdate}
        onClose={() => !updating && setUpdateTarget(null)}
      />
      <AdminConfirmationModal
        open={bulkOpen}
        title={isArabic ? "تأكيد التحديث الجماعي" : "Confirm bulk update"}
        description={isArabic ? `سيتم تحديث ${selectedIds.length} طلب/طلبات إلى الحالة ${bulkStatus}.` : `${selectedIds.length} selected request(s) will be updated to ${bulkStatus}.`}
        confirmLabel={isArabic ? "تأكيد" : "Confirm"}
        cancelLabel={isArabic ? "إلغاء" : "Cancel"}
        loading={updating}
        onConfirm={handleBulkUpdate}
        onClose={() => !updating && setBulkOpen(false)}
      />
      <AdminToastViewport items={toasts} onDismiss={dismissToast} />
    </div>
  );
};
