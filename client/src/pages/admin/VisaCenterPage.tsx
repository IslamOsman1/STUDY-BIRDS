import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useLanguage } from '../../hooks/useLanguage';
import { getErrorMessage } from '../../utils/errors';
import { ApplicationVisaCase } from '../../components/admin/ApplicationVisaCase';

type Row = {
  applicationId: string; student: { _id: string; name: string } | null;
  program: string; university: string; status: string;
};
const statusLabels: Record<string, [string, string]> = {
  'not-started': ['لم تبدأ', 'Not started'], 'preparing-documents': ['تجهيز المستندات', 'Preparing documents'],
  'ready': ['جاهز للتقديم', 'Ready'], 'submitted': ['تم التقديم', 'Submitted'],
  'under-review': ['قيد المراجعة', 'Under review'], 'approved': ['مقبولة', 'Approved'], 'rejected': ['مرفوضة', 'Rejected'],
};

export const VisaCenterPage = () => {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const t = (a: string, b: string) => ar ? a : b;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openId, setOpenId] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { setRows((await api.get<Row[]>('/applications/visa-cases')).data); }
    catch (e) { setError(getErrorMessage(e, t('تعذر تحميل ملفات التأشيرة', 'Unable to load visa cases'))); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const visible = rows.filter(r => !statusFilter || r.status === statusFilter);
  const input = 'rounded-xl border border-slate-300 bg-white p-3 text-slate-900';
  const button = 'rounded-xl bg-brand-primary px-4 py-2 text-white disabled:opacity-50';

  return <div className="space-y-6" dir={ar ? 'rtl' : 'ltr'}>
    <h1 className="text-2xl font-bold">{t('مركز التأشيرة', 'Visa Center')}</h1>
    <p>{t('متابعة متطلبات السفارة والمواعيد والتأمين لكل طلب صدر له قبول نهائي.', "Track embassy requirements, appointments and insurance for each finally-admitted application.")}</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}
    <div className="flex flex-wrap items-center gap-3">
      <label>{t('الحالة', 'Status')}<select className={input} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="">{t('الكل', 'All')}</option>
        {Object.entries(statusLabels).map(([key, value]) => <option key={key} value={key}>{value[ar ? 0 : 1]}</option>)}
      </select></label>
      <button className={button} disabled={loading} onClick={() => void load()}>{t('تحديث', 'Refresh')}</button>
    </div>
    {loading ? <p>{t('جارٍ التحميل…', 'Loading…')}</p> : !visible.length && <p>{t('لا توجد طلبات تأشيرة مطابقة حاليًا', 'No matching visa cases right now')}</p>}
    <div className="space-y-3">
      {visible.map(r => <article key={r.applicationId} className="rounded-2xl border bg-white p-4">
        <button className="flex w-full min-h-11 items-center justify-between text-start" aria-expanded={openId === r.applicationId} onClick={() => setOpenId(openId === r.applicationId ? '' : r.applicationId)}>
          <span>
            <span className="font-semibold">{r.student?.name || t('طالب', 'Student')}</span>
            <span className="text-slate-600"> — {r.university} · {r.program}</span>
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">{statusLabels[r.status]?.[ar ? 0 : 1] || r.status}</span>
        </button>
        {openId === r.applicationId && <ApplicationVisaCase id={r.applicationId} />}
      </article>)}
    </div>
  </div>;
};
