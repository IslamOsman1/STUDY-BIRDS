import { ArrowUpLeft, BadgeCheck, CircleDollarSign, MapPinned, Sparkles } from "lucide-react";
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
      className="group block overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] transition hover:-translate-y-1"
    >
      <div className="relative h-64 overflow-hidden bg-slate-950">
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.74)_100%)] p-4">
          <img src={coverImageUrl} alt={university.name} loading="lazy" className="h-full w-full object-contain transition duration-500 group-hover:scale-105" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent" />
        <div className="absolute start-5 top-5 flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {t("universityBadge")}
          </div>
          {university.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">
              <BadgeCheck size={14} />
              {t("featured")}
            </span>
          ) : null}
        </div>
      </div>
      <div className="p-6 text-slate-900">
        <div className="inline-flex items-center gap-2 text-sm text-slate-500">
          <MapPinned className="h-4 w-4 text-brand-700" />
          <span>{locationLabel || t("universityBadge")}</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">{university.name}</h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              {university.city ? <span className="rounded-full bg-slate-100 px-3 py-1">{university.city}</span> : null}
              {university.language ? <span className="rounded-full bg-slate-100 px-3 py-1">{language === "ar" ? `اللغة ${university.language}` : `Language ${university.language}`}</span> : null}
              <span className="rounded-full bg-slate-100 px-3 py-1">{language === "ar" ? `الطلاب ${university.studentCount || 0}` : `${university.studentCount || 0} Students`}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{language === "ar" ? `التخصصات ${university.specialtyCount || 0}` : `${university.specialtyCount || 0} Specialties`}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {t("ranking")}: {university.ranking || "-"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 inline-flex items-center gap-1">
                <CircleDollarSign className="h-3.5 w-3.5" />
                {formatCurrency(university.tuitionRange?.min)} - {formatCurrency(university.tuitionRange?.max)}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-brand-700">{t("viewUniversity")}</p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-900 transition group-hover:-translate-y-1 group-hover:border-brand-200 group-hover:bg-brand-50">
            <ArrowUpLeft className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
