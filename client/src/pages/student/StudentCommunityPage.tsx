import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

type Post = {
  _id: string; title: string; body: string; commentCount: number; createdAt: string;
  author?: { _id: string; name: string }; country?: { name: string }; university?: { name: string };
};
type Comment = { _id: string; body: string; createdAt: string; author?: { _id: string; name: string } };

export const StudentCommunityPage = () => {
  const { language } = useLanguage();
  const ar = language === "ar";
  const t = (a: string, b: string) => (ar ? a : b);
  const [posts, setPosts] = useState<Post[]>([]);
  const [openPost, setOpenPost] = useState<{ post: Post; comments: Comment[] } | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [form, setForm] = useState({ title: "", body: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [success, setSuccess] = useState("");
  const { user } = useAuth();
  const input = "rounded-xl border border-slate-300 bg-white p-3 text-slate-900";
  const button = "rounded-xl bg-brand-primary px-4 py-2 text-white disabled:opacity-50";

  async function load() {
    setLoading(true);
    try { setPosts((await api.get<Post[]>("/community/posts")).data); }
    catch (e) { setError(getErrorMessage(e, t("تعذر تحميل المجتمع", "Unable to load the community"))); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function submitPost() {
    setBusy(true); setError(""); setSuccess("");
    try {
      await api.post("/community/posts", form);
      setForm({ title: "", body: "" }); setShowForm(false); setSuccess(t("تم نشر موضوعك", "Your post was published"));
      await load();
    } catch (e) { setError(getErrorMessage(e, t("تعذر نشر الموضوع", "Unable to publish the post"))); }
    finally { setBusy(false); }
  }

  async function openThread(post: Post) {
    setBusy(true); setError("");
    try { setOpenPost({ post, comments: (await api.get<{ post: Post; comments: Comment[] }>(`/community/posts/${post._id}`)).data.comments }); }
    catch (e) { setError(getErrorMessage(e, t("تعذر فتح الموضوع", "Unable to open the post"))); }
    finally { setBusy(false); }
  }

  async function submitComment() {
    if (!openPost || !commentBody.trim()) return;
    setBusy(true); setError("");
    try {
      await api.post(`/community/posts/${openPost.post._id}/comments`, { body: commentBody });
      setCommentBody("");
      await openThread(openPost.post);
      await load();
    } catch (e) { setError(getErrorMessage(e, t("تعذر إضافة التعليق", "Unable to add the comment"))); }
    finally { setBusy(false); }
  }

  async function deletePost(post: Post) {
    if (!window.confirm(t("حذف الموضوع؟", "Delete this post?"))) return;
    setBusy(true);
    try { await api.delete(`/community/posts/${post._id}`); setOpenPost(null); await load(); }
    catch (e) { setError(getErrorMessage(e, t("تعذر الحذف", "Unable to delete"))); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6" dir={ar ? "rtl" : "ltr"}>
    <h1 className="text-2xl font-bold">{t("مجتمع الطلاب", "Student Community")}</h1>
    <p className="text-sm text-slate-600">{t("شارك تجربتك واسأل زملاءك الطلاب. المحتوى خاضع لمراجعة الفريق.", "Share your experience and ask fellow students. Content is subject to team review.")}</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}
    {success && <p role="status" className="rounded-xl bg-green-50 p-3 text-green-800">{success}</p>}

    <button className={button} onClick={() => setShowForm(!showForm)}>{showForm ? t("إلغاء", "Cancel") : t("موضوع جديد", "New post")}</button>
    {showForm && <div className="space-y-3 rounded-2xl border bg-white p-5">
      <label>{t("العنوان", "Title")}<input maxLength={150} className={`${input} block w-full`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <label>{t("النص", "Body")}<textarea rows={4} maxLength={5000} className={`${input} block w-full`} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
      <button className={button} disabled={busy || !form.title.trim() || !form.body.trim()} onClick={() => void submitPost()}>{t("نشر", "Publish")}</button>
    </div>}

    {openPost ? <section className="space-y-4 rounded-2xl border bg-white p-5">
      <button className="text-sm underline" onClick={() => setOpenPost(null)}>{t("رجوع للقائمة", "Back to list")}</button>
      <h2 className="text-xl font-semibold">{openPost.post.title}</h2>
      <p className="text-sm text-slate-500">{openPost.post.author?.name} · {new Date(openPost.post.createdAt).toLocaleDateString(ar ? "ar" : "en")}</p>
      <p className="whitespace-pre-wrap">{openPost.post.body}</p>
      {openPost.post.author?._id === user?._id && <button className="text-sm text-red-700" onClick={() => void deletePost(openPost.post)}>{t("حذف موضوعي", "Delete my post")}</button>}
      <div className="space-y-3 border-t pt-4">
        <h3 className="font-semibold">{t("التعليقات", "Comments")}</h3>
        {openPost.comments.map((c) => <div key={c._id} className="rounded-xl bg-slate-50 p-3 text-sm">
          <p className="font-semibold">{c.author?.name}</p><p>{c.body}</p>
        </div>)}
        <div className="flex gap-2">
          <input className={`${input} flex-1`} value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder={t("أضف تعليقًا", "Add a comment")} />
          <button className={button} disabled={busy || !commentBody.trim()} onClick={() => void submitComment()}>{t("إرسال", "Send")}</button>
        </div>
      </div>
    </section> : <section className="space-y-3">
      {loading ? <p>{t("جارٍ التحميل…", "Loading…")}</p> : !posts.length && <p>{t("لا توجد مواضيع بعد. كن أول من يشارك!", "No posts yet. Be the first to share!")}</p>}
      {posts.map((p) => <article key={p._id} className="cursor-pointer rounded-2xl border bg-white p-4" onClick={() => void openThread(p)}>
        <h3 className="font-semibold">{p.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.body}</p>
        <p className="mt-2 text-xs text-slate-500">{p.author?.name} · {p.commentCount} {t("تعليق", "comments")}{p.university ? ` · ${p.university.name}` : ""}</p>
      </article>)}
    </section>}
  </div>;
};
