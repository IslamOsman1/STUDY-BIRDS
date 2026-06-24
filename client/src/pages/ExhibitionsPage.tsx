import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { getApiAssetUrl } from "../lib/api";
import { SITE_NAME, seoText } from "../seo/site";
import { contentService } from "../services/contentService";
import type { Country, ExhibitionArticle } from "../types";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/format";
import { getPaginatedItems } from "../utils/pagination";

const slugifyCategory = (value: string) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

export const ExhibitionsPage = () => {
  const { language, t, tv } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<ExhibitionArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const blogText = language === "ar" ? "محطة المعارض" : "Blog";
  const selectedCountryId = searchParams.get("country") || "";
  const selectedCountry = useMemo(
    () => countries.find((country) => country._id === selectedCountryId),
    [countries, selectedCountryId]
  );

  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      setError("");

      try {
        const [articlesData, categoryData, countriesData] = await Promise.all([
          contentService.getExhibitionArticles({ page: 1, limit: 12, paginate: true, ...(selectedCountryId ? { country: selectedCountryId } : {}) }),
          contentService.getBlogCategories(),
          contentService.getCountries(),
        ]);
        setArticles(getPaginatedItems(articlesData));
        setCategories(categoryData);
        setCountries(getPaginatedItems(countriesData));
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            language === "ar"
              ? "تعذر تحميل محتوى محطة المعارض حاليًا."
              : "Unable to load the blog right now."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [language, selectedCountryId]);

  const handleCountryFilter = (countryId: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (countryId) {
      nextParams.set("country", countryId);
    } else {
      nextParams.delete("country");
    }

    setSearchParams(nextParams);
  };

  const categoryLinks = useMemo(
    () =>
      categories
        .map((category) => ({
          name: category,
          slug: slugifyCategory(category),
        }))
        .filter((item) => item.slug),
    [categories]
  );

  return (
    <div className="space-y-8">
      <Seo
        title={seoText(language, "Study Abroad Blog", "محطة المعارض")}
        description={seoText(
          language,
          `Explore fresh study abroad articles, university updates, and student guidance from ${SITE_NAME}.`,
          `استكشف أحدث المقالات والتحديثات والإرشادات الخاصة بالدراسة بالخارج من ${SITE_NAME}.`
        )}
        canonicalPath="/blog"
        keywords={["study abroad blog", "university updates", "articles", "محطة المعارض", "الدراسة بالخارج"]}
      />

      <section className="relative overflow-hidden rounded-[2rem] bg-fusion px-8 py-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-100">
              <Newspaper className="h-4 w-4" />
              {blogText}
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              {language === "ar" ? "مقالات وموضوعات الدراسة بالخارج" : "Study abroad articles and updates"}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-brand-100 sm:text-lg">
              {language === "ar"
                ? "تصفح المقالات، افتح كل موضوع برابط نظيف، واستكشف التصنيفات الجاهزة للأرشفة والمشاركة."
                : "Browse articles, open each topic on a clean URL, and explore category pages ready for search indexing."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-brand-100">{language === "ar" ? "إجمالي المقالات" : "Total articles"}</p>
              <p className="mt-3 text-4xl font-semibold">{articles.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleCountryFilter("")}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            !selectedCountryId
              ? "bg-brand-900 text-white shadow-soft"
              : "border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
          }`}
        >
          {t("allCountries")}
        </button>
        {countries.map((country) => {
          const isActive = selectedCountryId === country._id;

          return (
            <button
              key={country._id}
              type="button"
              onClick={() => handleCountryFilter(country._id)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-brand-900 text-white shadow-soft"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {tv(country.name)}
            </button>
          );
        })}
      </div>

      {selectedCountry ? (
        <p className="text-sm font-semibold text-slate-600">
          {language === "ar" ? `عرض مقالات ${tv(selectedCountry.name)}` : `Showing articles for ${tv(selectedCountry.name)}`}
        </p>
      ) : null}

      {categoryLinks.length ? (
        <section className="flex flex-wrap gap-3">
          {categoryLinks.map((category) => (
            <Link
              key={category.slug}
              to={`/blog/category/${category.slug}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
            >
              {category.name}
            </Link>
          ))}
        </section>
      ) : null}

      {loading ? <div className="panel p-8 text-sm text-slate-500">{language === "ar" ? "جاري تحميل المقالات..." : "Loading articles..."}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error && articles.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            {selectedCountryId
              ? language === "ar"
                ? "لا توجد مقالات منشورة لهذه الدولة حاليًا"
                : "No articles have been published for this country yet"
              : language === "ar"
                ? "لا توجد مقالات منشورة حاليًا"
                : "No articles have been published yet"}
          </h2>
          <p className="mt-3 text-slate-600">
            {language === "ar"
              ? "بمجرد إضافة مقالات جديدة من لوحة التحكم ستظهر هنا تلقائيًا."
              : "As soon as new articles are added from the dashboard, they will appear here automatically."}
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
              to={`/blog/${article.slug}`}
              className="group panel overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative h-64 overflow-hidden bg-slate-950">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={article.resolvedSeo?.imageAltText || article.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-fusion" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
                      {article.category || (article.featured ? (language === "ar" ? "مميز" : "Featured") : blogText)}
                    </span>
                    {(article.publishedAt || article.createdAt) ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(article.publishedAt || article.createdAt || "")}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight">{article.title}</h2>
                </div>
              </div>

              <div className="p-6">
                <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                  {article.resolvedSeo?.metaDescription || article.summary}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {language === "ar" ? `عدد الأقسام ${articleCount}` : `${articleCount} sections`}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                    {language === "ar" ? "فتح المقال" : "Open article"}
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
