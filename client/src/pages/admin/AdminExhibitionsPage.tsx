import { CalendarDays, PencilLine, Plus, Trash2, Video } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArticleContentFields } from "../../components/admin/ArticleContentFields";
import { createEmptyArticleBodies, createEmptyArticleHeadings, normalizeArticleBodies, normalizeArticleHeadings } from "../../constants/articleContent";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";
import { adminService } from "../../services/adminService";
import type { ExhibitionArticle } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";
import { getYoutubeEmbedUrl } from "../../utils/youtube";

type ExhibitionForm = {
  title: string;
  summary: string;
  body: string;
  image: string;
  titleColor: string;
  articleTitle: string;
  articleTitleColor: string;
  articleHeadingColor: string;
  articleBodyColor: string;
  articleHeadings: string[];
  articleBodies: string[];
  youtubeUrl: string;
  featured: boolean;
  published: boolean;
};

const appendArticleItem = (items: string[]) => [...items, ""];
const removeArticleItem = (items: string[], index: number) => (items.length > 1 ? items.filter((_, itemIndex) => itemIndex !== index) : items);

const mapSectionsToArticleContent = (article: ExhibitionArticle) => {
  const headings = article.articleHeadings?.length
    ? article.articleHeadings
    : (article.sections || []).map((section) => section.title || "").filter((item) => item.trim());
  const bodies = article.articleBodies?.length
    ? article.articleBodies
    : (article.sections || []).map((section) => section.body || "");
  const articleItemCount = Math.max(1, headings.length || 0, bodies.length || 0);

  return {
    articleTitle: article.articleTitle || "",
    articleTitleColor: article.articleTitleColor || "#0f172a",
    articleHeadingColor: article.articleHeadingColor || "#0f172a",
    articleBodyColor: article.articleBodyColor || "#475569",
    articleHeadings: normalizeArticleHeadings(headings, articleItemCount),
    articleBodies: normalizeArticleBodies(bodies, articleItemCount),
  };
};

const emptyForm: ExhibitionForm = {
  title: "",
  summary: "",
  body: "",
  image: "",
  titleColor: "#0f172a",
  articleTitle: "",
  articleTitleColor: "#0f172a",
  articleHeadingColor: "#0f172a",
  articleBodyColor: "#475569",
  articleHeadings: createEmptyArticleHeadings(),
  articleBodies: createEmptyArticleBodies(),
  youtubeUrl: "",
  featured: true,
  published: true,
};

export const AdminExhibitionsPage = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ExhibitionArticle[]>([]);
  const [form, setForm] = useState<ExhibitionForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingImage(true);
    try {
      const image = await adminService.uploadExhibitionImage(fileList[0]);
      setForm((current) => ({ ...current, image }));
    } catch (error) {
      setFormError(getErrorMessage(error, language === "ar" ? "تعذر رفع صورة المنشور." : "Unable to upload the post image."));
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      ...form,
      articleTitle: form.articleTitle.trim(),
      articleHeadings: form.articleHeadings.map((item) => item.trim()),
      articleBodies: form.articleBodies.map((item) => item.trim()),
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
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "صورة أعلى المنشور" : "Post top image"}</span>
            <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event.target.files)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring" />
            <p className="mt-2 text-xs text-slate-500">
              {uploadingImage ? (language === "ar" ? "جاري رفع الصورة..." : "Uploading image...") : language === "ar" ? "يمكنك إضافة صورة تظهر أعلى المنشور في الصفحة العامة." : "You can add an image displayed above the post on the public page."}
            </p>
          </label>

          {form.image ? (
            <div className="rounded-2xl border border-slate-200 p-4">
              <img src={getApiAssetUrl(form.image)} alt="Exhibition post" className="h-48 w-full rounded-2xl object-cover" />
              <button type="button" onClick={() => setForm((current) => ({ ...current, image: "" }))} className="mt-3 rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700">
                {language === "ar" ? "حذف الصورة" : "Remove image"}
              </button>
            </div>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{labels.body}</span>
            <textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} rows={5} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            <p className="mt-2 text-xs text-slate-500">{labels.embeddedButtonHelp}</p>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{labels.youtubeUrl}</span>
            <input value={form.youtubeUrl} onChange={(event) => setForm((current) => ({ ...current, youtubeUrl: event.target.value }))} placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>

          <ArticleContentFields
            articleTitle={form.articleTitle}
            articleTitleColor={form.articleTitleColor}
            articleHeadingColor={form.articleHeadingColor}
            articleBodyColor={form.articleBodyColor}
            articleHeadings={form.articleHeadings}
            articleBodies={form.articleBodies}
            onArticleTitleChange={(value) => setForm((current) => ({ ...current, articleTitle: value }))}
            onArticleTitleColorChange={(value) => setForm((current) => ({ ...current, articleTitleColor: value }))}
            onArticleHeadingColorChange={(value) => setForm((current) => ({ ...current, articleHeadingColor: value }))}
            onArticleBodyColorChange={(value) => setForm((current) => ({ ...current, articleBodyColor: value }))}
            onArticleHeadingChange={(index, value) =>
              setForm((current) => ({
                ...current,
                articleHeadings: current.articleHeadings.map((item, itemIndex) => (itemIndex === index ? value : item)),
              }))
            }
            onArticleBodyChange={(index, value) =>
              setForm((current) => ({
                ...current,
                articleBodies: current.articleBodies.map((item, itemIndex) => (itemIndex === index ? value : item)),
              }))
            }
            onAddArticleItem={() =>
              setForm((current) => ({
                ...current,
                articleHeadings: appendArticleItem(current.articleHeadings),
                articleBodies: appendArticleItem(current.articleBodies),
              }))
            }
            onRemoveArticleItem={(index) =>
              setForm((current) => ({
                ...current,
                articleHeadings: removeArticleItem(current.articleHeadings, index),
                articleBodies: removeArticleItem(current.articleBodies, index),
              }))
            }
            language={language}
            titleLabel={language === "ar" ? "عنوان المقال الداخلي" : "Inner article title"}
          />

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
          const articleContent = mapSectionsToArticleContent(article);
          const articleCount = articleContent.articleHeadings.filter(Boolean).length;
          const embedUrl = getYoutubeEmbedUrl(article.youtubeUrl);

          return (
            <div key={article._id} className="panel overflow-hidden p-0">
              <div className="grid gap-0 xl:grid-cols-[1fr_360px]">
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold" style={{ color: article.titleColor || "#0f172a" }}>{article.title}</h2>
                    {article.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{language === "ar" ? "مميز" : "Featured"}</span> : null}
                    {article.published ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{language === "ar" ? "منشور" : "Published"}</span> : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{language === "ar" ? "مسودة" : "Draft"}</span>}
                  </div>

                  {article.image ? <img src={getApiAssetUrl(article.image)} alt={article.title} className="mt-4 h-44 w-full rounded-3xl object-cover" /> : null}
                  <p className="mt-3 text-sm leading-7 text-slate-600">{article.summary}</p>

                  <div className="mt-4 space-y-4">
                    {articleContent.articleHeadings.filter(Boolean).map((heading, sectionIndex) => (
                      <div key={`${article._id}-${sectionIndex}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-lg font-semibold" style={{ color: articleContent.articleHeadingColor || "#0f172a" }}>{heading}</h3>
                        {articleContent.articleBodies[sectionIndex] ? <div className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{articleContent.articleBodies[sectionIndex]}</div> : null}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {article.createdAt ? <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(article.createdAt)}</span> : null}
                    <span>{language === "ar" ? `عدد المقالات: ${articleCount}` : `Articles: ${articleCount}`}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setEditingId(article._id);
                        setForm({
                          title: article.title,
                          summary: article.summary,
                          body: article.body,
                          image: article.image || "",
                          titleColor: article.titleColor || "#0f172a",
                          ...mapSectionsToArticleContent(article),
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
