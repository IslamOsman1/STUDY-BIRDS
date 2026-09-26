import { useState, type FormEvent } from "react";
import { FormInput } from "../../components/forms/FormInput";
import { authService } from "../../services/authService";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

export const PartnerSettingsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSuccess("");
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError(isArabic ? "تأكيد كلمة المرور غير مطابق." : "Password confirmation does not match.");
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(isArabic ? "تم تحديث كلمة المرور بنجاح." : "Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر تحديث كلمة المرور." : "Unable to update password."));
    }
  };

  return (
    <section className="panel p-8">
      <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "الإعدادات" : "Settings"}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {isArabic ? "حدّث كلمة المرور وإعدادات الأمان الخاصة بحساب الوكيل." : "Update your password and account security settings."}
      </p>
      {success ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-3">
        <FormInput
          label={isArabic ? "كلمة المرور الحالية" : "Current Password"}
          type="password"
          value={form.currentPassword}
          onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))}
        />
        <FormInput
          label={isArabic ? "كلمة المرور الجديدة" : "New Password"}
          type="password"
          value={form.newPassword}
          onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
        />
        <FormInput
          label={isArabic ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
          type="password"
          value={form.confirmPassword}
          onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
        />
        <button type="submit" className="w-fit rounded-full bg-brand-900 px-6 py-3 font-semibold text-white md:col-span-3">
          {isArabic ? "تحديث كلمة المرور" : "Update Password"}
        </button>
      </form>
    </section>
  );
};
