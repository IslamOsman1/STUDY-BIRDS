import { ArrowRight, Award, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { getApiAssetUrl } from "../lib/api";
import { SITE_NAME, seoText } from "../seo/site";
import { contentService } from "../services/contentService";
import type { Recognition } from "../types";
import { getErrorMessage } from "../utils/errors";
import { renderRichTextLines } from "../utils/richText";

export const RecognitionDetailsPage = () => {
  const { language } = useLanguage();
  const { slug = "" } = useParams();
  const [recognition, setRecognition] = useState<Recognition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecognition = async () => {
      setLoading(true);
      setError("");

      try {
        setRecognition(await contentService.getRecognitionBySlug(slug));
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            language === "ar" ? "تعذر تحميل تفاصيل الشهادة." : "Unable to load the recognition details."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecognition();
  }, [slug, language]);

  if (loading) {
    return <div className="panel p-8 text-sm text-slate-500">{language === "ar" ? "جارٍ تحميل الشهادة..." : "Loading recognition..."}</div>;
  }

  if (error || !recognition) {
    return (
      <div className="space-y-4">
        <Link to="/about" className="inline-flex text-sm font-semibold text-brand-700">
          {language === "ar" ? "العودة إلى من نحن" : "Back to about"}
        </Link>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error || (language === "ar" ? "الشهادة غير موجودة." : "Recognition not found.")}
        </div>
      </div>
    );
  }

  const heroImage = getApiAssetUrl(recognition.detailImage || recognition.image || "");
  const pageTitle = recognition.detailTitle || recognition.title;

  return (
    <div className="space-y-8">
      <Seo
        title={seoText(language, pageTitle, pageTitle)}
        description={seoText(
          language,
          recognition.detailBody || `Read more about this recognition from ${SITE_NAME}.`,
          recognition.detailBody || `تعرّف على تفاصيل هذه الشهادة من ${SITE_NAME}.`
        )}
        type="article"
        canonicalPath={`/recognitions/${recognition.slug || recognition._id}`}
      />

      <section
        className="relative overflow-hidden rounded-[2rem] text-white"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(135deg, rgba(15,23,42,0.82), rgba(30,41,59,0.7)), url(${heroImage})`
            : "linear-gradient(135deg, #0f172a, #1e3a8a)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="px-8 py-14 sm:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/85">
            <Award className="h-4 w-4" />
            {language === "ar" ? "الشهادات والاعتمادات" : "Recognitions"}
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">{pageTitle}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/85">
            {recognition.detailBody
              ? language === "ar"
                ? "تفاصيل الشهادة موضحة في هذه الصفحة، ويمكنك الانتقال للرابط الخارجي من الزر بالأسفل."
                : "This page shows the recognition details, with the external source available from the button below."
              : language === "ar"
                ? "يمكنك استعراض صورة الشهادة والانتقال إلى الرابط الخارجي من داخل هذه الصفحة."
                : "You can preview the recognition image and open the external source from this page."}
          </p>
        </div>
      </section>

      <div className="flex justify-between gap-4">
        <Link to="/about" className="inline-flex text-sm font-semibold text-brand-700">
          {language === "ar" ? "العودة إلى من نحن" : "Back to about"}
        </Link>
      </div>

      <article className="panel overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-slate-200 bg-slate-50 p-6 lg:border-b-0 lg:border-r">
            {heroImage ? (
              <img src={heroImage} alt={pageTitle} className="h-full max-h-[32rem] w-full rounded-[1.5rem] object-contain bg-white p-4" />
            ) : (
              <div className="flex h-80 items-center justify-center rounded-[1.5rem] bg-fusion text-white">
                <div className="text-center">
                  <Award className="mx-auto h-12 w-12" />
                  <p className="mt-4 text-lg font-semibold">{recognition.title}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            <h2 className="text-3xl font-semibold text-slate-900">{pageTitle}</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              {recognition.detailBody
                ? renderRichTextLines(recognition.detailBody)
                : renderRichTextLines(
                    language === "ar"
                      ? "لم يتم إضافة نص تفصيلي لهذه الشهادة بعد."
                      : "A detailed description has not been added for this recognition yet."
                  )}
            </div>

            {recognition.link ? (
              <a
                href={recognition.link}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                {language === "ar" ? "الذهاب إلى الرابط" : "Go to link"}
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}

            <Link
              to="/about"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
              {language === "ar" ? "العودة إلى صفحة من نحن" : "Back to about page"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};
