import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Seo } from "../components/seo/Seo";
import { contentService } from "../services/contentService";
import type { Country, Faq } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { SITE_NAME, seoText } from "../seo/site";
import { getPaginatedItems } from "../utils/pagination";

export const FaqPage = () => {
  const { t, language, tv } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const selectedCountryId = searchParams.get("country") || "";
  const selectedCountry = useMemo(
    () => countries.find((country) => country._id === selectedCountryId),
    [countries, selectedCountryId]
  );

  useEffect(() => {
    Promise.all([
      contentService.getFaqs({ paginate: false, ...(selectedCountryId ? { country: selectedCountryId } : {}) }),
      contentService.getCountries(),
    ]).then(([faqsData, countriesData]) => {
      setFaqs(getPaginatedItems(faqsData));
      setCountries(getPaginatedItems(countriesData));
    });
  }, [selectedCountryId]);

  const handleCountryFilter = (countryId: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (countryId) {
      nextParams.set("country", countryId);
    } else {
      nextParams.delete("country");
    }

    setSearchParams(nextParams);
    setOpenFaqId(null);
  };

  return (
    <div className="space-y-8">
      <Seo
        title={seoText(language, `FAQ | ${SITE_NAME}`, `الأسئلة الشائعة | ${SITE_NAME}`)}
        description={seoText(
          language,
          `Read the most common questions and answers about studying abroad with ${SITE_NAME}.`,
          `تصفح أكثر الأسئلة الشائعة وإجاباتها حول الدراسة بالخارج مع ${SITE_NAME}.`
        )}
      />

      <div className="panel border-t-4 border-t-accent-300 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("faqEyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">{t("faqTitle")}</h1>
        <p className="mt-4 max-w-3xl text-slate-600">{t("faqBody")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleCountryFilter("")}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              !selectedCountryId
                ? "bg-brand-900 text-white shadow-soft"
                : "border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {t("allCountries")}
          </button>
          {countries.map((country) => {
            const isActive = selectedCountryId === country._id;

            return (
              <button
                key={country._id}
                type="button"
                onClick={() => handleCountryFilter(country._id)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-brand-900 text-white shadow-soft"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
                }`}
              >
                {tv(country.name)}
              </button>
            );
          })}
        </div>
        {selectedCountry ? (
          <p className="mt-4 text-sm font-semibold text-slate-600">
            {language === "ar" ? `عرض الأسئلة الشائعة الخاصة بـ ${tv(selectedCountry.name)}` : `Showing FAQs for ${tv(selectedCountry.name)}`}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => {
          const isOpen = openFaqId === faq._id;

          return (
            <div key={faq._id} className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setOpenFaqId((current) => (current === faq._id ? null : faq._id))}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
              >
                <span className="text-base font-semibold text-slate-900 sm:text-lg">{faq.question}</span>
                <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 transition ${isOpen ? "rotate-180" : ""}`}>
                  <ChevronDown className="h-5 w-5" />
                </span>
              </button>
              {isOpen ? <div className="border-t border-slate-200 px-6 py-5 text-sm leading-7 text-slate-600">{faq.answer}</div> : null}
            </div>
          );
        })}
      </div>
      {!faqs.length ? (
        <div className="panel p-8 text-sm text-slate-500">
          {language === "ar" ? "لا توجد أسئلة شائعة لهذه الدولة حاليًا." : "No FAQs are available for this country yet."}
        </div>
      ) : null}
    </div>
  );
};
