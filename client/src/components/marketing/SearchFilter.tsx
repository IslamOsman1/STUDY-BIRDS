import type { Country, StudyField, University } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import {
  PROGRAM_DEGREE_LEVELS,
  PROGRAM_INTAKES,
} from "../../constants/programOptions";

interface SearchFilterProps {
  keyword: string;
  filters: Record<string, string>;
  countries: Country[];
  universities: University[];
  studyFields: StudyField[];
  onKeywordChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
}

export const SearchFilter = ({
  keyword,
  filters,
  countries,
  universities,
  studyFields,
  onKeywordChange,
  onFilterChange,
}: SearchFilterProps) => {
  const { t, tv } = useLanguage();

  return (
    <div className="panel grid gap-4 p-5 lg:grid-cols-4">
      <input
        value={keyword}
        onChange={(event) => onKeywordChange(event.target.value)}
        placeholder={t("searchKeyword")}
        className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-300 focus:ring"
      />
      <select
        value={filters.country}
        onChange={(event) => onFilterChange("country", event.target.value)}
        className="rounded-2xl border border-slate-200 px-4 py-3"
      >
        <option value="">{t("allCountries")}</option>
        {countries.map((country) => (
          <option key={country._id} value={country._id}>
            {tv(country.name)}
          </option>
        ))}
      </select>
      <select
        value={filters.university}
        onChange={(event) => onFilterChange("university", event.target.value)}
        className="rounded-2xl border border-slate-200 px-4 py-3"
      >
        <option value="">{t("allUniversities")}</option>
        {universities.map((university) => (
          <option key={university._id} value={university._id}>
            {university.name}
          </option>
        ))}
      </select>
      <select
        value={filters.degreeLevel}
        onChange={(event) => onFilterChange("degreeLevel", event.target.value)}
        className="rounded-2xl border border-slate-200 px-4 py-3"
      >
        <option value="">{t("allDegreeLevels")}</option>
        {PROGRAM_DEGREE_LEVELS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.translationKey)}
          </option>
        ))}
      </select>
      <select
        value={filters.fieldOfStudy}
        onChange={(event) => onFilterChange("fieldOfStudy", event.target.value)}
        className="rounded-2xl border border-slate-200 px-4 py-3"
      >
        <option value="">{t("allFields")}</option>
        {studyFields.map((studyField) => (
          <option key={studyField._id} value={studyField.name}>
            {tv(studyField.name)}
          </option>
        ))}
      </select>
      <input
        value={filters.tuitionMin}
        onChange={(event) => onFilterChange("tuitionMin", event.target.value)}
        placeholder={t("minTuition")}
        className="rounded-2xl border border-slate-200 px-4 py-3"
      />
      <input
        value={filters.tuitionMax}
        onChange={(event) => onFilterChange("tuitionMax", event.target.value)}
        placeholder={t("maxTuition")}
        className="rounded-2xl border border-slate-200 px-4 py-3"
      />
      <select
        value={filters.intake}
        onChange={(event) => onFilterChange("intake", event.target.value)}
        className="rounded-2xl border border-slate-200 px-4 py-3"
      >
        <option value="">{t("allIntakes")}</option>
        {PROGRAM_INTAKES.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.translationKey)}
          </option>
        ))}
      </select>
      <select
        value={filters.sortBy}
        onChange={(event) => onFilterChange("sortBy", event.target.value)}
        className="rounded-2xl border border-slate-200 px-4 py-3 lg:col-span-4"
      >
        <option value="">{t("sortByFeatured")}</option>
        <option value="tuition">{t("tuition")}</option>
        <option value="deadline">{t("deadline")}</option>
        <option value="popularity">{t("popularity")}</option>
      </select>
    </div>
  );
};
