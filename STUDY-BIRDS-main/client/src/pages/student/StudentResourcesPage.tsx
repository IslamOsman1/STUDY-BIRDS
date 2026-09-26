import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, PlayCircle, Search } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";
import { useLanguage } from "../../hooks/useLanguage";
import { getDownloadableAssetUrl } from "../../lib/api";
import { studentService } from "../../services/studentService";
import type { KnowledgeBaseItem } from "../../types";
import { getErrorMessage } from "../../utils/errors";

const resourceActionLabel = (resourceType?: string, isArabic?: boolean) => {
  if (resourceType === "video") {
    return isArabic ? "مشاهدة" : "Watch";
  }
  if (resourceType === "pdf") {
    return isArabic ? "تحميل" : "Download";
  }
  return isArabic ? "فتح" : "Open";
};

export const StudentResourcesPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    studentService
      .getKnowledgeBase()
      .then(setItems)
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل دليل الطالب." : "Unable to load student resources.")));
  }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => [item.title, item.summary || "", item.body, item.category || ""].join(" ").toLowerCase().includes(normalizedQuery));
  }, [items, query]);

  if (error && items.length === 0) {
    return <EmptyState title={isArabic ? "تعذر التحميل" : "Unable to load"} description={error} />;
  }

  if (!items.length) {
    return <EmptyState title={isArabic ? "لا يوجد محتوى بعد" : "No resources yet"} description={isArabic ? "سيضيف الأدمن محتوى دليل الطالب هنا." : "Admin-managed student resources will appear here."} />;
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "دليل الطالب والموارد" : "Student Guide & Resources"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "ملفات وروابط وشروحات تساعدك قبل السفر وخلال رحلتك الدراسية." : "Files, links, and guides to help before travel and throughout your study journey."}</p>
          </div>
          <label className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "بحث" : "Search"}</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "ابحث في المواد الإرشادية" : "Search resources"} className="w-full border-none bg-transparent p-0 outline-none" />
            </div>
          </label>
        </div>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {filteredItems.map((item) => {
          const href = item.fileUrl ? getDownloadableAssetUrl(item.fileUrl) : item.videoUrl || undefined;
          const isVideo = item.resourceType === "video";

          return (
            <article key={item._id} className="panel p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">{item.category || (isArabic ? "عام" : "General")}</div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.resourceType || "article"}</span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{item.title}</h2>
              {item.summary ? <p className="mt-3 text-sm leading-7 text-slate-500">{item.summary}</p> : null}
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{item.body}</p>
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                  {isVideo ? <PlayCircle className="h-4 w-4" /> : item.resourceType === "pdf" ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                  {resourceActionLabel(item.resourceType, isArabic)}
                </a>
              ) : null}
            </article>
          );
        })}
      </section>

      {filteredItems.length === 0 ? <EmptyState title={isArabic ? "لا توجد نتائج" : "No matching resources"} description={isArabic ? "جرّب كلمات بحث مختلفة." : "Try different search terms."} /> : null}
    </div>
  );
};
