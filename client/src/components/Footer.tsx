import { Link } from "react-router-dom";
import { SocialLinks } from "./SocialLinks";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { useLanguage } from "../hooks/useLanguage";
import { BRAND_LOGO_PATH, SITE_NAME } from "../seo/site";

export const Footer = () => {
  const { t, language } = useLanguage();
  const siteSettings = useSiteSettings();
  const exhibitionsText = language === "ar" ? "محطة المعارض" : "Exhibitions Station";

  return (
    <footer className="mt-20 bg-brand-900 text-white">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src={BRAND_LOGO_PATH} alt={SITE_NAME} className="h-12 w-12 rounded-2xl bg-white object-cover p-1" />
            <h3 className="text-2xl font-semibold">{SITE_NAME}</h3>
          </div>
          <p className="mt-4 max-w-sm text-sm text-sky-100">{t("footerBody")}</p>
        </div>
        <div>
          <h4 className="font-semibold">{t("explore")}</h4>
          <div className="mt-4 flex flex-col gap-3 text-sm text-sky-100">
            <Link to="/programs">{t("programs")}</Link>
            <Link to="/universities">{t("universities")}</Link>
            <Link to="/destinations">{t("destinations")}</Link>
            <Link to="/exhibitions">{exhibitionsText}</Link>
            <Link to="/partner">{t("partner")}</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold">{t("contact")}</h4>
          <div className="mt-4 space-y-4 text-sm text-sky-100">
            <p>{siteSettings.contactEmail}</p>
            <p>{t("contactBody")}</p>
            <SocialLinks
              settings={siteSettings}
              className="flex flex-wrap gap-3"
              itemClassName="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-3 text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-brand-900"
              labelClassName="sr-only"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
