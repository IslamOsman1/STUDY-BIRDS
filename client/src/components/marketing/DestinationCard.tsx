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
      className="group relative block overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
    >
      <div className="relative h-72">
        <img
          src={getDestinationImage(country.name, country.heroImage)}
          alt={tv(country.name)}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-950/5" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {country.code}
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-sm text-white/85">
                <MapPinned className="h-4 w-4" />
                <span>{t("destinationBadge")}</span>
              </div>
              <h3 className="mt-2 text-2xl font-semibold">{tv(country.name)}</h3>
              {country.description ? <p className="mt-2 max-w-xs text-sm leading-6 text-white/85">{country.description}</p> : null}
              <p className="mt-3 text-sm font-medium text-sky-100">{t("destinationCta")}</p>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition group-hover:-translate-y-1">
              <ArrowUpLeft className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
