import { useEffect, useState } from "react";
import { UniversityCard } from "../components/marketing/UniversityCard";
import { Seo } from "../components/seo/Seo";
import { universityService } from "../services/universityService";
import type { University } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { seoText } from "../seo/site";

export const UniversitiesPage = () => {
  const { t, language } = useLanguage();
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    universityService.getAll().then(setUniversities);
  }, []);

  return (
    <div>
      <Seo
        title={seoText(language, "International Universities", "جامعات دولية")}
        description={seoText(
          language,
          "Explore international universities, partner institutions, rankings, and tuition options for studying abroad.",
          "استكشف الجامعات الدولية والجامعات الشريكة والتصنيفات وخيارات الرسوم للدراسة بالخارج."
        )}
        keywords={[
          "international universities",
          "partner universities",
          "study abroad universities",
          "جامعات دولية",
          "جامعات شريكة",
        ]}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("universities")}</p>
      <h1 className="mt-3 text-4xl font-semibold text-slate-900">{t("universitiesTitle")}</h1>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {universities.map((university) => (
          <UniversityCard key={university._id} university={university} />
        ))}
      </div>
    </div>
  );
};
