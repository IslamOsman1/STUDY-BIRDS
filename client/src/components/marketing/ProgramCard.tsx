import { CalendarDays, CircleDollarSign, Clock3, GraduationCap, School } from "lucide-react";
import { Link } from "react-router-dom";
import type { Program } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency, formatDate } from "../../utils/format";
import { useLanguage } from "../../hooks/useLanguage";
import { getApiAssetUrl } from "../../lib/api";

export const ProgramCard = ({ program }: { program: Program }) => {
  const { t, tv } = useLanguage();
  const { user } = useAuth();
  const isPartnerUser = user?.role === "partner";
  const coverImage = program.coverImage || program.university?.campusImages?.[0] || program.university?.logo;
  const visibleTuition = isPartnerUser ? program.partnerTuition ?? program.tuition : program.tuition;
  const tuitionLabel = isPartnerUser ? t("partnerPrice") : t("tuition");

  return (
    <div className="panel overflow-hidden bg-white p-0">
      {coverImage ? <img src={getApiAssetUrl(coverImage)} alt={program.title} className="h-48 w-full object-cover" /> : null}
      <div className="p-6">
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <GraduationCap size={14} />
          {tv(program.degreeLevel)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
          <School size={14} />
          {tv(program.fieldOfStudy)}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{program.title}</h3>
      <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
        <School size={15} className="text-brand-700" />
        {program.university?.name}
        {program.university?.country?.name ? <span className="h-1 w-1 rounded-full bg-slate-300" /> : null}
        {tv(program.university?.country?.name)}
      </p>
      <div className="mt-5 grid gap-3 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <CircleDollarSign size={16} className="text-accent" />
          {tuitionLabel}: {formatCurrency(visibleTuition)}
        </p>
        {isPartnerUser && typeof program.partnerTuition === "number" && typeof program.tuition === "number" ? (
          <p className="text-xs text-slate-500">
            {t("tuition")}: {formatCurrency(program.tuition)}
          </p>
        ) : null}
        <p className="flex items-center gap-2">
          <Clock3 size={16} className="text-accent" />
          {t("intake")}: {tv(program.intake)}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays size={16} className="text-accent" />
          {t("deadline")}: {formatDate(program.applicationDeadline)}
        </p>
      </div>
      <Link to={`/programs/${program._id}`} className="mt-6 inline-flex text-sm font-semibold text-accent-700">
        {t("exploreProgram")}
      </Link>
      </div>
    </div>
  );
};
