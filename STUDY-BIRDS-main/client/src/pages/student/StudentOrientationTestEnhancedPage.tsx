import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { ToastViewport } from "../../components/ToastViewport";
import { useLanguage } from "../../hooks/useLanguage";
import { useToasts } from "../../hooks/useToasts";
import { studentService } from "../../services/studentService";
import type { OrientationTestResultItem } from "../../types";
import { getErrorMessage } from "../../utils/errors";

type OrientationAnswers = OrientationTestResultItem["answers"];

const emptyAnswers: OrientationAnswers = {
  favoriteSubjects: [],
  interestedFields: [],
  studyStyle: "",
  preferredLanguage: "",
  preferredCountry: "",
  approximateBudget: "",
  desiredDegreeLevel: "",
  avoidFields: [],
};

const parseCommaList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const StudentOrientationTestEnhancedPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [result, setResult] = useState<OrientationTestResultItem | null>(null);
  const [answers, setAnswers] = useState<OrientationAnswers>(emptyAnswers);
  const [textLists, setTextLists] = useState({
    favoriteSubjects: "",
    interestedFields: "",
    avoidFields: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toasts, pushToast, dismissToast } = useToasts();

  useEffect(() => {
    studentService
      .getOrientationTest()
      .then((data) => {
        setResult(data);
        if (data?.answers) {
          setAnswers(data.answers);
          setTextLists({
            favoriteSubjects: data.answers.favoriteSubjects?.join(", ") || "",
            interestedFields: data.answers.interestedFields?.join(", ") || "",
            avoidFields: data.answers.avoidFields?.join(", ") || "",
          });
        }
      })
      .catch((issue) =>
        setError(
          getErrorMessage(
            issue,
            isArabic ? "تعذر تحميل اختبار التوجيه." : "Unable to load the orientation test."
          )
        )
      );
  }, [isArabic]);

  const payloadPreview = useMemo(
    () => ({
      favoriteSubjects: parseCommaList(textLists.favoriteSubjects),
      interestedFields: parseCommaList(textLists.interestedFields),
      avoidFields: parseCommaList(textLists.avoidFields),
    }),
    [textLists]
  );

  const saveOrientation = async () => {
    setSaving(true);
    setError("");
    try {
      const payload: OrientationAnswers = {
        ...answers,
        favoriteSubjects: payloadPreview.favoriteSubjects,
        interestedFields: payloadPreview.interestedFields,
        avoidFields: payloadPreview.avoidFields,
      };
      const saved = await studentService.submitOrientationTest(payload);
      setResult(saved);
      pushToast(
        isArabic ? "تم حفظ اختبار التوجيه بنجاح." : "Orientation test saved successfully.",
        "success"
      );
      setConfirmOpen(false);
    } catch (issue) {
      setError(
        getErrorMessage(
          issue,
          isArabic ? "تعذر حفظ اختبار التوجيه." : "Unable to save orientation test."
        )
      );
      pushToast(isArabic ? "تعذر حفظ اختبار التوجيه." : "Unable to save orientation test.", "error");
    } finally {
      setSaving(false);
    }
  };

  const completionCount = [
    payloadPreview.favoriteSubjects.length > 0,
    payloadPreview.interestedFields.length > 0,
    Boolean(answers.studyStyle),
    Boolean(answers.preferredLanguage),
    Boolean(answers.preferredCountry),
    Boolean(answers.approximateBudget),
    Boolean(answers.desiredDegreeLevel),
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <ToastViewport items={toasts} onDismiss={dismissToast} />

      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "اختبار التوجيه" : "Orientation Test"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "أجب عن الأسئلة التالية لمساعدتنا في توجيهك نحو التخصص والوجهة الأنسب." : "Answer the following questions so we can help guide you toward suitable study fields and destinations."}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">{isArabic ? "الأسئلة المكتملة" : "Completed Inputs"}</p>
          <p className="mt-4 text-2xl font-semibold text-slate-900">{completionCount}/7</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">{isArabic ? "المواد المفضلة" : "Favorite Subjects"}</p>
          <p className="mt-4 text-lg font-semibold text-slate-900">{payloadPreview.favoriteSubjects.length || 0}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">{isArabic ? "المجالات المهتم بها" : "Interested Fields"}</p>
          <p className="mt-4 text-lg font-semibold text-slate-900">{payloadPreview.interestedFields.length || 0}</p>
        </article>
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setConfirmOpen(true);
        }}
        className="panel grid gap-5 p-6 md:grid-cols-2"
      >
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "المواد الدراسية المفضلة" : "Favorite Subjects"}</span>
          <input value={textLists.favoriteSubjects} onChange={(event) => setTextLists((current) => ({ ...current, favoriteSubjects: event.target.value }))} placeholder={isArabic ? "مثال: رياضيات، أحياء، اقتصاد" : "Example: Math, Biology, Economics"} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "المجالات التي تهتم بها" : "Interested Fields"}</span>
          <input value={textLists.interestedFields} onChange={(event) => setTextLists((current) => ({ ...current, interestedFields: event.target.value }))} placeholder={isArabic ? "مثال: هندسة، إدارة أعمال" : "Example: Engineering, Business"} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "تفضّل الدراسة" : "Study Style"}</span>
          <select value={answers.studyStyle || ""} onChange={(event) => setAnswers((current) => ({ ...current, studyStyle: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring">
            <option value="">{isArabic ? "اختر" : "Select"}</option>
            <option value="practical">{isArabic ? "عملية" : "Practical"}</option>
            <option value="theoretical">{isArabic ? "نظرية" : "Theoretical"}</option>
            <option value="balanced">{isArabic ? "متوازنة" : "Balanced"}</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "اللغة المفضلة للدراسة" : "Preferred Study Language"}</span>
          <input value={answers.preferredLanguage || ""} onChange={(event) => setAnswers((current) => ({ ...current, preferredLanguage: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "البلد المفضل للدراسة" : "Preferred Study Country"}</span>
          <input value={answers.preferredCountry || ""} onChange={(event) => setAnswers((current) => ({ ...current, preferredCountry: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "الميزانية التقريبية" : "Approximate Budget"}</span>
          <input value={answers.approximateBudget || ""} onChange={(event) => setAnswers((current) => ({ ...current, approximateBudget: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "المرحلة الدراسية المطلوبة" : "Desired Degree Level"}</span>
          <input value={answers.desiredDegreeLevel || ""} onChange={(event) => setAnswers((current) => ({ ...current, desiredDegreeLevel: event.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "مجالات لا ترغب بها" : "Fields to Avoid"}</span>
          <input value={textLists.avoidFields} onChange={(event) => setTextLists((current) => ({ ...current, avoidFields: event.target.value }))} placeholder={isArabic ? "مثال: طب، محاسبة" : "Example: Medicine, Accounting"} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring" />
        </label>
        <button type="submit" disabled={saving} className="w-fit rounded-full bg-brand-900 px-6 py-3 font-semibold text-white md:col-span-2">
          {saving ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : isArabic ? "حفظ الاختبار" : "Save Test"}
        </button>
      </form>

      {result ? (
        <section className="panel p-6">
          <h2 className="text-2xl font-semibold text-slate-900">{isArabic ? "النتيجة الحالية" : "Current Result"}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{result.recommendationSummary || (isArabic ? "سيتم عرض التوصية هنا بعد الحفظ." : "Your recommendation will appear here after saving.")}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">{isArabic ? "الحقول المقترحة" : "Suggested Fields"}</p>
              <p className="mt-2 text-sm text-slate-600">{result.suggestedFields?.join(", ") || "--"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-700">{isArabic ? "الدول المقترحة" : "Suggested Countries"}</p>
              <p className="mt-2 text-sm text-slate-600">{result.suggestedCountries?.join(", ") || "--"}</p>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState title={isArabic ? "لا توجد نتيجة محفوظة بعد" : "No saved result yet"} description={isArabic ? "املأ الاستبيان وسيتم عرض التوصية هنا." : "Complete the assessment and your recommendation will appear here."} />
      )}

      <ConfirmationModal
        open={confirmOpen}
        title={isArabic ? "تأكيد حفظ الاختبار" : "Confirm Test Save"}
        description={isArabic ? `سيتم حفظ بيانات الاختبار الحالية مع ${payloadPreview.interestedFields.length} مجالات اهتمام و${payloadPreview.favoriteSubjects.length} مواد مفضلة.` : `This will save the current test with ${payloadPreview.interestedFields.length} interested fields and ${payloadPreview.favoriteSubjects.length} favorite subjects.`}
        confirmLabel={isArabic ? "تأكيد الحفظ" : "Confirm Save"}
        cancelLabel={isArabic ? "إلغاء" : "Cancel"}
        loading={saving}
        onConfirm={saveOrientation}
        onClose={() => !saving && setConfirmOpen(false)}
      />
    </div>
  );
};
