import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/adminService";
import type { ArrivalServiceRequestItem } from "../../types";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { ToastViewport } from "../../components/ToastViewport";
import { useLanguage } from "../../hooks/useLanguage";
import { useToasts } from "../../hooks/useToasts";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";

const PAGE_SIZE = 5;

export const AdminStudentArrivalRequestsEnhancedPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<ArrivalServiceRequestItem[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ArrivalServiceRequestItem["status"]>("all");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: ArrivalServiceRequestItem["status"];
    studentName: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const { toasts, pushToast, dismissToast } = useToasts();

  useEffect(() => {
    adminService
      .getArrivalRequests()
      .then(setItems)
      .catch((issue) =>
        setError(
          getErrorMessage(
            issue,
            isArabic ? "تعذر تحميل طلبات الوصول." : "Unable to load arrival requests."
          )
        )
      );
  }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          item.student?.name,
          item.student?.email,
          item.airport,
          item.flightNumber,
          item.status,
        ]
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

  const confirmStatusUpdate = async () => {
    if (!pendingAction) return;
    setSaving(true);
    try {
      const updated = await adminService.updateArrivalRequest(pendingAction.id, {
        status: pendingAction.status,
      });
      setItems((current) => current.map((item) => (item._id === pendingAction.id ? updated : item)));
      pushToast(
        isArabic
          ? `تم تحديث طلب ${pendingAction.studentName}.`
          : `${pendingAction.studentName}'s arrival request was updated.`,
        "success"
      );
      setPendingAction(null);
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر تحديث الطلب." : "Unable to update request."));
      pushToast(isArabic ? "تعذر تحديث الطلب." : "Unable to update request.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastViewport items={toasts} onDismiss={dismissToast} />

      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "طلبات الوصول والخدمات" : "Arrival Service Requests"}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {isArabic ? "تنسيق طلبات السفر والسكن والاستقبال الخاصة بالطلاب." : "Coordinate student travel, housing, and airport-related requests."}
        </p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="panel p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "بحث" : "Search"}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isArabic ? "ابحث باسم الطالب أو البريد أو المطار" : "Search by student, email, or airport"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "الحالة" : "Status"}</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | ArrivalServiceRequestItem["status"])} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring">
              <option value="all">{isArabic ? "كل الحالات" : "All statuses"}</option>
              <option value="draft">{isArabic ? "مسودة" : "Draft"}</option>
              <option value="submitted">{isArabic ? "مرسل" : "Submitted"}</option>
              <option value="in-progress">{isArabic ? "قيد التنفيذ" : "In Progress"}</option>
              <option value="completed">{isArabic ? "مكتمل" : "Completed"}</option>
            </select>
          </label>
        </div>

        <div className="mt-6 space-y-4">
          {visibleItems.map((item) => (
            <article key={item._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{item.student?.name || "--"}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.student?.email || "--"}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">{isArabic ? "تاريخ الوصول:" : "Arrival Date:"} {item.arrivalDate ? formatDate(item.arrivalDate) : "--"}</div>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">{isArabic ? "وقت الوصول:" : "Arrival Time:"} {item.arrivalTime || "--"}</div>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">{isArabic ? "رقم الرحلة:" : "Flight Number:"} {item.flightNumber || "--"}</div>
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">{isArabic ? "المطار:" : "Airport:"} {item.airport || "--"}</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700">
                {item.services.airportPickup ? <span className="rounded-full bg-white px-3 py-1">{isArabic ? "استقبال المطار" : "Airport Pickup"}</span> : null}
                {item.services.studentHousing ? <span className="rounded-full bg-white px-3 py-1">{isArabic ? "السكن" : "Housing"}</span> : null}
                {item.services.residencePermitSupport ? <span className="rounded-full bg-white px-3 py-1">{isArabic ? "الإقامة" : "Residence Permit"}</span> : null}
                {item.services.visaSupport ? <span className="rounded-full bg-white px-3 py-1">{isArabic ? "الفيزا" : "Visa Support"}</span> : null}
              </div>

              {item.notes ? <p className="mt-4 text-sm text-slate-600">{item.notes}</p> : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" onClick={() => setPendingAction({ id: item._id, status: "in-progress", studentName: item.student?.name || "--" })} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
                  {isArabic ? "قيد التنفيذ" : "In Progress"}
                </button>
                <button type="button" onClick={() => setPendingAction({ id: item._id, status: "completed", studentName: item.student?.name || "--" })} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                  {isArabic ? "مكتمل" : "Completed"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {!filteredItems.length ? (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
            {isArabic ? "لا توجد طلبات مطابقة للبحث الحالي." : "No arrival requests match the current filters."}
          </div>
        ) : null}

        <div className="mt-5">
          <AdminPagination page={page} totalPages={totalPages} totalItems={filteredItems.length} pageSize={PAGE_SIZE} isArabic={isArabic} onPageChange={setPage} />
        </div>
      </section>

      <ConfirmationModal
        open={Boolean(pendingAction)}
        title={isArabic ? "تأكيد تحديث الحالة" : "Confirm Status Update"}
        description={
          pendingAction
            ? isArabic
              ? `سيتم تحديث طلب ${pendingAction.studentName} إلى الحالة ${pendingAction.status}.`
              : `This will update ${pendingAction.studentName}'s request to ${pendingAction.status}.`
            : ""
        }
        confirmLabel={isArabic ? "تأكيد" : "Confirm"}
        cancelLabel={isArabic ? "إلغاء" : "Cancel"}
        loading={saving}
        onConfirm={confirmStatusUpdate}
        onClose={() => !saving && setPendingAction(null)}
      />
    </div>
  );
};
