import { useLanguage } from "../../hooks/useLanguage";
import { Seo } from "../../components/seo/Seo";
import { SITE_NAME, seoText } from "../../seo/site";

export const ForgotPasswordPage = () => {
  const { t, language } = useLanguage();

  return (
    <div className="mx-auto max-w-xl panel p-8">
      <Seo
        title={seoText(language, "Forgot Password", "نسيت كلمة المرور")}
        description={seoText(
          language,
          `Password assistance page for ${SITE_NAME} accounts.`,
          `صفحة المساعدة الخاصة بكلمة المرور لحسابات ${SITE_NAME}.`
        )}
        noIndex
      />
      <h1 className="text-3xl font-semibold text-slate-900">{t("forgotPassword")}</h1>
      <p className="mt-4 text-slate-600">{t("forgotPasswordBody")}</p>
    </div>
  );
};
