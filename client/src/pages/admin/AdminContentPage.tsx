import { useEffect, useState, type FormEvent } from "react";
import { Globe2, GraduationCap, MessageSquareQuote, PencilLine, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";
import { adminService } from "../../services/adminService";
import type { Country, SiteSettings, StudyField, Testimonial } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { dt } from "../../utils/dashboardTranslations";

const emptyCountryForm = {
  name: "",
  code: "",
  description: "",
  visaNotes: "",
  heroImage: "",
  featured: false,
};

const emptyTestimonialForm = {
  studentName: "",
  destination: "",
  quote: "",
  rating: "5",
  featured: true,
};

const emptySiteSettingsForm = {
  contactEmail: "",
  whatsappUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  supportHours: "",
  officeLocations: "",
};

const emptyStudyFieldForm = {
  name: "",
  description: "",
  image: "",
  featured: true,
  sortOrder: "0",
};

export const AdminContentPage = () => {
  const { language, t } = useLanguage();
  const [countries, setCountries] = useState<Country[]>([]);
  const [studyFields, setStudyFields] = useState<StudyField[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [siteSettingsForm, setSiteSettingsForm] = useState(emptySiteSettingsForm);
  const [studyFieldForm, setStudyFieldForm] = useState(emptyStudyFieldForm);
  const [countryForm, setCountryForm] = useState(emptyCountryForm);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonialForm);
  const [editingStudyFieldId, setEditingStudyFieldId] = useState<string | null>(null);
  const [editingCountryId, setEditingCountryId] = useState<string | null>(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [uploadingCountryImage, setUploadingCountryImage] = useState(false);
  const [uploadingStudyFieldImage, setUploadingStudyFieldImage] = useState(false);

  const loadData = async () => {
    const [countriesData, studyFieldsData, testimonialsData, siteSettingsData] = await Promise.all([
      adminService.getCountries(),
      adminService.getStudyFields(),
      adminService.getTestimonials(),
      adminService.getSiteSettings(),
    ]);
    setCountries(countriesData);
    setStudyFields(studyFieldsData);
    setTestimonials(testimonialsData);
    setSiteSettingsForm({
      contactEmail: siteSettingsData.contactEmail || "",
      whatsappUrl: siteSettingsData.whatsappUrl || "",
      facebookUrl: siteSettingsData.facebookUrl || "",
      instagramUrl: siteSettingsData.instagramUrl || "",
      tiktokUrl: siteSettingsData.tiktokUrl || "",
      supportHours: siteSettingsData.supportHours || "",
      officeLocations: siteSettingsData.officeLocations || "",
    });
  };

  useEffect(() => {
    loadData().catch((error) => setFormError(getErrorMessage(error, dt(language, "loadContentFailed"))));
  }, [language]);

  const resetCountryForm = () => {
    setEditingCountryId(null);
    setCountryForm(emptyCountryForm);
  };

  const resetStudyFieldForm = () => {
    setEditingStudyFieldId(null);
    setStudyFieldForm(emptyStudyFieldForm);
  };

  const resetTestimonialForm = () => {
    setEditingTestimonialId(null);
    setTestimonialForm(emptyTestimonialForm);
  };

  const submitCountry = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    try {
      if (editingCountryId) {
        await adminService.updateCountry(editingCountryId, countryForm);
      } else {
        await adminService.createCountry(countryForm);
      }
      resetCountryForm();
      await loadData();
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "saveContentFailed")));
    }
  };

  const handleCountryImageUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingCountryImage(true);

    try {
      const imageUrl = await adminService.uploadCountryImage(fileList[0]);
      setCountryForm((current) => ({ ...current, heroImage: imageUrl }));
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "imageUploadFailed")));
    } finally {
      setUploadingCountryImage(false);
    }
  };

  const submitStudyField = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      name: studyFieldForm.name,
      description: studyFieldForm.description || "",
      image: studyFieldForm.image || "",
      featured: studyFieldForm.featured,
      sortOrder: Number(studyFieldForm.sortOrder || 0),
    };

    try {
      if (editingStudyFieldId) {
        await adminService.updateStudyField(editingStudyFieldId, payload);
      } else {
        await adminService.createStudyField(payload);
      }

      resetStudyFieldForm();
      await loadData();
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "saveContentFailed")));
    }
  };

  const handleStudyFieldImageUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingStudyFieldImage(true);

    try {
      const imageUrl = await adminService.uploadStudyFieldImage(fileList[0]);
      setStudyFieldForm((current) => ({ ...current, image: imageUrl }));
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "imageUploadFailed")));
    } finally {
      setUploadingStudyFieldImage(false);
    }
  };

  const submitTestimonial = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    try {
      const payload = { ...testimonialForm, rating: Number(testimonialForm.rating) };
      if (editingTestimonialId) {
        await adminService.updateTestimonial(editingTestimonialId, payload);
      } else {
        await adminService.createTestimonial(payload);
      }
      resetTestimonialForm();
      await loadData();
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "saveContentFailed")));
    }
  };

  const submitSiteSettings = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    try {
      await adminService.updateSiteSettings(siteSettingsForm as SiteSettings);
      await loadData();
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "saveContentFailed")));
    }
  };

  return (
    <div className="space-y-6">
      {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{dt(language, "countriesContent")}</h1>
              <p className="mt-1 text-sm text-slate-500">{dt(language, "countriesHelp")}</p>
            </div>
          </div>
          <form onSubmit={submitCountry} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{t("country")}</span>
                <input value={countryForm.name} onChange={(event) => setCountryForm((current) => ({ ...current, name: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "code")}</span>
                <input value={countryForm.code} onChange={(event) => setCountryForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "description")}</span>
              <textarea value={countryForm.description} onChange={(event) => setCountryForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "visaNotes")}</span>
              <textarea value={countryForm.visaNotes} onChange={(event) => setCountryForm((current) => ({ ...current, visaNotes: event.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700">{language === "ar" ? "غلاف الدولة" : "Country cover image"}</p>
              <input type="file" accept="image/*" onChange={(event) => handleCountryImageUpload(event.target.files)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <p className="mt-2 text-xs text-slate-500">
                {uploadingCountryImage ? `${dt(language, "uploadImages")}...` : language === "ar" ? "ارفع صورة تظهر في بطاقة الدولة داخل الموقع." : "Upload the image shown on the destination card."}
              </p>
              {countryForm.heroImage ? (
                <div className="mt-4 rounded-2xl border border-slate-200 p-3">
                  <img src={getApiAssetUrl(countryForm.heroImage)} alt="Country cover" className="h-36 w-full rounded-2xl object-cover" />
                  <button
                    type="button"
                    onClick={() => setCountryForm((current) => ({ ...current, heroImage: "" }))}
                    className="mt-3 rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700"
                  >
                    {dt(language, "removeImage")}
                  </button>
                </div>
              ) : null}
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
              <input type="checkbox" checked={countryForm.featured} onChange={(event) => setCountryForm((current) => ({ ...current, featured: event.target.checked }))} />
              <span className="text-sm font-medium text-slate-700">{dt(language, "featureDestination")}</span>
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
                <Plus className="h-4 w-4" />
                {editingCountryId ? dt(language, "updateCountry") : dt(language, "createCountry")}
              </button>
              <button type="button" onClick={resetCountryForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
                {dt(language, "clearForm")}
              </button>
            </div>
          </form>
        </section>

        <section className="panel p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <MessageSquareQuote className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{dt(language, "testimonialsContent")}</h1>
              <p className="mt-1 text-sm text-slate-500">{dt(language, "testimonialsHelp")}</p>
            </div>
          </div>
          <form onSubmit={submitTestimonial} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "studentName")}</span>
                <input value={testimonialForm.studentName} onChange={(event) => setTestimonialForm((current) => ({ ...current, studentName: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "destination")}</span>
                <input value={testimonialForm.destination} onChange={(event) => setTestimonialForm((current) => ({ ...current, destination: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
              </label>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "quote")}</span>
              <textarea value={testimonialForm.quote} onChange={(event) => setTestimonialForm((current) => ({ ...current, quote: event.target.value }))} required rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "rating")}</span>
                <input type="number" min="1" max="5" value={testimonialForm.rating} onChange={(event) => setTestimonialForm((current) => ({ ...current, rating: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <input type="checkbox" checked={testimonialForm.featured} onChange={(event) => setTestimonialForm((current) => ({ ...current, featured: event.target.checked }))} />
                <span className="text-sm font-medium text-slate-700">{dt(language, "showFeaturedTestimonial")}</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
                <Plus className="h-4 w-4" />
                {editingTestimonialId ? dt(language, "updateTestimonial") : dt(language, "createTestimonial")}
              </button>
              <button type="button" onClick={resetTestimonialForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
                {dt(language, "clearForm")}
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{language === "ar" ? "مجالات الدراسة" : "Study fields"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {language === "ar"
                ? "أضف التخصصات مع صورة ووصف قصير لتظهر في الصفحة الرئيسية وقائمة البرامج."
                : "Manage the study fields shown on the homepage and in program filters."}
            </p>
          </div>
        </div>
        <form onSubmit={submitStudyField} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "اسم المجال" : "Field name"}</span>
              <input
                value={studyFieldForm.name}
                onChange={(event) => setStudyFieldForm((current) => ({ ...current, name: event.target.value }))}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "الترتيب" : "Sort order"}</span>
              <input
                type="number"
                value={studyFieldForm.sortOrder}
                onChange={(event) => setStudyFieldForm((current) => ({ ...current, sortOrder: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "وصف قصير" : "Short description"}</span>
            <textarea
              value={studyFieldForm.description}
              onChange={(event) => setStudyFieldForm((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700">{language === "ar" ? "صورة المجال" : "Field image"}</p>
            <input type="file" accept="image/*" onChange={(event) => handleStudyFieldImageUpload(event.target.files)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="mt-2 text-xs text-slate-500">
              {uploadingStudyFieldImage
                ? `${dt(language, "uploadImages")}...`
                : language === "ar"
                  ? "ارفع صورة تظهر فوق بطاقة المجال في الصفحة الرئيسية."
                  : "Upload the image shown on the homepage study field card."}
            </p>
            {studyFieldForm.image ? (
              <div className="mt-4 rounded-2xl border border-slate-200 p-3">
                <img src={getApiAssetUrl(studyFieldForm.image)} alt="Study field" className="h-40 w-full rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={() => setStudyFieldForm((current) => ({ ...current, image: "" }))}
                  className="mt-3 rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700"
                >
                  {dt(language, "removeImage")}
                </button>
              </div>
            ) : null}
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="checkbox" checked={studyFieldForm.featured} onChange={(event) => setStudyFieldForm((current) => ({ ...current, featured: event.target.checked }))} />
            <span className="text-sm font-medium text-slate-700">{language === "ar" ? "إظهاره في الواجهة الرئيسية" : "Show on homepage"}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {editingStudyFieldId ? (language === "ar" ? "تحديث المجال" : "Update field") : language === "ar" ? "إضافة مجال" : "Create field"}
            </button>
            <button type="button" onClick={resetStudyFieldForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {dt(language, "clearForm")}
            </button>
          </div>
        </form>
      </section>

      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{language === "ar" ? "روابط التواصل" : "Contact links"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {language === "ar" ? "تحكم في البريد وروابط واتساب وفيسبوك وإنستجرام وتيك توك الظاهرة في الموقع." : "Manage the public email and social links shown across the website."}
            </p>
          </div>
        </div>
        <form onSubmit={submitSiteSettings} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "البريد الإلكتروني" : "Email"}</span>
            <input
              type="email"
              value={siteSettingsForm.contactEmail}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, contactEmail: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">WhatsApp</span>
            <input
              value={siteSettingsForm.whatsappUrl}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, whatsappUrl: event.target.value }))}
              placeholder="https://wa.me/201000000000"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Facebook</span>
            <input
              value={siteSettingsForm.facebookUrl}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, facebookUrl: event.target.value }))}
              placeholder="https://facebook.com/your-page"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Instagram</span>
            <input
              value={siteSettingsForm.instagramUrl}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, instagramUrl: event.target.value }))}
              placeholder="https://instagram.com/your-profile"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">TikTok</span>
            <input
              value={siteSettingsForm.tiktokUrl}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, tiktokUrl: event.target.value }))}
              placeholder="https://tiktok.com/@your-profile"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "مواعيد العمل" : "Support hours"}</span>
            <textarea
              value={siteSettingsForm.supportHours}
              onChange={(event) => setSiteSettingsForm((current) => ({ ...current, supportHours: event.target.value }))}
              rows={3}
              placeholder={language === "ar" ? "السبت إلى الخميس - 10 صباحًا إلى 6 مساءً" : "Saturday to Thursday - 10 AM to 6 PM"}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "مواقع المكاتب" : "Office locations"}</span>
            <textarea
              value={siteSettingsForm.officeLocations}
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

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4">
          {studyFields.map((studyField) => (
            <div key={studyField._id} className="panel p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  {studyField.image ? <img src={getApiAssetUrl(studyField.image)} alt={studyField.name} className="h-40 w-full rounded-3xl object-cover" /> : null}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900">{studyField.name}</p>
                    {studyField.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{dt(language, "featured")}</span> : null}
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {language === "ar" ? `ترتيب ${studyField.sortOrder || 0}` : `Order ${studyField.sortOrder || 0}`}
                    </span>
                  </div>
                  {studyField.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{studyField.description}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditingStudyFieldId(studyField._id);
                      setStudyFieldForm({
                        name: studyField.name,
                        description: studyField.description || "",
                        image: studyField.image || "",
                        featured: Boolean(studyField.featured),
                        sortOrder: String(studyField.sortOrder || 0),
                      });
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                  >
                    <PencilLine className="h-4 w-4" />
                    {dt(language, "edit")}
                  </button>
                  <button onClick={() => adminService.removeStudyField(studyField._id).then(loadData)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
                    <Trash2 className="h-4 w-4" />
                    {dt(language, "delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          {countries.map((country) => (
            <div key={country._id} className="panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900">{country.name}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{country.code}</span>
                    {country.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{dt(language, "featured")}</span> : null}
                  </div>
                  {country.heroImage ? <img src={getApiAssetUrl(country.heroImage)} alt={country.name} className="mt-4 h-32 w-full rounded-2xl object-cover" /> : null}
                  {country.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{country.description}</p> : null}
                  {country.visaNotes ? <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{country.visaNotes}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditingCountryId(country._id);
                      setCountryForm({
                        name: country.name,
                        code: country.code,
                        description: country.description || "",
                        visaNotes: country.visaNotes || "",
                        heroImage: country.heroImage || "",
                        featured: Boolean(country.featured),
                      });
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                  >
                    <PencilLine className="h-4 w-4" />
                    {dt(language, "edit")}
                  </button>
                  <button onClick={() => adminService.removeCountry(country._id).then(loadData)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
                    <Trash2 className="h-4 w-4" />
                    {dt(language, "delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial._id} className="panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-slate-900">{testimonial.studentName}</p>
                    {testimonial.destination ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{testimonial.destination}</span> : null}
                    {testimonial.featured ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{dt(language, "featured")}</span> : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{testimonial.quote}</p>
                  <p className="mt-3 text-xs text-slate-500">{dt(language, "rating")}: {testimonial.rating || 5}/5</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditingTestimonialId(testimonial._id);
                      setTestimonialForm({
                        studentName: testimonial.studentName,
                        destination: testimonial.destination || "",
                        quote: testimonial.quote,
                        rating: String(testimonial.rating || 5),
                        featured: Boolean(testimonial.featured),
                      });
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                  >
                    <PencilLine className="h-4 w-4" />
                    {dt(language, "edit")}
                  </button>
                  <button onClick={() => adminService.removeTestimonial(testimonial._id).then(loadData)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
                    <Trash2 className="h-4 w-4" />
                    {dt(language, "delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};
