type AccentWaveProps = {
  className?: string;
  shadowClassName?: string;
  glowClassName?: string;
};

export const AccentWave = ({ className = "", shadowClassName = "", glowClassName = "" }: AccentWaveProps) => (
  <div className={`pointer-events-none absolute overflow-hidden ${className}`}>
    <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-[#f07a1f] via-[#d25500] to-[#8f3200]" />
    <div
      className={`absolute -left-[12%] -top-[58%] h-[82%] w-[126%] rounded-[999px] bg-brand-900 shadow-[0_10px_28px_rgba(10,25,49,0.28)] ${shadowClassName}`}
    />
    <div className={`absolute inset-x-[10%] bottom-[-26%] h-[58%] rounded-[999px] bg-[#ff8a2a]/18 blur-xl ${glowClassName}`} />
  </div>
);
