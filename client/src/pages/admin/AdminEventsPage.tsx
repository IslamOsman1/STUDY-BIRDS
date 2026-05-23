import { Download, ImagePlus, PencilLine, Plus, Trash2, Upload, Video } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";
import { adminService } from "../../services/adminService";
import type { EventRegistration, PastEvent, PastEventMediaItem, UpcomingEvent } from "../../types";
import { getErrorMessage } from "../../utils/errors";

const eventCategoryOptions = [
  { value: "expos-fairs", en: "Expos & Fairs", ar: "الملتقيات والمعارض" },
  { value: "our-community", en: "Our Community", ar: "مجتمع الطلاب" },
  { value: "webinars", en: "Webinars", ar: "الندوات والويبinars" },
  { value: "partnerships", en: "Partnerships", ar: "بروتوكولات الشراكة" },
] as const;

const emptyUpcomingEventForm: UpcomingEvent = {
  title: "",
  subtitle: "",
  eventType: "",
  eventDate: "",
  ctaText: "",
  backgroundImage: "",
  isPublished: true,
};

const emptyPastEventForm = {
  title: "",
  category: "expos-fairs" as PastEvent["category"],
  eventDate: "",
  countryCode: "",
  summary: "",
  coverImage: "",
  mediaItems: [] as PastEventMediaItem[],
  featured: true,
  sortOrder: "0",
};

const formatDateTimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const toCsvCell = (value: string | number | null | undefined) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const AdminEventsPage = () => {
  const { language } = useLanguage();
  const [upcomingEventForm, setUpcomingEventForm] = useState<UpcomingEvent>(emptyUpcomingEventForm);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [pastEventForm, setPastEventForm] = useState(emptyPastEventForm);
  const [editingPastEventId, setEditingPastEventId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [uploadingUpcomingImage, setUploadingUpcomingImage] = useState(false);
  const [uploadingPastMedia, setUploadingPastMedia] = useState(false);

  const loadData = async () => {
    const [upcomingEvent, pastEventsData, registrationsData] = await Promise.all([
      adminService.getUpcomingEvent(),
      adminService.getPastEvents(),
      adminService.getEventRegistrations(),
    ]);

    setUpcomingEventForm({
      title: upcomingEvent.title || "",
      subtitle: upcomingEvent.subtitle || "",
      eventType: upcomingEvent.eventType || "",
      eventDate: formatDateTimeLocalValue(upcomingEvent.eventDate),
      ctaText: upcomingEvent.ctaText || "",
      backgroundImage: upcomingEvent.backgroundImage || "",
      isPublished: Boolean(upcomingEvent.isPublished),
    });
    setPastEvents(pastEventsData);
    setRegistrations(registrationsData);
  };

  useEffect(() => {
    loadData().catch((error) =>
      setFormError(
        getErrorMessage(error, language === "ar" ? "تعذر تحميل بيانات الفعاليات." : "Unable to load events data.")
      )
    );
  }, [language]);

  const resetPastEventForm = () => {
    setEditingPastEventId(null);
    setPastEventForm(emptyPastEventForm);
  };

  const handleUpcomingImageUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingUpcomingImage(true);

    try {
      const url = await adminService.uploadUpcomingEventImage(fileList[0]);
      setUpcomingEventForm((current) => ({ ...current, backgroundImage: url }));
    } catch (error) {
      setFormError(getErrorMessage(error, language === "ar" ? "فشل رفع صورة الفعالية القادمة." : "Failed to upload upcoming event image."));
    } finally {
      setUploadingUpcomingImage(false);
    }
  };

  const handlePastEventMediaUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFormError("");
    setUploadingPastMedia(true);

    try {
      const uploadedItems: PastEventMediaItem[] = [];
      for (const file of Array.from(fileList)) {
        const uploaded = await adminService.uploadPastEventMedia(file);
        uploadedItems.push(uploaded);
      }

      setPastEventForm((current) => ({
        ...current,
        coverImage: current.coverImage || uploadedItems.find((item) => item.type === "image")?.url || current.coverImage,
        mediaItems: [...current.mediaItems, ...uploadedItems],
      }));
    } catch (error) {
      setFormError(getErrorMessage(error, language === "ar" ? "فشل رفع وسائط الفعالية." : "Failed to upload event media."));
    } finally {
      setUploadingPastMedia(false);
    }
  };

  const submitUpcomingEvent = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    try {
      await adminService.updateUpcomingEvent({
        ...upcomingEventForm,
        eventDate: upcomingEventForm.eventDate ? new Date(upcomingEventForm.eventDate).toISOString() : null,
      });
      await loadData();
    } catch (error) {
      setFormError(getErrorMessage(error, language === "ar" ? "تعذر حفظ الفعالية القادمة." : "Unable to save the upcoming event."));
    }
  };

  const submitPastEvent = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    const payload: Partial<PastEvent> = {
      title: pastEventForm.title,
      category: pastEventForm.category,
      eventDate: pastEventForm.eventDate ? new Date(pastEventForm.eventDate).toISOString() : null,
      countryCode: pastEventForm.countryCode,
      summary: pastEventForm.summary,
      coverImage: pastEventForm.coverImage,
      mediaItems: pastEventForm.mediaItems,
      featured: pastEventForm.featured,
      sortOrder: Number(pastEventForm.sortOrder || 0),
    };

    try {
      if (editingPastEventId) {
        await adminService.updatePastEvent(editingPastEventId, payload);
      } else {
        await adminService.createPastEvent(payload);
      }

      resetPastEventForm();
      await loadData();
    } catch (error) {
      setFormError(getErrorMessage(error, language === "ar" ? "تعذر حفظ الفعالية السابقة." : "Unable to save the past event."));
    }
  };

  const exportRegistrations = () => {
    const header = ["Name", "Phone", "Field of Interest", "Current Country", "Upcoming Event", "Created At"];
    const rows = registrations.map((item) => [
      item.name,
      item.phone,
      item.fieldOfInterest,
      item.currentCountry,
      item.upcomingEvent?.title || "",
      item.createdAt || "",
    ]);

    const csv = [header, ...rows].map((row) => row.map((cell) => toCsvCell(cell)).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "event-registrations.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const categoryLabelMap = useMemo(
    () =>
      Object.fromEntries(
        eventCategoryOptions.map((option) => [option.value, language === "ar" ? option.ar : option.en])
      ) as Record<PastEvent["category"], string>,
    [language]
  );

  return (
    <div className="space-y-6">
      {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <section className="panel p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          {language === "ar" ? "إدارة قسم فعاليتنا" : "Manage Our Event section"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {language === "ar"
            ? "من هنا يمكنك ضبط الفعالية القادمة، إضافة الفعاليات السابقة، ومراجعة تسجيلات الطلاب."
            : "Control the upcoming event, past events, and student registrations from here."}
        </p>
      </section>

      <section className="panel p-6">
        <h2 className="text-xl font-semibold text-slate-900">{language === "ar" ? "الفعالية القادمة" : "Upcoming event"}</h2>
        <form onSubmit={submitUpcomingEvent} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "العنوان" : "Title"}</span>
              <input value={upcomingEventForm.title || ""} onChange={(event) => setUpcomingEventForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "نوع الفعالية" : "Event type"}</span>
              <input value={upcomingEventForm.eventType || ""} onChange={(event) => setUpcomingEventForm((current) => ({ ...current, eventType: event.target.value }))} placeholder={language === "ar" ? "ندوة، معرض، ويبينار..." : "Webinar, fair, expo..."} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "الوصف المختصر" : "Subtitle"}</span>
            <textarea value={upcomingEventForm.subtitle || ""} onChange={(event) => setUpcomingEventForm((current) => ({ ...current, subtitle: event.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "تاريخ ووقت الفعالية" : "Event date and time"}</span>
              <input type="datetime-local" value={upcomingEventForm.eventDate || ""} onChange={(event) => setUpcomingEventForm((current) => ({ ...current, eventDate: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "نص زر التسجيل" : "CTA button text"}</span>
              <input value={upcomingEventForm.ctaText || ""} onChange={(event) => setUpcomingEventForm((current) => ({ ...current, ctaText: event.target.value }))} placeholder={language === "ar" ? "احجز مقعدك الآن" : "Reserve your seat now"} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-slate-600" />
              <p className="text-sm font-medium text-slate-700">{language === "ar" ? "خلفية الفعالية القادمة" : "Upcoming event background"}</p>
            </div>
            <input type="file" accept="image/*" onChange={(event) => handleUpcomingImageUpload(event.target.files)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="mt-2 text-xs text-slate-500">
              {uploadingUpcomingImage
                ? language === "ar"
                  ? "جارٍ رفع الصورة..."
                  : "Uploading image..."
                : language === "ar"
                  ? "هذه الصورة ستظهر كخلفية للبنر الرئيسي."
                  : "This image will be used as the main hero background."}
            </p>
            {upcomingEventForm.backgroundImage ? (
              <img src={getApiAssetUrl(upcomingEventForm.backgroundImage)} alt="Upcoming event background" className="mt-4 h-48 w-full rounded-2xl object-cover" />
            ) : null}
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="checkbox" checked={Boolean(upcomingEventForm.isPublished)} onChange={(event) => setUpcomingEventForm((current) => ({ ...current, isPublished: event.target.checked }))} />
            <span className="text-sm font-medium text-slate-700">{language === "ar" ? "إظهار الفعالية القادمة في صفحة من نحن" : "Show upcoming event on the About page"}</span>
          </label>
          <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            {language === "ar" ? "حفظ الفعالية القادمة" : "Save upcoming event"}
          </button>
        </form>
      </section>

      <section className="panel p-6">
        <h2 className="text-xl font-semibold text-slate-900">{language === "ar" ? "إضافة فعالية سابقة" : "Add past event"}</h2>
        <form onSubmit={submitPastEvent} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "عنوان الفعالية" : "Event title"}</span>
              <input value={pastEventForm.title} onChange={(event) => setPastEventForm((current) => ({ ...current, title: event.target.value }))} required className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "التصنيف" : "Category"}</span>
              <select value={pastEventForm.category} onChange={(event) => setPastEventForm((current) => ({ ...current, category: event.target.value as PastEvent["category"] }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring">
                {eventCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {language === "ar" ? option.ar : option.en}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "تاريخ الفعالية" : "Event date"}</span>
              <input type="datetime-local" value={pastEventForm.eventDate} onChange={(event) => setPastEventForm((current) => ({ ...current, eventDate: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "رمز الدولة" : "Country code"}</span>
              <input value={pastEventForm.countryCode} onChange={(event) => setPastEventForm((current) => ({ ...current, countryCode: event.target.value.toUpperCase() }))} placeholder="TR" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "الترتيب" : "Sort order"}</span>
              <input type="number" value={pastEventForm.sortOrder} onChange={(event) => setPastEventForm((current) => ({ ...current, sortOrder: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "وصف قصير" : "Short summary"}</span>
            <textarea value={pastEventForm.summary} onChange={(event) => setPastEventForm((current) => ({ ...current, summary: event.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
          </label>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-slate-600" />
              <p className="text-sm font-medium text-slate-700">{language === "ar" ? "ألبوم الصور والفيديو" : "Images and videos gallery"}</p>
            </div>
            <input type="file" accept="image/*,video/*" multiple onChange={(event) => handlePastEventMediaUpload(event.target.files)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
            <p className="mt-2 text-xs text-slate-500">
              {uploadingPastMedia
                ? language === "ar"
                  ? "جارٍ رفع الوسائط..."
                  : "Uploading media..."
                : language === "ar"
                  ? "يمكنك رفع مجموعة صور وفيديوهات قصيرة لنفس الحدث."
                  : "Upload multiple images and short videos for the same event."}
            </p>
            {pastEventForm.mediaItems.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pastEventForm.mediaItems.map((item, index) => (
                  <div key={`${item.url}-${index}`} className="rounded-2xl border border-slate-200 p-3">
                    {item.type === "video" ? (
                      <video src={getApiAssetUrl(item.url)} className="h-32 w-full rounded-xl object-cover" controls />
                    ) : (
                      <img src={getApiAssetUrl(item.url)} alt={`Media ${index + 1}`} className="h-32 w-full rounded-xl object-cover" />
                    )}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-500">{item.type === "video" ? "Video" : "Image"}</span>
                      <button type="button" onClick={() => setPastEventForm((current) => ({ ...current, mediaItems: current.mediaItems.filter((_, itemIndex) => itemIndex !== index), coverImage: current.coverImage === item.url ? "" : current.coverImage }))} className="rounded-full border border-rose-200 px-3 py-1 text-xs font-medium text-rose-700">
                        {language === "ar" ? "حذف" : "Remove"}
                      </button>
                    </div>
                    {item.type === "image" ? (
                      <button type="button" onClick={() => setPastEventForm((current) => ({ ...current, coverImage: item.url }))} className={`mt-3 w-full rounded-full px-3 py-2 text-xs font-semibold ${pastEventForm.coverImage === item.url ? "bg-brand-900 text-white" : "border border-slate-200 text-slate-700"}`}>
                        {language === "ar" ? "استخدام كغلاف" : "Use as cover"}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="checkbox" checked={pastEventForm.featured} onChange={(event) => setPastEventForm((current) => ({ ...current, featured: event.target.checked }))} />
            <span className="text-sm font-medium text-slate-700">{language === "ar" ? "إظهار الفعالية" : "Show event"}</span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {editingPastEventId ? (language === "ar" ? "تحديث الفعالية" : "Update event") : (language === "ar" ? "إضافة الفعالية" : "Create event")}
            </button>
            <button type="button" onClick={resetPastEventForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {language === "ar" ? "إفراغ النموذج" : "Clear form"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {pastEvents.map((event) => (
          <div key={event._id} className="panel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                {event.coverImage ? <img src={getApiAssetUrl(event.coverImage)} alt={event.title} className="h-40 w-full rounded-3xl object-cover" /> : null}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-slate-900">{event.title}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{categoryLabelMap[event.category]}</span>
                </div>
                {event.summary ? <p className="mt-3 text-sm leading-6 text-slate-500">{event.summary}</p> : null}
                <p className="mt-3 text-xs font-medium text-slate-500">{language === "ar" ? `عدد الوسائط: ${event.mediaItems?.length || 0}` : `Media count: ${event.mediaItems?.length || 0}`}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setEditingPastEventId(event._id);
                    setPastEventForm({
                      title: event.title,
                      category: event.category,
                      eventDate: formatDateTimeLocalValue(event.eventDate),
                      countryCode: event.countryCode || "",
                      summary: event.summary || "",
                      coverImage: event.coverImage || "",
                      mediaItems: event.mediaItems || [],
                      featured: Boolean(event.featured),
                      sortOrder: String(event.sortOrder || 0),
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                >
                  <PencilLine className="h-4 w-4" />
                  {language === "ar" ? "تعديل" : "Edit"}
                </button>
                <button onClick={() => adminService.removePastEvent(event._id).then(loadData)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
                  <Trash2 className="h-4 w-4" />
                  {language === "ar" ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="panel p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{language === "ar" ? "تسجيلات الطلاب" : "Student registrations"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {language === "ar" ? "عرض وتصدير الطلاب الذين سجّلوا في الفعالية القادمة." : "Review and export students who registered for the upcoming event."}
            </p>
          </div>
          <button onClick={exportRegistrations} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white">
            <Download className="h-4 w-4" />
            {language === "ar" ? "تصدير CSV" : "Export CSV"}
          </button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-3">{language === "ar" ? "الاسم" : "Name"}</th>
                <th className="px-3 py-3">{language === "ar" ? "الهاتف" : "Phone"}</th>
                <th className="px-3 py-3">{language === "ar" ? "التخصص" : "Field"}</th>
                <th className="px-3 py-3">{language === "ar" ? "الدولة الحالية" : "Current country"}</th>
                <th className="px-3 py-3">{language === "ar" ? "الفعالية" : "Event"}</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={registration._id} className="border-b border-slate-100">
                  <td className="px-3 py-3 text-slate-900">{registration.name}</td>
                  <td className="px-3 py-3 text-slate-700">{registration.phone}</td>
                  <td className="px-3 py-3 text-slate-700">{registration.fieldOfInterest}</td>
                  <td className="px-3 py-3 text-slate-700">{registration.currentCountry}</td>
                  <td className="px-3 py-3 text-slate-700">{registration.upcomingEvent?.title || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
