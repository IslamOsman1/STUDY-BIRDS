import { CalendarDays, PencilLine, Plus, Trash2, Video } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { adminService } from "../../services/adminService";
import type { ExhibitionArticle } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";
import { getYoutubeEmbedUrl } from "../../utils/youtube";

type ExhibitionSection = NonNullable<ExhibitionArticle["sections"]>[number];

type ExhibitionForm = {
  title: string;
  summary: string;
  body: string;
  titleColor: string;
  youtubeUrl: string;
  sections: ExhibitionSection[];
  featured: boolean;
  published: boolean;
};

const createEmptySection = (): ExhibitionSection => ({
  title: "",
  summary: "",
  body: "",
  titleColor: "#0f172a",
  youtubeUrl: "",
});

const emptyForm: ExhibitionForm = {
  title: "",
  summary: "",
  body: "",
  titleColor: "#0f172a",
  youtubeUrl: "",
  sections: [],
  featured: true,
  published: true,
};

const isMirroredMainSection = (
  article: ExhibitionArticle,
  section: {
    title: string;
    summary?: string;
    body: string;
    titleColor?: string;
    youtubeUrl?: string;
  }
) =>
  section.title === article.title &&
  (section.summary || "") === (article.summary || "") &&
  section.body === article.body &&
  (section.titleColor || "#0f172a") === (article.titleColor || "#0f172a") &&
  (section.youtubeUrl || "") === (article.youtubeUrl || "");

export const AdminExhibitionsPage = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ExhibitionArticle[]>([]);
  const [form, setForm] = useState<ExhibitionForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const labels = {
    title: language === "ar" ? "محطة المعارض" : "Exhibitions Station",
    intro:
      language === "ar"
        ? "أنشئ منشورًا واحدًا يضم أكثر من مقال مع فيديوهات يوتيوب لكل مقال."
        : "Create one post that can contain multiple articles, each with its own YouTube video.",
    postTitle: language === "ar" ? "عنوان المنشور" : "Post title",
    postSummary: language === "ar" ? "ملخص المنشور" : "Post summary",
    titleColor: language === "ar" ? "لون العنوان" : "Title color",
    body: language === "ar" ? "نص المنشور" : "Post body",
    youtubeUrl: language === "ar" ? "رابط يوتيوب الرئيسي" : "Main YouTube URL",
    sections: language === "ar" ? "مقالات المنشور" : "Post articles",
    addSection: language === "ar" ? "إضافة مقال داخل المنشور" : "Add article inside post",
    sectionTitle: language === "ar" ? "عنوان المقال الداخلي" : "Inner article title",
    sectionSummary: language === "ar" ? "ملخص المقال الداخلي" : "Inner article summary",
    sectionBody: language === "ar" ? "نص المقال الداخلي" : "Inner article body",
    sectionYoutube: language === "ar" ? "رابط يوتيوب للمقال الداخلي" : "Inner article YouTube URL",
    deleteSection: language === "ar" ? "حذف المقال" : "Delete article",
    featured: language === "ar" ? "إظهار كمنشور مميز" : "Show as featured post",
    published: language === "ar" ? "نشر المنشور في الصفحة العامة" : "Publish on the public page",
    create: language === "ar" ? "إضافة المنشور" : "Create post",
    update: language === "ar" ? "تحديث المنشور" : "Update post",
    reset: language === "ar" ? "مسح النموذج" : "Clear form",
    preview: language === "ar" ? "فتح الصفحة العامة" : "Open public page",
    empty: language === "ar" ? "لا توجد منشورات حتى الآن." : "No posts yet.",
    invalidYoutube:
      language === "ar" ? "رابط يوتيوب غير صالح للعرض المضمن." : "This YouTube link is not embeddable.",
    embeddedButtonHelp:
      language === "ar"
        ? "لإضافة زر داخل النص اكتب بهذه الصيغة: [button:نص الزر|https://example.com]"
        : "To place a button inside the text, use: [button:Button text|https://example.com]",
  };

  const getArticleSections = (article: ExhibitionArticle): ExhibitionSection[] => {
    if (!article.sections?.length) {
      return [];
    }

    return article.sections.filter((section, index) => {
      if (article.sections && article.sections.length === 1) {
        return !isMirroredMainSection(article, section);
      }

      return index !== 0 || !isMirroredMainSection(article, section);
    });
  };

  const loadArticles = async () => {
    setArticles(await adminService.getExhibitions());
  };

  useEffect(() => {
    loadArticles().catch((error) =>
      setFormError(
        getErrorMessage(
          error,
          language === "ar" ? "تعذر تحميل منشورات محطة المعارض." : "Unable to load exhibitions posts."
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

    const payload = {
      ...form,
      sections: form.sections.map((section) => ({
        title: section.title.trim(),
        summary: (section.summary || "").trim(),
        body: section.body.trim(),
        titleColor: section.titleColor || "#0f172a",
        youtubeUrl: section.youtubeUrl.trim(),
      })),
    };

    try {
      if (editingId) {
        await adminService.updateExhibition(editingId, payload);
      } else {
        await adminService.createExhibition(payload);
      }

      resetForm();
      await loadArticles();
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          language === "ar" ? "تعذر حفظ المنشور." : "Unable to save the post."
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
          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{labels.postTitle}</span>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{labels.titleColor}</span>
              <input type="color" value={form.titleColor} onChange={(event) => setForm((current) => ({ ...current, titleColor: event.target.value }))} className="h-[52px] w-full rounded-2xl border border-slate-200 bg-white px-2 py-2 outline-none focus:ring" />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{labels.postSummary}</span>
            <textarea value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} rows={3} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{labels.body}</span>
            <textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} rows={5} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            <p className="mt-2 text-xs text-slate-500">{labels.embeddedButtonHelp}</p>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{labels.youtubeUrl}</span>
            <input value={form.youtubeUrl} onChange={(event) => setForm((current) => ({ ...current, youtubeUrl: event.target.value }))} required placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>

          <div className="rounded-[1.75rem] border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">{labels.sections}</h3>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, sections: [...current.sections, createEmptySection()] }))}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <Plus className="h-4 w-4" />
                {labels.addSection}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {form.sections.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  {language === "ar"
                    ? "لا توجد مقالات داخلية بعد. اضغط على زر إضافة مقال داخل المنشور."
                    : "No inner articles yet. Use the add article button to create one."}
                </div>
              ) : null}

              {form.sections.map((section, index) => (
                <div key={index} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{language === "ar" ? `المقال ${index + 1}` : `Article ${index + 1}`}</p>
                    {form.sections.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            sections: current.sections.filter((_, itemIndex) => itemIndex !== index),
                          }))
                        }
                        className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                      >
                        {labels.deleteSection}
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">{labels.sectionTitle}</span>
                      <input
                        value={section.title}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            sections: current.sections.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)),
                          }))
                        }
                        required
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">{labels.titleColor}</span>
                      <input
                        type="color"
                        value={section.titleColor}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            sections: current.sections.map((item, itemIndex) => (itemIndex === index ? { ...item, titleColor: event.target.value } : item)),
                          }))
                        }
                        className="h-[52px] w-full rounded-2xl border border-slate-200 bg-white px-2 py-2 outline-none focus:ring"
                      />
                    </label>
                  </div>

                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">{labels.sectionSummary}</span>
                    <textarea
                      value={section.summary}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => (itemIndex === index ? { ...item, summary: event.target.value } : item)),
                        }))
                      }
                      rows={2}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">{labels.sectionBody}</span>
                    <textarea
                      value={section.body}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => (itemIndex === index ? { ...item, body: event.target.value } : item)),
                        }))
                      }
                      rows={5}
                      required
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">{labels.sectionYoutube}</span>
                    <input
                      value={section.youtubeUrl}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          sections: current.sections.map((item, itemIndex) => (itemIndex === index ? { ...item, youtubeUrl: event.target.value } : item)),
                        }))
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

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
          const sections = getArticleSections(article);
          const embedUrl = getYoutubeEmbedUrl(sections[0]?.youtubeUrl || article.youtubeUrl);

          return (
            <div key={article._id} className="panel overflow-hidden p-0">
              <div className="grid gap-0 xl:grid-cols-[1fr_360px]">
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold" style={{ color: article.titleColor || "#0f172a" }}>{article.title}</h2>
                    {article.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{language === "ar" ? "مميز" : "Featured"}</span> : null}
                    {article.published ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{language === "ar" ? "منشور" : "Published"}</span> : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{language === "ar" ? "مسودة" : "Draft"}</span>}
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-600">{article.summary}</p>

                  <div className="mt-4 space-y-4">
                    {sections.map((section, sectionIndex) => (
                      <div key={`${article._id}-${sectionIndex}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-lg font-semibold" style={{ color: section.titleColor || "#0f172a" }}>{section.title}</h3>
                        {section.summary ? <p className="mt-2 text-sm leading-7 text-slate-600">{section.summary}</p> : null}
                        <div className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{section.body}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {article.createdAt ? <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(article.createdAt)}</span> : null}
                    <span>{language === "ar" ? `عدد المقالات: ${sections.length}` : `Articles: ${sections.length}`}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setEditingId(article._id);
                        setForm({
                          title: article.title,
                          summary: article.summary,
                          body: article.body,
                          titleColor: article.titleColor || "#0f172a",
                          youtubeUrl: article.youtubeUrl,
                          sections: sections.map((section) => ({
                            title: section.title,
                            summary: section.summary || "",
                            body: section.body,
                            titleColor: section.titleColor || "#0f172a",
                            youtubeUrl: section.youtubeUrl,
                          })),
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
