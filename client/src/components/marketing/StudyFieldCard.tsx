import { ArrowUpLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { StudyField } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";

export const StudyFieldCard = ({ studyField }: { studyField: StudyField }) => {
  const { t, tv } = useLanguage();
  const imageSrc = getApiAssetUrl(studyField.image);
  const href = `/programs?fieldOfStudy=${encodeURIComponent(studyField.name)}`;

  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] transition hover:-translate-y-1"
    >
      <div className="relative h-40 overflow-hidden bg-slate-950 sm:h-52 lg:h-64">
        {imageSrc ? (
          <img src={imageSrc} alt={tv(studyField.name)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-fusion" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent" />
        <div className="absolute start-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          {t("studyFieldBadge")}
        </div>
      </div>
      <div className="p-4 text-slate-900 sm:p-5 lg:p-6">
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold sm:text-xl lg:text-2xl">{tv(studyField.name)}</h3>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-900 transition group-hover:-translate-y-1 group-hover:border-brand-200 group-hover:bg-brand-50 sm:h-11 sm:w-11 lg:h-12 lg:w-12">
            <ArrowUpLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
