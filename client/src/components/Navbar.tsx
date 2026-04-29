import { Languages, Menu, UserCircle2 } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { BRAND_LOGO_PATH, SITE_NAME } from "../seo/site";
import { dt } from "../utils/dashboardTranslations";

const exhibitionsLabel = {
  en: "Exhibitions Station",
  ar: "محطة المعارض",
} as const;

const navItems = [
  ["programs", "/programs"],
  ["universities", "/universities"],
  ["destinations", "/destinations"],
  ["about", "/about"],
  ["contact", "/contact"],
] as const;

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { language, t, toggleLanguage } = useLanguage();
  const exhibitionsText = exhibitionsLabel[language];
  const profileHref = user?.role === "admin" ? "/admin" : user?.role === "partner" ? "/partner/profile" : "/student";
  const profileLabel = user?.role === "partner" ? dt(language, "profileHub") : t("dashboard");
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img src={BRAND_LOGO_PATH} alt={SITE_NAME} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{SITE_NAME}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-700">{t("flyBeyondBorders")}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-brand-700" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              {t(label)}
            </NavLink>
          ))}
          <NavLink
            to="/exhibitions"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? "text-brand-700" : "text-slate-600 hover:text-slate-900"}`
            }
          >
            {exhibitionsText}
          </NavLink>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            aria-label="Change language"
          >
            <Languages size={17} />
            {t("language")}
          </button>
          {user ? (
            <>
              {user.role === "student" ? (
                <Link
                  to="/student"
                  className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700"
                  aria-label={dt(language, "profilePhoto")}
                  title={dt(language, "profilePhoto")}
                >
                  {initials || <UserCircle2 size={18} />}
                </Link>
              ) : (
                <Link
                  to={profileHref}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  {profileLabel}
                </Link>
              )}
              <button onClick={logout} className="rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white">
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                {t("login")}
              </Link>
              <Link to="/register" className="rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white">
                {t("startJourney")}
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen((value) => !value)} className="lg:hidden">
          <Menu />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-shell flex flex-col gap-3 py-4">
            {navItems.map(([label, href]) => (
              <Link key={href} to={href} className="text-sm font-medium text-slate-700" onClick={() => setOpen(false)}>
                {t(label)}
              </Link>
            ))}
            <Link to="/exhibitions" className="text-sm font-medium text-slate-700" onClick={() => setOpen(false)}>
              {exhibitionsText}
            </Link>
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <Languages size={17} />
              {t("language")}
            </button>
            {user ? (
              <>
                {user.role === "student" ? (
                  <Link to="/student" className="flex items-center gap-3 text-sm font-medium text-brand-700">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700">
                      {initials || <UserCircle2 size={18} />}
                    </span>
                    {dt(language, "profilePhoto")}
                  </Link>
                ) : (
                  <Link to={profileHref} className="flex items-center gap-2 text-sm font-medium text-brand-700">
                    <UserCircle2 size={18} />
                    {profileLabel}
                  </Link>
                )}
                <button onClick={logout} className="rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white">
                  {t("logout")}
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-full bg-brand-900 px-4 py-2 text-center text-sm font-semibold text-white">
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
