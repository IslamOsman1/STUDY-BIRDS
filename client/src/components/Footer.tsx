import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { BRAND_LOGO_PATH, SITE_NAME } from "../seo/site";

export const Footer = () => {
  const { t, language } = useLanguage();
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
          <div className="mt-4 space-y-2 text-sm text-sky-100">
            <p>hello@studybirds.com</p>
            <p>{t("heroSubtitle")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
