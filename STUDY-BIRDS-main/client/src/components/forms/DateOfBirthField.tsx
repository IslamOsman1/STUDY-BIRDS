import { useMemo } from "react";
import type { Language } from "../../context/LanguageContext";

type DateOfBirthFieldProps = {
  label: string;
  language: Language;
  value?: string;
  onChange: (value: string) => void;
};

const parseDateValue = (value?: string) => {
  const [year = "", month = "", day = ""] = (value || "").split("-");
  return { year, month, day };
};

export const DateOfBirthField = ({
  label,
  language,
  value,
  onChange,
}: DateOfBirthFieldProps) => {
  const { year, month, day } = parseDateValue(value);
  const currentYear = new Date().getFullYear();

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(language === "ar" ? "ar" : "en-US", { month: "long" }),
    [language]
  );

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: String(index + 1).padStart(2, "0"),
        label: monthFormatter.format(new Date(2024, index, 1)),
      })),
    [monthFormatter]
  );

  const years = useMemo(
    () => Array.from({ length: 100 }, (_, index) => String(currentYear - index)),
    [currentYear]
  );

  const placeholders =
    language === "ar"
      ? { day: "اليوم", month: "الشهر", year: "السنة" }
      : { day: "Day", month: "Month", year: "Year" };

  const updateValue = (next: { year?: string; month?: string; day?: string }) => {
    const nextYear = next.year ?? year;
    const nextMonth = next.month ?? month;
    const nextDay = next.day ?? day;

    if (nextYear && nextMonth && nextDay) {
      onChange(`${nextYear}-${nextMonth}-${nextDay}`);
      return;
    }

    onChange("");
  };

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <div className="grid gap-3 sm:grid-cols-3">
        <select
          value={day}
          onChange={(event) => updateValue({ day: event.target.value })}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-300 focus:ring"
        >
          <option value="">{placeholders.day}</option>
          {Array.from({ length: 31 }, (_, index) => {
            const optionValue = String(index + 1).padStart(2, "0");
            return (
              <option key={optionValue} value={optionValue}>
                {index + 1}
              </option>
            );
          })}
        </select>

        <select
          value={month}
          onChange={(event) => updateValue({ month: event.target.value })}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-300 focus:ring"
        >
          <option value="">{placeholders.month}</option>
          {months.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(event) => updateValue({ year: event.target.value })}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-300 focus:ring"
        >
          <option value="">{placeholders.year}</option>
          {years.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
};
