import { useEffect, useState, type FormEvent } from "react";
import { Download, PencilLine, Plus, Trash2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { MarketingAssetItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

const emptyForm = {
  title: "",
  description: "",
  type: "",
  published: true,
};

export const AdminMarketingAssetsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<MarketingAssetItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadItems = async () => {
    const data = await adminService.getMarketingAssets();
    setItems(data);
  };

  useEffect(() => {
    loadItems().catch((issue) =>
      setError(getErrorMessage(issue, isArabic ? "تعذر تحميل المواد التسويقية." : "Unable to load marketing assets."))
    );
  }, [isArabic]);

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setEditingId("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (editingId) {
        await adminService.updateMarketingAsset(editingId, form);
      } else {
        if (!file) {
          throw new Error(isArabic ? "يرجى اختيار ملف." : "Please choose a file.");
        }
        await adminService.createMarketingAsset({
          title: form.title,
          description: form.description,
          type: form.type,
          published: form.published,
          file,
        });
      }
      resetForm();
      await loadItems();
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر حفظ العنصر." : "Unable to save the asset."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "إدارة المواد التسويقية" : "Marketing Assets"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "ارفع الملفات التي تظهر داخل Marketing Toolkit للوكلاء." : "Upload and manage files available in the agent marketing toolkit."}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "اسم الملف" : "Title"}</span>
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "النوع" : "Type"}</span>
            <input value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "الوصف" : "Description"}</span>
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
          </label>
          {!editingId ? (
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "الملف" : "File"}</span>
              <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring" />
            </label>
          ) : null}
          <label className="flex items-center gap-3 md:col-span-2">
            <input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} />
            <span className="text-sm font-medium text-slate-700">{isArabic ? "نشر الملف للوكلاء" : "Publish for agents"}</span>
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {submitting ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : editingId ? (isArabic ? "تحديث الملف" : "Update Asset") : isArabic ? "إضافة ملف" : "Create Asset"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </section>

      <div className="grid gap-4">
        {items.map((item) => (
          <article key={item._id} className="panel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.type}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {item.published ? (isArabic ? "منشور" : "Published") : isArabic ? "مخفي" : "Hidden"}
                  </span>
                </div>
                {item.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p> : null}
                <div className="mt-3 text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "--"}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700">
                  <Download className="h-4 w-4" />
                  {isArabic ? "فتح" : "Open"}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item._id);
                    setForm({
                      title: item.title,
                      description: item.description || "",
                      type: item.type,
                      published: Boolean(item.published),
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                >
                  <PencilLine className="h-4 w-4" />
                  {isArabic ? "تعديل" : "Edit"}
                </button>
                <button type="button" onClick={() => adminService.removeMarketingAsset(item._id).then(loadItems)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
                  <Trash2 className="h-4 w-4" />
                  {isArabic ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
