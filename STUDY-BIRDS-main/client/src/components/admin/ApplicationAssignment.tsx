import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useLanguage } from '../../hooks/useLanguage';
import { AdminConfirmationModal } from './AdminConfirmationModal';
type State = { application: { assignedAdvisor?: string; followUpDueAt?: string; __v: number }; advisors: { _id: string; name: string }[] };
export function ApplicationAssignment({ id }: { id: string }) {
  const { language } = useLanguage(); const ar = language === 'ar';
  const [data, setData] = useState<State>(); const [advisor, setAdvisor] = useState('');
  const [due, setDue] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [confirm, setConfirm] = useState(false);
  async function load() {
    setBusy(true); setError('');
    try {
      const { data: result } = await api.get<State>(`/applications/${id}/assignment`);
      setData(result); setAdvisor(result.application.assignedAdvisor || '');
      const date = result.application.followUpDueAt ? new Date(result.application.followUpDueAt) : null;
      setDue(date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16) : '');
    } catch { setError(ar ? 'تعذر تحميل التعيين. أعد المحاولة.' : 'Unable to load assignment. Retry.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, [id]);
  async function save() {
    if (!data) return; setBusy(true); setError('');
    try {
      await api.patch(`/applications/${id}/assignment`, { advisorId: advisor || null, dueAt: advisor && due ? new Date(due).toISOString() : null, version: data.application.__v });
      setConfirm(false); await load();
    } catch { setError(ar ? 'تعذر حفظ التعيين. قد يكون الطلب تغير أو المسؤول غير متاح؛ حدّث البيانات ثم حاول مجددًا.' : 'Unable to save. The application may have changed or the advisor is unavailable. Refresh and retry.'); setConfirm(false); }
    finally { setBusy(false); }
  }
  return <section className="my-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <h3 className="font-semibold text-slate-900">{ar ? 'مسؤول متابعة الطلب' : 'Application follow-up owner'}</h3>
    {data && <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-sm">{ar ? 'المسؤول' : 'Advisor'}<select disabled={busy} value={advisor} onChange={e => { setAdvisor(e.target.value); if (!e.target.value) setDue(''); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3">
        <option value="">{ar ? 'غير معيّن' : 'Unassigned'}</option>
        {advisor && !data.advisors.some(a => a._id === advisor) && <option value={advisor} disabled>{ar ? 'المسؤول السابق غير متاح' : 'Previous advisor unavailable'}</option>}
        {data.advisors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
      </select></label>
      <label className="text-sm">{ar ? 'موعد المتابعة (بتوقيت جهازك)' : 'Follow-up deadline (local time)'}<input type="datetime-local" disabled={busy || !advisor} value={due} onChange={e => setDue(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3" /></label>
      <button disabled={busy} onClick={() => setConfirm(true)} className="min-h-11 rounded-xl bg-slate-900 px-4 text-white">{ar ? 'حفظ التعيين' : 'Save assignment'}</button>
    </div>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy} onClick={() => void load()} className="mt-2 min-h-11 text-sm">{ar ? 'تحديث بيانات التعيين' : 'Refresh assignment'}</button>
    <AdminConfirmationModal open={confirm} title={ar ? 'تأكيد مسؤول المتابعة' : 'Confirm follow-up assignment'} description={`${data?.advisors.find(a => a._id === advisor)?.name || (ar ? 'إلغاء التعيين' : 'Unassign')} — ${due || (ar ? 'دون موعد' : 'No deadline')}`} confirmLabel={ar ? 'تأكيد' : 'Confirm'} cancelLabel={ar ? 'رجوع' : 'Back'} loading={busy} onClose={() => { if (!busy) setConfirm(false); }} onConfirm={() => void save()} />
  </section>;
}
