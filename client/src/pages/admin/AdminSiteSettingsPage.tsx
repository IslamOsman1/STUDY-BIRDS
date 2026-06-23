import { useEffect, useState, type FormEvent } from "react";
import { Globe2, Plus } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import { adminService } from "../../services/adminService";
import type { SiteSettings } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { dt } from "../../utils/dashboardTranslations";

const emptySiteSettingsForm: SiteSettings = {
  contactEmail: "",
  whatsappUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  britishMembershipUrl: "",
  supportHours: "",
  officeLocations: "",
};

export const AdminSiteSettingsPage = () => {
  const { language } = useLanguage();
  const [siteSettingsForm, setSiteSettingsForm] = useState<SiteSettings>(emptySiteSettingsForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    adminService
      .getSiteSettings()
      .then((data) => setSiteSettingsForm({ ...emptySiteSettingsForm, ...data }))
      .catch((error) => setFormError(getErrorMessage(error, dt(language, "loadContentFailed"))));
  }, [language]);

  const submitSiteSettings = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    try {
      const payload = {
        contactEmail: siteSettingsForm.contactEmail?.trim() || "",
        whatsappUrl: siteSettingsForm.whatsappUrl?.trim() || "",
        facebookUrl: siteSettingsForm.facebookUrl?.trim() || "",
        instagramUrl: siteSettingsForm.instagramUrl?.trim() || "",
        tiktokUrl: siteSettingsForm.tiktokUrl?.trim() || "",
        britishMembershipUrl: siteSettingsForm.britishMembershipUrl?.trim() || "",
        supportHours: siteSettingsForm.supportHours?.trim() || "",
        officeLocations: siteSettingsForm.officeLocations?.trim() || "",
      };

      const updatedSettings = await adminService.updateSiteSettings(payload);
      setSiteSettingsForm({ ...emptySiteSettingsForm, ...updatedSettings });
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "saveContentFailed")));
    }
  };

  return (
    <div className="space-y-6">
      {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{dt(language, "contactLinksNav")}</h1>
            <p className="mt-1 text-sm text-slate-500">{dt(language, "contactLinksNavDesc")}</p>
          </div>
        </div>

        <form onSubmit={submitSiteSettings} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "البريد الإلكتروني" : "Email"}</span>
            <input
              type="email"
              value={siteSettingsForm.contactEmail || ""}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, contactEmail: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">WhatsApp</span>
            <input
              value={siteSettingsForm.whatsappUrl || ""}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, whatsappUrl: event.target.value }))}
              placeholder="https://wa.me/201000000000"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Facebook</span>
            <input
              value={siteSettingsForm.facebookUrl || ""}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, facebookUrl: event.target.value }))}
              placeholder="https://facebook.com/your-page"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Instagram</span>
            <input
              value={siteSettingsForm.instagramUrl || ""}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, instagramUrl: event.target.value }))}
              placeholder="https://instagram.com/your-profile"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">TikTok</span>
            <input
              value={siteSettingsForm.tiktokUrl || ""}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, tiktokUrl: event.target.value }))}
              placeholder="https://tiktok.com/@your-profile"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "رابط العضوية البريطانية" : "British membership link"}</span>
            <input
              value={siteSettingsForm.britishMembershipUrl || ""}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, britishMembershipUrl: event.target.value }))}
              placeholder="https://example.com/british-membership"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "مواعيد العمل" : "Support hours"}</span>
            <textarea
              value={siteSettingsForm.supportHours || ""}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, supportHours: event.target.value }))}
              rows={3}
              placeholder={language === "ar" ? "السبت إلى الخميس - 10 صباحًا إلى 6 مساءً" : "Saturday to Thursday - 10 AM to 6 PM"}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "مواقع المكاتب" : "Office locations"}</span>
            <textarea
              value={siteSettingsForm.officeLocations || ""}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, officeLocations: event.target.value }))}
              rows={4}
              placeholder={language === "ar" ? "القاهرة - مدينة نصر\nالإسكندرية - سموحة" : "Cairo - Nasr City\nAlexandria - Smouha"}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {language === "ar" ? "حفظ روابط التواصل" : "Save contact links"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
