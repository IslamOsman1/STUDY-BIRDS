import { useEffect, useState, type FormEvent } from "react";
import { BookOpenText, PencilLine, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";
import { adminService } from "../../services/adminService";
import { programService } from "../../services/programService";
import { universityService } from "../../services/universityService";
import type { Program, StudyField, University } from "../../types";
import {
  PROGRAM_DEGREE_LEVELS,
  PROGRAM_INTAKES,
} from "../../constants/programOptions";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency, formatDate } from "../../utils/format";
import { dt } from "../../utils/dashboardTranslations";

const emptyProgramForm = {
  title: "",
  university: "",
  degreeLevel: "",
  fieldOfStudy: "",
  duration: "",
  tuition: "",
  partnerTuition: "",
  intake: "",
  applicationDeadline: "",
  popularity: "",
  summary: "",
  requirements: "",
  featured: false,
  coverImage: "",
};

export const AdminProgramsPage = () => {
  const { language, t } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [studyFields, setStudyFields] = useState<StudyField[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProgramForm);
  const [formError, setFormError] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  const loadData = async () => {
    const [programsData, universitiesData, studyFieldsData] = await Promise.all([
      programService.getAll(),
      universityService.getAll(),
      adminService.getStudyFields(),
    ]);
    setPrograms(programsData);
    setUniversities(universitiesData);
    setStudyFields(studyFieldsData);
  };

  useEffect(() => {
    loadData().catch((error) => setFormError(getErrorMessage(error, dt(language, "loadProgramsFailed"))));
  }, [language]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyProgramForm);
  };

  const startEdit = (program: Program) => {
    setEditingId(program._id);
    setForm({
      title: program.title || "",
      university: program.university?._id || "",
      degreeLevel: program.degreeLevel || "",
      fieldOfStudy: program.fieldOfStudy || "",
      duration: program.duration || "",
      tuition: typeof program.tuition === "number" ? String(program.tuition) : "",
      partnerTuition: typeof program.partnerTuition === "number" ? String(program.partnerTuition) : "",
      intake: program.intake || "",
      applicationDeadline: program.applicationDeadline ? new Date(program.applicationDeadline).toISOString().slice(0, 10) : "",
      popularity: typeof program.popularity === "number" ? String(program.popularity) : "",
      summary: program.summary || "",
      requirements: program.requirements?.join("\n") || "",
      featured: Boolean(program.featured),
      coverImage: program.coverImage || "",
    });
  };

  const handleCoverUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingCover(true);
    try {
      const coverImage = await programService.uploadCoverImage(fileList[0]);
      setForm((current) => ({ ...current, coverImage }));
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "imageUploadFailed")));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      title: form.title,
      university: form.university,
      degreeLevel: form.degreeLevel,
      fieldOfStudy: form.fieldOfStudy,
      duration: form.duration || undefined,
      tuition: form.tuition ? Number(form.tuition) : undefined,
      partnerTuition: form.partnerTuition ? Number(form.partnerTuition) : undefined,
      intake: form.intake || undefined,
      applicationDeadline: form.applicationDeadline || undefined,
      popularity: form.popularity ? Number(form.popularity) : undefined,
      summary: form.summary || undefined,
      requirements: form.requirements.split("\n").map((item) => item.trim()).filter(Boolean),
      featured: form.featured,
      coverImage: form.coverImage || undefined,
    };

    try {
      if (editingId) {
        await programService.update(editingId, payload);
      } else {
        await programService.create(payload);
      }
      resetForm();
      await loadData();
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "saveProgramFailed")));
    }
  };

  const handleDelete = async (id: string) => {
    setFormError("");
    try {
      await programService.remove(id);
      setPrograms((current) => current.filter((item) => item._id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "deleteProgramFailed")));
    }
  };

  const studyFieldOptions =
    form.fieldOfStudy && !studyFields.some((studyField) => studyField.name === form.fieldOfStudy)
      ? [{ _id: "current-study-field", name: form.fieldOfStudy }, ...studyFields]
      : studyFields;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <BookOpenText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{dt(language, "programCatalogControl")}</h1>
            <p className="mt-1 text-sm text-slate-500">{dt(language, "programCatalogHelp")}</p>
          </div>
        </div>
        {formError ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "programTitle")}</span>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("university")}</span>
              <select value={form.university} onChange={(event) => setForm((current) => ({ ...current, university: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring">
                <option value="">{dt(language, "selectUniversity")}</option>
                {universities.map((university) => (
                  <option key={university._id} value={university._id}>
                    {university.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "degreeLevel")}</span>
              <select value={form.degreeLevel} onChange={(event) => setForm((current) => ({ ...current, degreeLevel: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring">
                <option value="">{dt(language, "bachelorMasterDiploma")}</option>
                {PROGRAM_DEGREE_LEVELS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.translationKey)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("fieldOfStudy")}</span>
              <select value={form.fieldOfStudy} onChange={(event) => setForm((current) => ({ ...current, fieldOfStudy: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring">
                <option value="">{language === "ar" ? "اختر مجال الدراسة" : "Select field of study"}</option>
                {studyFieldOptions.map((studyField) => (
                  <option key={studyField._id} value={studyField.name}>
                    {studyField.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "duration")}</span>
              <input value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} placeholder={dt(language, "fourYears")} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("intake")}</span>
              <select value={form.intake} onChange={(event) => setForm((current) => ({ ...current, intake: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring">
                <option value="">{dt(language, "fall2026")}</option>
                {PROGRAM_INTAKES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.translationKey)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t("tuition")}</span>
              <input type="number" value={form.tuition} onChange={(event) => setForm((current) => ({ ...current, tuition: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "deadline")}</span>
              <input type="date" value={form.applicationDeadline} onChange={(event) => setForm((current) => ({ ...current, applicationDeadline: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "popularity")}</span>
              <input type="number" value={form.popularity} onChange={(event) => setForm((current) => ({ ...current, popularity: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "partnerTuition")}</span>
              <input type="number" value={form.partnerTuition} onChange={(event) => setForm((current) => ({ ...current, partnerTuition: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "programCoverImage")}</span>
              <input type="file" accept="image/*" onChange={(event) => handleCoverUpload(event.target.files)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring" />
              <p className="mt-2 text-xs text-slate-500">{uploadingCover ? `${dt(language, "uploadImages")}...` : dt(language, "coverPreview")}</p>
            </label>
          </div>

          {form.coverImage ? (
            <div className="rounded-2xl border border-slate-200 p-4">
              <img src={getApiAssetUrl(form.coverImage)} alt="Program cover" className="h-44 w-full rounded-2xl object-cover" />
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, coverImage: "" }))}
                className="mt-3 rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700"
              >
                {dt(language, "removeImage")}
              </button>
            </div>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "summary")}</span>
            <textarea value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "requirements")}</span>
            <textarea value={form.requirements} onChange={(event) => setForm((current) => ({ ...current, requirements: event.target.value }))} rows={4} placeholder={dt(language, "oneRequirementPerLine")} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
            <span className="text-sm font-medium text-slate-700">{dt(language, "featureProgram")}</span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {editingId ? dt(language, "updateProgram") : dt(language, "createProgram")}
            </button>
            <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {dt(language, "clearForm")}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {programs.map((program) => (
          <div key={program._id} className="panel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                {program.coverImage ? (
                  <img src={getApiAssetUrl(program.coverImage)} alt={program.title} className="mb-4 h-40 w-full rounded-3xl object-cover" />
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xl font-semibold text-slate-900">{program.title}</p>
                  {program.featured ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{dt(language, "featured")}</span> : null}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {program.university?.name || dt(language, "unknownUniversity")} - {program.degreeLevel} - {program.fieldOfStudy}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{dt(language, "tuitionLabel")}: {formatCurrency(program.tuition)}</span>
                  {typeof program.partnerTuition === "number" ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{dt(language, "partnerTuition")}: {formatCurrency(program.partnerTuition)}</span>
                  ) : null}
                  <span className="rounded-full bg-slate-100 px-3 py-1">{dt(language, "deadline")}: {formatDate(program.applicationDeadline)}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{dt(language, "programIntake")}: {program.intake || dt(language, "flexible")}</span>
                </div>
                {program.summary ? <p className="mt-4 text-sm leading-6 text-slate-600">{program.summary}</p> : null}
                {program.requirements?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {program.requirements.map((requirement) => (
                      <span key={requirement} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                        {requirement}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => startEdit(program)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700">
                  <PencilLine className="h-4 w-4" />
                  {dt(language, "edit")}
                </button>
                <button onClick={() => handleDelete(program._id)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
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
