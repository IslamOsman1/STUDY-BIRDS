import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PencilLine, Plus, Search, Trash2 } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { KnowledgeBaseItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { AdminConfirmationModal } from "../../components/admin/AdminConfirmationModal";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { AdminToastViewport } from "../../components/admin/AdminToastViewport";
import { useAdminToasts } from "../../hooks/useAdminToasts";

const PAGE_SIZE = 6;

const emptyForm = {
  title: "",
  body: "",
  category: "",
  videoUrl: "",
  sortOrder: "0",
  published: true,
};

export const AdminKnowledgeBaseEnhancedPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeBaseItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toasts, pushToast, dismissToast } = useAdminToasts();

  const loadItems = async () => {
    const data = await adminService.getKnowledgeBase();
    setItems(data);
  };

  useEffect(() => {
    loadItems().catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل قاعدة المعرفة." : "Unable to load knowledge base.")));
  }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => [item.title, item.body, item.category || "", item.videoUrl || ""].join(" ").toLowerCase().includes(normalizedQuery));
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = useMemo(() => filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredItems, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

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
        pushToast(isArabic ? "تم تحديث عنصر المعرفة." : "Knowledge base item updated.", "success");
      } else {
        await adminService.createKnowledgeBaseItem(payload);
        pushToast(isArabic ? "تمت إضافة عنصر جديد." : "Knowledge base item created.", "success");
      }

      resetForm();
      await loadItems();
    } catch (issue) {
      const message = getErrorMessage(issue, isArabic ? "تعذر حفظ العنصر." : "Unable to save the item.");
      setError(message);
      pushToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await adminService.removeKnowledgeBaseItem(deleteTarget._id);
      await loadItems();
      pushToast(isArabic ? "تم حذف عنصر المعرفة." : "Knowledge base item deleted.", "success");
      setDeleteTarget(null);
    } catch (issue) {
      const message = getErrorMessage(issue, isArabic ? "تعذر حذف العنصر." : "Unable to delete the item.");
      setError(message);
      pushToast(message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "إدارة قاعدة المعرفة" : "Knowledge Base"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "أدر المحتوى التدريبي الذي يظهر للوكلاء." : "Manage the training content shown to agents."}</p>
          </div>
          <label className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "بحث" : "Search"}</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "ابحث بالعنوان أو التصنيف أو المحتوى" : "Search by title, category, or content"} className="w-full border-none p-0 outline-none" />
            </div>
          </label>
        </div>
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
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-60">
              <Plus className="h-4 w-4" />
              {submitting ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : editingId ? (isArabic ? "تحديث العنصر" : "Update Item") : isArabic ? "إضافة عنصر" : "Create Item"}
            </button>
            <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </form>
      </section>

      <div className="space-y-4">
        {visibleItems.map((item) => (
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
                <button type="button" onClick={() => setDeleteTarget(item)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
                  <Trash2 className="h-4 w-4" />
                  {isArabic ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          </article>
        ))}
        {filteredItems.length === 0 ? <div className="panel px-6 py-12 text-center text-sm text-slate-500">{isArabic ? "لا توجد عناصر مطابقة." : "No knowledge base items match your search."}</div> : null}
      </div>

      <AdminPagination page={page} totalPages={totalPages} totalItems={filteredItems.length} pageSize={PAGE_SIZE} isArabic={isArabic} onPageChange={setPage} />

      <AdminConfirmationModal
        open={Boolean(deleteTarget)}
        title={isArabic ? "تأكيد حذف العنصر" : "Confirm item deletion"}
        description={isArabic ? `سيتم حذف "${deleteTarget?.title || ""}" نهائيًا.` : `This will permanently delete "${deleteTarget?.title || ""}".`}
        confirmLabel={isArabic ? "نعم، احذف" : "Yes, delete"}
        cancelLabel={isArabic ? "إلغاء" : "Cancel"}
        tone="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => !deleting && setDeleteTarget(null)}
      />
      <AdminToastViewport items={toasts} onDismiss={dismissToast} />
    </div>
  );
};
