import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/adminService";
import type { OrientationTestResultItem } from "../../types";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";

const PAGE_SIZE = 5;

export const AdminStudentOrientationResultsEnhancedPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<OrientationTestResultItem[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    adminService
      .getOrientationResults()
      .then(setItems)
      .catch((issue) =>
        setError(
          getErrorMessage(
            issue,
            isArabic ? "تعذر تحميل نتائج اختبار التوجيه." : "Unable to load orientation results."
          )
        )
      );
  }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      [
        item.student?.name,
        item.student?.email,
        item.recommendationSummary,
        ...(item.answers.favoriteSubjects || []),
        ...(item.answers.interestedFields || []),
        ...(item.suggestedFields || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "نتائج اختبار التوجيه" : "Orientation Results"}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {isArabic ? "راجع تفضيلات الطلاب والنتائج الإرشادية المقترحة لهم." : "Review student preferences and the suggested guidance results."}
        </p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="panel p-6">
        <label className="block max-w-xl">
          <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "بحث" : "Search"}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isArabic ? "ابحث باسم الطالب أو التوصية أو الاهتمامات" : "Search by student, guidance, or interests"}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring"
          />
        </label>

        <div className="mt-6 space-y-4">
          {visibleItems.map((item) => (
            <article key={item._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">{item.student?.name || "--"}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.student?.email || "--"}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{isArabic ? "المواد المفضلة" : "Favorite Subjects"}</p>
                  <p className="mt-2">{item.answers.favoriteSubjects?.join(", ") || "--"}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{isArabic ? "المجالات المهتم بها" : "Interested Fields"}</p>
                  <p className="mt-2">{item.answers.interestedFields?.join(", ") || "--"}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{isArabic ? "النتيجة الإرشادية" : "Recommendation Summary"}</p>
                  <p className="mt-2">{item.recommendationSummary || "--"}</p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{isArabic ? "الحقول المقترحة" : "Suggested Fields"}</p>
                  <p className="mt-2">{item.suggestedFields?.join(", ") || "--"}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!filteredItems.length ? (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
            {isArabic ? "لا توجد نتائج مطابقة للبحث الحالي." : "No orientation results match the current search."}
          </div>
        ) : null}

        <div className="mt-5">
          <AdminPagination page={page} totalPages={totalPages} totalItems={filteredItems.length} pageSize={PAGE_SIZE} isArabic={isArabic} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
};
