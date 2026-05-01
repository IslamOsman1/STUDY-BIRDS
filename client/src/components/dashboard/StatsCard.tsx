import type { ReactNode } from "react";
import { AccentWave } from "../ui/AccentWave";

export const StatsCard = ({ label, value, icon }: { label: string; value: string | number; icon?: ReactNode }) => (
  <div className="panel relative overflow-hidden border-t-4 border-t-accent-700 bg-[linear-gradient(180deg,rgba(20,45,93,0.98)_0%,rgba(10,25,49,0.98)_100%)] p-6">
    <AccentWave
      className="right-0 top-0 h-20 w-28 rounded-bl-[2.1rem] rounded-tl-[3rem] rounded-br-[0.4rem] opacity-95"
      shadowClassName="-left-[4%] -top-[54%] h-[78%] w-[112%]"
      glowClassName="bottom-[-30%] h-[50%]"
    />
    <div className="flex items-start justify-between gap-4">
      <p className="relative z-10 text-sm uppercase tracking-[0.18em] text-brand-100/80">{label}</p>
      {icon ? (
        <span className="relative z-10 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-accent-300 shadow-sm backdrop-blur-sm">
          {icon}
        </span>
      ) : null}
    </div>
    <p className="relative z-10 mt-4 text-3xl font-semibold text-white">{value}</p>
  </div>
);
