import { useEffect, useState, type FormEvent } from "react";
import { MessageSquareQuote, PencilLine, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";
import { adminService } from "../../services/adminService";
import type { Testimonial } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { dt } from "../../utils/dashboardTranslations";

const emptyTestimonialForm = {
  studentName: "",
  destination: "",
  quote: "",
  avatar: "",
  rating: "5",
  featured: true,
};

export const AdminTestimonialsPage = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonialForm);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const loadData = async () => {
    const testimonialsData = await adminService.getTestimonials();
    setTestimonials(testimonialsData);
  };

  useEffect(() => {
    loadData().catch((error) => setFormError(getErrorMessage(error, dt(language, "loadContentFailed"))));
  }, [language]);

  const resetTestimonialForm = () => {
    setEditingTestimonialId(null);
    setTestimonialForm(emptyTestimonialForm);
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

  const handleAvatarUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingAvatar(true);

    try {
      const imageUrl = await adminService.uploadTestimonialAvatar(fileList[0]);
      setTestimonialForm((current) => ({ ...current, avatar: imageUrl }));
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "imageUploadFailed")));
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6">
      {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

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
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700">{language === "ar" ? "صورة الطالب" : "Student photo"}</p>
            <input type="file" accept="image/*" onChange={(event) => handleAvatarUpload(event.target.files)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="mt-2 text-xs text-slate-500">
              {uploadingAvatar ? `${dt(language, "uploadImages")}...` : language === "ar" ? "ارفع صورة الطالب لتظهر في بطاقة الرأي." : "Upload the student's image for the testimonial card."}
            </p>
            {testimonialForm.avatar ? (
              <div className="mt-4 rounded-2xl border border-slate-200 p-3">
                <img src={getApiAssetUrl(testimonialForm.avatar)} alt="Student avatar" className="h-24 w-24 rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={() => setTestimonialForm((current) => ({ ...current, avatar: "" }))}
                  className="mt-3 rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700"
                >
                  {dt(language, "removeImage")}
                </button>
              </div>
            ) : null}
          </div>
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

      <section className="space-y-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial._id} className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {testimonial.avatar ? <img src={getApiAssetUrl(testimonial.avatar)} alt={testimonial.studentName} className="h-12 w-12 rounded-2xl object-cover" /> : null}
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
                      avatar: testimonial.avatar || "",
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
  );
};
