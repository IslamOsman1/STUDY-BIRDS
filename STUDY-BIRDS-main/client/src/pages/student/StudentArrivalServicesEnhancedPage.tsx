import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { ToastViewport } from "../../components/ToastViewport";
import { useLanguage } from "../../hooks/useLanguage";
import { useToasts } from "../../hooks/useToasts";
import { studentService } from "../../services/studentService";
import type { ArrivalServiceRequestItem, StudentProfile } from "../../types";
import { getErrorMessage } from "../../utils/errors";

type ArrivalForm = {
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  airport: string;
  notes: string;
  services: ArrivalServiceRequestItem["services"];
};

const emptyForm: ArrivalForm = {
  arrivalDate: "",
  arrivalTime: "",
  flightNumber: "",
  airport: "",
  notes: "",
  services: {
    airportPickup: false,
    studentHousing: false,
    residencePermitSupport: false,
    visaSupport: false,
  },
};

export const StudentArrivalServicesEnhancedPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [request, setRequest] = useState<ArrivalServiceRequestItem | null>(null);
  const [overview, setOverview] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState<ArrivalForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toasts, pushToast, dismissToast } = useToasts();

  useEffect(() => {
    Promise.all([studentService.getArrivalServices(), studentService.getOverview()])
      .then(([requestData, overviewData]) => {
        setRequest(requestData);
        setOverview(overviewData.profile);
        if (requestData) {
          setForm({
            arrivalDate: requestData.arrivalDate ? new Date(requestData.arrivalDate).toISOString().slice(0, 10) : "",
            arrivalTime: requestData.arrivalTime || "",
            flightNumber: requestData.flightNumber || "",
            airport: requestData.airport || "",
            notes: requestData.notes || "",
            services: requestData.services,
          });
        }
      })
      .catch((issue) =>
        setError(
          getErrorMessage(
            issue,
            isArabic ? "تعذر تحميل بيانات الوصول." : "Unable to load arrival services."
          )
        )
      );
  }, [isArabic]);

  const isAvailable = ["final-accepted", "travel-and-settlement"].includes(overview?.applicationStage || "");
  const selectedServices = useMemo(
    () => Object.entries(form.services).filter(([, enabled]) => enabled).length,
    [form.services]
  );

  const saveRequest = async () => {
    setSaving(true);
    setError("");
    try {
      const saved = await studentService.saveArrivalServices(form);
      setRequest(saved);
      pushToast(
        isArabic ? "تم حفظ طلب الوصول والخدمات." : "Arrival services request saved successfully.",
        "success"
      );
      setConfirmOpen(false);
    } catch (issue) {
      setError(
        getErrorMessage(
          issue,
          isArabic ? "تعذر حفظ طلب الوصول." : "Unable to save the arrival request."
        )
      );
      pushToast(isArabic ? "تعذر حفظ طلب الوصول." : "Unable to save the arrival request.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isAvailable) {
    return <EmptyState title={isArabic ? "الخدمة غير متاحة بعد" : "Not available yet"} description={isArabic ? "سيتم تفعيل قسم الوصول والخدمات بعد الوصول إلى مرحلة القبول النهائي." : "Arrival services become available after reaching the final acceptance stage."} />;
  }

  return (
    <div className="space-y-6">
      <ToastViewport items={toasts} onDismiss={dismissToast} />

      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "الوصول والخدمات" : "Arrival & Services"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "أدخل بيانات السفر واختر الخدمات التي تحتاجها بعد القبول النهائي." : "Enter travel details and choose the services you need after final acceptance."}</p>
        {request?.adminNote ? <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">{request.adminNote}</div> : null}
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">{isArabic ? "حالة الطلب" : "Request Status"}</p>
          <p className="mt-4 text-2xl font-semibold text-slate-900">{request?.status || (isArabic ? "جديد" : "New")}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">{isArabic ? "الخدمات المحددة" : "Selected Services"}</p>
          <p className="mt-4 text-2xl font-semibold text-slate-900">{selectedServices}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">{isArabic ? "رحلة الوصول" : "Arrival Flight"}</p>
          <p className="mt-4 text-lg font-semibold text-slate-900">{form.flightNumber || "--"}</p>
        </article>
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setConfirmOpen(true);
        }}
        className="panel grid gap-5 p-6 md:grid-cols-2"
      >
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "تاريخ الوصول" : "Arrival Date"}</span>
          <input type="date" value={form.arrivalDate} onChange={(event) => setForm((current) => ({ ...current, arrivalDate: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "وقت الوصول" : "Arrival Time"}</span>
          <input value={form.arrivalTime} onChange={(event) => setForm((current) => ({ ...current, arrivalTime: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "رقم الرحلة" : "Flight Number"}</span>
          <input value={form.flightNumber} onChange={(event) => setForm((current) => ({ ...current, flightNumber: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "المطار" : "Airport"}</span>
          <input value={form.airport} onChange={(event) => setForm((current) => ({ ...current, airport: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "الخدمات المطلوبة" : "Requested Services"}</span>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["airportPickup", isArabic ? "استقبال المطار" : "Airport Pickup"],
              ["studentHousing", isArabic ? "تأمين السكن الجامعي" : "Student Housing"],
              ["residencePermitSupport", isArabic ? "مساعدة إجراءات الإقامة" : "Residence Permit Support"],
              ["visaSupport", isArabic ? "مساعدة إجراءات الفيزا" : "Visa Support"],
            ].map(([key, label]) => (
              <label key={key} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${form.services[key as keyof ArrivalServiceRequestItem["services"]] ? "border-brand-300 bg-brand-50 text-brand-900" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                <input type="checkbox" checked={form.services[key as keyof ArrivalServiceRequestItem["services"]]} onChange={(event) => setForm((current) => ({ ...current, services: { ...current.services, [key]: event.target.checked } }))} />
                {label}
              </label>
            ))}
          </div>
        </label>
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "ملاحظات" : "Notes"}</span>
          <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <button type="submit" disabled={saving} className="w-fit rounded-full bg-brand-900 px-6 py-3 font-semibold text-white md:col-span-2">
          {saving ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : isArabic ? "حفظ الطلب" : "Save Request"}
        </button>
      </form>

      <ConfirmationModal
        open={confirmOpen}
        title={isArabic ? "تأكيد حفظ الطلب" : "Confirm Request Save"}
        description={isArabic ? `سيتم حفظ بيانات الوصول الحالية مع ${selectedServices} خدمات محددة.` : `This will save your current arrival details with ${selectedServices} selected services.`}
        confirmLabel={isArabic ? "تأكيد الحفظ" : "Confirm Save"}
        cancelLabel={isArabic ? "إلغاء" : "Cancel"}
        loading={saving}
        onConfirm={saveRequest}
        onClose={() => !saving && setConfirmOpen(false)}
      />
    </div>
  );
};
