import { useState } from 'react';
import { api } from '../lib/api';
import { useLanguage } from '../hooks/useLanguage';

type VisaCase = {
  eligible: boolean; status: string; requirements: { label: string; done: boolean }[];
  appointment: { date: string | null; location: string };
  insurance: { provider: string; policyNumber: string; expiresAt: string | null };
};
const labels: Record<string, [string, string]> = {
  'not-started': ['لم تبدأ', 'Not started'], 'preparing-documents': ['تجهيز المستندات', 'Preparing documents'],
  'ready': ['جاهز للتقديم', 'Ready'], 'submitted': ['تم التقديم', 'Submitted'],
  'under-review': ['قيد المراجعة', 'Under review'], 'approved': ['مقبولة', 'Approved'], 'rejected': ['مرفوضة', 'Rejected'],
};
export function StudentVisaCase({ applicationId }: { applicationId: string }) {
  const ar = useLanguage().language === 'ar';
  const [open, setOpen] = useState(false); const [data, setData] = useState<VisaCase>();
  const [busy, setBusy] = useState(false); const [error, setError] = useState(false);
  async function load() {
    setBusy(true); setError(false);
    try { setData((await api.get<VisaCase>(`/applications/${applicationId}/visa-case`)).data); }
    catch { setError(true); }
    finally { setBusy(false); }
  }
  return <section className="mt-4 rounded-2xl bg-white p-4">
    <button className="min-h-11 font-semibold" aria-expanded={open} onClick={() => { setOpen(!open); if (!open && !data) void load(); }}>{ar ? 'ملف التأشيرة' : 'Visa case'}</button>
    {open && <div className="space-y-3">
      {busy && <p role="status">{ar ? 'جاري التحميل…' : 'Loading…'}</p>}
      {error && <p role="alert">{ar ? 'تعذر تحميل ملف التأشيرة. أعد المحاولة.' : 'Unable to load the visa case. Retry.'}</p>}
      {data && !data.eligible && <p>{ar ? 'يظهر ملف التأشيرة بعد تسجيل القبول النهائي.' : 'The visa case becomes available after final admission.'}</p>}
      {data?.eligible && <div className="rounded-xl border border-slate-200 p-3">
        <h3 className="font-semibold">{labels[data.status]?.[ar ? 0 : 1] || data.status}</h3>
        {data.requirements.length > 0 && <ul className="mt-2 space-y-1 text-sm">
          {data.requirements.map((r, i) => <li key={i}>{r.done ? '✅' : '⬜'} {r.label}</li>)}
        </ul>}
        {data.appointment.date && <p className="mt-2 text-sm">{ar ? 'موعد السفارة: ' : 'Embassy appointment: '}{new Date(data.appointment.date).toLocaleString(ar ? 'ar' : 'en')}{data.appointment.location ? ` — ${data.appointment.location}` : ''}</p>}
        {data.insurance.provider && <p className="mt-1 text-sm">{ar ? 'التأمين الصحي: ' : 'Health insurance: '}{data.insurance.provider}{data.insurance.policyNumber ? ` (${data.insurance.policyNumber})` : ''}</p>}
        {data.insurance.expiresAt && <p className="mt-1 text-sm">{ar ? 'انتهاء التأمين: ' : 'Insurance expires: '}{new Date(data.insurance.expiresAt).toLocaleDateString(ar ? 'ar' : 'en')}</p>}
      </div>}
      <button disabled={busy} className="min-h-11 text-sm" onClick={() => void load()}>{ar ? 'تحديث' : 'Refresh'}</button>
    </div>}
  </section>;
}
