import type { ReactNode } from "react";

export const StatsCard = ({ label, value, icon }: { label: string; value: string | number; icon?: ReactNode }) => (
  <div className="panel bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-6">
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{label}</p>
      {icon ? (
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
          {icon}
        </span>
      ) : null}
    </div>
    <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
  </div>
);
