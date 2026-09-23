import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

type Post = {
  _id: string; title: string; body: string; status: string; commentCount: number; createdAt: string;
  author?: { name: string; email: string }; moderationNote?: string;
};

export const AdminCommunityPage = () => {
  const { language } = useLanguage();
  const ar = language === "ar";
  const t = (a: string, b: string) => (ar ? a : b);
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const button = "rounded-xl px-3 py-1.5 text-sm";

  async function load() {
    setLoading(true);
    try { setPosts((await api.get<Post[]>(`/admin/community-posts${statusFilter ? `?status=${statusFilter}` : ""}`)).data); }
    catch (e) { setError(getErrorMessage(e, t("تعذر تحميل المواضيع", "Unable to load posts"))); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [statusFilter]);

  async function moderate(post: Post, status: string) {
    setBusy(true);
    try { await api.patch(`/admin/community-posts/${post._id}`, { status }); await load(); }
    catch (e) { setError(getErrorMessage(e, t("تعذر تحديث الحالة", "Unable to update status"))); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6" dir={ar ? "rtl" : "ltr"}>
    <h1 className="text-2xl font-bold">{t("إشراف مجتمع الطلاب", "Student Community Moderation")}</h1>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}
    <div className="flex gap-2">
      {["", "published", "hidden"].map((s) => <button key={s} className={`${button} ${statusFilter === s ? "bg-brand-primary text-white" : "border border-slate-300"}`} onClick={() => setStatusFilter(s)}>
        {s === "" ? t("الكل", "All") : s === "published" ? t("منشور", "Published") : t("مخفي", "Hidden")}
      </button>)}
    </div>
    {loading ? <p>{t("جارٍ التحميل…", "Loading…")}</p> : !posts.length && <p>{t("لا توجد مواضيع", "No posts")}</p>}
    <div className="space-y-3">
      {posts.map((p) => <article key={p._id} className="rounded-2xl border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">{p.title}</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{p.status === "published" ? t("منشور", "Published") : t("مخفي", "Hidden")}</span>
        </div>
        <p className="mt-2 text-sm text-slate-600">{p.author?.name} — {p.author?.email}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{p.body}</p>
        <div className="mt-3 flex gap-2">
          {p.status === "published"
            ? <button className={`${button} border border-red-300 text-red-700`} disabled={busy} onClick={() => void moderate(p, "hidden")}>{t("إخفاء", "Hide")}</button>
            : <button className={`${button} border border-emerald-300 text-emerald-700`} disabled={busy} onClick={() => void moderate(p, "published")}>{t("إظهار", "Show")}</button>}
        </div>
      </article>)}
    </div>
  </div>;
};
