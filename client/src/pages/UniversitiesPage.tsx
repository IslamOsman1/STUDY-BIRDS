import { useEffect, useMemo, useState } from "react";
import { MapPinned, ScrollText } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { UniversityCard } from "../components/marketing/UniversityCard";
import { Seo } from "../components/seo/Seo";
import { universityService } from "../services/universityService";
import { contentService } from "../services/contentService";
import type { Country, University } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { seoText } from "../seo/site";
import { getDestinationImage } from "../utils/marketingVisuals";

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
      <h1 className="mt-3 text-4xl font-semibold text-slate-900">
        {selectedCountry ? tv(selectedCountry.name) : t("universitiesTitle")}
      </h1>
      {selectedCountry ? (
        <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="relative h-72 bg-slate-950 lg:h-full">
              <img
                src={getDestinationImage(selectedCountry.name, selectedCountry.heroImage)}
                alt={tv(selectedCountry.name)}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            </div>
            <div className="p-6 lg:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <MapPinned className="h-3.5 w-3.5" />
                <span>{t("destinationBadge")}</span>
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">{selectedCountry.code}</p>
              {selectedCountry.description ? (
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{selectedCountry.description}</p>
              ) : (
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                  {language === "ar"
                    ? `استعرض الجامعات المتاحة في ${tv(selectedCountry.name)} واختر الوجهة الأنسب لخطتك الدراسية.`
                    : `Browse the universities available in ${tv(selectedCountry.name)} and choose the best fit for your study plan.`}
                </p>
              )}
              {selectedCountry.visaNotes ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                  <div className="inline-flex items-center gap-2 font-semibold text-slate-900">
                    <ScrollText className="h-4 w-4 text-brand-700" />
                    <span>{language === "ar" ? "ملاحظات مهمة" : "Important notes"}</span>
                  </div>
                  <p className="mt-3">{selectedCountry.visaNotes}</p>
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-900">
                <span className="font-semibold">
                  {language === "ar" ? `عرض جامعات ${tv(selectedCountry.name)}` : `Showing universities in ${tv(selectedCountry.name)}`}
                </span>
                <Link to="/universities" className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-accent-700 transition hover:bg-slate-200">
                  {language === "ar" ? "عرض كل الجامعات" : "View all universities"}
                </Link>
              </div>
            </div>
          </div>
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
