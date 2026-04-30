import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { UniversityCard } from "../components/marketing/UniversityCard";
import { Seo } from "../components/seo/Seo";
import { universityService } from "../services/universityService";
import { contentService } from "../services/contentService";
import type { Country, University } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { seoText } from "../seo/site";

export const UniversitiesPage = () => {
  const { t, language, tv } = useLanguage();
  const [searchParams] = useSearchParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const selectedCountryId = searchParams.get("country") || "";
  const selectedCountry = useMemo(
    () => countries.find((country) => country._id === selectedCountryId),
    [countries, selectedCountryId]
  );

  useEffect(() => {
    Promise.all([
      universityService.getAll(selectedCountryId ? { country: selectedCountryId } : undefined),
      contentService.getCountries(),
    ]).then(([universitiesData, countriesData]) => {
      setUniversities(universitiesData);
      setCountries(countriesData);
    });
  }, [selectedCountryId]);

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
      {selectedCountry ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-3xl border border-brand-100 bg-brand-50 px-5 py-4 text-sm text-brand-900">
          <span className="font-semibold">
            {language === "ar" ? `عرض جامعات ${tv(selectedCountry.name)}` : `Showing universities in ${tv(selectedCountry.name)}`}
          </span>
          <Link to="/universities" className="rounded-full bg-white px-4 py-2 font-semibold text-brand-700 shadow-sm">
            {language === "ar" ? "عرض كل الجامعات" : "View all universities"}
          </Link>
        </div>
      ) : null}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {universities.map((university) => (
          <UniversityCard key={university._id} university={university} />
        ))}
      </div>
      {!universities.length ? (
        <div className="panel mt-8 p-8 text-sm text-slate-500">
          {language === "ar" ? "لا توجد جامعات مضافة لهذه الدولة حاليًا." : "No universities are available for this country yet."}
        </div>
      ) : null}
    </div>
  );
};
