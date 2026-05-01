import { CalendarDays, Newspaper, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { SITE_NAME, seoText } from "../seo/site";
import { contentService } from "../services/contentService";
import type { ExhibitionArticle } from "../types";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/format";
import { getYoutubeEmbedUrl } from "../utils/youtube";

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
          `Explore study abroad fairs, university events, and student guidance content from ${SITE_NAME}, with YouTube videos you can watch directly on the page.`,
          `استكشف معارض الدراسة بالخارج وفعاليات الجامعات ومحتوى الإرشاد الطلابي من ${SITE_NAME}، مع فيديوهات يوتيوب يمكنك مشاهدتها مباشرة داخل الصفحة.`
        )}
        keywords={["study abroad fairs", "university events", "youtube", "articles", "محطة المعارض", "الدراسة بالخارج"]}
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
              {language === "ar" ? "دليلك إلى معارض الدراسة بالخارج وفعاليات الجامعات" : "Your hub for study abroad fairs and university event coverage"}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-brand-100 sm:text-lg">
              {language === "ar"
                ? "اكتشف هنا أحدث أخبار المعارض التعليمية، لقاءات الجامعات، ونصائح التقديم والسفر، مع فيديوهات يوتيوب مدمجة تساعد الطالب على فهم الفرص المتاحة قبل اتخاذ القرار."
                : "Discover the latest education fair updates, university meetings, and study abroad guidance, with embedded YouTube videos that help students understand available opportunities before making a decision."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-brand-100">{language === "ar" ? "مقالات المعارض التعليمية" : "Educational fair articles"}</p>
              <p className="mt-3 text-4xl font-semibold">{articles.length}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-brand-100">{language === "ar" ? "محتوى مرئي داعم" : "Supporting video content"}</p>
              <p className="mt-3 text-lg font-semibold">{language === "ar" ? "شرح مباشر داخل الصفحة" : "Watch guidance without leaving the page"}</p>
            </div>
          </div>
        </div>
      </section>

      {loading ? <div className="panel p-8 text-sm text-slate-500">{language === "ar" ? "جاري تحميل المقالات..." : "Loading articles..."}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error && articles.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">{language === "ar" ? "لا توجد تغطية منشورة للمعارض حالياً" : "No fair coverage has been published yet"}</h2>
          <p className="mt-3 text-slate-600">
            {language === "ar"
              ? "بمجرد إضافة مقالات عن معارض الدراسة بالخارج أو فعاليات الجامعات من لوحة التحكم، ستظهر هنا تلقائياً."
              : "As soon as study abroad fair or university event articles are added from the dashboard, they will appear here automatically."}
          </p>
        </div>
      ) : null}

      <div className="space-y-6">
        {articles.map((article) => {
          const embedUrl = getYoutubeEmbedUrl(article.youtubeUrl);

          return (
            <article key={article._id} className="panel overflow-hidden p-0">
              <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="p-8">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                    <span className="rounded-full bg-brand-50 px-3 py-1">{article.featured ? (language === "ar" ? "تغطية مميزة" : "Featured coverage") : exhibitionsText}</span>
                    {article.createdAt ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(article.createdAt)}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-5 text-3xl font-semibold text-slate-900">{article.title}</h2>
                  <p className="mt-4 text-lg leading-8 text-slate-600">{article.summary}</p>
                  <div className="mt-6 whitespace-pre-line text-sm leading-7 text-slate-600">{article.body}</div>
                </div>

                <div className="border-t border-slate-200 bg-slate-950 p-6 lg:border-l lg:border-t-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <PlayCircle className="h-5 w-5 text-orange-400" />
                    {language === "ar" ? "شاهد شرح المعرض أو الفعالية" : "Watch the fair or event video"}
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-black shadow-2xl">
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
                        {language === "ar" ? "رابط يوتيوب غير صالح للعرض المضمن." : "This YouTube link cannot be embedded."}
                      </div>
                    )}
                  </div>

                  <a
                    href={article.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {language === "ar" ? "فتح الفيديو الكامل على يوتيوب" : "Open the full video on YouTube"}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
