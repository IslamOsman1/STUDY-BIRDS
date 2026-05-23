import { Award } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { getApiAssetUrl } from "../lib/api";
import { SITE_NAME, seoText } from "../seo/site";
import { contentService } from "../services/contentService";
import type { Recognition } from "../types";
import { getErrorMessage } from "../utils/errors";

export const AboutPage = () => {
  const { t, language } = useLanguage();
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecognitions = async () => {
      setLoading(true);
      setError("");

      try {
        const recognitionsData = await contentService.getRecognitions();
        setRecognitions(recognitionsData.filter((recognition) => recognition.featured !== false));
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            language === "ar" ? "تعذر تحميل الشهادات حاليًا." : "Unable to load the recognitions right now."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecognitions();
  }, [language]);

  return (
    <div className="space-y-8">
      <Seo
        title={seoText(language, `About ${SITE_NAME}`, `عن ${SITE_NAME}`)}
        description={seoText(
          language,
          `Learn how ${SITE_NAME} helps students compare universities, apply to international programs, and manage study abroad journeys.`,
          `تعرّف على كيفية مساعدة ${SITE_NAME} للطلاب في مقارنة الجامعات، واختيار البرامج، وتنظيم رحلة الدراسة بالخارج بوضوح.`
        )}
      />

      <section className="panel p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("about")}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">{t("aboutTitle")}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{t("aboutBody")}</p>
      </section>

      <section className="overflow-hidden rounded-[2.5rem] bg-fusion px-8 py-10 text-white sm:px-10">
        <h2 className="text-3xl font-semibold">{t("recognitionsTitle")}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-100/85">{t("recognitionsBody")}</p>

        {loading ? <div className="mt-6 text-sm text-brand-100">{language === "ar" ? "جارٍ تحميل الشهادات..." : "Loading recognitions..."}</div> : null}
        {error ? <div className="mt-6 rounded-2xl border border-rose-200/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

        {!loading && !error && recognitions.length ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {recognitions.map((recognition) => {
              const imageUrl = recognition.image ? getApiAssetUrl(recognition.image) : "";

              return (
                <div
                  key={recognition._id}
                  className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 p-2 backdrop-blur-sm"
                >
                  <Link to={`/recognitions/${recognition.slug || recognition._id}`} className="block">
                    {imageUrl ? (
                      <div className="flex h-32 w-full items-center justify-center rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.06)_100%)] p-3 sm:h-40 lg:h-48">
                        <img src={imageUrl} alt={recognition.title} className="h-full w-full rounded-[1rem] object-contain" />
                      </div>
                    ) : (
                      <div className="flex h-32 w-full flex-col justify-between rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] p-4 sm:h-40 sm:p-5 lg:h-48">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-brand-100">
                          <Award size={22} />
                        </span>
                        <p className="text-lg font-semibold text-white">{recognition.title}</p>
                      </div>
                    )}
                    <div className="px-1 pb-1 pt-3">
                      <p className="text-sm font-semibold text-white">{recognition.title}</p>
                      <p className="mt-2 text-xs font-medium text-brand-100">{t("viewRecognition")}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
};
