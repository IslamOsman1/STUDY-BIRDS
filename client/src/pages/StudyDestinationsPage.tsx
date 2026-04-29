import { useEffect, useState } from "react";
import { DestinationCard } from "../components/marketing/DestinationCard";
import { Seo } from "../components/seo/Seo";
import { contentService } from "../services/contentService";
import type { Country } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { seoText } from "../seo/site";

export const StudyDestinationsPage = () => {
  const { t, language } = useLanguage();
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    contentService.getCountries().then(setCountries);
  }, []);

  return (
    <div>
      <Seo
        title={seoText(language, "Study Destinations", "وجهات الدراسة")}
        description={seoText(
          language,
          "Discover the best study destinations, compare countries, and choose where to continue your education abroad.",
          "اكتشف أفضل وجهات الدراسة وقارن بين الدول واختر المكان الأنسب لمتابعة تعليمك في الخارج."
        )}
        keywords={[
          "study destinations",
          "study abroad countries",
          "international education destinations",
          "وجهات الدراسة",
          "دول الدراسة بالخارج",
        ]}
      />
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("destinations")}</p>
      <h1 className="mt-3 text-4xl font-semibold text-slate-900">{t("destinationsTitle")}</h1>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {countries.map((country) => (
          <DestinationCard key={country._id} country={country} />
        ))}
      </div>
    </div>
  );
};
