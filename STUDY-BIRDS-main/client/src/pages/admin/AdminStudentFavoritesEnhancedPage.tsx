import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/adminService";
import type { FavoriteItem } from "../../types";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency, formatDate } from "../../utils/format";

const PAGE_SIZE = 8;

export const AdminStudentFavoritesEnhancedPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | FavoriteItem["itemType"]>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    adminService
      .getStudentFavorites()
      .then(setItems)
      .catch((issue) =>
        setError(
          getErrorMessage(
            issue,
            isArabic ? "تعذر تحميل مفضلة الطلاب." : "Unable to load student favorites."
          )
        )
      );
  }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesType = typeFilter === "all" || item.itemType === typeFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          item.student?.name,
          item.student?.email,
          item.university?.name,
          item.program?.title,
          item.program?.university?.name,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      return matchesType && matchesQuery;
    });
  }, [items, query, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, typeFilter]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "مفضلة الطلاب" : "Student Favorites"}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {isArabic ? "اعرف ما الذي يهتم به الطلاب من جامعات وبرامج." : "See which universities and programs students are saving the most."}
        </p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="panel p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "بحث" : "Search"}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isArabic ? "ابحث باسم الطالب أو الجامعة أو البرنامج" : "Search by student, university, or program"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring"
            />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "النوع" : "Type"}</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "all" | FavoriteItem["itemType"])} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring">
              <option value="all">{isArabic ? "الكل" : "All"}</option>
              <option value="university">{isArabic ? "جامعة" : "University"}</option>
              <option value="program">{isArabic ? "برنامج" : "Program"}</option>
            </select>
          </label>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{isArabic ? "الطالب" : "Student"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "النوع" : "Type"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "العنصر" : "Item"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "التفاصيل" : "Details"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "التاريخ" : "Date"}</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-4 py-4">{item.student?.name || "--"}</td>
                  <td className="px-4 py-4">{item.itemType}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{item.itemType === "university" ? item.university?.name : item.program?.title}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {item.itemType === "university"
                      ? `${item.university?.city || "--"} / ${item.university?.country?.name || "--"}`
                      : `${item.program?.university?.name || "--"} • ${formatCurrency(item.program?.tuition)}`}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredItems.length ? (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
            {isArabic ? "لا توجد عناصر مطابقة للبحث الحالي." : "No favorites match the current filters."}
          </div>
        ) : null}

        <div className="mt-5">
          <AdminPagination page={page} totalPages={totalPages} totalItems={filteredItems.length} pageSize={PAGE_SIZE} isArabic={isArabic} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
};
