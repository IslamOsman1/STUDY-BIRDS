import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { adminService } from "../../services/adminService";
import type { DocumentItem } from "../../types";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { useLanguage } from "../../hooks/useLanguage";
import { getErrorMessage } from "../../utils/errors";
import { formatDate } from "../../utils/format";
import { getApiAssetUrl } from "../../lib/api";

const PAGE_SIZE = 8;

export const AdminStudentDocumentsPage = () => {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DocumentItem["status"]>("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getStudentDocuments()
      .then(setItems)
      .catch((issue) => setError(getErrorMessage(issue, isArabic ? "تعذر تحميل مستندات الطلاب." : "Unable to load student documents.")));
  }, [isArabic]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [item.student?.name, item.student?.email, item.fileName, item.type]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, statusFilter]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? "مستندات الطلاب" : "Student Documents"}</h1>
            <p className="mt-2 text-sm text-slate-500">{isArabic ? "مراجعة كل الملفات التي رفعها الطلاب من مكان واحد." : "Review all files uploaded by students from one place."}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "بحث" : "Search"}</span>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isArabic ? "ابحث بالطالب أو الملف" : "Search by student or file"} className="w-full border-none bg-transparent p-0 outline-none" />
              </div>
            </label>
            <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isArabic ? "الحالة" : "Status"}</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | DocumentItem["status"])} className="w-full border-none bg-transparent p-0 outline-none">
                <option value="all">{isArabic ? "كل الحالات" : "All statuses"}</option>
                <option value="pending">{isArabic ? "قيد المراجعة" : "Pending"}</option>
                <option value="verified">{isArabic ? "مقبول" : "Verified"}</option>
                <option value="rejected">{isArabic ? "مرفوض" : "Rejected"}</option>
              </select>
            </label>
          </div>
        </div>
        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      </section>

      <section className="panel p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">{isArabic ? "الطالب" : "Student"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "نوع المستند" : "Document Type"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "اسم الملف" : "File Name"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "التاريخ" : "Date"}</th>
                <th className="px-4 py-3 font-medium">{isArabic ? "الإجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.student?.name || "--"}</p>
                      <p className="text-slate-500">{item.student?.email || "--"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">{item.type}</td>
                  <td className="px-4 py-4 font-medium text-slate-900">{item.fileName}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "verified" ? "bg-emerald-100 text-emerald-700" : item.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-4">
                    <a href={getApiAssetUrl(item.filePath)} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700">
                      {isArabic ? "عرض الملف" : "View file"}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 ? <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{isArabic ? "لا توجد مستندات مطابقة." : "No matching documents found."}</div> : null}

        <div className="mt-5">
          <AdminPagination page={page} totalPages={totalPages} totalItems={filteredItems.length} pageSize={PAGE_SIZE} isArabic={isArabic} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
};
