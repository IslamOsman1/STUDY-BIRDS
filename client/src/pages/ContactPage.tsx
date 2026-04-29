import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { SITE_NAME, seoText } from "../seo/site";

export const ContactPage = () => {
  const { t, language } = useLanguage();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Seo
        title={seoText(language, `Contact ${SITE_NAME}`, `Contact ${SITE_NAME}`)}
        description={seoText(
          language,
          `Contact ${SITE_NAME} for support with university applications, international programs, and study abroad planning.`,
          `Contact ${SITE_NAME} for support with university applications, international programs, and study abroad planning.`
        )}
      />
      <div className="panel p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("contact")}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">{t("contactTitle")}</h1>
        <p className="mt-4 text-slate-600">{t("contactBody")}</p>
      </div>
      <div className="panel p-8">
        <div className="space-y-4 text-slate-700">
          <p>{t("email")}: hello@studybirds.com</p>
          <p>{t("supportHours")}</p>
          <p>{t("offices")}</p>
        </div>
      </div>
    </div>
  );
};
