import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Clock3, Filter, XCircle } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { AgencyRequest } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";

export const AdminAgencyRequestsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [requests, setRequests] = useState<AgencyRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<AgencyRequest["status"] | "all">("all");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    adminService
      .getAgencyRequests()
      .then((data) => {
        setRequests(data);
        setNoteDrafts(
          data.reduce<Record<string, string>>((accumulator, item) => {
            accumulator[item._id] = item.adminNote || "";
            return accumulator;
          }, {})
        );
      })
      .catch((error) => setFormError(getErrorMessage(error, isArabic ? "تعذر تحميل طلبات الوكالة." : "Unable to load agency requests.")));
  }, [isArabic]);

  const filteredRequests = useMemo(
    () => requests.filter((item) => statusFilter === "all" || item.status === statusFilter),
    [requests, statusFilter]
  );

  const statusMeta: Record<AgencyRequest["status"], { label: string; className: string; icon: JSX.Element }> = {
    pending: {
      label: isArabic ? "قيد المراجعة" : "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock3 className="h-4 w-4" />,
    },
    approved: {
      label: isArabic ? "مقبول" : "Approved",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    rejected: {
      label: isArabic ? "مرفوض" : "Rejected",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <XCircle className="h-4 w-4" />,
    },
  };

  const handleStatusChange = async (id: string, status: AgencyRequest["status"]) => {
    setSubmittingId(id);
    setFormError("");

    try {
      const updated = await adminService.updateAgencyRequestStatus(id, {
        status,
        adminNote: noteDrafts[id] || "",
      });

      setRequests((current) => current.map((item) => (item._id === id ? updated : item)));
    } catch (error) {
      setFormError(getErrorMessage(error, isArabic ? "تعذر تحديث الطلب." : "Unable to update request."));
    } finally {
      setSubmittingId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "طلبات الوكالة" : "Agency Requests"}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {isArabic ? "راجع طلبات الطلاب الراغبين في التحول إلى وكلاء." : "Review student requests to become agents."}
              </p>
            </div>
          </div>

          <label className="rounded-2xl border border-slate-200 px-4 py-3">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <Filter className="h-3.5 w-3.5" />
              {isArabic ? "تصفية" : "Filter"}
            </span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AgencyRequest["status"] | "all")} className="w-full border-none bg-transparent p-0 outline-none">
              <option value="all">{isArabic ? "كل الحالات" : "All statuses"}</option>
              <option value="pending">{isArabic ? "قيد المراجعة" : "Pending"}</option>
              <option value="approved">{isArabic ? "مقبول" : "Approved"}</option>
              <option value="rejected">{isArabic ? "مرفوض" : "Rejected"}</option>
            </select>
          </label>
        </div>

        {formError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
      </section>

      <section className="space-y-4">
        {filteredRequests.length ? (
          filteredRequests.map((request) => {
            const meta = statusMeta[request.status];
            const studentName = request.student?.name || (isArabic ? "طالب غير معروف" : "Unknown student");
            const studentEmail = request.student?.email || (isArabic ? "بدون بريد" : "No email");

            return (
              <article key={request._id} className="panel p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-slate-900">{studentName}</h2>
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${meta.className}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{studentEmail}</p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {isArabic ? "أُرسل في" : "Submitted"}: {formatDate(request.submittedAt || request.createdAt)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {isArabic ? "الدور الحالي" : "Current role"}: {request.student?.role || "student"}
                      </span>
                      {request.reviewedAt ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {isArabic ? "تمت المراجعة" : "Reviewed"}: {formatDate(request.reviewedAt)}
                        </span>
                      ) : null}
                    </div>

                    {request.studentNote ? (
                      <div className="mt-5 rounded-3xl border border-slate-200 p-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {isArabic ? "ملاحظة الطالب" : "Student note"}
                        </h3>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{request.studentNote}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="w-full xl:max-w-sm">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "ملاحظة الإدارة" : "Admin note"}</span>
                      <textarea
                        value={noteDrafts[request._id] ?? ""}
                        onChange={(event) => setNoteDrafts((current) => ({ ...current, [request._id]: event.target.value }))}
                        rows={4}
                        placeholder={isArabic ? "أضف ملاحظة داخلية حول القرار" : "Add an internal note about this decision"}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
                      />
                    </label>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {([
                        ["pending", isArabic ? "إعادة للمراجعة" : "Set pending"],
                        ["approved", isArabic ? "قبول" : "Approve"],
                        ["rejected", isArabic ? "رفض" : "Reject"],
                      ] as Array<[AgencyRequest["status"], string]>).map(([status, label]) => (
                        <button
                          key={status}
                          type="button"
                          disabled={submittingId === request._id}
                          onClick={() => handleStatusChange(request._id, status)}
                          className={`rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                            status === "approved"
                              ? "bg-emerald-600 text-white"
                              : status === "rejected"
                                ? "bg-rose-600 text-white"
                                : "border border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {submittingId === request._id ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="panel p-8 text-sm text-slate-500">
            {isArabic ? "لا توجد طلبات وكالة مطابقة حاليًا." : "No agency requests match the current filter."}
          </div>
        )}
      </section>
    </div>
  );
};
