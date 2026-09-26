import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { SITE_NAME, seoText } from "../seo/site";

export const PartnerPage = () => {
  const { t, language } = useLanguage();

  return (
    <div className="panel p-8">
      <Seo
        title={seoText(language, `Partner With ${SITE_NAME}`, `Partner With ${SITE_NAME}`)}
        description={seoText(
          language,
          `Partner with ${SITE_NAME} to reach qualified international students through a clearer admissions and recruitment workflow.`,
          `Partner with ${SITE_NAME} to reach qualified international students through a clearer admissions and recruitment workflow.`
        )}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("partner")}</p>
      <h1 className="mt-3 text-4xl font-semibold text-slate-900">{t("partnerTitle")}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{t("partnerBody")}</p>
    </div>
  );
};
