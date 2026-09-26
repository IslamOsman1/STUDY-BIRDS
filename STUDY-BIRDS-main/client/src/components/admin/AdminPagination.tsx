import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  isArabic: boolean;
  onPageChange: (page: number) => void;
}

export const AdminPagination = ({ page, totalPages, totalItems, pageSize, isArabic, onPageChange }: AdminPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        {isArabic ? `عرض ${start}-${end} من ${totalItems}` : `Showing ${start}-${end} of ${totalItems}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          {isArabic ? "السابق" : "Previous"}
        </button>
        <span className="text-sm font-medium text-slate-600">{isArabic ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}</span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          {isArabic ? "التالي" : "Next"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
