import { ArrowUpLeft, BadgeCheck, CircleDollarSign, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getApiAssetUrl } from "../../lib/api";
import type { University } from "../../types";
import { formatCurrency } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";
import { campusFallbackImage } from "../../utils/marketingVisuals";

export const UniversityCard = ({ university }: { university: University }) => {
  const { t, tv, language } = useLanguage();
  const coverImage = university.logo || university.campusImages?.[0];
  const coverImageUrl = coverImage ? getApiAssetUrl(coverImage) : campusFallbackImage;
  const locationLabel = [tv(university.country?.name), university.city].filter(Boolean).join(" - ");

  return (
    <Link
      to={`/universities/${university._id}`}
      className="group relative block overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
    >
      <img
        src={coverImageUrl}
        alt={university.name}
        loading="lazy"
        className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-950/5" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {language === "ar" ? "جامعة" : "University"}
          </div>
          {university.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/30 bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-100 backdrop-blur-sm">
              <BadgeCheck size={14} />
              {t("featured")}
            </span>
          ) : null}
        </div>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            {locationLabel ? (
              <div className="inline-flex items-center gap-2 text-sm text-white/85">
                <MapPin className="h-4 w-4" />
                <span>{locationLabel}</span>
              </div>
            ) : null}
            <h3 className="mt-2 text-2xl font-semibold">{university.name}</h3>
            {university.overview ? (
              <p className="mt-2 max-w-xs text-sm leading-6 text-white/85">{university.overview}</p>
            ) : null}
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-sky-100">
              <CircleDollarSign className="h-4 w-4" />
              <span>
                {formatCurrency(university.tuitionRange?.min)} - {formatCurrency(university.tuitionRange?.max)}
              </span>
            </div>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition group-hover:-translate-y-1">
            <ArrowUpLeft className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
