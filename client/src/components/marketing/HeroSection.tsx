import { motion } from "framer-motion";
import { BookOpenCheck, FileCheck2, GraduationCap, PlaneTakeoff, Search, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { studentHeroImage, studentPortraits } from "../../utils/marketingVisuals";
import { dt } from "../../utils/dashboardTranslations";

export const HeroSection = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const heroSteps = [
    { label: t("heroStep1"), icon: Search },
    { label: t("heroStep2"), icon: GraduationCap },
    { label: t("heroStep3"), icon: FileCheck2 },
    { label: t("heroStep4"), icon: TrendingUp },
  ];
  const primaryHref =
    !user
      ? "/register"
      : user.role === "admin"
        ? "/admin"
        : user.role === "partner"
          ? "/partner/profile"
          : "/student";
  const primaryLabel =
    !user ? t("startJourney") : user.role === "student" ? t("studentProfile") : user.role === "partner" ? dt(language, "profileHub") : t("dashboard");

  return (
    <section className="overflow-hidden rounded-[2rem] bg-hero text-white shadow-soft">
      <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-sky-100">
            {t("flyBeyondBorders")}
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight">{t("heroTitle")}</h1>
          <p className="mt-6 max-w-2xl text-lg text-sky-50">{t("heroSubtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to={primaryHref} className="rounded-full bg-white px-6 py-3 font-semibold text-brand-900">
              {primaryLabel}
            </Link>
            <Link to="/programs" className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white">
              {t("explorePrograms")}
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {studentPortraits.slice(0, 4).map((student) => (
                <img
                  key={student.name}
                  src={student.src}
                  alt={student.name}
                  className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-soft"
                />
              ))}
            </div>
            <div className="text-sm text-sky-50">
              <p className="font-semibold text-white">50,000+</p>
              <p>{t("studentsHelped")}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative"
        >
          <img
            src={studentHeroImage}
            alt="International students planning their study abroad journey"
            className="h-[430px] w-full rounded-[2rem] border border-white/20 object-cover shadow-2xl"
          />
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-brand-900 shadow-soft">
            <PlaneTakeoff size={17} />
            {t("startJourney")}
          </div>
          <div className="absolute -bottom-6 left-4 right-4 rounded-[1.75rem] border border-white/30 bg-white/95 p-4 text-brand-900 shadow-soft backdrop-blur md:left-8 md:right-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {heroSteps.map(({ label, icon: Icon }, index) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {t("step")} {index + 1}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-3 bottom-24 hidden rounded-2xl border border-white/20 bg-brand-900/85 p-4 text-sm shadow-soft backdrop-blur lg:block">
            <BookOpenCheck size={22} className="mb-3 text-accent" />
            <p className="max-w-32 font-semibold">{t("explorePrograms")}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
