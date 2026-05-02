import { useEffect, useState, type FormEvent } from "react";
import { Building2, PencilLine, Plus, Trash2 } from "lucide-react";
import { ArticleContentFields } from "../../components/admin/ArticleContentFields";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";
import { adminService } from "../../services/adminService";
import { universityService } from "../../services/universityService";
import type { Country, University } from "../../types";
import { createEmptyArticleBodies, createEmptyArticleHeadings, normalizeArticleBodies, normalizeArticleHeadings } from "../../constants/articleContent";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency } from "../../utils/format";
import { dt } from "../../utils/dashboardTranslations";

const emptyUniversityForm = {
  name: "",
  country: "",
  city: "",
  ranking: "",
  tuitionMin: "",
  tuitionMax: "",
  overview: "",
  articleTitle: "",
  articleHeadings: createEmptyArticleHeadings(),
  articleBodies: createEmptyArticleBodies(),
  featured: false,
  isPartnerInstitution: false,
  logo: "",
  campusImages: [] as string[],
};

export const AdminUniversitiesPage = () => {
  const { language, t, tv } = useLanguage();
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyUniversityForm);
  const [formError, setFormError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const loadData = async () => {
    const [universitiesData, countriesData] = await Promise.all([universityService.getAll(), adminService.getCountries()]);
    setUniversities(universitiesData);
    setCountries(countriesData);
  };

  useEffect(() => {
    loadData().catch((error) => setFormError(getErrorMessage(error, dt(language, "loadUniversitiesFailed"))));
  }, [language]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyUniversityForm);
  };

  const startEdit = (university: University) => {
    setEditingId(university._id);
    setForm({
      name: university.name || "",
      country: university.country?._id || "",
      city: university.city || "",
      ranking: university.ranking ? String(university.ranking) : "",
      tuitionMin: university.tuitionRange?.min ? String(university.tuitionRange.min) : "",
      tuitionMax: university.tuitionRange?.max ? String(university.tuitionRange.max) : "",
      overview: university.overview || "",
      articleTitle: university.articleTitle || "",
      articleHeadings: normalizeArticleHeadings(university.articleHeadings),
      articleBodies: normalizeArticleBodies(university.articleBodies),
      featured: Boolean(university.featured),
      isPartnerInstitution: Boolean(university.isPartnerInstitution),
      logo: university.logo || "",
      campusImages: university.campusImages || [],
    });
  };

  const handleLogoUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingLogo(true);
    try {
      const urls = await universityService.uploadImages([fileList[0]]);
      setForm((current) => ({ ...current, logo: urls[0] || "" }));
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "imageUploadFailed")));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleGalleryUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingGallery(true);
    try {
      const urls = await universityService.uploadImages(Array.from(fileList));
      setForm((current) => ({ ...current, campusImages: [...current.campusImages, ...urls] }));
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "imageUploadFailed")));
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      name: form.name,
      country: form.country,
      city: form.city || undefined,
      ranking: form.ranking ? Number(form.ranking) : undefined,
      overview: form.overview || undefined,
      articleTitle: form.articleTitle.trim() || undefined,
      articleHeadings: form.articleHeadings.map((item) => item.trim()).filter(Boolean),
      articleBodies: form.articleBodies.map((item) => item.trim()).filter(Boolean),
      featured: form.featured,
      isPartnerInstitution: form.isPartnerInstitution,
      logo: form.logo || undefined,
      campusImages: form.campusImages,
      tuitionRange: {
        min: form.tuitionMin ? Number(form.tuitionMin) : undefined,
        max: form.tuitionMax ? Number(form.tuitionMax) : undefined,
      },
    };

    try {
      if (editingId) {
        await universityService.update(editingId, payload);
      } else {
        await universityService.create(payload);
      }
      resetForm();
      await loadData();
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "saveUniversityFailed")));
    }
  };

  const handleDelete = async (id: string) => {
    setFormError("");
    try {
      await universityService.remove(id);
      setUniversities((current) => current.filter((item) => item._id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "deleteUniversityFailed")));
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr] 2xl:grid-cols-[1.6fr_0.7fr]">
      <section className="panel p-7 2xl:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{dt(language, "universityManagement")}</h1>
            <p className="mt-1 text-sm text-slate-500">{dt(language, "universityHelp")}</p>
          </div>
        </div>
        {formError ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "universityName")}</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("country")}</span>
              <select value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring">
                <option value="">{dt(language, "selectCountry")}</option>
                {countries.map((country) => (
                  <option key={country._id} value={country._id}>
                    {tv(country.name)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("city")}</span>
              <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("ranking")}</span>
              <input type="number" value={form.ranking} onChange={(event) => setForm((current) => ({ ...current, ranking: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "partnerInstitution")}</span>
              <select value={form.isPartnerInstitution ? "yes" : "no"} onChange={(event) => setForm((current) => ({ ...current, isPartnerInstitution: event.target.value === "yes" }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring">
                <option value="no">{dt(language, "no")}</option>
                <option value="yes">{dt(language, "yes")}</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "minTuition")}</span>
              <input type="number" value={form.tuitionMin} onChange={(event) => setForm((current) => ({ ...current, tuitionMin: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "maxTuition")}</span>
              <input type="number" value={form.tuitionMax} onChange={(event) => setForm((current) => ({ ...current, tuitionMax: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "overviewText")}</span>
            <textarea value={form.overview} onChange={(event) => setForm((current) => ({ ...current, overview: event.target.value }))} rows={5} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>

          <ArticleContentFields
            articleTitle={form.articleTitle}
            articleHeadings={form.articleHeadings}
            articleBodies={form.articleBodies}
            onArticleTitleChange={(value) => setForm((current) => ({ ...current, articleTitle: value }))}
            onArticleHeadingChange={(index, value) =>
              setForm((current) => ({
                ...current,
                articleHeadings: current.articleHeadings.map((item, itemIndex) => (itemIndex === index ? value : item)),
              }))
            }
            onArticleBodyChange={(index, value) =>
              setForm((current) => ({
                ...current,
                articleBodies: current.articleBodies.map((item, itemIndex) => (itemIndex === index ? value : item)),
              }))
            }
            language={language}
          />

          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700">{dt(language, "imageUploadHelp")}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "universityLogo")}</span>
                <input type="file" accept="image/*" onChange={(event) => handleLogoUpload(event.target.files)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <p className="mt-2 text-xs text-slate-500">{uploadingLogo ? `${dt(language, "uploadImages")}...` : dt(language, "logoPreview")}</p>
                {form.logo ? (
                  <div className="mt-3 rounded-2xl border border-slate-200 p-3">
                    <img src={getApiAssetUrl(form.logo)} alt="University logo" className="h-20 w-20 rounded-2xl object-cover" />
                  </div>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "campusImages")}</span>
                <input type="file" accept="image/*" multiple onChange={(event) => handleGalleryUpload(event.target.files)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                <p className="mt-2 text-xs text-slate-500">{uploadingGallery ? `${dt(language, "uploadImages")}...` : dt(language, "galleryPreview")}</p>
              </label>
            </div>
            {form.campusImages.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {form.campusImages.map((imageUrl) => (
                  <div key={imageUrl} className="rounded-2xl border border-slate-200 p-3">
                    <img src={getApiAssetUrl(imageUrl)} alt="Campus" className="h-28 w-full rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, campusImages: current.campusImages.filter((item) => item !== imageUrl) }))}
                      className="mt-3 rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700"
                    >
                      {dt(language, "removeImage")}
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
            <span className="text-sm font-medium text-slate-700">{dt(language, "featureUniversity")}</span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {editingId ? dt(language, "updateUniversity") : dt(language, "createUniversity")}
            </button>
            <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {dt(language, "clearForm")}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4 xl:max-h-[calc(100vh-10rem)] xl:overflow-y-auto xl:pr-1">
        {universities.map((university) => (
          <div key={university._id} className="panel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-semibold text-slate-900">{university.name}</p>
                  {university.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{dt(language, "featured")}</span> : null}
                  {university.isPartnerInstitution ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{dt(language, "partner")}</span> : null}
                </div>
                {university.logo ? <img src={getApiAssetUrl(university.logo)} alt="University logo" className="mt-4 h-16 w-16 rounded-2xl object-cover" /> : null}
                <p className="mt-2 text-sm text-slate-500">
                  {tv(university.country?.name)}
                  {university.city ? ` - ${university.city}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{dt(language, "rankingLabel")}: {university.ranking || dt(language, "notAvailable")}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {dt(language, "tuitionLabel")}: {formatCurrency(university.tuitionRange?.min)} - {formatCurrency(university.tuitionRange?.max)}
                  </span>
                </div>
                {university.overview ? <p className="mt-4 text-sm leading-6 text-slate-600">{university.overview}</p> : null}
                {university.campusImages?.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {university.campusImages.slice(0, 4).map((imageUrl) => (
                      <img key={imageUrl} src={getApiAssetUrl(imageUrl)} alt="Campus" className="h-28 w-full rounded-2xl object-cover" />
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => startEdit(university)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700">
                  <PencilLine className="h-4 w-4" />
                  {dt(language, "edit")}
                </button>
                <button onClick={() => handleDelete(university._id)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
                  <Trash2 className="h-4 w-4" />
                  {dt(language, "delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
