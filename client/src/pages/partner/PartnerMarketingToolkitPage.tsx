import { useEffect, useState } from "react";
import { Download, FileArchive } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { getDownloadableAssetUrl } from "../../lib/api";
import { partnerService } from "../../services/partnerService";
import type { MarketingAssetItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

export const PartnerMarketingToolkitPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [assets, setAssets] = useState<MarketingAssetItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    partnerService
      .getMarketingAssets()
      .then(setAssets)
      .catch((issue) =>
        setError(getErrorMessage(issue, isArabic ? "تعذر تحميل المواد التسويقية." : "Unable to load marketing assets."))
      );
  }, [isArabic]);

  if (error) {
    return <EmptyState title={isArabic ? "تعذر التحميل" : "Unable to load"} description={error} />;
  }

  if (!assets.length) {
    return <EmptyState title={isArabic ? "لا توجد ملفات بعد" : "No assets yet"} description={isArabic ? "سيضيف الأدمن المواد التسويقية هنا لاحقًا." : "Marketing assets uploaded by admin will appear here."} />;
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "المواد التسويقية" : "Marketing Toolkit"}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {isArabic ? "حمل البروشورات والملفات التسويقية الجاهزة للاستخدام." : "Download brochures and ready-to-use marketing assets."}
        </p>
      </section>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <article key={asset._id} className="panel p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <FileArchive className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">{asset.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{asset.description || (isArabic ? "بدون وصف إضافي." : "No additional description.")}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">{asset.type}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : "--"}
              </span>
            </div>
            <a href={getDownloadableAssetUrl(asset.fileUrl)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              <Download className="h-4 w-4" />
              {isArabic ? "تنزيل" : "Download"}
            </a>
          </article>
        ))}
      </div>
    </div>
  );
};
