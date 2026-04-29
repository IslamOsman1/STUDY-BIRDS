import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { dt } from "../../utils/dashboardTranslations";

export const DashboardSidebar = ({
  links,
  sectionLabel,
  title,
  subtitle,
}: {
  links: Array<{ label: string; href: string; icon?: LucideIcon; description?: string }>;
  sectionLabel?: string;
  title: string;
  subtitle: string;
}) => {
  const location = useLocation();
  const { language } = useLanguage();

  return (
    <aside className="panel h-fit overflow-hidden p-0">
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-6 text-white">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{sectionLabel || dt(language, "controlCenter")}</p>
        <h2 className="mt-2 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
      </div>
      <div className="space-y-2 p-4">
        {links.map((link) => {
          const active = location.pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`block rounded-2xl border px-4 py-3 transition ${
                active
                  ? "border-brand-900 bg-brand-900 text-white shadow-lg shadow-brand-900/20"
                  : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {Icon ? <Icon className={`mt-0.5 h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} /> : null}
                <div>
                  <div className="text-sm font-semibold">{link.label}</div>
                  {link.description ? (
                    <div className={`mt-1 text-xs ${active ? "text-slate-100" : "text-slate-500"}`}>{link.description}</div>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
