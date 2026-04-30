import { useEffect, useState } from "react";
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

export const ProgramsPage = () => {
  const { t, language } = useLanguage();
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
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">{t("searchProgramsTitle")}</h1>
      </div>
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
