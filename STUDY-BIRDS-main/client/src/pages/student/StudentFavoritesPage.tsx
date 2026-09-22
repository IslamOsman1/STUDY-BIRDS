import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/EmptyState";
import { useLanguage } from "../../hooks/useLanguage";
import { studentService } from "../../services/studentService";
import type { FavoriteItem } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency } from "../../utils/format";

export const StudentFavoritesPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    studentService
      .getFavorites()
      .then(setItems)
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل المفضلة." : "Unable to load favorites.")));
  }, [isArabic]);

  const universityFavorites = useMemo(() => items.filter((item) => item.itemType === "university"), [items]);
  const programFavorites = useMemo(() => items.filter((item) => item.itemType === "program"), [items]);

  const handleRemove = async (id: string) => {
    try {
      await studentService.removeFavorite(id);
      setItems((current) => current.filter((item) => item._id !== id));
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر حذف العنصر من المفضلة." : "Unable to remove favorite item."));
    }
  };

  const comparePrograms = programFavorites.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "المفضلة والمقارنة" : "My Favorites & Compare"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? "احفظ الجامعات والبرامج المهمة ثم قارن بينها بسرعة." : "Save important universities and programs, then compare them quickly."}</p>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      {!items.length ? (
        <EmptyState title={isArabic ? "لا توجد عناصر مفضلة بعد" : "No favorites yet"} description={isArabic ? "يمكنك إضافة جامعة أو برنامج من صفحات التفاصيل." : "You can add a university or program from its details page."} />
      ) : (
        <>
          <section className="panel p-6">
            <h2 className="text-2xl font-semibold text-slate-900">{isArabic ? "الجامعات المفضلة" : "Favorite Universities"}</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {universityFavorites.map((item) => (
                <article key={item._id} className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="text-xl font-semibold text-slate-900">{item.university?.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.university?.country?.name} • {item.university?.city}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to={`/universities/${item.university?._id}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                      {isArabic ? "عرض الجامعة" : "View University"}
                    </Link>
                    <button type="button" onClick={() => handleRemove(item._id)} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
                      {isArabic ? "حذف" : "Remove"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel p-6">
            <h2 className="text-2xl font-semibold text-slate-900">{isArabic ? "البرامج المفضلة" : "Favorite Programs"}</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {programFavorites.map((item) => (
                <article key={item._id} className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="text-xl font-semibold text-slate-900">{item.program?.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.program?.university?.name}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to={`/programs/${item.program?._id}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                      {isArabic ? "عرض البرنامج" : "View Program"}
                    </Link>
                    <button type="button" onClick={() => handleRemove(item._id)} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
                      {isArabic ? "حذف" : "Remove"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel p-6">
            <h2 className="text-2xl font-semibold text-slate-900">{isArabic ? "مقارنة سريعة" : "Quick Compare"}</h2>
            {comparePrograms.length ? (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">{isArabic ? "البرنامج" : "Program"}</th>
                      <th className="px-4 py-3 font-medium">{isArabic ? "الجامعة" : "University"}</th>
                      <th className="px-4 py-3 font-medium">{isArabic ? "لغة الدراسة" : "Language"}</th>
                      <th className="px-4 py-3 font-medium">{isArabic ? "الرسوم" : "Tuition"}</th>
                      <th className="px-4 py-3 font-medium">{isArabic ? "المدينة / الدولة" : "City / Country"}</th>
                      <th className="px-4 py-3 font-medium">{isArabic ? "مدة الدراسة" : "Duration"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparePrograms.map((item) => (
                      <tr key={item._id} className="border-t border-slate-100">
                        <td className="px-4 py-4 font-semibold text-slate-900">{item.program?.title}</td>
                        <td className="px-4 py-4 text-slate-600">{item.program?.university?.name}</td>
                        <td className="px-4 py-4 text-slate-600">{item.program?.language || "--"}</td>
                        <td className="px-4 py-4 text-slate-600">{formatCurrency(item.program?.tuition)}</td>
                        <td className="px-4 py-4 text-slate-600">{item.program?.university?.city || "--"} / {item.program?.university?.country?.name || "--"}</td>
                        <td className="px-4 py-4 text-slate-600">{item.program?.duration || "--"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">{isArabic ? "أضف برامج أكثر للمفضلة لعرض المقارنة." : "Add more programs to favorites to compare them here."}</div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
