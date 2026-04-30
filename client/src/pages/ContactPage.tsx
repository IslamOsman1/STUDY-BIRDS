import { SocialLinks } from "../components/SocialLinks";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { SITE_NAME, seoText } from "../seo/site";

export const ContactPage = () => {
  const { t, language } = useLanguage();
  const siteSettings = useSiteSettings();
  const supportHoursText = siteSettings.supportHours?.trim() || t("supportHours");
  const officeLocationsText = siteSettings.officeLocations?.trim() || t("offices");

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
          <p>{t("email")}: {siteSettings.contactEmail}</p>
          <div>
            <p className="font-semibold text-slate-900">{language === "ar" ? "مواعيد العمل" : "Support hours"}</p>
            <p className="mt-1 whitespace-pre-line">{supportHoursText}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{language === "ar" ? "مواقع المكاتب" : "Office locations"}</p>
            <p className="mt-1 whitespace-pre-line">{officeLocationsText}</p>
          </div>
          <div className="pt-2">
            <SocialLinks
              settings={siteSettings}
              className="grid gap-3 sm:grid-cols-2"
              itemClassName="group inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-900"
              labelClassName="text-sm font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
