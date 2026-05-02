import { ArrowUpLeft, MapPinned, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Country } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getDestinationImage } from "../../utils/marketingVisuals";

export const DestinationCard = ({ country }: { country: Country }) => {
  const { t, tv } = useLanguage();

  return (
    <Link
      to={`/universities?country=${country._id}`}
      className="group block overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] transition hover:-translate-y-1"
    >
      <div className="relative h-64 overflow-hidden bg-slate-950">
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
      <div className="p-6 text-slate-900">
        <div className="inline-flex items-center gap-2 text-sm text-slate-500">
          <MapPinned className="h-4 w-4 text-brand-700" />
          <span>{t("destinationBadge")}</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">{tv(country.name)}</h3>
            <p className="mt-3 text-sm font-medium text-brand-700">{t("destinationCta")}</p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-900 transition group-hover:-translate-y-1 group-hover:border-brand-200 group-hover:bg-brand-50">
            <ArrowUpLeft className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
