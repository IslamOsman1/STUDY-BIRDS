import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

type Named = { _id: string; name: string };
type Post = {
  _id: string; title: string; body: string; topic: string; commentCount: number; createdAt: string; status?: string; moderationNote?: string;
  author?: Named; country?: Named; university?: Named; studyField?: Named;
};
type Comment = { _id: string; body: string; createdAt: string; author?: Named };
type ReportTarget = { type: "post" | "comment"; id: string };

const TOPICS: Array<[string, string, string]> = [
  ["experience", "تجارب", "Experiences"], ["housing", "السكن", "Housing"], ["tips", "نصائح", "Tips"],
  ["student_life", "الحياة الطلابية", "Student life"], ["faq", "أسئلة شائعة", "FAQ"], ["other", "أخرى", "Other"],
];
const REASONS: Array<[string, string, string]> = [
  ["spam", "إعلان أو محتوى متكرر", "Spam"], ["abuse", "إساءة أو تنمر", "Abuse or harassment"],
  ["misinformation", "معلومات مضللة", "Misinformation"], ["privacy", "نشر معلومات شخصية", "Private information"], ["other", "سبب آخر", "Other"],
];
const emptyForm = { title: "", body: "", topic: "experience", country: "", university: "", studyField: "" };

export const StudentCommunityPage = () => {
  const { language } = useLanguage();
  const ar = language === "ar";
  const t = (a: string, b: string) => (ar ? a : b);
  const topicLabel = (key: string) => { const row = TOPICS.find(([k]) => k === key); return row ? (ar ? row[1] : row[2]) : key; };
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<"all" | "mine">("all");
  const [filters, setFilters] = useState({ topic: "", country: "", university: "", studyField: "" });
  const [lookups, setLookups] = useState<{ countries: Named[]; universities: Array<Named & { country?: string | Named }>; fields: Named[] }>({ countries: [], universities: [], fields: [] });
  const [openPost, setOpenPost] = useState<{ post: Post; comments: Comment[] } | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [reporting, setReporting] = useState<ReportTarget | null>(null);
  const [report, setReport] = useState({ reason: "spam", details: "" });
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [success, setSuccess] = useState("");
  const [suspension, setSuspension] = useState<{ suspended: boolean; until?: string | null; reason?: string }>({ suspended: false });
  const { user } = useAuth();
  // Community-specific refusals get a clear message instead of the raw server text.
  const communityError = (e: unknown, fallback: string) => {
    const status = axios.isAxiosError(e) ? e.response?.status : undefined;
    if (status === 422) return t("النص يحتوي كلمات غير مسموحة في المجتمع. عدّل النص وحاول مجددًا.", "Your text contains words that aren't allowed in the community. Please rephrase.");
    if (status === 403) { void loadStatus(); return t("أنت موقوف حاليًا عن النشر في المجتمع.", "You are currently suspended from posting."); }
    if (status === 409) return t("سبق أن أبلغت عن هذا المحتوى.", "You already reported this content.");
    return getErrorMessage(e, fallback);
  };
  async function loadStatus() {
    try { setSuspension((await api.get<typeof suspension>("/community/status")).data); } catch { /* reading still works */ }
  }
  useEffect(() => { void loadStatus(); }, []);
  const canWrite = !suspension.suspended;
  const input = "rounded-xl border border-slate-300 bg-white p-3 text-slate-900";
  const button = "rounded-xl bg-brand-primary px-4 py-2 text-white disabled:opacity-50";
  const chip = (active: boolean) => `rounded-full px-3 py-1.5 text-sm ${active ? "bg-brand-primary text-white" : "border border-slate-300"}`;
  const universitiesIn = (country: string) => lookups.universities.filter((u) => !country || (typeof u.country === "string" ? u.country : u.country?._id) === country);

  useEffect(() => {
    void Promise.all([
      api.get<Named[]>("/content/countries"), api.get<Array<Named & { country?: string | Named }>>("/universities"), api.get<Named[]>("/content/study-fields"),
    ]).then(([c, u, f]) => setLookups({ countries: c.data, universities: u.data, fields: f.data })).catch(() => undefined);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const params = view === "mine" ? { mine: "1" } : Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      setPosts((await api.get<Post[]>("/community/posts", { params })).data);
    } catch (e) { setError(getErrorMessage(e, t("تعذر تحميل المجتمع", "Unable to load the community"))); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [view, filters]);

  async function submitPost() {
    setBusy(true); setError(""); setSuccess("");
    try {
      await api.post("/community/posts", Object.fromEntries(Object.entries(form).filter(([, v]) => v)));
      setForm(emptyForm); setShowForm(false); setSuccess(t("تم نشر موضوعك", "Your post was published"));
      await load();
    } catch (e) { setError(communityError(e, t("تعذر نشر الموضوع", "Unable to publish the post"))); }
    finally { setBusy(false); }
  }

  async function openThread(post: Post) {
    if (post.status === "hidden") return;
    setBusy(true); setError(""); setReporting(null);
    try { setOpenPost((await api.get<{ post: Post; comments: Comment[] }>(`/community/posts/${post._id}`)).data); }
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
    } catch (e) { setError(communityError(e, t("تعذر إضافة التعليق", "Unable to add the comment"))); }
    finally { setBusy(false); }
  }

  async function deletePost(post: Post) {
    if (!window.confirm(t("حذف الموضوع؟", "Delete this post?"))) return;
    setBusy(true);
    try { await api.delete(`/community/posts/${post._id}`); setOpenPost(null); await load(); }
    catch (e) { setError(getErrorMessage(e, t("تعذر الحذف", "Unable to delete"))); }
    finally { setBusy(false); }
  }

  async function deleteComment(comment: Comment) {
    if (!openPost || !window.confirm(t("حذف التعليق؟", "Delete this comment?"))) return;
    setBusy(true);
    try { await api.delete(`/community/comments/${comment._id}`); await openThread(openPost.post); await load(); }
    catch (e) { setError(getErrorMessage(e, t("تعذر الحذف", "Unable to delete"))); }
    finally { setBusy(false); }
  }

  async function submitReport() {
    if (!reporting) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      await api.post(`/community/${reporting.type === "post" ? "posts" : "comments"}/${reporting.id}/report`, report);
      setReporting(null); setReport({ reason: "spam", details: "" });
      setSuccess(t("شكرًا، وصل بلاغك لفريق الإشراف", "Thanks — your report was sent to the moderation team"));
    } catch (e) { setError(communityError(e, t("تعذر إرسال البلاغ", "Unable to send the report"))); }
    finally { setBusy(false); }
  }

  const reportForm = (target: ReportTarget) => reporting?.type === target.type && reporting.id === target.id && <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
    <label className="block">{t("سبب البلاغ", "Reason")}
      <select className={`${input} block w-full`} value={report.reason} onChange={(e) => setReport({ ...report, reason: e.target.value })}>
        {REASONS.map(([k, a, b]) => <option key={k} value={k}>{ar ? a : b}</option>)}
      </select>
    </label>
    <label className="block">{t("تفاصيل (اختياري)", "Details (optional)")}
      <textarea rows={2} maxLength={500} className={`${input} block w-full`} value={report.details} onChange={(e) => setReport({ ...report, details: e.target.value })} />
    </label>
    <div className="flex gap-2">
      <button className={button} disabled={busy} onClick={() => void submitReport()}>{t("إرسال البلاغ", "Send report")}</button>
      <button className="text-sm underline" onClick={() => setReporting(null)}>{t("إلغاء", "Cancel")}</button>
    </div>
  </div>;
  const reportButton = (target: ReportTarget) => <button className="text-xs text-amber-800 underline" onClick={() => { setReporting(target); setReport({ reason: "spam", details: "" }); }}>{t("إبلاغ", "Report")}</button>;
  const meta = (p: Post) => [topicLabel(p.topic), p.country?.name, p.university?.name, p.studyField?.name].filter(Boolean).join(" · ");

  return <div className="space-y-6" dir={ar ? "rtl" : "ltr"}>
    <h1 className="text-2xl font-bold">{t("مجتمع الطلاب", "Student Community")}</h1>
    <p className="text-sm text-slate-600">{t("شارك تجربتك واسأل زملاءك الطلاب. المحتوى خاضع لمراجعة الفريق، ويمكنك الإبلاغ عن أي محتوى مخالف.", "Share your experience and ask fellow students. Content is reviewed by the team, and you can report anything inappropriate.")}</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}
    {success && <p role="status" className="rounded-xl bg-green-50 p-3 text-green-800">{success}</p>}
    {suspension.suspended && <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      {t("أنت موقوف عن النشر والتعليق والإبلاغ في المجتمع", "You are suspended from posting, commenting and reporting")}
      {" "}{suspension.until ? `${t("حتى", "until")} ${new Date(suspension.until).toLocaleDateString(ar ? "ar" : "en")}` : t("حتى يرفعه فريق الإشراف", "until the moderation team lifts it")}.
      {suspension.reason ? ` ${t("السبب", "Reason")}: ${suspension.reason}.` : ""} {t("ما زال بإمكانك القراءة.", "You can still read.")}
    </p>}

    <div className="flex flex-wrap gap-2">
      <button className={chip(view === "all")} onClick={() => { setView("all"); setOpenPost(null); }}>{t("كل المواضيع", "All posts")}</button>
      <button className={chip(view === "mine")} onClick={() => { setView("mine"); setOpenPost(null); }}>{t("مواضيعي", "My posts")}</button>
      {canWrite && <button className={button} onClick={() => setShowForm(!showForm)}>{showForm ? t("إلغاء", "Cancel") : t("موضوع جديد", "New post")}</button>}
    </div>

    {showForm && canWrite && <div className="grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-2">
      <label className="md:col-span-2">{t("العنوان", "Title")}<input maxLength={150} className={`${input} block w-full`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <label className="md:col-span-2">{t("النص", "Body")}<textarea rows={4} maxLength={5000} className={`${input} block w-full`} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></label>
      <label>{t("الموضوع", "Topic")}<select className={`${input} block w-full`} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
        {TOPICS.map(([k, a, b]) => <option key={k} value={k}>{ar ? a : b}</option>)}
      </select></label>
      <label>{t("التخصص (اختياري)", "Field of study (optional)")}<select className={`${input} block w-full`} value={form.studyField} onChange={(e) => setForm({ ...form, studyField: e.target.value })}>
        <option value="">—</option>{lookups.fields.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
      </select></label>
      <label>{t("الدولة (اختياري)", "Country (optional)")}<select className={`${input} block w-full`} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value, university: "" })}>
        <option value="">—</option>{lookups.countries.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select></label>
      <label>{t("الجامعة (اختياري)", "University (optional)")}<select className={`${input} block w-full`} value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })}>
        <option value="">—</option>{universitiesIn(form.country).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
      </select></label>
      <div className="md:col-span-2"><button className={button} disabled={busy || !form.title.trim() || !form.body.trim()} onClick={() => void submitPost()}>{t("نشر", "Publish")}</button></div>
    </div>}

    {view === "all" && !openPost && <div className="space-y-3 rounded-2xl border bg-white p-4">
      <div className="flex flex-wrap gap-2">
        <button className={chip(!filters.topic)} onClick={() => setFilters({ ...filters, topic: "" })}>{t("كل المواضيع", "All topics")}</button>
        {TOPICS.map(([k, a, b]) => <button key={k} className={chip(filters.topic === k)} onClick={() => setFilters({ ...filters, topic: k })}>{ar ? a : b}</button>)}
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <select aria-label={t("الدولة", "Country")} className={input} value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value, university: "" })}>
          <option value="">{t("كل الدول", "All countries")}</option>{lookups.countries.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select aria-label={t("الجامعة", "University")} className={input} value={filters.university} onChange={(e) => setFilters({ ...filters, university: e.target.value })}>
          <option value="">{t("كل الجامعات", "All universities")}</option>{universitiesIn(filters.country).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <select aria-label={t("التخصص", "Field of study")} className={input} value={filters.studyField} onChange={(e) => setFilters({ ...filters, studyField: e.target.value })}>
          <option value="">{t("كل التخصصات", "All fields")}</option>{lookups.fields.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
        </select>
      </div>
    </div>}

    {openPost ? <section className="space-y-4 rounded-2xl border bg-white p-5">
      <button className="text-sm underline" onClick={() => setOpenPost(null)}>{t("رجوع للقائمة", "Back to list")}</button>
      <h2 className="text-xl font-semibold">{openPost.post.title}</h2>
      <p className="text-sm text-slate-500">{openPost.post.author?.name} · {new Date(openPost.post.createdAt).toLocaleDateString(ar ? "ar" : "en")} · {meta(openPost.post)}</p>
      <p className="whitespace-pre-wrap">{openPost.post.body}</p>
      <div className="flex gap-4">
        {openPost.post.author?._id === user?._id
          ? <button className="text-sm text-red-700" onClick={() => void deletePost(openPost.post)}>{t("حذف موضوعي", "Delete my post")}</button>
          : canWrite && reportButton({ type: "post", id: openPost.post._id })}
      </div>
      {reportForm({ type: "post", id: openPost.post._id })}
      <div className="space-y-3 border-t pt-4">
        <h3 className="font-semibold">{t("التعليقات", "Comments")}</h3>
        {openPost.comments.map((c) => <div key={c._id} className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
          <p className="font-semibold">{c.author?.name}</p><p className="whitespace-pre-wrap">{c.body}</p>
          {c.author?._id === user?._id
            ? <button className="text-xs text-red-700" onClick={() => void deleteComment(c)}>{t("حذف تعليقي", "Delete my comment")}</button>
            : canWrite && reportButton({ type: "comment", id: c._id })}
          {reportForm({ type: "comment", id: c._id })}
        </div>)}
        {canWrite && <div className="flex gap-2">
          <input maxLength={2000} className={`${input} flex-1`} value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder={t("أضف تعليقًا", "Add a comment")} />
          <button className={button} disabled={busy || !commentBody.trim()} onClick={() => void submitComment()}>{t("إرسال", "Send")}</button>
        </div>}
      </div>
    </section> : <section className="space-y-3">
      {loading ? <p>{t("جارٍ التحميل…", "Loading…")}</p> : !posts.length && <p>{view === "mine" ? t("لم تنشر أي موضوع بعد.", "You haven't posted yet.") : t("لا توجد مواضيع مطابقة. كن أول من يشارك!", "No matching posts. Be the first to share!")}</p>}
      {posts.map((p) => <article key={p._id} className={`rounded-2xl border bg-white p-4 ${p.status === "hidden" ? "border-amber-300" : "cursor-pointer"}`} onClick={() => void openThread(p)}>
        <h3 className="font-semibold">{p.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.body}</p>
        <p className="mt-2 text-xs text-slate-500">{p.author?.name} · {p.commentCount} {t("تعليق", "comments")} · {meta(p)}</p>
        {p.status === "hidden" && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">{t("أخفاه فريق الإشراف", "Hidden by the moderation team")}{p.moderationNote ? ` — ${p.moderationNote}` : ""}</p>}
      </article>)}
    </section>}
  </div>;
};
