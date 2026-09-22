import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/EmptyState";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { ToastViewport } from "../../components/ToastViewport";
import { useLanguage } from "../../hooks/useLanguage";
import { useToasts } from "../../hooks/useToasts";
import { studentService } from "../../services/studentService";
import type { FavoriteItem } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatCurrency } from "../../utils/format";

export const StudentFavoritesEnhancedPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<FavoriteItem | null>(null);
  const [removing, setRemoving] = useState(false);
  const { toasts, pushToast, dismissToast } = useToasts();

  useEffect(() => {
    studentService
      .getFavorites()
      .then(setItems)
      .catch((issue) =>
        setError(getErrorMessage(issue, isArabic ? "تعذر تحميل المفضلة." : "Unable to load favorites."))
      );
  }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      [
        item.university?.name,
        item.university?.country?.name,
        item.program?.title,
        item.program?.university?.name,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [items, query]);

  const universityFavorites = useMemo(
    () => filteredItems.filter((item) => item.itemType === "university"),
    [filteredItems]
  );
  const programFavorites = useMemo(
    () => filteredItems.filter((item) => item.itemType === "program"),
    [filteredItems]
  );

  const confirmRemoval = async () => {
    if (!pendingRemoval) return;
    setRemoving(true);
    try {
      await studentService.removeFavorite(pendingRemoval._id);
      setItems((current) => current.filter((item) => item._id !== pendingRemoval._id));
      pushToast(isArabic ? "تم حذف العنصر من المفضلة." : "Favorite removed.", "success");
      setPendingRemoval(null);
    } catch (issue) {
      setError(getErrorMessage(issue, isArabic ? "تعذر حذف العنصر من المفضلة." : "Unable to remove favorite item."));
      pushToast(isArabic ? "تعذر حذف العنصر من المفضلة." : "Unable to remove favorite item.", "error");
    } finally {
      setRemoving(false);
    }
  };

  const comparePrograms = programFavorites.slice(0, 3);

  return (
    <div className="space-y-6">
      <ToastViewport items={toasts} onDismiss={dismissToast} />

      <section className="panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "المفضلة والمقارنة" : "My Favorites & Compare"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "احفظ الجامعات والبرامج المهمة ثم قارن بينها بسرعة." : "Save important universities and programs, then compare them quickly."}</p>
          </div>
          <label className="block w-full max-w-md">
            <span className="mb-2 block text-sm font-medium text-slate-700">{isArabic ? "بحث" : "Search"}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isArabic ? "ابحث باسم الجامعة أو البرنامج" : "Search by university or program"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring"
            />
          </label>
        </div>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      {!filteredItems.length ? (
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
                    <button type="button" onClick={() => setPendingRemoval(item)} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
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
                    <button type="button" onClick={() => setPendingRemoval(item)} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">
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

      <ConfirmationModal
        open={Boolean(pendingRemoval)}
        title={isArabic ? "حذف من المفضلة" : "Remove Favorite"}
        description={
          pendingRemoval
            ? isArabic
              ? `سيتم حذف ${pendingRemoval.itemType === "university" ? pendingRemoval.university?.name : pendingRemoval.program?.title} من المفضلة.`
              : `This will remove ${pendingRemoval.itemType === "university" ? pendingRemoval.university?.name : pendingRemoval.program?.title} from favorites.`
            : ""
        }
        confirmLabel={isArabic ? "تأكيد الحذف" : "Confirm Removal"}
        cancelLabel={isArabic ? "إلغاء" : "Cancel"}
        tone="danger"
        loading={removing}
        onConfirm={confirmRemoval}
        onClose={() => !removing && setPendingRemoval(null)}
      />
    </div>
  );
};
