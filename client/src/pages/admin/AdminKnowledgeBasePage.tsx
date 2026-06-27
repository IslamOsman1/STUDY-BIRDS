import { useEffect, useState, type FormEvent } from "react";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { KnowledgeBaseItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

const emptyForm = {
  title: "",
  body: "",
  category: "",
  videoUrl: "",
  sortOrder: "0",
  published: true,
};

export const AdminKnowledgeBasePage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");

  const loadItems = async () => {
    const data = await adminService.getKnowledgeBase();
    setItems(data);
  };

  useEffect(() => {
    loadItems().catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل قاعدة المعرفة." : "Unable to load knowledge base.")));
  }, [isArabic]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        title: form.title,
        body: form.body,
        category: form.category,
        videoUrl: form.videoUrl,
        sortOrder: Number(form.sortOrder || 0),
        published: form.published,
      };
      if (editingId) {
        await adminService.updateKnowledgeBaseItem(editingId, payload);
      } else {
        await adminService.createKnowledgeBaseItem(payload);
      }
      resetForm();
      await loadItems();
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر حفظ العنصر." : "Unable to save the item."));
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "إدارة قاعدة المعرفة" : "Knowledge Base"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "أدر المحتوى التدريبي الذي يظهر للوكلاء." : "Manage the training content shown to agents."}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "العنوان" : "Title"}</span>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "التصنيف" : "Category"}</span>
              <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
            </label>
          </div>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "الرابط المرئي" : "Video URL"}</span>
            <input value={form.videoUrl} onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "المحتوى" : "Body"}</span>
            <textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} rows={6} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "الترتيب" : "Sort Order"}</span>
              <input type="number" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="flex items-center gap-3 pt-9">
              <input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} />
              <span className="text-sm font-medium text-slate-700">{isArabic ? "نشر المحتوى" : "Publish item"}</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {editingId ? (isArabic ? "تحديث العنصر" : "Update Item") : isArabic ? "إضافة عنصر" : "Create Item"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </section>

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item._id} className="panel p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.category || "general"}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {item.published ? (isArabic ? "منشور" : "Published") : isArabic ? "مخفي" : "Hidden"}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{item.body}</p>
                {item.videoUrl ? <a href={item.videoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:underline">{item.videoUrl}</a> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item._id);
                    setForm({
                      title: item.title,
                      body: item.body,
                      category: item.category || "",
                      videoUrl: item.videoUrl || "",
                      sortOrder: String(item.sortOrder || 0),
                      published: Boolean(item.published),
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                >
                  <PencilLine className="h-4 w-4" />
                  {isArabic ? "تعديل" : "Edit"}
                </button>
                <button type="button" onClick={() => adminService.removeKnowledgeBaseItem(item._id).then(loadItems)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
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
