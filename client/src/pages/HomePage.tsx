import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, Building2, Globe2, ListChecks, SearchCheck, Send, UserRoundPlus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { HeroSection } from "../components/marketing/HeroSection";
import { Seo } from "../components/seo/Seo";
import { StatsCard } from "../components/dashboard/StatsCard";
import { DestinationCard } from "../components/marketing/DestinationCard";
import { StudyFieldCard } from "../components/marketing/StudyFieldCard";
import { UniversityCard } from "../components/marketing/UniversityCard";
import { TestimonialCard } from "../components/marketing/TestimonialCard";
import { useAuth } from "../hooks/useAuth";
import { contentService } from "../services/contentService";
import { universityService } from "../services/universityService";
import type { Country, StudyField, Testimonial, University } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { SITE_NAME, getSiteUrl, seoText } from "../seo/site";
import { dt } from "../utils/dashboardTranslations";
import { advisorDeskImage, documentPrepImage, journeyShowcaseImages, studentPortraits } from "../utils/marketingVisuals";

export const HomePage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [studyFields, setStudyFields] = useState<StudyField[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

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

  useEffect(() => {
    Promise.all([
      contentService.getCountries(),
      contentService.getStudyFields(),
      universityService.getAll(),
      contentService.getTestimonials(),
    ]).then(([countriesData, studyFieldsData, universitiesData, testimonialsData]) => {
      setCountries(countriesData.slice(0, 7));
      setStudyFields(studyFieldsData.slice(0, 6));
      setUniversities(universitiesData.slice(0, 3));
      setTestimonials(testimonialsData.slice(0, 3));
    });
  }, []);

  const homeDescription = seoText(
    language,
    `Explore universities, compare international programs, and apply to study abroad with ${SITE_NAME} in English and Arabic.`,
    `استكشف الجامعات، وقارن البرامج الدولية، وقدّم للدراسة بالخارج مع ${SITE_NAME} باللغتين العربية والإنجليزية.`
  );

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
      email: "hello@studybirds.com",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl(),
      inLanguage: ["en", "ar"],
      potentialAction: {
        "@type": "SearchAction",
        target: `${getSiteUrl()}/programs?keyword={search_term_string}&lang=${language}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  const journeySteps = [
    { label: t("createProfile"), icon: UserRoundPlus },
    { label: t("findBestProgram"), icon: SearchCheck },
    { label: t("submitYourApplication"), icon: Send },
    { label: t("trackAdmission"), icon: ListChecks },
  ];

  const sectionTransition = { duration: 0.55, ease: "easeOut" } as const;

  return (
    <div className="space-y-16">
      <Seo
        title={seoText(language, "Study Abroad Platform", "منصة الدراسة بالخارج")}
        description={homeDescription}
        keywords={[
          SITE_NAME,
          "study abroad platform",
          "international programs",
          "university applications",
          "الدراسة بالخارج",
          "التقديم على الجامعات",
        ]}
        structuredData={structuredData}
      />

      <HeroSection />

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={sectionTransition}
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: t("studentsHelped"), value: "50,000+", icon: <UsersRound size={20} /> },
          { label: t("programs"), value: "10,000+", icon: <BookOpenCheck size={20} /> },
          { label: t("partnerInstitutions"), value: "500+", icon: <Building2 size={20} /> },
          { label: t("studyDestinations"), value: "20+", icon: <Globe2 size={20} /> },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <StatsCard label={stat.label} value={stat.value} icon={stat.icon} />
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition}
        className="panel overflow-hidden p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("howItWorks")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">{t("guidedPath")}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{t("homeJourneyIntro")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {studentPortraits.slice(0, 5).map((student, index) => (
                <motion.img
                  key={student.name}
                  src={student.src}
                  alt={student.name}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="h-14 w-14 rounded-2xl object-cover shadow-soft ring-2 ring-white"
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="overflow-hidden rounded-[1.8rem] bg-slate-100"
            >
              <img src={advisorDeskImage} alt="Student planning session" className="h-48 w-full object-cover" />
              <div className="p-4">
                <p className="text-sm font-semibold text-slate-900">{t("homePlanningTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t("homePlanningBody")}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="overflow-hidden rounded-[1.8rem] bg-slate-100"
            >
              <img src={documentPrepImage} alt="Study documents preparation" className="h-48 w-full object-cover" />
              <div className="p-4">
                <p className="text-sm font-semibold text-slate-900">{t("homeDocumentsTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t("homeDocumentsBody")}</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {journeySteps.map(({ label, icon: Icon }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="rounded-3xl bg-slate-50 p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-accent">0{index + 1}</div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
                  <Icon size={21} />
                </span>
              </div>
              <p className="mt-5 text-lg font-medium">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition}
        className="overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-10 text-white sm:px-10"
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">{t("homeExperienceEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold">{t("homeExperienceTitle")}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">{t("homeExperienceBody")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {journeyShowcaseImages.map((image, index) => (
              <motion.div
                key={image.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: index * 0.1 }}
                className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 p-2 backdrop-blur-sm"
              >
                <img src={image.src} alt={image.title} className="h-48 w-full rounded-[1.2rem] object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {studyFields.length ? (
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition}
          className="overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,_rgba(219,234,254,0.85),_rgba(240,249,255,0.92)_42%,_rgba(224,242,254,0.96))] p-8 sm:p-10"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("studyFieldsEyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">{t("studyFieldsTitle")}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{t("studyFieldsBody")}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="hidden overflow-hidden rounded-[1.8rem] border border-white/60 bg-white/60 p-2 shadow-soft lg:block"
            >
              <img src={journeyShowcaseImages[0]?.src} alt="Study fields" className="h-28 w-48 rounded-[1.3rem] object-cover" />
            </motion.div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {studyFields.map((studyField) => (
              <motion.div
                key={studyField._id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
              >
                <StudyFieldCard studyField={studyField} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition}
        className="overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,_rgba(219,234,254,0.85),_rgba(240,249,255,0.92)_42%,_rgba(224,242,254,0.96))] p-8 sm:p-10"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("destinations")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">{t("featuredDestinations")}</h2>
          </div>
          <img
            src={journeyShowcaseImages[2]?.src}
            alt="Study destinations"
            className="hidden h-24 w-36 rounded-[1.4rem] object-cover shadow-soft lg:block"
          />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <motion.div
              key={country._id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
            >
              <DestinationCard country={country} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition}
        className="overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,_rgba(219,234,254,0.85),_rgba(240,249,255,0.92)_42%,_rgba(224,242,254,0.96))] p-8 sm:p-10"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("universities")}</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">{t("featuredUniversities")}</h2>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {universities.map((university) => (
            <motion.div
              key={university._id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
            >
              <UniversityCard university={university} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("studentStories")}</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">{t("testimonialsTitle")}</h2>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial._id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition}
        className="panel overflow-hidden bg-brand-900 p-8 text-white"
      >
        <h2 className="text-3xl font-semibold">{t("readyNextChapter")}</h2>
        <p className="mt-4 max-w-2xl text-sky-100">{t("ctaDescription")}</p>
        <div className="mt-6">
          <Link to={primaryHref} className="rounded-full bg-white px-6 py-3 font-semibold text-brand-900">
            {primaryLabel}
          </Link>
        </div>
      </motion.section>
    </div>
  );
};
