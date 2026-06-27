import { EmptyState } from "../../components/EmptyState";
import { useLanguage } from "../../hooks/useLanguage";

export const StudentWorkspacePlaceholderPage = ({
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
}: {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}) => {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-3xl font-semibold text-slate-900">{isArabic ? titleAr : titleEn}</h1>
        <p className="mt-2 text-sm text-slate-500">{isArabic ? descriptionAr : descriptionEn}</p>
      </section>
      <EmptyState
        title={isArabic ? "سيتم تفعيل هذا القسم قريبًا" : "This module will be enabled soon"}
        description={
          isArabic
            ? "تم تجهيز مكان هذا القسم داخل لوحة الطالب، ويمكن الآن متابعة تنفيذ الربط الكامل مع العمليات والإدارة."
            : "This section has been prepared inside the student dashboard and is ready for deeper workflow integration."
        }
      />
    </div>
  );
};
