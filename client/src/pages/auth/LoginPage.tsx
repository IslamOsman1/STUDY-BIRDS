import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton";
import { FormInput } from "../../components/forms/FormInput";
import { Seo } from "../../components/seo/Seo";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { getHomeRouteForRole } from "../../utils/roleHome";
import { SITE_NAME, seoText } from "../../seo/site";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  twoFactorCode: z.string().optional(),
});

type LoginValues = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin, user } = useAuth();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [requiresCode, setRequiresCode] = useState(false);
  const [formError, setFormError] = useState("");
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      navigate(getHomeRouteForRole(user.role, user.permissions), {
        replace: true,
      });
    }
  }, [navigate, user]);

  const onSubmit = async (values: LoginValues) => {
    setFormError("");
    try {
      const user = await login(values.email, values.password, values.twoFactorCode);
      navigate(getHomeRouteForRole(user.role, user.permissions));
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 428) setRequiresCode(true);
      setFormError(getErrorMessage(error, t("authFailed")));
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setFormError("");
    setGoogleSubmitting(true);

    try {
      const user = await googleLogin(credential);
      navigate(getHomeRouteForRole(user.role, user.permissions));
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          language === "ar"
            ? "تعذر تسجيل الدخول عبر Google. حاول مرة أخرى."
            : "Unable to sign in with Google. Please try again."
        )
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl panel p-8">
      <Seo
        title={seoText(language, "Login", "تسجيل الدخول")}
        description={seoText(
          language,
          `Sign in to manage your ${SITE_NAME} profile and applications.`,
          `سجّل الدخول لإدارة ملفك وطلباتك في ${SITE_NAME}.`
        )}
        noIndex
      />
      <h1 className="text-3xl font-semibold text-slate-900">{t("welcomeBack")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {formError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {formError}
          </div>
        ) : null}
        <FormInput label={t("email")} type="email" {...register("email")} error={errors.email?.message} />
        <FormInput label={t("password")} type={showPassword ? "text" : "password"} autoComplete="current-password" {...register("password")} error={errors.password?.message} />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} />{language === "ar" ? "إظهار كلمة المرور" : "Show password"}</label>
          <Link to="/forgot-password" className="font-medium text-brand-700">{language === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}</Link>
        </div>
        {requiresCode ? (
          <FormInput label={language === "ar" ? "رمز التحقق المرسل إلى بريدك" : "Verification code sent to your email"}
            inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required
            {...register("twoFactorCode")} />
        ) : null}
        {requiresCode ? <button type="button" disabled={isSubmitting} className="text-sm text-brand-700 underline" onClick={() => { setRequiresCode(false); setValue("twoFactorCode", ""); setFormError(""); }}>{language === "ar" ? "العودة لبيانات الدخول أو طلب رمز آخر" : "Back to sign-in details or request another code"}</button> : null}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-brand-900 px-5 py-3 font-semibold text-white">
          {isSubmitting ? t("signingIn") : t("login")}
        </button>
      </form>

      {import.meta.env.VITE_GOOGLE_CLIENT_ID ? <>
      <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        <span>{language === "ar" ? "أو" : "Or"}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleSignInButton language={language} onCredential={handleGoogleCredential} />
      </> : null}
      {googleSubmitting ? (
        <p className="mt-3 text-center text-sm text-slate-500">
          {language === "ar" ? "جارٍ تسجيل الدخول عبر Google..." : "Signing in with Google..."}
        </p>
      ) : null}

      <p className="mt-5 text-center text-sm text-slate-600">
        {t("registerPrompt")}{" "}
        <Link to="/register" className="font-semibold text-brand-700">
          {t("register")}
        </Link>
      </p>
    </div>
  );
};
