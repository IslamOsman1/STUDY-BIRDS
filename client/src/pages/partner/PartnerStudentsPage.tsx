import { useEffect, useMemo, useState } from "react";
import { Plus, UploadCloud } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { DOCUMENT_UPLOAD_ACCEPT, DOCUMENT_UPLOAD_HINT_AR, DOCUMENT_UPLOAD_HINT_EN } from "../../constants/upload";
import { partnerService } from "../../services/partnerService";
import type { AgentStudentItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

const statusLabel = (status: AgentStudentItem["applicationStatus"], isArabic: boolean) =>
  ({
    "under-review": isArabic ? "قيد المراجعة" : "Under Review",
    "preliminary-accepted": isArabic ? "مقبول مبدئي" : "Preliminary Accepted",
    "final-accepted": isArabic ? "مقبول نهائي" : "Final Accepted",
    rejected: isArabic ? "مرفوض" : "Rejected",
  })[status];

export const PartnerStudentsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [students, setStudents] = useState<AgentStudentItem[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    passportNumber: "",
    studyPreferences: "",
    desiredUniversity: "",
    desiredProgram: "",
    notes: "",
  });
  const [files, setFiles] = useState<Record<string, File | null>>({
    passport: null,
    certificates: null,
    transcript: null,
    other: null,
  });

  const fetchStudents = () =>
    partnerService
      .getStudents()
      .then(setStudents)
      .catch((issue) =>
        setError(getErrorMessage(issue, isArabic ? "تعذر تحميل الطلاب." : "Unable to load students."))
      );

  useEffect(() => {
    fetchStudents();
  }, [isArabic]);

  const studentRows = useMemo(
    () =>
      students.map((student) => ({
        ...student,
        applicationDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "--",
      })),
    [students]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);

    try {
      const created = await partnerService.createStudent(form);
      const uploads = Object.entries(files).filter(([, file]) => file);

      for (const [label, file] of uploads) {
        if (file) {
          await partnerService.uploadStudentDocument(created._id, file, label);
        }
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        passportNumber: "",
        studyPreferences: "",
        desiredUniversity: "",
        desiredProgram: "",
        notes: "",
      });
      setFiles({ passport: null, certificates: null, transcript: null, other: null });
      setShowForm(false);
      setSuccess(isArabic ? "تمت إضافة الطالب بنجاح." : "Student added successfully.");
      await fetchStudents();
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر إضافة الطالب." : "Unable to add student."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "طلابي" : "My Students"}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {isArabic ? "أدر الطلاب والطلبات المرتبطة بك من مكان واحد." : "Manage your students and their applications from one place."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            {isArabic ? "إضافة طالب جديد" : "Add New Student"}
          </button>
        </div>

        {success ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        {showForm ? (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
            {[
              ["name", isArabic ? "اسم الطالب" : "Student Name"],
              ["email", isArabic ? "البريد الإلكتروني" : "Email"],
              ["phone", isArabic ? "رقم الهاتف" : "Phone"],
              ["passportNumber", isArabic ? "رقم جواز السفر" : "Passport Number"],
              ["studyPreferences", isArabic ? "الرغبات الدراسية" : "Study Preferences"],
              ["desiredUniversity", isArabic ? "الجامعة المطلوبة" : "Desired University"],
              ["desiredProgram", isArabic ? "التخصص المطلوب" : "Desired Program"],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring"
                />
              </label>
            ))}
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "ملاحظات إضافية" : "Additional Notes"}</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring"
              />
            </label>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["passport", isArabic ? "جواز السفر" : "Passport"],
                ["certificates", isArabic ? "الشهادات" : "Certificates"],
                ["transcript", isArabic ? "كشف الدرجات" : "Transcript"],
                ["other", isArabic ? "مستندات أخرى" : "Other Documents"],
              ].map(([key, label]) => (
                <label key={key} className="rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center">
                  <UploadCloud className="mx-auto h-5 w-5 text-slate-400" />
                  <span className="mt-3 block text-sm font-medium text-slate-700">{label}</span>
                  <input
                    type="file"
                    accept={DOCUMENT_UPLOAD_ACCEPT}
                    className="mt-3 w-full text-xs"
                    onChange={(event) => setFiles((current) => ({ ...current, [key]: event.target.files?.[0] || null }))}
                  />
                  <span className="mt-2 block text-[11px] text-slate-400">{isArabic ? DOCUMENT_UPLOAD_HINT_AR : DOCUMENT_UPLOAD_HINT_EN}</span>
                </label>
              ))}
            </div>
            <button type="submit" disabled={creating} className="w-fit rounded-full bg-slate-950 px-6 py-3 font-semibold text-white md:col-span-2">
              {creating ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : isArabic ? "حفظ الطالب" : "Save Student"}
            </button>
          </form>
        ) : null}
      </section>

      {studentRows.length ? (
        <section className="panel overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {[
                    isArabic ? "اسم الطالب" : "Student Name",
                    isArabic ? "الجامعة / التخصص" : "Program / University",
                    isArabic ? "تاريخ التقديم" : "Application Date",
                    isArabic ? "الحالة" : "Status",
                  ].map((header) => (
                    <th key={header} className="px-5 py-4 text-start font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studentRows.map((student) => (
                  <tr key={student._id} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.email}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {student.desiredProgram || "--"}
                      <div className="text-xs text-slate-500">{student.desiredUniversity || "--"}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{student.applicationDate}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {statusLabel(student.applicationStatus, isArabic)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <EmptyState
          title={isArabic ? "لا يوجد طلاب بعد" : "No students yet"}
          description={isArabic ? "ابدأ بإضافة أول طالب ليظهر هنا." : "Add your first student to start tracking applications."}
        />
      )}
    </div>
  );
};
