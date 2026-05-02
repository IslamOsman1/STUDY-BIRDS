import { useEffect, useMemo, useState } from "react";
import { ScrollText, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { ProgramCard } from "../components/marketing/ProgramCard";
import { SearchFilter } from "../components/marketing/SearchFilter";
import { EmptyState } from "../components/EmptyState";
import { Seo } from "../components/seo/Seo";
import { programService } from "../services/programService";
import { universityService } from "../services/universityService";
import { contentService } from "../services/contentService";
import type { Country, Program, StudyField, University } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { seoText } from "../seo/site";
import { getApiAssetUrl } from "../lib/api";

export const ProgramsPage = () => {
  const { t, language, tv } = useLanguage();
  const [searchParams] = useSearchParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [studyFields, setStudyFields] = useState<StudyField[]>([]);
  const [keyword, setKeyword] = useState(() => searchParams.get("keyword") || "");
  const [filters, setFilters] = useState<Record<string, string>>(() => ({
    country: searchParams.get("country") || "",
    university: searchParams.get("university") || "",
    degreeLevel: searchParams.get("degreeLevel") || "",
    fieldOfStudy: searchParams.get("fieldOfStudy") || "",
    tuitionMin: searchParams.get("tuitionMin") || "",
    tuitionMax: searchParams.get("tuitionMax") || "",
    intake: searchParams.get("intake") || "",
    sortBy: searchParams.get("sortBy") || "",
  }));
  const selectedStudyField = useMemo(
    () => studyFields.find((studyField) => studyField.name === filters.fieldOfStudy),
    [filters.fieldOfStudy, studyFields]
  );

  useEffect(() => {
    Promise.all([
      contentService.getCountries(),
      universityService.getAll(),
      programService.getAll(),
      contentService.getStudyFields(),
    ]).then(([countryData, universityData, programData, studyFieldData]) => {
      setCountries(countryData);
      setUniversities(universityData);
      setPrograms(programData);
      setStudyFields(studyFieldData);
    });
  }, []);

  useEffect(() => {
    const params = { keyword, ...filters };
    programService.getAll(params).then(setPrograms);
  }, [keyword, filters]);

  return (
    <div className="space-y-8">
      <Seo
        title={seoText(language, "Study Abroad Programs", "برامج الدراسة بالخارج")}
        description={seoText(
          language,
          "Browse study abroad programs, compare tuition, degree levels, and admission requirements in English and Arabic.",
          "تصفح برامج الدراسة بالخارج وقارن الرسوم والدرجات العلمية ومتطلبات القبول بالعربية والإنجليزية."
        )}
        keywords={[
          "study abroad programs",
          "international degree programs",
          "university admissions",
          "برامج دولية",
          "برامج جامعية",
        ]}
      />
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("programs")}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">
          {selectedStudyField ? tv(selectedStudyField.name) : t("searchProgramsTitle")}
        </h1>
      </div>
      {selectedStudyField ? (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="relative h-72 bg-slate-950 lg:h-full">
              {selectedStudyField.image ? (
                <img src={getApiAssetUrl(selectedStudyField.image)} alt={tv(selectedStudyField.name)} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-fusion" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
            </div>
            <div className="p-6 lg:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t("studyFieldBadge")}</span>
              </div>
              {selectedStudyField.description ? (
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{selectedStudyField.description}</p>
              ) : (
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                  {language === "ar"
                    ? `استعرض البرامج المتاحة في تخصص ${tv(selectedStudyField.name)} وقارن بين الجامعات والرسوم قبل اختيار البرنامج المناسب.`
                    : `Browse the programs available in ${tv(selectedStudyField.name)} and compare universities and tuition before choosing the best fit.`}
                </p>
              )}
              <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                <div className="inline-flex items-center gap-2 font-semibold text-slate-900">
                  <ScrollText className="h-4 w-4 text-brand-700" />
                  <span>{language === "ar" ? "عرض البرامج" : "Program view"}</span>
                </div>
                <p className="mt-3">
                  {language === "ar"
                    ? `يتم الآن عرض البرامج المرتبطة بتخصص ${tv(selectedStudyField.name)} فقط.`
                    : `You are now viewing programs related to ${tv(selectedStudyField.name)} only.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <SearchFilter
        keyword={keyword}
        filters={filters}
        countries={countries}
        universities={universities}
        studyFields={studyFields}
        onKeywordChange={setKeyword}
        onFilterChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />
      {programs.length ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {programs.map((program) => (
            <ProgramCard key={program._id} program={program} />
          ))}
        </div>
      ) : (
        <EmptyState title={t("noPrograms")} description={t("noProgramsDescription")} />
      )}
    </div>
  );
};
