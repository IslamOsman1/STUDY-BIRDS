import { useEffect, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { useLanguage } from "../../hooks/useLanguage";
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

export const StudentOrientationTestPage = () => {
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
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

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
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل اختبار التوجيه." : "Unable to load the orientation test.")));
  }, [isArabic]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload: OrientationAnswers = {
        ...answers,
        favoriteSubjects: parseCommaList(textLists.favoriteSubjects),
        interestedFields: parseCommaList(textLists.interestedFields),
        avoidFields: parseCommaList(textLists.avoidFields),
      };
      const saved = await studentService.submitOrientationTest(payload);
      setResult(saved);
      setSuccess(isArabic ? "تم حفظ اختبار التوجيه بنجاح." : "Orientation test saved successfully.");
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر حفظ اختبار التوجيه." : "Unable to save orientation test."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "اختبار التوجيه" : "Orientation Test"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "أجب عن الأسئلة التالية لمساعدتنا في توجيهك نحو التخصص والوجهة الأنسب." : "Answer the following questions so we can help guide you toward suitable study fields and destinations."}</p>
        {success ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <form onSubmit={handleSubmit} className="panel grid gap-5 p-6 md:grid-cols-2">
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
    </div>
  );
};
