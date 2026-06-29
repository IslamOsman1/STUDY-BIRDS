import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Mail, Phone, Search, UserRound } from "lucide-react";
import { adminService } from "../../services/adminService";
import { getDownloadableAssetUrl } from "../../lib/api";
import type { AgentStudentItem } from "../../types";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { AdminToastViewport } from "../../components/admin/AdminToastViewport";
import { useAdminToasts } from "../../hooks/useAdminToasts";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";

const PAGE_SIZE = 8;

export const AdminPartnerStudentsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<AgentStudentItem[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [statusDrafts, setStatusDrafts] = useState<Record<string, AgentStudentItem["applicationStatus"]>>({});
  const [savingId, setSavingId] = useState("");
  const { toasts, pushToast, dismissToast } = useAdminToasts();

  useEffect(() => {
    adminService
      .getAllPartnerStudents()
      .then((data) => {
        setItems(data);
        setStatusDrafts(
          data.reduce<Record<string, AgentStudentItem["applicationStatus"]>>((accumulator, item) => {
            accumulator[item._id] = item.applicationStatus;
            return accumulator;
          }, {})
        );
      })
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل طلاب الوكلاء." : "Unable to load partner students.")));
  }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      [
        item.name,
        item.email,
        item.phone,
        item.desiredUniversity,
        item.desiredProgram,
        item.agent?.name,
        item.agent?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleSave = async (studentId: string) => {
    const current = items.find((item) => item._id === studentId);
    const nextStatus = statusDrafts[studentId];

    if (!current || !nextStatus || current.applicationStatus === nextStatus) {
      return;
    }

    setSavingId(studentId);
    setError("");

    try {
      const updated = await adminService.updatePartnerStudentStatus(studentId, {
        applicationStatus: nextStatus,
        notes: current.notes,
      });
      setItems((existing) => existing.map((item) => (item._id === studentId ? { ...item, ...updated } : item)));
      pushToast(isArabic ? "تم تحديث حالة ملف الطالب." : "Student file status updated.", "success");
    } catch (issue) {
      const message = getErrorMessage(issue, isArabic ? "تعذر تحديث حالة ملف الطالب." : "Unable to update student file status.");
      setError(message);
      pushToast(message, "error");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "طلاب الوكلاء" : "Partner Students"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "قراءة بيانات الطلاب الذين أضافهم الوكلاء وتغيير حالة ملفاتهم من مكان واحد." : "Review students added by agents and update their file status from one place."}</p>
          </div>
          <label className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "بحث" : "Search"}</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "ابحث بالطالب أو الوكيل أو الجامعة" : "Search by student, agent, or university"} className="w-full border-none bg-transparent p-0 outline-none" />
            </div>
          </label>
        </div>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <div className="space-y-4">
        {visibleItems.map((student) => (
          <section key={student._id} className="panel p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{student.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{student.desiredProgram || "--"} • {student.desiredUniversity || "--"}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{student.applicationStatus}</span>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{isArabic ? "بيانات الطالب" : "Student Details"}</h3>
                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <p className="break-all"><Mail className="me-1 inline h-4 w-4" />{student.email}</p>
                      <p className="break-words"><Phone className="me-1 inline h-4 w-4" />{student.phone}</p>
                      <p>{isArabic ? "رقم الجواز:" : "Passport Number:"} {student.passportNumber || "--"}</p>
                      <p>{isArabic ? "تاريخ الإضافة:" : "Created:"} {formatDate(student.createdAt)}</p>
                      <p className="sm:col-span-2">{isArabic ? "التفضيلات الدراسية:" : "Study Preferences:"} {student.studyPreferences || "--"}</p>
                      <p className="sm:col-span-2">{isArabic ? "ملاحظات الوكيل:" : "Agent Notes:"} {student.notes || "--"}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{isArabic ? "بيانات الوكيل" : "Agent Details"}</h3>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <p className="inline-flex items-center gap-2"><UserRound className="h-4 w-4" />{student.agent?.name || "--"}</p>
                      <p className="break-all">{student.agent?.email || "--"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{isArabic ? "المستندات المرفوعة" : "Uploaded Documents"}</h3>
                  <div className="mt-4 space-y-3">
                    {student.documents?.length ? (
                      student.documents.map((document) => (
                        <div key={document._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <div className="min-w-0 flex-1">
                            <p className="break-words font-semibold text-slate-900">{document.label}</p>
                            <p className="mt-1 break-all text-xs text-slate-500">{document.fileName}</p>
                          </div>
                          <a href={getDownloadableAssetUrl(document.filePath)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                            <ExternalLink className="h-4 w-4" />
                            {isArabic ? "فتح الملف" : "Open file"}
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">{isArabic ? "لا توجد مستندات لهذا الطالب." : "No documents for this student."}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full xl:max-w-sm">
                <div className="rounded-3xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{isArabic ? "تغيير حالة الملف" : "Update File Status"}</h3>
                  <div className="mt-4 space-y-3">
                    <select
                      value={statusDrafts[student._id] || student.applicationStatus}
                      onChange={(event) =>
                        setStatusDrafts((current) => ({
                          ...current,
                          [student._id]: event.target.value as AgentStudentItem["applicationStatus"],
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
                    >
                      <option value="under-review">{isArabic ? "قيد المراجعة" : "Under Review"}</option>
                      <option value="preliminary-accepted">{isArabic ? "مقبول مبدئي" : "Preliminary Accepted"}</option>
                      <option value="final-accepted">{isArabic ? "مقبول نهائي" : "Final Accepted"}</option>
                      <option value="rejected">{isArabic ? "مرفوض" : "Rejected"}</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleSave(student._id)}
                      disabled={savingId === student._id || (statusDrafts[student._id] || student.applicationStatus) === student.applicationStatus}
                      className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingId === student._id ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : isArabic ? "حفظ الحالة" : "Save status"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {filteredItems.length === 0 ? <div className="panel p-10 text-center text-sm text-slate-500">{isArabic ? "لا يوجد طلاب وكلاء مطابقون." : "No matching partner students found."}</div> : null}
      </div>

      <AdminPagination page={page} totalPages={totalPages} totalItems={filteredItems.length} pageSize={PAGE_SIZE} isArabic={isArabic} onPageChange={setPage} />
      <AdminToastViewport items={toasts} onDismiss={dismissToast} />
    </div>
  );
};
