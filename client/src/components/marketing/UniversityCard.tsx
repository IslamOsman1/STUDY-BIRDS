import { BadgeCheck, CircleDollarSign, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { getApiAssetUrl } from "../../lib/api";
import type { University } from "../../types";
import { formatCurrency } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";
import { campusFallbackImage } from "../../utils/marketingVisuals";

export const UniversityCard = ({ university }: { university: University }) => {
  const { t, tv } = useLanguage();
  const coverImage = university.logo || university.campusImages?.[0];
  const coverImageUrl = coverImage ? getApiAssetUrl(coverImage) : campusFallbackImage;

  return (
    <div className="panel p-6">
      <img
        src={coverImageUrl}
        alt={university.name}
        loading="lazy"
        className="mb-5 h-44 w-full rounded-3xl object-cover"
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1 text-sm text-brand-700">
            <MapPin size={14} />
            {tv(university.country?.name)}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{university.name}</h3>
        </div>
        {university.featured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <BadgeCheck size={14} />
            {t("featured")}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-sm text-slate-600">{university.overview}</p>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPin size={14} />
          {university.city}
        </span>
        <span className="inline-flex items-center gap-1">
          <CircleDollarSign size={14} />
          {formatCurrency(university.tuitionRange?.min)} - {formatCurrency(university.tuitionRange?.max)}
        </span>
      </div>
      <Link to={`/universities/${university._id}`} className="mt-6 inline-flex text-sm font-semibold text-brand-700">
        {t("viewUniversity")}
      </Link>
    </div>
  );
};
