import { ArrowUpLeft, MapPinned, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Country } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getDestinationImage } from "../../utils/marketingVisuals";
import { formatCurrency } from "../../utils/format";

export const DestinationCard = ({ country }: { country: Country }) => {
  const { t, tv, language } = useLanguage();

  return (
    <Link
      to={`/universities?country=${country._id}`}
      className="group block overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] transition hover:-translate-y-1"
    >
      <div className="relative h-40 overflow-hidden bg-slate-950 sm:h-52 lg:h-64">
        <img
          src={getDestinationImage(country.name, country.heroImage)}
          alt={tv(country.name)}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent" />
        <div className="absolute start-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          {country.code}
        </div>
      </div>

      <div className="p-4 text-slate-900 sm:p-5 lg:p-6">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 sm:text-xs">
          <MapPinned className="h-4 w-4 text-brand-700" />
          <span>{t("destinationBadge")}</span>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold sm:text-lg lg:text-xl">{tv(country.name)}</h3>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-900 transition group-hover:-translate-y-1 group-hover:border-brand-200 group-hover:bg-brand-50 sm:h-11 sm:w-11 lg:h-12 lg:w-12">
              <ArrowUpLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-slate-600 sm:text-[11px]">
            <div className="rounded-2xl bg-slate-100 px-2 py-1.5 sm:px-2.5 sm:py-2">
              {language === "ar" ? `الجامعات ${country.universityCount || 0}` : `${country.universityCount || 0} Universities`}
            </div>
            <div className="rounded-2xl bg-slate-100 px-2 py-1.5 sm:px-2.5 sm:py-2">
              {language === "ar" ? `التخصصات ${country.specialtyCount || 0}` : `${country.specialtyCount || 0} Specialties`}
            </div>
            <div className="col-span-2 rounded-2xl bg-slate-100 px-2 py-1.5 sm:px-2.5 sm:py-2">
              {language === "ar" ? `متوسط الرسوم ${formatCurrency(country.averageTuition)}` : `Avg ${formatCurrency(country.averageTuition)}`}
            </div>
          </div>

          <p className="text-[11px] font-medium text-brand-700 sm:text-xs">{t("destinationCta")}</p>
        </div>
      </div>
    </Link>
  );
};
