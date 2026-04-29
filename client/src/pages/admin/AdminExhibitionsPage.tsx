import { CalendarDays, PencilLine, Plus, Trash2, Video } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { adminService } from "../../services/adminService";
import type { ExhibitionArticle } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";
import { getYoutubeEmbedUrl } from "../../utils/youtube";

const emptyForm = {
  title: "",
  summary: "",
  body: "",
  youtubeUrl: "",
  featured: true,
  published: true,
};

export const AdminExhibitionsPage = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ExhibitionArticle[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const labels = {
    title: language === "ar" ? "محطة المعارض" : "Exhibitions Station",
    intro:
      language === "ar"
        ? "أنشئ مقالات احترافية مع روابط يوتيوب ليتم تشغيل الفيديو مباشرة داخل الصفحة العامة."
        : "Create polished articles with YouTube links so videos can play directly on the public page.",
    articleTitle: language === "ar" ? "عنوان المقال" : "Article title",
    summary: language === "ar" ? "ملخص قصير" : "Short summary",
    body: language === "ar" ? "نص المقال" : "Article body",
    youtubeUrl: language === "ar" ? "رابط يوتيوب" : "YouTube URL",
    featured: language === "ar" ? "إظهار كمقال مميز" : "Show as featured article",
    published: language === "ar" ? "نشر المقال في الصفحة العامة" : "Publish on the public page",
    create: language === "ar" ? "إضافة المقال" : "Create article",
    update: language === "ar" ? "تحديث المقال" : "Update article",
    reset: language === "ar" ? "مسح النموذج" : "Clear form",
    preview: language === "ar" ? "فتح الصفحة العامة" : "Open public page",
    empty: language === "ar" ? "لا توجد مقالات حتى الآن." : "No articles yet.",
    invalidYoutube:
      language === "ar" ? "رابط يوتيوب غير صالح للعرض المضمن." : "This YouTube link is not embeddable.",
  };

  const loadArticles = async () => {
    setArticles(await adminService.getExhibitions());
  };

  useEffect(() => {
    loadArticles().catch((error) =>
      setFormError(
        getErrorMessage(
          error,
          language === "ar" ? "تعذر تحميل مقالات محطة المعارض." : "Unable to load exhibitions articles."
        )
      )
    );
  }, [language]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    try {
      if (editingId) {
        await adminService.updateExhibition(editingId, form);
      } else {
        await adminService.createExhibition(form);
      }

      resetForm();
      await loadArticles();
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          language === "ar" ? "تعذر حفظ المقال." : "Unable to save the article."
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <section className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{labels.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{labels.intro}</p>
            </div>
          </div>

          <Link to="/exhibitions" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            {labels.preview}
          </Link>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{labels.articleTitle}</span>
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{labels.summary}</span>
            <textarea value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} rows={3} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{labels.body}</span>
            <textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} rows={6} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{labels.youtubeUrl}</span>
            <input value={form.youtubeUrl} onChange={(event) => setForm((current) => ({ ...current, youtubeUrl: event.target.value }))} required placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
              <span className="text-sm font-medium text-slate-700">{labels.featured}</span>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} />
              <span className="text-sm font-medium text-slate-700">{labels.published}</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {editingId ? labels.update : labels.create}
            </button>
            <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {labels.reset}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {articles.length === 0 ? <div className="panel p-6 text-sm text-slate-500">{labels.empty}</div> : null}

        {articles.map((article) => {
          const embedUrl = getYoutubeEmbedUrl(article.youtubeUrl);

          return (
            <div key={article._id} className="panel overflow-hidden p-0">
              <div className="grid gap-0 xl:grid-cols-[1fr_360px]">
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{article.title}</h2>
                    {article.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{language === "ar" ? "مميز" : "Featured"}</span> : null}
                    {article.published ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{language === "ar" ? "منشور" : "Published"}</span> : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{language === "ar" ? "مسودة" : "Draft"}</span>}
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-600">{article.summary}</p>
                  <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{article.body}</div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {article.createdAt ? <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(article.createdAt)}</span> : null}
                    <a href={article.youtubeUrl} target="_blank" rel="noreferrer" className="font-semibold text-brand-700">
                      {language === "ar" ? "رابط الفيديو" : "Video link"}
                    </a>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setEditingId(article._id);
                        setForm({
                          title: article.title,
                          summary: article.summary,
                          body: article.body,
                          youtubeUrl: article.youtubeUrl,
                          featured: Boolean(article.featured),
                          published: Boolean(article.published),
                        });
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                    >
                      <PencilLine className="h-4 w-4" />
                      {language === "ar" ? "تعديل" : "Edit"}
                    </button>
                    <button onClick={() => adminService.removeExhibition(article._id).then(loadArticles)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
                      <Trash2 className="h-4 w-4" />
                      {language === "ar" ? "حذف" : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-slate-950 p-5 xl:border-l xl:border-t-0">
                  <div className="overflow-hidden rounded-[1.25rem] bg-black">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={article.title}
                        className="aspect-video w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-slate-300">
                        {labels.invalidYoutube}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
