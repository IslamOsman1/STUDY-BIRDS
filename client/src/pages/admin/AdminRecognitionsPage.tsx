import { useEffect, useState, type FormEvent } from "react";
import { Award, PencilLine, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";
import { adminService } from "../../services/adminService";
import type { Recognition } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { dt } from "../../utils/dashboardTranslations";

const emptyRecognitionForm = {
  title: "",
  image: "",
  link: "",
  featured: true,
  sortOrder: "0",
};

export const AdminRecognitionsPage = () => {
  const { language } = useLanguage();
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [recognitionForm, setRecognitionForm] = useState(emptyRecognitionForm);
  const [editingRecognitionId, setEditingRecognitionId] = useState<string | null>(null);
  const [uploadingRecognitionImage, setUploadingRecognitionImage] = useState(false);
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    const recognitionsData = await adminService.getRecognitions();
    setRecognitions(recognitionsData);
  };

  useEffect(() => {
    loadData().catch((error) => setFormError(getErrorMessage(error, dt(language, "loadContentFailed"))));
  }, [language]);

  const resetRecognitionForm = () => {
    setEditingRecognitionId(null);
    setRecognitionForm(emptyRecognitionForm);
  };

  const handleRecognitionImageUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingRecognitionImage(true);

    try {
      const imageUrl = await adminService.uploadRecognitionImage(fileList[0]);
      setRecognitionForm((current) => ({ ...current, image: imageUrl }));
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "imageUploadFailed")));
    } finally {
      setUploadingRecognitionImage(false);
    }
  };

  const submitRecognition = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      title: recognitionForm.title,
      image: recognitionForm.image || "",
      link: recognitionForm.link || "",
      featured: recognitionForm.featured,
      sortOrder: Number(recognitionForm.sortOrder || 0),
    };

    try {
      if (editingRecognitionId) {
        await adminService.updateRecognition(editingRecognitionId, payload);
      } else {
        await adminService.createRecognition(payload);
      }

      resetRecognitionForm();
      await loadData();
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
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{dt(language, "recognitionsContent")}</h1>
            <p className="mt-1 text-sm text-slate-500">{dt(language, "recognitionsHelp")}</p>
          </div>
        </div>

        <form onSubmit={submitRecognition} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "recognitionTitle")}</span>
              <input
                value={recognitionForm.title}
                onChange={(event) => setRecognitionForm((current) => ({ ...current, title: event.target.value }))}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "الترتيب" : "Sort order"}</span>
              <input
                type="number"
                value={recognitionForm.sortOrder}
                onChange={(event) => setRecognitionForm((current) => ({ ...current, sortOrder: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "recognitionLink")}</span>
            <input
              type="url"
              value={recognitionForm.link}
              onChange={(event) => setRecognitionForm((current) => ({ ...current, link: event.target.value }))}
              placeholder="https://example.com/certificate"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700">{dt(language, "recognitionImage")}</p>
            <input type="file" accept="image/*" onChange={(event) => handleRecognitionImageUpload(event.target.files)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="mt-2 text-xs text-slate-500">
              {uploadingRecognitionImage
                ? `${dt(language, "uploadImages")}...`
                : language === "ar"
                  ? "ارفع صورة الشهادة أو الاعتراف كما ستظهر في الواجهة الرئيسية."
                  : "Upload the certificate or recognition image shown on the homepage."}
            </p>
            {recognitionForm.image ? (
              <div className="mt-4 rounded-2xl border border-slate-200 p-3">
                <img src={getApiAssetUrl(recognitionForm.image)} alt={recognitionForm.title || "Recognition"} className="h-40 w-full rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={() => setRecognitionForm((current) => ({ ...current, image: "" }))}
                  className="mt-3 rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700"
                >
                  {dt(language, "removeImage")}
                </button>
              </div>
            ) : null}
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="checkbox" checked={recognitionForm.featured} onChange={(event) => setRecognitionForm((current) => ({ ...current, featured: event.target.checked }))} />
            <span className="text-sm font-medium text-slate-700">{dt(language, "showFeaturedRecognition")}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {editingRecognitionId ? dt(language, "updateRecognition") : dt(language, "createRecognition")}
            </button>
            <button type="button" onClick={resetRecognitionForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {dt(language, "clearForm")}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {recognitions.map((recognition) => (
          <div key={recognition._id} className="panel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                {recognition.image ? <img src={getApiAssetUrl(recognition.image)} alt={recognition.title} className="h-40 w-full rounded-3xl object-cover" /> : null}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-slate-900">{recognition.title}</p>
                  {recognition.featured ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{dt(language, "featured")}</span> : null}
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {language === "ar" ? `ترتيب ${recognition.sortOrder || 0}` : `Order ${recognition.sortOrder || 0}`}
                  </span>
                </div>
                {recognition.link ? (
                  <a href={recognition.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-medium text-brand-700 hover:text-brand-900">
                    {recognition.link}
                  </a>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setEditingRecognitionId(recognition._id);
                    setRecognitionForm({
                      title: recognition.title,
                      image: recognition.image || "",
                      link: recognition.link || "",
                      featured: Boolean(recognition.featured),
                      sortOrder: String(recognition.sortOrder || 0),
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                >
                  <PencilLine className="h-4 w-4" />
                  {dt(language, "edit")}
                </button>
                <button onClick={() => adminService.removeRecognition(recognition._id).then(loadData)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
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
