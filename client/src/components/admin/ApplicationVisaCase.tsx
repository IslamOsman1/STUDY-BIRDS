import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useLanguage } from '../../hooks/useLanguage';
import { AdminConfirmationModal } from './AdminConfirmationModal';

type Requirement = { label: string; done: boolean };
type VisaCase = {
  version: number; eligible: boolean; status: string; requirements: Requirement[];
  appointment: { date: string | null; location: string };
  insurance: { provider: string; policyNumber: string; expiresAt: string | null };
  notes: string; updatedAt: string | null;
};
const statuses = [
  ['not-started', 'لم تبدأ', 'Not started'], ['preparing-documents', 'تجهيز المستندات', 'Preparing documents'],
  ['ready', 'جاهز للتقديم', 'Ready'], ['submitted', 'تم التقديم', 'Submitted'],
  ['under-review', 'قيد المراجعة', 'Under review'], ['approved', 'مقبولة', 'Approved'], ['rejected', 'مرفوضة', 'Rejected'],
];
function toLocalInput(iso: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function ApplicationVisaCase({ id }: { id: string }) {
  const ar = useLanguage().language === 'ar';
  const [data, setData] = useState<VisaCase>();
  const [status, setStatus] = useState('not-started');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentLocation, setAppointmentLocation] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [insuranceExpiresAt, setInsuranceExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);

  function apply(result: VisaCase) {
    setData(result);
    setStatus(result.status);
    setRequirements(result.requirements);
    setAppointmentDate(toLocalInput(result.appointment.date));
    setAppointmentLocation(result.appointment.location);
    setInsuranceProvider(result.insurance.provider);
    setInsurancePolicyNumber(result.insurance.policyNumber);
    setInsuranceExpiresAt(toLocalInput(result.insurance.expiresAt));
    setNotes(result.notes);
  }

  async function load() {
    setBusy(true); setError('');
    try { apply((await api.get<VisaCase>(`/applications/${id}/visa-case`)).data); }
    catch { setError(ar ? 'تعذر تحميل ملف التأشيرة. أعد المحاولة.' : 'Unable to load the visa case. Retry.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, [id]);

  function addRequirement() {
    const label = newRequirement.trim();
    if (!label) return;
    setRequirements(r => [...r, { label, done: false }]);
    setNewRequirement('');
  }
  function toggleRequirement(index: number) {
    setRequirements(r => r.map((row, i) => i === index ? { ...row, done: !row.done } : row));
  }
  function removeRequirement(index: number) {
    setRequirements(r => r.filter((_, i) => i !== index));
  }

  async function save() {
    if (!data) return;
    setBusy(true); setError('');
    try {
      const result = (await api.patch<VisaCase>(`/applications/${id}/visa-case`, {
        version: data.version, status, requirements,
        appointmentDate: appointmentDate ? new Date(appointmentDate).toISOString() : null,
        appointmentLocation: appointmentLocation.trim(),
        insuranceProvider: insuranceProvider.trim(), insurancePolicyNumber: insurancePolicyNumber.trim(),
        insuranceExpiresAt: insuranceExpiresAt ? new Date(insuranceExpiresAt).toISOString() : null,
        notes: notes.trim(),
      })).data;
      apply(result);
    } catch { setError(ar ? 'تعذر الحفظ. حدّث البيانات إذا تغير الطلب.' : 'Unable to save. Refresh if the application changed.'); }
    finally { setBusy(false); setConfirm(false); }
  }

  const inputClass = 'mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-white p-2';
  return <section className="my-4 rounded-2xl border border-slate-200 p-4">
    <h3 className="font-semibold">{ar ? 'ملف التأشيرة' : 'Visa case'}</h3>
    <p className="mt-2 text-sm text-slate-600">{ar ? 'متطلبات السفارة، موعد التقديم، والتأمين الصحي لهذا الطلب.' : "This application's embassy requirements, appointment, and health insurance."}</p>
    {data && !data.eligible && <p className="mt-3 text-sm">{ar ? 'يتاح ملف التأشيرة بعد القبول النهائي للطلب غير المغلق.' : 'Available after final admission on an open application.'}</p>}
    {data?.eligible && <div className="mt-3 space-y-4">
      <label className="block">{ar ? 'حالة التأشيرة' : 'Visa status'}<select className={inputClass} disabled={busy} value={status} onChange={e => setStatus(e.target.value)}>{statuses.map(s => <option key={s[0]} value={s[0]}>{s[ar ? 1 : 2]}</option>)}</select></label>

      <div>
        <p className="text-sm font-medium">{ar ? 'متطلبات السفارة والمستندات المترجمة' : 'Embassy and translated-document requirements'}</p>
        <ul className="mt-2 space-y-2">
          {requirements.map((r, i) => <li key={i} className="flex items-center gap-2">
            <input type="checkbox" checked={r.done} disabled={busy} onChange={() => toggleRequirement(i)} />
            <span className="flex-1 text-sm">{r.label}</span>
            <button type="button" className="text-xs text-red-700" disabled={busy} onClick={() => removeRequirement(i)}>{ar ? 'حذف' : 'Remove'}</button>
          </li>)}
          {requirements.length === 0 && <li className="text-sm text-slate-500">{ar ? 'لا توجد متطلبات مضافة بعد.' : 'No requirements added yet.'}</li>}
        </ul>
        <div className="mt-2 flex gap-2">
          <input className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white p-2" maxLength={200} disabled={busy}
            placeholder={ar ? 'مثال: ترجمة كشف الدرجات' : 'e.g. Translated transcript'} value={newRequirement}
            onChange={e => setNewRequirement(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRequirement(); } }} />
          <button type="button" className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm" disabled={busy || !newRequirement.trim()} onClick={addRequirement}>{ar ? 'إضافة' : 'Add'}</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label>{ar ? 'موعد السفارة بتوقيت جهازك' : 'Embassy appointment (local time)'}<input type="datetime-local" className={inputClass} disabled={busy} value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} /></label>
        <label>{ar ? 'مكان الموعد' : 'Appointment location'}<input maxLength={250} className={inputClass} disabled={busy} value={appointmentLocation} onChange={e => setAppointmentLocation(e.target.value)} /></label>
        <label>{ar ? 'مزود التأمين الصحي' : 'Insurance provider'}<input maxLength={150} className={inputClass} disabled={busy} value={insuranceProvider} onChange={e => setInsuranceProvider(e.target.value)} /></label>
        <label>{ar ? 'رقم وثيقة التأمين' : 'Insurance policy number'}<input maxLength={100} className={inputClass} disabled={busy} value={insurancePolicyNumber} onChange={e => setInsurancePolicyNumber(e.target.value)} /></label>
        <label>{ar ? 'انتهاء صلاحية التأمين' : 'Insurance expiry'}<input type="datetime-local" className={inputClass} disabled={busy} value={insuranceExpiresAt} onChange={e => setInsuranceExpiresAt(e.target.value)} /></label>
      </div>
      <label className="block">{ar ? 'ملاحظات داخلية (لا تظهر للطالب)' : 'Internal notes (not shown to the student)'}<textarea maxLength={2000} rows={3} className={inputClass} disabled={busy} value={notes} onChange={e => setNotes(e.target.value)} /></label>
      <button className="min-h-11 rounded-xl bg-slate-900 px-4 text-white disabled:opacity-50" disabled={busy} onClick={() => setConfirm(true)}>{ar ? 'حفظ ملف التأشيرة' : 'Save visa case'}</button>
    </div>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    <button className="mt-2 min-h-11 text-sm" disabled={busy} onClick={() => void load()}>{ar ? 'تحديث' : 'Refresh'}</button>
    <AdminConfirmationModal open={confirm} title={ar ? 'تأكيد حفظ ملف التأشيرة' : 'Confirm saving the visa case'}
      description={`${statuses.find(s => s[0] === status)?.[ar ? 1 : 2]} — ${requirements.filter(r => r.done).length}/${requirements.length} ${ar ? 'متطلبات مكتملة' : 'requirements done'}`}
      confirmLabel={ar ? 'تأكيد' : 'Confirm'} cancelLabel={ar ? 'رجوع' : 'Back'} loading={busy}
      onClose={() => { if (!busy) setConfirm(false); }} onConfirm={() => void save()} />
  </section>;
}
