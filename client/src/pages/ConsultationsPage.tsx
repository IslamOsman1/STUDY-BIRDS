import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useLanguage } from "../hooks/useLanguage";
import { getErrorMessage } from "../utils/errors";

type Person = { _id: string; name: string };
type Slot = { _id: string; __v: number; advisor: Person; startsAt: string; mode: string; meetingUrl?: string; instructions?: string; enabled: boolean; reservation?: string };
type Booking = { _id: string; __v: number; advisor: Person; student?: Person; startsAt: string; status: string; slot: Slot };
const labels: Record<string, [string, string]> = { online: ["أونلاين", "Online"], phone: ["هاتف", "Phone"], office: ["مكتب", "Office"] };
export const ConsultationsPage = ({ staff = false }: { staff?: boolean }) => {
  const { language } = useLanguage();
  const ar = language === "ar";
  const t = (a: string, b: string) => ar ? a : b;
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [advisors, setAdvisors] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [success, setSuccess] = useState("");
  const [moving, setMoving] = useState<Booking | null>(null);
  const [mode, setMode] = useState(""), [advisor, setAdvisor] = useState(""), [day, setDay] = useState("");
  const [form, setForm] = useState({ advisorId: "", startsAt: "", mode: "online", meetingUrl: "", instructions: "" });
  const when = (s: string) => new Date(s).toLocaleString(ar ? "ar" : "en", { dateStyle: "medium", timeStyle: "short" });
  const dateKey = (s: string) => { const d = new Date(s); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  async function load() {
    setLoading(true);
    try {
      const [s, b, a] = await Promise.all([api.get<Slot[]>(`/consultations/${staff ? "staff/slots" : "slots"}`), api.get<Booking[]>(`/consultations/${staff ? "staff/bookings" : "mine"}`), staff ? api.get<Person[]>("/consultations/staff/advisors") : Promise.resolve({ data: [] as Person[] })]);
      setSlots(s.data); setBookings(b.data); setAdvisors(a.data);
    } catch (e) { setError(getErrorMessage(e, t("تعذر تحميل المواعيد", "Unable to load appointments"))); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [staff]);
  async function change(action: () => Promise<unknown>, message: string) {
    if (busy) return;
    setBusy(true); setError(""); setSuccess("");
    try { await action(); setMoving(null); setSuccess(message); await load(); }
    catch (e) { setError(getErrorMessage(e, t("تعذر إتمام العملية؛ حدّث المواعيد وحاول مجددًا", "Unable to complete; refresh and try again"))); }
    finally { setBusy(false); }
  }
  const people = staff ? advisors : [...new Map(slots.map(s => [s.advisor._id, s.advisor])).values()];
  const visible = slots.filter(s => (!mode || s.mode === mode) && (!advisor || s.advisor._id === advisor) && (!day || dateKey(s.startsAt) === day));
  const input = "rounded-xl border border-slate-300 bg-white p-3 text-slate-900";
  const button = "rounded-xl bg-brand-primary px-4 py-2 text-white disabled:opacity-50";
  return <div className="space-y-6" dir={ar ? "rtl" : "ltr"}>
    <h1 className="text-2xl font-bold">{t("الاستشارات والمواعيد", "Consultations")}</h1>
    <p>{t("مدة الموعد 30 دقيقة. جميع الأوقات بتوقيت جهازك:", "Appointments last 30 minutes. Times use your device timezone:")} {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}
    {success && <p role="status" className="rounded-xl bg-green-50 p-3 text-green-800">{success}</p>}
    <button className={button} disabled={busy || loading} onClick={() => { setError(""); void load(); }}>{t("تحديث", "Refresh")}</button>
    {staff && <form className="space-y-3 rounded-2xl border bg-white p-5" onSubmit={e => {
      e.preventDefault();
      const start = new Date(form.startsAt);
      if (!Number.isFinite(start.getTime()) || start.getTime() % 1800000 !== 0) { setError(t("اختر موعدًا على رأس الساعة أو نصفها بتوقيت UTC", "Choose a UTC half-hour boundary")); return; }
      void change(() => api.post("/consultations/staff/slots", { ...form, startsAt: start.toISOString() }), t("نُشر الموعد المتاح", "Availability published"));
    }}>
      <h2 className="text-xl font-semibold">{t("إتاحة موعد جديد", "Publish availability")}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <label>{t("المستشار", "Consultant")}<select className={`${input} block w-full`} required value={form.advisorId} onChange={e => setForm({ ...form, advisorId: e.target.value })}><option value="">{t("اختر مستشارًا", "Choose consultant")}</option>{advisors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}</select></label>
        <label>{t("التاريخ والوقت المحلي", "Local date and time")}<input className={`${input} block w-full`} type="datetime-local" required step={1800} value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} /></label>
        <label>{t("نوع الاستشارة", "Consultation type")}<select className={`${input} block w-full`} value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>{Object.entries(labels).map(([key, value]) => <option key={key} value={key}>{value[ar ? 0 : 1]}</option>)}</select></label>
        {form.mode === "online" && <label>{t("رابط اجتماع HTTPS", "HTTPS meeting link")}<input className={`${input} block w-full`} type="url" required pattern="https://.*" maxLength={1000} value={form.meetingUrl} onChange={e => setForm({ ...form, meetingUrl: e.target.value })} /></label>}
      </div>
      <label className="block">{t("تعليمات الاتصال أو عنوان المكتب", "Contact instructions or office address")}<textarea className={`${input} block w-full`} required={form.mode !== "online"} maxLength={500} value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} /></label>
      {!advisors.length && <p>{t("يجب منح موظف نشط صلاحية الاستشارات أولًا من إدارة الموظفين.", "Grant an active employee the Consultations permission first.")}</p>}
      <button className={button} disabled={busy || !advisors.length}>{t("نشر الموعد", "Publish slot")}</button>
    </form>}
    <section className="space-y-3"><h2 className="text-xl font-semibold">{staff ? t("الحجوزات", "Bookings") : t("مواعيدي", "My appointments")}</h2>
      {loading ? <p>{t("جارٍ التحميل…", "Loading…")}</p> : !bookings.length && <p>{t("لا توجد حجوزات", "No bookings")}</p>}
      {bookings.map(b => <article key={b._id} className="space-y-2 rounded-2xl border bg-white p-4">
        <h3 className="font-semibold">{b.advisor?.name} {staff && `— ${b.student?.name || ""}`}</h3><p>{when(b.startsAt)} · {labels[b.slot?.mode]?.[ar ? 0 : 1]} · {b.status === "booked" ? t("مؤكد", "Confirmed") : t("ملغى", "Cancelled")}</p>
        {b.status === "booked" && <><p>{b.slot?.instructions}</p>{b.slot?.meetingUrl?.startsWith("https://") && <a className="underline" href={b.slot.meetingUrl} target="_blank" rel="noopener noreferrer">{t("فتح الاجتماع", "Open meeting")}</a>}</>}
        {b.status === "booked" && new Date(b.startsAt) > new Date() && <div className="flex flex-wrap gap-3">
          {!staff && <button className={button} disabled={busy} onClick={() => { setMoving(b); setMode(""); setAdvisor(""); setDay(""); }}>{t("تغيير الموعد", "Reschedule")}</button>}
          <button className={button} disabled={busy} onClick={() => { if (window.confirm(`${t("إلغاء الموعد؟", "Cancel appointment?")} ${when(b.startsAt)}`)) void change(() => api.post(`/consultations/bookings/${b._id}/cancel`, { version: b.__v }), t("أُلغي الموعد", "Appointment cancelled")); }}>{t("إلغاء الحجز", "Cancel booking")}</button>
        </div>}
      </article>)}
    </section>
    <section className="space-y-3"><h2 className="text-xl font-semibold">{t("المواعيد المتاحة", "Availability")}</h2>
      {moving && <div role="status" className="rounded-xl bg-amber-50 p-3">{t("اختر بديلًا؛ يبقى حجزك الحالي حتى تأكيد التغيير:", "Choose a replacement; your current booking remains until confirmed:")} {when(moving.startsAt)} <button className="underline" onClick={() => setMoving(null)} disabled={busy}>{t("تراجع", "Stop rescheduling")}</button></div>}
      <div className="flex flex-wrap gap-3">
        <label>{t("النوع", "Type")}<select className={input} value={mode} onChange={e => setMode(e.target.value)}><option value="">{t("الكل", "All")}</option>{Object.entries(labels).map(([k, v]) => <option key={k} value={k}>{v[ar ? 0 : 1]}</option>)}</select></label>
        <label>{t("المستشار", "Consultant")}<select className={input} value={advisor} onChange={e => setAdvisor(e.target.value)}><option value="">{t("الكل", "All")}</option>{people.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select></label>
        <label>{t("اليوم", "Day")}<input className={input} type="date" value={day} onChange={e => setDay(e.target.value)} /></label>
      </div>
      {!loading && !visible.length && <p>{t("لا توجد مواعيد مطابقة حاليًا", "No matching slots available")}</p>}
      {visible.map(s => <article className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4" key={s._id}>
        <div><h3 className="font-semibold">{s.advisor.name}</h3><p>{when(s.startsAt)} · {labels[s.mode]?.[ar ? 0 : 1]}</p>{staff && <p>{s.reservation ? t("محجوز", "Reserved") : s.enabled ? t("متاح", "Available") : t("معطل", "Disabled")}</p>}</div>
        {staff ? <button className={button} disabled={busy || !!s.reservation || new Date(s.startsAt) <= new Date()} onClick={() => void change(() => api.patch(`/consultations/staff/slots/${s._id}`, { version: s.__v, enabled: !s.enabled }), t("حُدّث الموعد", "Slot updated"))}>{s.enabled ? t("تعطيل", "Disable") : t("إتاحة", "Enable")}</button> : <button className={button} disabled={busy || loading} onClick={() => {
          if (!window.confirm(`${t("تأكيد الموعد؟", "Confirm appointment?")} ${s.advisor.name} — ${when(s.startsAt)}`)) return;
          void change(() => moving ? api.post(`/consultations/bookings/${moving._id}/reschedule`, { version: moving.__v, slotId: s._id }) : api.post("/consultations/bookings", { slotId: s._id }), t("تم تأكيد الموعد", "Appointment confirmed"));
        }}>{moving ? t("اختيار البديل", "Choose replacement") : t("حجز", "Book")}</button>}
      </article>)}
    </section>
  </div>;
};
