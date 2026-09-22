type AccentWaveProps = {
  className?: string;
  shadowClassName?: string;
  glowClassName?: string;
};

export const AccentWave = ({ className = "", shadowClassName = "", glowClassName = "" }: AccentWaveProps) => (
  <div className={`pointer-events-none absolute overflow-hidden ${className}`}>
    <div className="absolute inset-0 rounded-[inherit] border border-white/10 bg-[linear-gradient(135deg,rgba(253,186,116,0.24)_0%,rgba(249,115,22,0.12)_30%,rgba(15,23,42,0.03)_100%)] shadow-[0_14px_34px_rgba(15,23,42,0.2)]" />
    <div
      className={`absolute -left-[6%] top-[10%] h-[72%] w-[118%] rounded-[inherit] border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.26)_0%,rgba(15,23,42,0.05)_100%)] ${shadowClassName}`}
    />
    <div className="absolute inset-x-[10%] top-[18%] h-px bg-white/18" />
    <div className="absolute left-[12%] top-[34%] h-[10%] w-[42%] rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_100%)]" />
    <div className="absolute right-[12%] top-[28%] h-[26%] w-[28%] rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(251,146,60,0.08)_100%)]" />
    <div className={`absolute inset-x-[14%] bottom-[16%] h-[18%] rounded-[1rem] bg-[linear-gradient(90deg,rgba(249,115,22,0.34)_0%,rgba(251,191,36,0.12)_56%,rgba(255,255,255,0.02)_100%)] ${glowClassName}`} />
  </div>
);
