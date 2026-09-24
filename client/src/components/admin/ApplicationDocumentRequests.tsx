import { DocumentFileLink } from '../DocumentFileLink';
import { AdminConfirmationModal } from './AdminConfirmationModal';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useLanguage } from '../../hooks/useLanguage';
import type { RevisionApplication, DocumentRequest } from '../ApplicationDocumentUpdates';

export function ApplicationDocumentRequests({ id }: { id: string }) {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const [application, setApplication] = useState<RevisionApplication>();
  const [type, setType] = useState('passport');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<{request?: DocumentRequest; decision?: string}>();
  async function load() {
    setBusy(true); setError('');
    try { setApplication((await api.get<RevisionApplication>(`/applications/${id}`)).data); }
    catch { setError(ar ? 'تعذر تحميل الطلب.' : 'Unable to load application.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, [id]);
  async function save(request?: DocumentRequest, decision?: string, confirmed = false) {
    if (!note.trim() || !application) { setError(ar ? 'اكتب ملاحظة واضحة للطالب أولًا.' : 'Enter a clear note for the student first.'); return; }
    if (!confirmed) { setPending({request, decision}); return; }
    setBusy(true); setError('');
    try {
      const body = { type, note, version: application.__v, decision };
      const response = request ? await api.patch<RevisionApplication>(`/applications/${id}/document-requests/${request._id}`, body)
        : await api.post<RevisionApplication>(`/applications/${id}/document-requests`, body);
      setApplication(response.data); setNote('');
    } catch { setError(ar ? 'تعذر حفظ الإجراء. حدّث البيانات وتحقق من حالة الطلب والصلاحيات.' : 'Unable to save. Refresh and check the application state and permissions.'); }
    finally { setBusy(false); setPending(undefined); }
  }
  const names: Record<string, [string, string]> = {passport: ['جواز السفر', 'Passport'], 'biometric-photo':['الصورة الشخصية','Photo'], 'latest-qualification':['آخر مؤهل','Qualification'], transcript:['كشف الدرجات','Transcript'], 'language-certificate':['شهادة اللغة','Language certificate'], 'high-school-certificate':['شهادة الثانوية','High school certificate'], 'university-degree':['الشهادة الجامعية','University degree'], 'birth-certificate':['شهادة الميلاد','Birth certificate'], 'recommendation-letter':['خطاب توصية','Recommendation letter'], 'personal-statement':['خطاب الدافع','Personal statement'], cv:['السيرة الذاتية','CV'], translation:['ترجمة معتمدة','Certified translation'], other:['مستند آخر','Other document']};
  const statuses = {requested: ar ? 'مطلوب من الطالب' : 'Requested', submitted: ar ? 'بانتظار المراجعة' : 'Awaiting review', approved: ar ? 'تم استيفاء الطلب' : 'Request fulfilled', cancelled: ar ? 'ملغى' : 'Cancelled'};
  return <section className="mt-3 space-y-3 rounded-xl border bg-white p-4" aria-busy={busy}>
    <label className="block text-sm">{ar ? 'نوع المستند المطلوب' : 'Document type'}<select value={type} disabled={busy} onChange={e => setType(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border p-2">{Object.entries(names).map(([key, label]) => <option key={key} value={key}>{label[ar ? 0 : 1]}</option>)}</select></label>
    <label className="block text-sm">{ar ? 'ملاحظة الطلب أو المراجعة للطالب' : 'Request or review note for the student'}<textarea value={note} disabled={busy} maxLength={2000} onChange={e => setNote(e.target.value)} className="mt-2 w-full rounded-xl border p-3" rows={3} /></label>
    <button disabled={busy || !application} onClick={() => void save()} className="min-h-11 rounded-xl bg-orange-500 px-4 text-white">{ar ? 'طلب مستند إضافي' : 'Request document'}</button>
    {application?.documentRequests?.map(request => <div key={request._id} className="rounded-xl bg-slate-50 p-3">
      <p className="font-semibold">{names[request.type]?.[ar ? 0 : 1] || request.type} — {statuses[request.status]}</p><p className="mt-2 text-sm">{request.note}</p>
      {application.documents?.filter(doc => doc._id === request.document).map(doc => <DocumentFileLink key={doc._id} className="mt-2 block min-h-11 text-sm text-blue-700" path={doc.filePath}>{ar ? 'عرض المستند: ' : 'View document: '}{doc.fileName}</DocumentFileLink>)}
      {request.status === 'submitted' && <>
        <button disabled={busy} onClick={() => void save(request, 'approved')} className="min-h-11 px-3 text-green-700">{ar ? 'استيفاء الطلب' : 'Mark fulfilled'}</button>
        <button disabled={busy} onClick={() => void save(request, 'requested')} className="min-h-11 px-3 text-orange-700">{ar ? 'طلب تصحيح' : 'Request revision'}</button>
      </>}
      {['requested', 'submitted'].includes(request.status) && <button disabled={busy} onClick={() => void save(request, 'cancelled')} className="min-h-11 px-3">{ar ? 'إلغاء الطلب الإضافي' : 'Cancel request'}</button>}
    </div>)}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button disabled={busy} onClick={() => void load()} className="min-h-11 px-3">{ar ? 'تحديث البيانات' : 'Refresh'}</button>
    <AdminConfirmationModal open={Boolean(pending)} title={ar ? 'تأكيد إجراء المستند' : 'Confirm document action'} description={`${pending?.decision === 'approved' ? (ar ? 'استيفاء الطلب' : 'Fulfill request') : pending?.decision === 'cancelled' ? (ar ? 'إلغاء الطلب' : 'Cancel request') : pending?.decision === 'requested' ? (ar ? 'طلب تصحيح' : 'Request revision') : (ar ? 'طلب مستند إضافي' : 'Request document')}: ${note}`} confirmLabel={ar ? 'تأكيد' : 'Confirm'} cancelLabel={ar ? 'رجوع' : 'Back'} loading={busy} onClose={() => { if (!busy) setPending(undefined); }} onConfirm={() => void save(pending?.request, pending?.decision, true)} />
  </section>;
}
