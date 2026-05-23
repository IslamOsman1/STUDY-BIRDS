import { CalendarDays, Newspaper, PlayCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArticleContentSection } from "../components/content/ArticleContentSection";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { getApiAssetUrl } from "../lib/api";
import { SITE_NAME, seoText } from "../seo/site";
import { contentService } from "../services/contentService";
import type { ExhibitionArticle } from "../types";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/format";
import { renderRichTextLines } from "../utils/richText";
import { getYoutubeEmbedUrl } from "../utils/youtube";

export const ExhibitionDetailsPage = () => {
  const { language } = useLanguage();
  const { slug = "" } = useParams();
  const [article, setArticle] = useState<ExhibitionArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const articleContent = useMemo(() => {
    if (!article) {
      return null;
    }

    return {
      ...article,
      articleTitle: article.articleTitle || "",
      articleTitleColor: article.articleTitleColor || "#0f172a",
      articleHeadingColor: article.articleHeadingColor || "#0f172a",
      articleBodyColor: article.articleBodyColor || "#475569",
      articleHeadings:
        article.articleHeadings?.length
          ? article.articleHeadings
          : (article.sections || []).map((section) => section.title || "").filter((item) => item.trim()),
      articleBodies:
        article.articleBodies?.length ? article.articleBodies : (article.sections || []).map((section) => section.body || ""),
    };
  }, [article]);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      setError("");

      try {
        setArticle(await contentService.getExhibitionArticleBySlug(slug));
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            language === "ar" ? "تعذر تحميل تفاصيل المنشور." : "Unable to load the exhibition post."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug, language]);

  const mainEmbedUrl = article?.youtubeUrl ? getYoutubeEmbedUrl(article.youtubeUrl) : null;
  const heroImage = article?.image ? getApiAssetUrl(article.image) : "";

  if (loading) {
    return <div className="panel p-8 text-sm text-slate-500">{language === "ar" ? "جاري تحميل المنشور..." : "Loading post..."}</div>;
  }

  if (error || !article || !articleContent) {
    return (
      <div className="space-y-4">
        <Link to="/exhibitions" className="inline-flex text-sm font-semibold text-brand-700">
          {language === "ar" ? "العودة إلى صفحة المعارض" : "Back to exhibitions"}
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error || (language === "ar" ? "المنشور غير موجود." : "Post not found.")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Seo
        title={seoText(language, article.title, article.title)}
        description={seoText(
          language,
          article.summary || `Explore this exhibitions post from ${SITE_NAME}.`,
          article.summary || `استكشف هذا المنشور من ${SITE_NAME}.`
        )}
        type="article"
        canonicalPath={`/exhibitions/${article.slug}`}
      />

      <section
        className="relative overflow-hidden rounded-[2rem] text-white"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(135deg, rgba(15,23,42,0.78), rgba(30,41,59,0.65)), url(${heroImage})`
            : "linear-gradient(135deg, #0f172a, #1e3a8a)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="px-8 py-14 sm:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/85">
            <Newspaper className="h-4 w-4" />
            {language === "ar" ? "محطة المعارض" : "Exhibitions Station"}
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">{article.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/85 sm:text-lg">{article.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/80">
            {article.createdAt ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(article.createdAt)}
              </span>
            ) : null}
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
              {language === "ar" ? `عدد المقالات ${articleContent.articleHeadings?.filter(Boolean).length || 0}` : `${articleContent.articleHeadings?.filter(Boolean).length || 0} articles`}
            </span>
          </div>
        </div>
      </section>

      <div className="flex justify-between gap-4">
        <Link to="/exhibitions" className="inline-flex text-sm font-semibold text-brand-700">
          {language === "ar" ? "العودة إلى كل المنشورات" : "Back to all posts"}
        </Link>
      </div>

      <article className="panel overflow-hidden p-0">
        <div className="p-8">
          <div className="space-y-3 text-sm leading-7 text-slate-600">{renderRichTextLines(article.body)}</div>

          {mainEmbedUrl ? (
            <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-slate-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4 text-sm font-semibold text-white">
                <PlayCircle className="h-5 w-5 text-orange-400" />
                {language === "ar" ? "فيديو المنشور" : "Post video"}
              </div>
              <iframe
                src={mainEmbedUrl}
                title={article.title}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ) : null}

          <div className="mt-10 border-t border-slate-200 pt-8">
            <ArticleContentSection article={articleContent} language={language} />
          </div>
        </div>
      </article>
    </div>
  );
};
