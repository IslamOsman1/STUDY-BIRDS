import { MapPinned } from "lucide-react";
import type { Country } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getDestinationImage } from "../../utils/marketingVisuals";

export const DestinationCard = ({ country }: { country: Country }) => {
  const { tv } = useLanguage();

  return (
    <div className="panel overflow-hidden p-0">
      <div className="relative h-44">
        <img
          src={getDestinationImage(country.name, country.heroImage)}
          alt={tv(country.name)}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/15 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 text-white">
          <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] backdrop-blur">
            {country.code}
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <MapPinned size={18} />
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-slate-900">{tv(country.name)}</h3>
        <p className="mt-3 text-sm text-slate-600">{country.description}</p>
      </div>
    </div>
  );
};
