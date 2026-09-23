import { Link } from "react-router-dom";
import type { StudentHome } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { StatusExplanation } from "./StatusExplanation";
import { formatDate } from "../utils/format";

// Where each home destination lives on the website.
const ROUTES: Record<string, string> = {
  catalog: "/programs", programs: "/programs", universities: "/universities", applications: "/student/applications",
  documents: "/student/documents", "upload-document": "/student/documents", consultation: "/student/consultations",
  visa: "/student/applications", journey: "/student/applications", travel: "/student/arrival-services",
  accommodation: "/student/accommodation", payments: "/student/financials", support: "/student/support",
};
export const homeRoute = (destination: string) => ROUTES[destination] || "/student/applications";

const countdown = (days: number, ar: boolean) => {
  if (days < 0) return ar ? `متأخر ${-days} يوم` : `${-days} day(s) overdue`;
  if (days === 0) return ar ? "اليوم" : "Today";
  if (days === 1) return ar ? "غدًا" : "Tomorrow";
  return ar ? `بعد ${days} يوم` : `In ${days} days`;
};

// The context-aware part of the student home (PRD 9, 10, 11, 96, 97, 98).
export const StudentSmartHome = ({ home }: { home: StudentHome }) => {
  const { language } = useLanguage();
  const ar = language === "ar";
  const t = (a: string, b: string) => (ar ? a : b);
  const s = home.sections;
  const card = "panel p-5";

  return <div className="space-y-6" dir={ar ? "rtl" : "ltr"}>
    {/* Context card: one headline that changes with the journey (PRD 96). */}
    <section className="panel border border-orange-100 bg-gradient-to-l from-orange-50 to-white p-6" aria-label={t("خطوتك الآن", "Your step now")}>
      <p className="text-sm text-slate-500">{t(`مرحبًا ${home.greeting.name}`, `Hi ${home.greeting.name}`)}</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">{ar ? home.context.titleAr : home.context.titleEn}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">{ar ? home.context.descriptionAr : home.context.descriptionEn}</p>
      <Link className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-orange-500 px-5 font-semibold text-white" to={homeRoute(home.context.destination)}>
        {ar ? home.context.titleAr : home.context.titleEn}
      </Link>
    </section>

    <div className="grid gap-4 lg:grid-cols-2">
      {/* Status card: where the application stands and the exact next step (PRD 97). */}
      <section className={card} aria-label={t("حالتك الآن", "Your status")}>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("حالتك الآن", "Current status")}</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">{ar ? home.statusCard.labelAr : home.statusCard.labelEn}</p>
        {home.statusCard.nextStepAr ? <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <p className="text-sm text-slate-500">{home.statusCard.waiting ? t("بانتظار الفريق", "Waiting on the team") : t("المطلوب منك", "Needed from you")}</p>
          <p className="font-semibold text-slate-900">{ar ? home.statusCard.nextStepAr : home.statusCard.nextStepEn}</p>
          <p className="mt-1 text-sm text-slate-600">{ar ? home.statusCard.nextStepDescriptionAr : home.statusCard.nextStepDescriptionEn}</p>
          <Link className="mt-2 inline-flex text-sm font-semibold text-brand-700" to={homeRoute(home.statusCard.destination)}>{t("اذهب", "Go")} ←</Link>
        </div> : null}
      </section>

      {/* Current journey and progress (PRD 9). */}
      <section className={card} aria-label={t("رحلتك", "Your journey")}>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("رحلتك الحالية", "Current journey")}</p>
        {home.currentJourney ? <>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {[home.currentJourney.country, home.currentJourney.city, home.currentJourney.program].filter(Boolean).join(" - ")}
          </p>
          <p className="text-sm text-slate-500">{home.currentJourney.university}</p>
        </> : <p className="mt-2 text-sm text-slate-600">{t("لم تبدأ رحلتك بعد.", "Your journey hasn't started yet.")}</p>}
        <div className="mt-4">
          <div className="flex justify-between text-sm"><span>{t("التقدم", "Progress")}</span><span className="font-semibold">{home.progressPercent}%</span></div>
          <div className="mt-1 h-2 rounded-full bg-slate-100" role="progressbar" aria-valuenow={home.progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-2 rounded-full bg-orange-500" style={{ width: `${home.progressPercent}%` }} />
          </div>
        </div>
      </section>
    </div>

    {/* Important dates with countdowns (PRD 98). */}
    <section className={card} aria-label={t("المواعيد المهمة", "Important dates")}>
      <h2 className="text-lg font-semibold text-slate-900">{t("المواعيد المهمة", "Important dates")}</h2>
      {!home.importantDates.length ? <p className="mt-2 text-sm text-slate-500">{t("لا توجد مواعيد قادمة حاليًا.", "No upcoming dates right now.")}</p> : null}
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {home.importantDates.map((item) => <li key={`${item.key}-${item.entityId}-${item.date}`}>
          <Link to={homeRoute(item.destination)} className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${item.overdue ? "border-rose-200 bg-rose-50" : item.critical ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
            <span>
              <span className="block font-semibold text-slate-900">{ar ? item.titleAr : item.titleEn}</span>
              <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
            </span>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${item.overdue ? "bg-rose-100 text-rose-700" : item.critical ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
              {countdown(item.daysLeft, ar)}
            </span>
          </Link>
        </li>)}
      </ul>
    </section>

    {/* Dashboard sections (PRD 10). */}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label={t("أقسام رحلتك", "Your sections")}>
      {s.admission ? <div className={card}>
        <p className="mb-2 text-sm font-semibold text-slate-500">{t("حالة القبول", "Admission")}</p>
        <StatusExplanation info={s.admission.statusInfo} compact />
        <Link className="mt-2 inline-flex text-sm font-semibold text-brand-700" to="/student/applications">{t("تفاصيل الطلب", "Application details")}</Link>
      </div> : null}
      <Link to="/student/documents" className={card}>
        <p className="text-sm font-semibold text-slate-500">{t("المستندات", "Documents")}</p>
        <p className="mt-2 text-sm">{t(`${s.documents.approved} معتمد من ${s.documents.total}`, `${s.documents.approved} of ${s.documents.total} approved`)}</p>
        {s.documents.needsAction ? <p className="mt-1 text-sm font-semibold text-amber-700">{t(`${s.documents.needsAction} يحتاج إجراء منك`, `${s.documents.needsAction} need your action`)}</p> : null}
        {s.documents.underReview ? <p className="mt-1 text-sm text-slate-500">{t(`${s.documents.underReview} قيد المراجعة`, `${s.documents.underReview} under review`)}</p> : null}
      </Link>
      {s.visa ? <Link to="/student/applications" className={card}>
        <p className="text-sm font-semibold text-slate-500">{t("التأشيرة", "Visa")}</p>
        <p className="mt-2 text-sm font-semibold">{ar ? s.visa.labelAr : s.visa.labelEn}</p>
        {s.visa.appointmentDate ? <p className="mt-1 text-sm text-slate-500">{t("موعد السفارة: ", "Embassy: ")}{formatDate(s.visa.appointmentDate)}</p> : null}
      </Link> : null}
      {s.travel ? <Link to="/student/arrival-services" className={card}>
        <p className="text-sm font-semibold text-slate-500">{t("السفر والسكن", "Travel & housing")}</p>
        {s.travel.arrivalDate ? <p className="mt-2 text-sm">{t("الوصول: ", "Arrival: ")}{formatDate(s.travel.arrivalDate)}</p> : null}
        {s.travel.moveInDate ? <p className="mt-1 text-sm">{t("بدء السكن: ", "Move-in: ")}{formatDate(s.travel.moveInDate)}</p> : null}
      </Link> : null}
      <Link to="/student/financials" className={card}>
        <p className="text-sm font-semibold text-slate-500">{t("المدفوعات", "Payments")}</p>
        <p className="mt-2 text-sm">{s.payments.unpaid ? t(`${s.payments.unpaid} فاتورة غير مسددة`, `${s.payments.unpaid} unpaid invoice(s)`) : t("لا توجد مستحقات", "Nothing due")}</p>
        {s.payments.overdue ? <p className="mt-1 text-sm font-semibold text-rose-700">{t(`${s.payments.overdue} متأخرة`, `${s.payments.overdue} overdue`)}</p> : null}
      </Link>
      <Link to="/student/support" className={card}>
        <p className="text-sm font-semibold text-slate-500">{t("الدعم", "Support")}</p>
        <p className="mt-2 text-sm">{s.support.openTickets ? t(`${s.support.openTickets} تذكرة مفتوحة`, `${s.support.openTickets} open ticket(s)`) : t("لا توجد تذاكر مفتوحة", "No open tickets")}</p>
      </Link>
      <Link to="/student/notifications" className={card}>
        <p className="text-sm font-semibold text-slate-500">{t("الإشعارات", "Notifications")}</p>
        <p className="mt-2 text-sm">{s.notifications.unread ? t(`${s.notifications.unread} غير مقروء`, `${s.notifications.unread} unread`) : t("لا جديد", "All caught up")}</p>
        {s.notifications.latest ? <p className="mt-1 line-clamp-2 text-sm text-slate-500">{s.notifications.latest.title}</p> : null}
      </Link>
    </section>

    {s.recentActivity.length ? <section className={card} aria-label={t("آخر النشاطات", "Recent activity")}>
      <h2 className="text-lg font-semibold text-slate-900">{t("آخر النشاطات", "Recent activity")}</h2>
      <ul className="mt-3 space-y-2">
        {s.recentActivity.map((item) => <li key={`${item.kind}-${item.entityId}-${item.at}`} className="flex justify-between gap-3 text-sm">
          <Link to={homeRoute(item.destination)} className="text-slate-800">{ar ? item.titleAr : item.titleEn}</Link>
          <span className="shrink-0 text-slate-500">{formatDate(item.at)}</span>
        </li>)}
      </ul>
    </section> : null}

    {/* Quick actions (PRD 11). */}
    <section className={card} aria-label={t("الوصول السريع", "Quick actions")}>
      <h2 className="text-lg font-semibold text-slate-900">{t("الوصول السريع", "Quick actions")}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {home.quickActions.map((action) => action.destination === "bird-ai"
          ? <button key={action.key} type="button" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold" onClick={() => window.dispatchEvent(new Event("studybirds:open-assistant"))}>{ar ? action.labelAr : action.labelEn}</button>
          : <Link key={action.key} to={homeRoute(action.destination)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold">{ar ? action.labelAr : action.labelEn}</Link>)}
      </div>
    </section>
  </div>;
};
