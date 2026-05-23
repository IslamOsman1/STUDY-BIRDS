import { ImagePlus, Plus, Trash2, Users, Waypoints } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";
import { adminService } from "../../services/adminService";
import type { OurStory } from "../../types";
import { getErrorMessage } from "../../utils/errors";

const emptyStoryForm: OurStory = {
  heroEyebrow: "",
  heroTitle: "",
  heroBody: "",
  heroImage: "",
  heroCtaText: "",
  heroCtaLink: "",
  storyEyebrow: "",
  storyTitle: "",
  storyBody: "",
  storyImage: "",
  missionTitle: "",
  missionBody: "",
  visionTitle: "",
  visionBody: "",
  foundersTitle: "",
  foundersBody: "",
  founders: [{ name: "", role: "", bio: "", image: "" }],
  timelineTitle: "",
  timelineBody: "",
  timelineItems: [{ year: "", dateLabel: "", title: "", body: "", image: "", sortOrder: 0 }],
  impactTitle: "",
  impactBody: "",
  impactStats: [{ value: "", label: "" }],
  isPublished: true,
};

export const AdminOurStoryPage = () => {
  const { language } = useLanguage();
  const [storyForm, setStoryForm] = useState<OurStory>(emptyStoryForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState("");

  const loadData = async () => {
    const story = await adminService.getOurStory();
    setStoryForm({
      ...emptyStoryForm,
      ...story,
      founders: story.founders?.length ? story.founders : emptyStoryForm.founders,
      timelineItems: story.timelineItems?.length ? story.timelineItems : emptyStoryForm.timelineItems,
      impactStats: story.impactStats?.length ? story.impactStats : emptyStoryForm.impactStats,
    });
  };

  useEffect(() => {
    loadData().catch((error) =>
      setFormError(getErrorMessage(error, language === "ar" ? "تعذر تحميل بيانات قصتنا." : "Unable to load the story data."))
    );
  }, [language]);

  const uploadImage = async (fileList: FileList | null, onSuccess: (url: string) => void, target: string) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingTarget(target);
    try {
      const url = await adminService.uploadOurStoryImage(fileList[0]);
      onSuccess(url);
    } catch (error) {
      setFormError(getErrorMessage(error, language === "ar" ? "فشل رفع الصورة." : "Failed to upload image."));
    } finally {
      setUploadingTarget("");
    }
  };

  const submitStory = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      await adminService.updateOurStory(storyForm);
      await loadData();
    } catch (error) {
      setFormError(getErrorMessage(error, language === "ar" ? "تعذر حفظ قسم قصتنا." : "Unable to save the story section."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <section className="panel p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{language === "ar" ? "إدارة صفحة قصتنا" : "Manage Our Story page"}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {language === "ar"
            ? "من هنا يمكنك بناء صفحة قصتنا بشكل قريب من الصفحات التعريفية الكبيرة: واجهة علوية، القصة، الرؤية والرسالة، المؤسسون، التاريخ، والأثر."
            : "Build the full story page from here: hero, story section, mission and vision, founders, history, and impact."}
        </p>
      </section>

      <form onSubmit={submitStory} className="space-y-6">
        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-slate-900">{language === "ar" ? "الواجهة العلوية" : "Hero section"}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "النص الصغير" : "Eyebrow"}</span>
              <input value={storyForm.heroEyebrow || ""} onChange={(event) => setStoryForm((current) => ({ ...current, heroEyebrow: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "عنوان الزر" : "CTA text"}</span>
              <input value={storyForm.heroCtaText || ""} onChange={(event) => setStoryForm((current) => ({ ...current, heroCtaText: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "العنوان الرئيسي" : "Main title"}</span>
            <textarea value={storyForm.heroTitle || ""} onChange={(event) => setStoryForm((current) => ({ ...current, heroTitle: event.target.value }))} rows={2} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "النص التعريفي" : "Hero body"}</span>
            <textarea value={storyForm.heroBody || ""} onChange={(event) => setStoryForm((current) => ({ ...current, heroBody: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "رابط الزر" : "CTA link"}</span>
            <input value={storyForm.heroCtaLink || ""} onChange={(event) => setStoryForm((current) => ({ ...current, heroCtaLink: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>
          <div className="mt-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-slate-600" />
              <p className="text-sm font-medium text-slate-700">{language === "ar" ? "صورة الواجهة" : "Hero image"}</p>
            </div>
            <input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files, (url) => setStoryForm((current) => ({ ...current, heroImage: url })), "hero")} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="mt-2 text-xs text-slate-500">{uploadingTarget === "hero" ? (language === "ar" ? "جارٍ رفع الصورة..." : "Uploading image...") : language === "ar" ? "تظهر كصورة رئيسية كبيرة في أعلى الصفحة." : "Shown as the main large image at the top of the page."}</p>
            {storyForm.heroImage ? <img src={getApiAssetUrl(storyForm.heroImage)} alt="Hero" className="mt-4 h-48 w-full rounded-2xl object-cover" /> : null}
          </div>
          <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="checkbox" checked={Boolean(storyForm.isPublished)} onChange={(event) => setStoryForm((current) => ({ ...current, isPublished: event.target.checked }))} />
            <span className="text-sm font-medium text-slate-700">{language === "ar" ? "إظهار صفحة قصتنا في الواجهة" : "Show the story page publicly"}</span>
          </label>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-slate-900">{language === "ar" ? "قسم القصة والرؤية" : "Story, mission, and vision"}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "عنوان صغير للقصة" : "Story eyebrow"}</span>
              <input value={storyForm.storyEyebrow || ""} onChange={(event) => setStoryForm((current) => ({ ...current, storyEyebrow: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "عنوان القصة" : "Story title"}</span>
              <input value={storyForm.storyTitle || ""} onChange={(event) => setStoryForm((current) => ({ ...current, storyTitle: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "نص القصة" : "Story body"}</span>
            <textarea value={storyForm.storyBody || ""} onChange={(event) => setStoryForm((current) => ({ ...current, storyBody: event.target.value }))} rows={5} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>
          <div className="mt-4 rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700">{language === "ar" ? "صورة القصة" : "Story image"}</p>
            <input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files, (url) => setStoryForm((current) => ({ ...current, storyImage: url })), "story")} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            {storyForm.storyImage ? <img src={getApiAssetUrl(storyForm.storyImage)} alt="Story" className="mt-4 h-44 w-full rounded-2xl object-cover" /> : null}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "عنوان الرسالة" : "Mission title"}</span>
              <input value={storyForm.missionTitle || ""} onChange={(event) => setStoryForm((current) => ({ ...current, missionTitle: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "عنوان الرؤية" : "Vision title"}</span>
              <input value={storyForm.visionTitle || ""} onChange={(event) => setStoryForm((current) => ({ ...current, visionTitle: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "نص الرسالة" : "Mission body"}</span>
              <textarea value={storyForm.missionBody || ""} onChange={(event) => setStoryForm((current) => ({ ...current, missionBody: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "نص الرؤية" : "Vision body"}</span>
              <textarea value={storyForm.visionBody || ""} onChange={(event) => setStoryForm((current) => ({ ...current, visionBody: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-900">{language === "ar" ? "المؤسسون أو قادة الفريق" : "Founders or team leaders"}</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "عنوان القسم" : "Section title"}</span>
              <input value={storyForm.foundersTitle || ""} onChange={(event) => setStoryForm((current) => ({ ...current, foundersTitle: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "نص القسم" : "Section body"}</span>
              <input value={storyForm.foundersBody || ""} onChange={(event) => setStoryForm((current) => ({ ...current, foundersBody: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>

          <div className="mt-6 space-y-4">
            {(storyForm.founders || []).map((founder, index) => (
              <div key={founder._id || index} className="rounded-[1.8rem] border border-slate-200 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "الاسم" : "Name"}</span>
                    <input value={founder.name || ""} onChange={(event) => setStoryForm((current) => ({ ...current, founders: current.founders?.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "المنصب" : "Role"}</span>
                    <input value={founder.role || ""} onChange={(event) => setStoryForm((current) => ({ ...current, founders: current.founders?.map((item, itemIndex) => itemIndex === index ? { ...item, role: event.target.value } : item) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                  </label>
                </div>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "نبذة قصيرة" : "Short bio"}</span>
                  <textarea value={founder.bio || ""} onChange={(event) => setStoryForm((current) => ({ ...current, founders: current.founders?.map((item, itemIndex) => itemIndex === index ? { ...item, bio: event.target.value } : item) }))} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                </label>
                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-700">{language === "ar" ? "صورة الشخص" : "Person image"}</p>
                  <input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files, (url) => setStoryForm((current) => ({ ...current, founders: current.founders?.map((item, itemIndex) => itemIndex === index ? { ...item, image: url } : item) })), `founder-${index}`)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                  {founder.image ? <img src={getApiAssetUrl(founder.image)} alt={founder.name || "Founder"} className="mt-4 h-40 w-full rounded-2xl object-cover" /> : null}
                </div>
                <button type="button" onClick={() => setStoryForm((current) => ({ ...current, founders: (current.founders || []).length > 1 ? current.founders?.filter((_, itemIndex) => itemIndex !== index) : current.founders }))} className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">
                  <Trash2 className="h-4 w-4" />
                  {language === "ar" ? "حذف" : "Remove"}
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setStoryForm((current) => ({ ...current, founders: [...(current.founders || []), { name: "", role: "", bio: "", image: "" }] }))} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              <Plus className="h-4 w-4" />
              {language === "ar" ? "إضافة شخص" : "Add person"}
            </button>
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex items-center gap-2">
            <Waypoints className="h-5 w-5 text-slate-700" />
            <h2 className="text-xl font-semibold text-slate-900">{language === "ar" ? "التاريخ والمحطات" : "History and milestones"}</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "عنوان القسم" : "Section title"}</span>
              <input value={storyForm.timelineTitle || ""} onChange={(event) => setStoryForm((current) => ({ ...current, timelineTitle: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "وصف القسم" : "Section description"}</span>
              <input value={storyForm.timelineBody || ""} onChange={(event) => setStoryForm((current) => ({ ...current, timelineBody: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>
          <div className="mt-6 space-y-4">
            {(storyForm.timelineItems || []).map((item, index) => (
              <div key={item._id || index} className="rounded-[1.8rem] border border-slate-200 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "السنة" : "Year"}</span>
                    <input value={item.year || ""} onChange={(event) => setStoryForm((current) => ({ ...current, timelineItems: current.timelineItems?.map((entry, entryIndex) => entryIndex === index ? { ...entry, year: event.target.value } : entry) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "تاريخ مختصر" : "Short date"}</span>
                    <input value={item.dateLabel || ""} onChange={(event) => setStoryForm((current) => ({ ...current, timelineItems: current.timelineItems?.map((entry, entryIndex) => entryIndex === index ? { ...entry, dateLabel: event.target.value } : entry) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "الترتيب" : "Sort order"}</span>
                    <input type="number" value={item.sortOrder ?? index} onChange={(event) => setStoryForm((current) => ({ ...current, timelineItems: current.timelineItems?.map((entry, entryIndex) => entryIndex === index ? { ...entry, sortOrder: Number(event.target.value || 0) } : entry) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                  </label>
                </div>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "العنوان" : "Title"}</span>
                  <input value={item.title || ""} onChange={(event) => setStoryForm((current) => ({ ...current, timelineItems: current.timelineItems?.map((entry, entryIndex) => entryIndex === index ? { ...entry, title: event.target.value } : entry) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                </label>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "وصف المحطة" : "Milestone description"}</span>
                  <textarea value={item.body || ""} onChange={(event) => setStoryForm((current) => ({ ...current, timelineItems: current.timelineItems?.map((entry, entryIndex) => entryIndex === index ? { ...entry, body: event.target.value } : entry) }))} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                </label>
                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-700">{language === "ar" ? "صورة المحطة" : "Milestone image"}</p>
                  <input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files, (url) => setStoryForm((current) => ({ ...current, timelineItems: current.timelineItems?.map((entry, entryIndex) => entryIndex === index ? { ...entry, image: url } : entry) })), `timeline-${index}`)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
                  {item.image ? <img src={getApiAssetUrl(item.image)} alt={item.title || "Milestone"} className="mt-4 h-40 w-full rounded-2xl object-cover" /> : null}
                </div>
                <button type="button" onClick={() => setStoryForm((current) => ({ ...current, timelineItems: (current.timelineItems || []).length > 1 ? current.timelineItems?.filter((_, entryIndex) => entryIndex !== index) : current.timelineItems }))} className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">
                  <Trash2 className="h-4 w-4" />
                  {language === "ar" ? "حذف المحطة" : "Remove milestone"}
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setStoryForm((current) => ({ ...current, timelineItems: [...(current.timelineItems || []), { year: "", dateLabel: "", title: "", body: "", image: "", sortOrder: current.timelineItems?.length || 0 }] }))} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              <Plus className="h-4 w-4" />
              {language === "ar" ? "إضافة محطة" : "Add milestone"}
            </button>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="text-xl font-semibold text-slate-900">{language === "ar" ? "قسم الأثر" : "Impact section"}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "عنوان القسم" : "Section title"}</span>
              <input value={storyForm.impactTitle || ""} onChange={(event) => setStoryForm((current) => ({ ...current, impactTitle: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "وصف القسم" : "Section body"}</span>
              <input value={storyForm.impactBody || ""} onChange={(event) => setStoryForm((current) => ({ ...current, impactBody: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>
          <div className="mt-6 space-y-4">
            {(storyForm.impactStats || []).map((stat, index) => (
              <div key={stat._id || index} className="grid gap-4 rounded-[1.8rem] border border-slate-200 p-4 md:grid-cols-[1fr_1fr_auto]">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "الرقم" : "Value"}</span>
                  <input value={stat.value || ""} onChange={(event) => setStoryForm((current) => ({ ...current, impactStats: current.impactStats?.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "الوصف" : "Label"}</span>
                  <input value={stat.label || ""} onChange={(event) => setStoryForm((current) => ({ ...current, impactStats: current.impactStats?.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
                </label>
                <button type="button" onClick={() => setStoryForm((current) => ({ ...current, impactStats: (current.impactStats || []).length > 1 ? current.impactStats?.filter((_, itemIndex) => itemIndex !== index) : current.impactStats }))} className="self-end rounded-full border border-rose-200 px-4 py-3 text-sm font-medium text-rose-700">
                  {language === "ar" ? "حذف" : "Remove"}
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setStoryForm((current) => ({ ...current, impactStats: [...(current.impactStats || []), { value: "", label: "" }] }))} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              <Plus className="h-4 w-4" />
              {language === "ar" ? "إضافة رقم" : "Add stat"}
            </button>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white disabled:opacity-70">
            {saving ? (language === "ar" ? "جارٍ الحفظ..." : "Saving...") : language === "ar" ? "حفظ صفحة قصتنا" : "Save story page"}
          </button>
        </div>
      </form>
    </div>
  );
};
