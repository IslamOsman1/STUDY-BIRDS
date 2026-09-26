import { useState, type ReactNode } from 'react';
import { downloadApiAsset, getDownloadableAssetUrl, privateDocumentId } from '../lib/api';
import { useLanguage } from '../hooks/useLanguage';

export function DocumentFileLink({ path, children, className }: { path?: string; children: ReactNode; className?: string }) {
  const { language } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  if (!privateDocumentId(path)) return <a href={getDownloadableAssetUrl(path)} target="_blank" rel="noreferrer" className={className}>{children}</a>;
  return <span>
    <button type="button" className={className} disabled={busy} onClick={async () => {
      setBusy(true); setError(false);
      try { await downloadApiAsset(path); } catch { setError(true); } finally { setBusy(false); }
    }}>{busy ? (language === 'ar' ? 'جاري تجهيز الملف...' : 'Preparing file...') : children}</button>
    {error && <span role="alert" className="block text-sm text-red-700">{language === 'ar' ? 'تعذر فتح الملف. تحقق من الجلسة والصلاحيات ثم أعد المحاولة.' : 'Unable to open file. Check your session and permissions, then retry.'}</span>}
  </span>;
}
