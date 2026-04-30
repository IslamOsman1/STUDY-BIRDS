import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { SITE_NAME, seoText } from "../seo/site";

export const AboutPage = () => {
  const { t, language } = useLanguage();

  return (
    <div className="panel p-8">
      <Seo
        title={seoText(language, `About ${SITE_NAME}`, `عن ${SITE_NAME}`)}
        description={seoText(
          language,
          `Learn how ${SITE_NAME} helps students compare universities, apply to international programs, and manage study abroad journeys.`,
          `تعرّف على كيفية مساعدة ${SITE_NAME} للطلاب في مقارنة الجامعات، واختيار البرامج، وتنظيم رحلة الدراسة بالخارج بوضوح.`
        )}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("about")}</p>
      <h1 className="mt-3 text-4xl font-semibold text-slate-900">{t("aboutTitle")}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{t("aboutBody")}</p>
    </div>
  );
};
