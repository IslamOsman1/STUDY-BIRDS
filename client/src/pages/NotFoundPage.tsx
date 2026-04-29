import { Link } from "react-router-dom";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { SITE_NAME, seoText } from "../seo/site";

export const NotFoundPage = () => {
  const { t, language } = useLanguage();

  return (
    <div className="panel p-12 text-center">
      <Seo
        title={seoText(language, "Page Not Found", "Page Not Found")}
        description={seoText(
          language,
          `The requested page could not be found on ${SITE_NAME}.`,
          `The requested page could not be found on ${SITE_NAME}.`
        )}
        noIndex
      />
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">404</p>
      <h1 className="mt-3 text-4xl font-semibold text-slate-900">{t("notFoundTitle")}</h1>
      <p className="mt-4 text-slate-600">{t("notFoundBody")}</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-brand-900 px-6 py-3 font-semibold text-white">
        {t("returnHome")}
      </Link>
    </div>
  );
};
