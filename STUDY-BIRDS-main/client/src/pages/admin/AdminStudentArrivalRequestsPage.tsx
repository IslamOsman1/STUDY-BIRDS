import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import type { ArrivalServiceRequestItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";

export const AdminStudentArrivalRequestsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<ArrivalServiceRequestItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getArrivalRequests()
      .then(setItems)
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل طلبات الوصول." : "Unable to load arrival requests.")));
  }, [isArabic]);

  const handleStatus = async (id: string, status: ArrivalServiceRequestItem["status"]) => {
    const updated = await adminService.updateArrivalRequest(id, { status });
    setItems((current) => current.map((item) => (item._id === id ? updated : item)));
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "طلبات الوصول والخدمات" : "Arrival Service Requests"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "تنسيق طلبات السفر والسكن والاستقبال الخاصة بالطلاب." : "Coordinate student travel, housing, and airport-related requests."}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item._id} className="panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{item.student?.name || "--"}</h2>
                <p className="mt-1 text-sm text-slate-500">{item.student?.email || "--"}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{isArabic ? "تاريخ الوصول:" : "Arrival Date:"} {item.arrivalDate ? formatDate(item.arrivalDate) : "--"}</div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{isArabic ? "وقت الوصول:" : "Arrival Time:"} {item.arrivalTime || "--"}</div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{isArabic ? "رقم الرحلة:" : "Flight Number:"} {item.flightNumber || "--"}</div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{isArabic ? "المطار:" : "Airport:"} {item.airport || "--"}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700">
              {item.services.airportPickup ? <span className="rounded-full bg-slate-100 px-3 py-1">{isArabic ? "استقبال المطار" : "Airport Pickup"}</span> : null}
              {item.services.studentHousing ? <span className="rounded-full bg-slate-100 px-3 py-1">{isArabic ? "السكن" : "Housing"}</span> : null}
              {item.services.residencePermitSupport ? <span className="rounded-full bg-slate-100 px-3 py-1">{isArabic ? "الإقامة" : "Residence Permit"}</span> : null}
              {item.services.visaSupport ? <span className="rounded-full bg-slate-100 px-3 py-1">{isArabic ? "الفيزا" : "Visa Support"}</span> : null}
            </div>
            {item.notes ? <p className="mt-4 text-sm text-slate-600">{item.notes}</p> : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => handleStatus(item._id, "in-progress")} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
                {isArabic ? "قيد التنفيذ" : "In Progress"}
              </button>
              <button type="button" onClick={() => handleStatus(item._id, "completed")} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                {isArabic ? "مكتمل" : "Completed"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
