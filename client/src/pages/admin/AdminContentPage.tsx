import { useEffect, useState, type FormEvent } from "react";
import { Globe2, GraduationCap, PencilLine, Plus, Trash2 } from "lucide-react";
import { ArticleContentFields } from "../../components/admin/ArticleContentFields";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";
import { adminService } from "../../services/adminService";
import type { Country, StudyField } from "../../types";
import { createEmptyArticleBodies, createEmptyArticleHeadings, normalizeArticleBodies, normalizeArticleHeadings } from "../../constants/articleContent";
import { getErrorMessage } from "../../utils/errors";
import { dt } from "../../utils/dashboardTranslations";

const emptyCountryForm = {
  name: "",
  code: "",
  description: "",
  visaNotes: "",
  heroImage: "",
  universityCount: "0",
  specialtyCount: "0",
  averageTuition: "0",
  articleTitle: "",
  articleTitleColor: "#0f172a",
  articleHeadingColor: "#0f172a",
  articleBodyColor: "#475569",
  articleHeadings: createEmptyArticleHeadings(),
  articleBodies: createEmptyArticleBodies(),
  featured: false,
};

const emptyStudyFieldForm = {
  name: "",
  description: "",
  image: "",
  featured: true,
  sortOrder: "0",
};

const appendArticleItem = (items: string[]) => [...items, ""];
const removeArticleItem = (items: string[], index: number) => (items.length > 1 ? items.filter((_, itemIndex) => itemIndex !== index) : items);

export const AdminContentPage = () => {
  const { language, t } = useLanguage();
  const [countries, setCountries] = useState<Country[]>([]);
  const [studyFields, setStudyFields] = useState<StudyField[]>([]);
  const [studyFieldForm, setStudyFieldForm] = useState(emptyStudyFieldForm);
  const [countryForm, setCountryForm] = useState(emptyCountryForm);
  const [editingStudyFieldId, setEditingStudyFieldId] = useState<string | null>(null);
  const [editingCountryId, setEditingCountryId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [uploadingCountryImage, setUploadingCountryImage] = useState(false);
  const [uploadingStudyFieldImage, setUploadingStudyFieldImage] = useState(false);

  const loadData = async () => {
    const [countriesData, studyFieldsData] = await Promise.all([adminService.getCountries(), adminService.getStudyFields()]);
    setCountries(countriesData);
    setStudyFields(studyFieldsData);
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

  const submitCountry = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    try {
      const payload = {
        ...countryForm,
        universityCount: Number(countryForm.universityCount || 0),
        specialtyCount: Number(countryForm.specialtyCount || 0),
        averageTuition: Number(countryForm.averageTuition || 0),
        articleTitle: countryForm.articleTitle.trim(),
        articleTitleColor: countryForm.articleTitleColor || "#0f172a",
        articleHeadingColor: countryForm.articleHeadingColor || "#0f172a",
        articleBodyColor: countryForm.articleBodyColor || "#475569",
        articleHeadings: countryForm.articleHeadings.map((item) => item.trim()).filter(Boolean),
        articleBodies: countryForm.articleBodies.map((item) => item.trim()).filter(Boolean),
      };

      if (editingCountryId) {
        await adminService.updateCountry(editingCountryId, payload);
      } else {
        await adminService.createCountry(payload);
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

  return (
    <div className="space-y-6">
      {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <div className="grid gap-6">
        <section className="panel p-7">
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
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "??? ????????" : "Universities count"}</span>
                <input type="number" min="0" value={countryForm.universityCount} onChange={(event) => setCountryForm((current) => ({ ...current, universityCount: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "??? ????????" : "Specialties count"}</span>
                <input type="number" min="0" value={countryForm.specialtyCount} onChange={(event) => setCountryForm((current) => ({ ...current, specialtyCount: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "????? ???????" : "Average tuition"}</span>
                <input type="number" min="0" value={countryForm.averageTuition} onChange={(event) => setCountryForm((current) => ({ ...current, averageTuition: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
              </label>
            </div>
            <ArticleContentFields
              articleTitle={countryForm.articleTitle}
              articleTitleColor={countryForm.articleTitleColor}
              articleHeadingColor={countryForm.articleHeadingColor}
              articleBodyColor={countryForm.articleBodyColor}
              articleHeadings={countryForm.articleHeadings}
              articleBodies={countryForm.articleBodies}
              onArticleTitleChange={(value) => setCountryForm((current) => ({ ...current, articleTitle: value }))}
              onArticleTitleColorChange={(value) => setCountryForm((current) => ({ ...current, articleTitleColor: value }))}
              onArticleHeadingColorChange={(value) => setCountryForm((current) => ({ ...current, articleHeadingColor: value }))}
              onArticleBodyColorChange={(value) => setCountryForm((current) => ({ ...current, articleBodyColor: value }))}
              onArticleHeadingChange={(index, value) =>
                setCountryForm((current) => ({
                  ...current,
                  articleHeadings: current.articleHeadings.map((item, itemIndex) => (itemIndex === index ? value : item)),
                }))
              }
              onArticleBodyChange={(index, value) =>
                setCountryForm((current) => ({
                  ...current,
                  articleBodies: current.articleBodies.map((item, itemIndex) => (itemIndex === index ? value : item)),
                }))
              }
              onAddArticleItem={() =>
                setCountryForm((current) => ({
                  ...current,
                  articleHeadings: appendArticleItem(current.articleHeadings),
                  articleBodies: appendArticleItem(current.articleBodies),
                }))
              }
              onRemoveArticleItem={(index) =>
                setCountryForm((current) => ({
                  ...current,
                  articleHeadings: removeArticleItem(current.articleHeadings, index),
                  articleBodies: removeArticleItem(current.articleBodies, index),
                }))
              }
              language={language}
            />
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700">{language === "ar" ? "???? ??????" : "Country cover image"}</p>
              <input type="file" accept="image/*" onChange={(event) => handleCountryImageUpload(event.target.files)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
              <p className="mt-2 text-xs text-slate-500">
                {uploadingCountryImage ? `${dt(language, "uploadImages")}...` : language === "ar" ? "???? ???? ???? ?? ????? ?????? ???? ??????." : "Upload the image shown on the destination card."}
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
      </div>

      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{language === "ar" ? "?????? ???????" : "Study fields"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {language === "ar" ? "??? ???????? ?? ???? ???? ???? ????? ?? ?????? ???????? ?????? ???????." : "Manage the study fields shown on the homepage and in program filters."}
            </p>
          </div>
        </div>
        <form onSubmit={submitStudyField} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "??? ??????" : "Field name"}</span>
              <input
                value={studyFieldForm.name}
                onChange={(event) => setStudyFieldForm((current) => ({ ...current, name: event.target.value }))}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "???????" : "Sort order"}</span>
              <input
                type="number"
                value={studyFieldForm.sortOrder}
                onChange={(event) => setStudyFieldForm((current) => ({ ...current, sortOrder: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "??? ????" : "Short description"}</span>
            <textarea
              value={studyFieldForm.description}
              onChange={(event) => setStudyFieldForm((current) => ({ ...current, description: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700">{language === "ar" ? "???? ??????" : "Field image"}</p>
            <input type="file" accept="image/*" onChange={(event) => handleStudyFieldImageUpload(event.target.files)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="mt-2 text-xs text-slate-500">
              {uploadingStudyFieldImage
                ? `${dt(language, "uploadImages")}...`
                : language === "ar"
                  ? "???? ???? ???? ??? ????? ?????? ?? ?????? ????????."
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
            <span className="text-sm font-medium text-slate-700">{language === "ar" ? "?????? ?? ??????? ????????" : "Show on homepage"}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {editingStudyFieldId ? (language === "ar" ? "????? ??????" : "Update field") : language === "ar" ? "????? ????" : "Create field"}
            </button>
            <button type="button" onClick={resetStudyFieldForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {dt(language, "clearForm")}
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
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{language === "ar" ? `????? ${studyField.sortOrder || 0}` : `Order ${studyField.sortOrder || 0}`}</span>
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
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{language === "ar" ? `???????? ${country.universityCount || 0}` : `Universities ${country.universityCount || 0}`}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{language === "ar" ? `???????? ${country.specialtyCount || 0}` : `Specialties ${country.specialtyCount || 0}`}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{language === "ar" ? `????? ?????? ${country.averageTuition || 0}$` : `Avg tuition $${country.averageTuition || 0}`}</span>
                  </div>
                  {country.visaNotes ? <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{country.visaNotes}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const articleItemCount = Math.max(1, country.articleHeadings?.length || 0, country.articleBodies?.length || 0);
                      setEditingCountryId(country._id);
                      setCountryForm({
                        name: country.name,
                        code: country.code,
                        description: country.description || "",
                        visaNotes: country.visaNotes || "",
                        heroImage: country.heroImage || "",
                        universityCount: String(country.universityCount || 0),
                        specialtyCount: String(country.specialtyCount || 0),
                        averageTuition: String(country.averageTuition || 0),
                        articleTitle: country.articleTitle || "",
                        articleTitleColor: country.articleTitleColor || "#0f172a",
                        articleHeadingColor: country.articleHeadingColor || "#0f172a",
                        articleBodyColor: country.articleBodyColor || "#475569",
                        articleHeadings: normalizeArticleHeadings(country.articleHeadings, articleItemCount),
                        articleBodies: normalizeArticleBodies(country.articleBodies, articleItemCount),
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
      </div>
    </div>
  );
};
