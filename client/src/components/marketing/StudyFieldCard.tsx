import { ArrowUpLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { StudyField } from "../../types";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";

export const StudyFieldCard = ({ studyField }: { studyField: StudyField }) => {
  const { t } = useLanguage();
  const imageSrc = getApiAssetUrl(studyField.image);
  const href = `/programs?fieldOfStudy=${encodeURIComponent(studyField.name)}`;

  return (
    <Link
      to={href}
      className="group relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
    >
      {imageSrc ? (
        <img src={imageSrc} alt={studyField.name} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
      ) : (
        <div className="h-72 w-full bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.55),_transparent_34%),linear-gradient(135deg,_#0f172a,_#1e3a8a_55%,_#0f766e)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-slate-950/5" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          {t("studyFieldBadge")}
        </div>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">{studyField.name}</h3>
            {studyField.description ? <p className="mt-2 max-w-xs text-sm leading-6 text-white/85">{studyField.description}</p> : null}
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition group-hover:-translate-y-1">
            <ArrowUpLeft className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
