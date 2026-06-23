import { motion } from "framer-motion";
import { BookOpenCheck, FileCheck2, GraduationCap, PlaneTakeoff, Search, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { journeyShowcaseImages, studentHeroImage } from "../../utils/marketingVisuals";
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
    <section className="relative overflow-hidden rounded-[2rem] bg-fusion text-white shadow-soft">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 26, 0], y: [0, -18, 0], rotate: [-10, -4, -10] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-14 top-16 h-40 w-40 rounded-[2.5rem] bg-[linear-gradient(135deg,#ffb347_0%,#ff8a1f_42%,#d35400_100%)] opacity-90 shadow-[0_24px_60px_rgba(211,84,0,0.34)] blur-[2px]"
        >
          <div className="absolute inset-[14%] rounded-[2rem] border border-white/16 bg-white/10" />
        </motion.div>
        <motion.div
          animate={{ x: [0, -34, 0], y: [0, 16, 0], rotate: [8, 14, 8] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-6 top-4 h-20 w-52 rounded-[999px] bg-[linear-gradient(90deg,#ffd08a_0%,#ff9d42_30%,#e65c00_100%)] opacity-80 shadow-[0_18px_48px_rgba(230,92,0,0.24)]"
        >
          <div className="absolute inset-y-[22%] left-[10%] right-[10%] rounded-full bg-white/12" />
        </motion.div>
        <motion.div
          animate={{ x: [0, 18, 0], y: [0, 20, 0], rotate: [16, 22, 16] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-16 right-[18%] h-24 w-24 rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,#ff9d42_0%,#ff7b12_58%,#b64700_100%)] opacity-85 shadow-[0_18px_48px_rgba(230,92,0,0.3)]"
        />
        <motion.div
          animate={{ x: [0, -22, 0], y: [0, 12, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-[22%] h-20 w-56 rounded-[999px] bg-[linear-gradient(90deg,rgba(255,179,71,0.9)_0%,rgba(255,122,26,0.75)_48%,rgba(211,84,0,0.16)_100%)] opacity-85 blur-sm"
        />
        <motion.div
          animate={{ x: ["0vw", "92vw"], y: [0, -18, 12, -8, 0], rotate: [-8, -3, 2, -1, -8] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-11rem] top-16 z-10"
        >
          <div className="relative">
            <div className="absolute right-[88%] top-1/2 h-[2px] w-24 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,rgba(255,208,138,0)_0%,rgba(255,157,66,0.7)_58%,rgba(230,92,0,0)_100%)] blur-[1px]" />
            <svg width="184" height="104" viewBox="0 0 184 104" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_18px_34px_rgba(230,92,0,0.36)]">
              <motion.path
                d="M66 48C78 26 98 14 122 13C109 23 101 36 98 48C88 44 77 44 66 48Z"
                fill="url(#birdWingMain)"
                animate={{ rotate: [-10, 14, -10], y: [0, -4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "98px 47px" }}
              />
              <path
                d="M26 57C43 35 63 23 88 21C80 29 74 37 71 45C89 34 111 29 136 31C122 40 113 51 110 63C128 53 146 50 161 54C145 63 132 72 120 83C111 74 101 67 92 62C75 73 58 78 40 77C49 70 57 64 63 57C50 61 37 61 26 57Z"
                fill="url(#birdBody)"
              />
              <motion.path
                d="M80 34C93 25 108 22 123 24"
                stroke="url(#birdWing)"
                strokeWidth="6"
                strokeLinecap="round"
                animate={{ rotate: [-8, 12, -8] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "101px 30px" }}
              />
              <path
                d="M88 47C103 41 121 40 140 43"
                stroke="rgba(255,255,255,0.32)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M64 58C76 56 87 57 98 61"
                stroke="rgba(255,239,220,0.55)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="136" cy="42" r="2.8" fill="#FFF4E5" />
              <defs>
                <linearGradient id="birdBody" x1="26" y1="21" x2="161" y2="83" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFE0B0" />
                  <stop offset="0.42" stopColor="#FF9D42" />
                  <stop offset="1" stopColor="#D35400" />
                </linearGradient>
                <linearGradient id="birdWingMain" x1="66" y1="13" x2="122" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFF1D8" />
                  <stop offset="0.58" stopColor="#FFB347" />
                  <stop offset="1" stopColor="#E65C00" />
                </linearGradient>
                <linearGradient id="birdWing" x1="74" y1="15" x2="120" y2="15" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFF1D8" />
                  <stop offset="1" stopColor="#FFB347" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>
        <motion.div
          animate={{ x: ["-2vw", "82vw"], y: [0, -10, 8, -6, 0], rotate: [-6, -2, 1, -1, -6] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
          className="absolute left-[-8rem] top-28 z-[9] opacity-70"
        >
          <svg width="118" height="68" viewBox="0 0 118 68" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_14px_24px_rgba(230,92,0,0.24)]">
            <motion.path
              d="M38 33C46 20 60 13 76 12C67 18 62 26 60 33C53 31 46 31 38 33Z"
              fill="url(#smallBirdWingMain)"
              animate={{ rotate: [-9, 11, -9], y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              style={{ transformOrigin: "60px 31px" }}
            />
            <path
              d="M14 39C26 24 40 16 58 15C52 21 48 27 46 33C58 26 73 22 91 23C81 30 75 38 73 47C86 39 98 37 108 40C97 47 88 54 79 61C72 54 64 49 57 45C45 52 33 55 20 54C27 49 33 44 37 39C28 42 20 42 14 39Z"
              fill="url(#smallBirdBody)"
            />
            <motion.path
              d="M48 24C57 18 68 16 79 18"
              stroke="url(#smallBirdWing)"
              strokeWidth="4.5"
              strokeLinecap="round"
              animate={{ rotate: [-7, 10, -7] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
              style={{ transformOrigin: "63px 22px" }}
            />
            <defs>
              <linearGradient id="smallBirdBody" x1="14" y1="15" x2="108" y2="61" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFE7C5" />
                <stop offset="0.42" stopColor="#FFB347" />
                <stop offset="1" stopColor="#D35400" />
              </linearGradient>
              <linearGradient id="smallBirdWingMain" x1="38" y1="12" x2="76" y2="33" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF4E5" />
                <stop offset="1" stopColor="#FF9D42" />
              </linearGradient>
              <linearGradient id="smallBirdWing" x1="48" y1="18" x2="79" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF1D8" />
                <stop offset="1" stopColor="#FFB347" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.04)_38%,transparent_62%)]" />
      </div>

      <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p
            className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-brand-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
            style={language === "ar" ? { fontFamily: "Arial, Tahoma, sans-serif", fontWeight: 700 } : undefined}
          >
            {t("flyBeyondBorders")}
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight">{t("heroTitle")}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/86">{t("heroSubtitle")}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to={primaryHref} className="rounded-full bg-white px-6 py-3 font-semibold text-brand-900">
              {primaryLabel}
            </Link>
            <Link to="/programs" className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white">
              {t("explorePrograms")}
            </Link>
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
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
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

          <div className="absolute -left-6 top-24 hidden w-40 gap-3 lg:grid">
            {journeyShowcaseImages.slice(0, 2).map((image, index) => (
              <motion.div
                key={image.title}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.28 + index * 0.14 }}
                className="overflow-hidden rounded-[1.4rem] border border-white/20 bg-white/10 p-2 shadow-soft backdrop-blur-sm"
              >
                <img src={image.src} alt={image.title} className="h-24 w-full rounded-[1rem] object-cover" />
                <p className="mt-2 px-1 text-xs font-medium text-brand-50">{index === 0 ? t("heroPlanningCaption") : t("heroDocumentsCaption")}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
