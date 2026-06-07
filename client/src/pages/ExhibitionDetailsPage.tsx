import { CalendarDays, Newspaper, PlayCircle, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArticleContentSection } from "../components/content/ArticleContentSection";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { getApiAssetUrl } from "../lib/api";
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
        article.articleBodies?.length
          ? article.articleBodies
          : (article.sections || []).map((section) => section.body || ""),
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
            language === "ar" ? "تعذر تحميل تفاصيل المقال." : "Unable to load the article."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug, language]);

  const seo = article?.resolvedSeo;
  const mainEmbedUrl = article?.youtubeUrl ? getYoutubeEmbedUrl(article.youtubeUrl) : null;
  const heroImage = article?.image ? getApiAssetUrl(article.image) : "";

  if (loading) {
    return <div className="panel p-8 text-sm text-slate-500">{language === "ar" ? "جاري تحميل المقال..." : "Loading article..."}</div>;
  }

  if (error || !article || !articleContent || !seo) {
    return (
      <div className="space-y-4">
        <Link to="/blog" className="inline-flex text-sm font-semibold text-brand-700">
          {language === "ar" ? "العودة إلى المدونة" : "Back to the blog"}
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error || (language === "ar" ? "المقال غير موجود." : "Article not found.")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Seo
        title={seo.seoTitle}
        description={seo.metaDescription}
        keywords={seo.seoKeywords}
        noIndex={seo.robotsIndex === "noindex"}
        noFollow={seo.robotsFollow === "nofollow"}
        type="article"
        canonicalPath={`/blog/${article.slug}`}
        image={getApiAssetUrl(seo.ogImage)}
        twitterImage={getApiAssetUrl(seo.twitterImage)}
        articlePublishedTime={seo.publishedAt || article.createdAt || null}
        articleModifiedTime={seo.updatedAt || article.updatedAt || null}
        structuredData={article.articleSchema}
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
            {article.category || (language === "ar" ? "المدونة" : "Blog")}
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">{article.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/85 sm:text-lg">{seo.metaDescription}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/80">
            {(seo.publishedAt || article.createdAt) ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(seo.publishedAt || article.createdAt || "")}
              </span>
            ) : null}
            {seo.authorName ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <UserRound className="h-4 w-4" />
                {seo.authorName}
              </span>
            ) : null}
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
              {language === "ar"
                ? `عدد الأقسام ${articleContent.articleHeadings?.filter(Boolean).length || 0}`
                : `${articleContent.articleHeadings?.filter(Boolean).length || 0} sections`}
            </span>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/blog" className="inline-flex text-sm font-semibold text-brand-700">
          {language === "ar" ? "العودة إلى كل المقالات" : "Back to all articles"}
        </Link>
        {seo.categorySlug ? (
          <Link
            to={`/blog/category/${seo.categorySlug}`}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {language === "ar" ? `تصنيف: ${seo.category}` : `Category: ${seo.category}`}
          </Link>
        ) : null}
      </div>

      <article className="panel overflow-hidden p-0">
        <div className="p-8">
          <div className="space-y-3 text-sm leading-7 text-slate-600">{renderRichTextLines(article.body)}</div>

          {mainEmbedUrl ? (
            <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-slate-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4 text-sm font-semibold text-white">
                <PlayCircle className="h-5 w-5 text-orange-400" />
                {language === "ar" ? "فيديو المقال" : "Article video"}
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
