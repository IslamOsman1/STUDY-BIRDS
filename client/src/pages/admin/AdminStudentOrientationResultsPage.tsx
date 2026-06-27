import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import type { OrientationTestResultItem } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

export const AdminStudentOrientationResultsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<OrientationTestResultItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getOrientationResults()
      .then(setItems)
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل نتائج اختبار التوجيه." : "Unable to load orientation results.")));
  }, [isArabic]);

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "نتائج اختبار التوجيه" : "Orientation Results"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "راجع تفضيلات الطلاب والنتائج الإرشادية المقترحة لهم." : "Review student preferences and the suggested guidance results."}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item._id} className="panel p-6">
            <h2 className="text-xl font-semibold text-slate-900">{item.student?.name || "--"}</h2>
            <p className="mt-1 text-sm text-slate-500">{item.student?.email || "--"}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{isArabic ? "المواد المفضلة" : "Favorite Subjects"}</p>
                <p className="mt-2">{item.answers.favoriteSubjects?.join(", ") || "--"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{isArabic ? "المجالات المهتم بها" : "Interested Fields"}</p>
                <p className="mt-2">{item.answers.interestedFields?.join(", ") || "--"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{isArabic ? "النتيجة الإرشادية" : "Recommendation Summary"}</p>
                <p className="mt-2">{item.recommendationSummary || "--"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{isArabic ? "الحقول المقترحة" : "Suggested Fields"}</p>
                <p className="mt-2">{item.suggestedFields?.join(", ") || "--"}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
