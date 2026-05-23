import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { getApiAssetUrl } from "../lib/api";
import { SITE_NAME, seoText } from "../seo/site";
import { contentService } from "../services/contentService";
import type { ExhibitionArticle } from "../types";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/format";

export const ExhibitionsPage = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ExhibitionArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const exhibitionsText = language === "ar" ? "محطة المعارض" : "Exhibitions Station";

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      setError("");

      try {
        setArticles(await contentService.getExhibitionArticles());
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            language === "ar"
              ? "تعذر تحميل محتوى محطة المعارض حالياً."
              : "Unable to load the exhibitions station right now."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [language]);

  return (
    <div className="space-y-8">
      <Seo
        title={seoText(language, "Exhibitions Station", "محطة المعارض")}
        description={seoText(
          language,
          `Explore study abroad fairs, university events, and student guidance content from ${SITE_NAME}.`,
          `استكشف معارض الدراسة بالخارج وفعاليات الجامعات والمحتوى الإرشادي من ${SITE_NAME}.`
        )}
        keywords={["study abroad fairs", "university events", "articles", "محطة المعارض", "الدراسة بالخارج"]}
      />

      <section className="relative overflow-hidden rounded-[2rem] bg-fusion px-8 py-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-100">
              <Newspaper className="h-4 w-4" />
              {exhibitionsText}
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              {language === "ar" ? "منشورات المعارض والفعاليات التعليمية" : "Educational fairs and university event posts"}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-brand-100 sm:text-lg">
              {language === "ar"
                ? "تصفح المنشورات على شكل بطاقات، وافتح كل منشور في صفحة مستقلة لقراءة التفاصيل كاملة بخلفية مستوحاة من صورته."
                : "Browse posts as cards and open each one in its own detail page with a background inspired by its uploaded image."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-brand-100">{language === "ar" ? "إجمالي المنشورات" : "Total posts"}</p>
              <p className="mt-3 text-4xl font-semibold">{articles.length}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-brand-100">{language === "ar" ? "عرض سريع" : "Quick browsing"}</p>
              <p className="mt-3 text-lg font-semibold">{language === "ar" ? "كل منشور يفتح في صفحة خاصة به" : "Each post opens in its own page"}</p>
            </div>
          </div>
        </div>
      </section>

      {loading ? <div className="panel p-8 text-sm text-slate-500">{language === "ar" ? "جاري تحميل المنشورات..." : "Loading posts..."}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error && articles.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">{language === "ar" ? "لا توجد منشورات معارض منشورة حالياً" : "No exhibition posts have been published yet"}</h2>
          <p className="mt-3 text-slate-600">
            {language === "ar"
              ? "بمجرد إضافة منشورات جديدة من لوحة التحكم ستظهر هنا تلقائيًا على شكل بطاقات."
              : "As soon as new posts are added from the dashboard, they will appear here as cards."}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => {
          const articleCount = article.articleHeadings?.filter(Boolean).length || article.sections?.length || 0;
          const imageUrl = article.image ? getApiAssetUrl(article.image) : "";

          return (
            <Link
              key={article._id}
              to={`/exhibitions/${article.slug}`}
              className="group panel overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative h-64 overflow-hidden bg-slate-950">
                {imageUrl ? (
                  <img src={imageUrl} alt={article.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-fusion" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">{article.featured ? (language === "ar" ? "مميز" : "Featured") : exhibitionsText}</span>
                    {article.createdAt ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(article.createdAt)}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight">{article.title}</h2>
                </div>
              </div>

              <div className="p-6">
                <p className="line-clamp-3 text-sm leading-7 text-slate-600">{article.summary}</p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {language === "ar" ? `عدد المقالات ${articleCount}` : `${articleCount} articles`}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                    {language === "ar" ? "فتح المنشور" : "Open post"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
