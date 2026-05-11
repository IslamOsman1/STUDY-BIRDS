import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, BookOpenCheck, Building2, ChevronDown, Globe2, ListChecks, SearchCheck, Send, UserRoundPlus, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { HeroSection } from "../components/marketing/HeroSection";
import { Seo } from "../components/seo/Seo";
import { StatsCard } from "../components/dashboard/StatsCard";
import { AccentWave } from "../components/ui/AccentWave";
import { DestinationCard } from "../components/marketing/DestinationCard";
import { StudyFieldCard } from "../components/marketing/StudyFieldCard";
import { UniversityCard } from "../components/marketing/UniversityCard";
import { TestimonialCard } from "../components/marketing/TestimonialCard";
import { useAuth } from "../hooks/useAuth";
import { contentService } from "../services/contentService";
import { universityService } from "../services/universityService";
import type { Country, Faq, OurService, Recognition, StudyField, Testimonial, University } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { SITE_NAME, getSiteUrl, seoText } from "../seo/site";
import { dt } from "../utils/dashboardTranslations";
import { advisorDeskImage, documentPrepImage, journeyShowcaseImages, studentPortraits } from "../utils/marketingVisuals";

export const HomePage = () => {
  const { t, tv, language } = useLanguage();
  const { user } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [studyFields, setStudyFields] = useState<StudyField[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [services, setServices] = useState<OurService[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [selectedUniversityCountry, setSelectedUniversityCountry] = useState("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

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
      contentService.getRecognitions(),
      contentService.getOurServices(),
      contentService.getFaqs(),
    ]).then(([countriesData, studyFieldsData, universitiesData, testimonialsData, recognitionsData, servicesData, faqsData]) => {
      setCountries(countriesData.slice(0, 7));
      setStudyFields(studyFieldsData.slice(0, 6));
      setUniversities(universitiesData);
      setTestimonials(testimonialsData.slice(0, 3));
      setRecognitions(recognitionsData.filter((recognition) => recognition.featured !== false).slice(0, 6));
      setServices(servicesData.filter((service) => service.featured !== false).slice(0, 6));
      setFaqs(faqsData.filter((faq) => faq.featured !== false).slice(0, 6));
    });
  }, []);

  const universityCountries = universities.reduce<Country[]>((list, university) => {
    if (!university.country?._id || list.some((country) => country._id === university.country?._id)) {
      return list;
    }

    return [...list, university.country];
  }, []);

  const visibleUniversities = universities
    .filter((university) => selectedUniversityCountry === "all" || university.country?._id === selectedUniversityCountry)
    .slice(0, 3);

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
        className="panel relative overflow-hidden border-t-4 border-t-accent-700 bg-[linear-gradient(180deg,rgba(20,45,93,0.99)_0%,rgba(10,25,49,0.99)_100%)] p-8"
      >
        <AccentWave
          className="-right-10 bottom-0 h-28 w-80 rounded-tl-[5rem] rounded-bl-[2.8rem] rounded-tr-[1.4rem] opacity-95"
          shadowClassName="-left-[8%] -top-[52%] h-[80%] w-[118%]"
          glowClassName="bottom-[-22%] h-[48%]"
        />
        <AccentWave
          className="right-20 bottom-10 h-20 w-52 rounded-tl-[3.4rem] rounded-bl-[2.3rem] rounded-tr-[1rem] opacity-75"
          shadowClassName="-left-[8%] -top-[58%] h-[78%] w-[118%]"
          glowClassName="bottom-[-24%] h-[44%] opacity-70"
        />
        <div className="pointer-events-none absolute -left-6 top-4 h-20 w-48 rounded-[2rem] border border-white/6 bg-[linear-gradient(135deg,rgba(148,163,184,0.14)_0%,rgba(255,255,255,0.03)_100%)] shadow-[0_18px_40px_rgba(15,23,42,0.12)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-300">{t("howItWorks")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{t("guidedPath")}</h2>
            <p className="mt-4 text-sm leading-7 text-brand-100/85">{t("homeJourneyIntro")}</p>
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
              className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(26,58,122,0.92)_0%,rgba(10,25,49,0.96)_100%)] shadow-[0_14px_36px_rgba(15,23,42,0.18)]"
            >
              <img src={advisorDeskImage} alt="Student planning session" className="h-48 w-full object-cover" />
              <div className="p-4">
                <div className="mb-3 h-2 w-20 overflow-hidden rounded-full bg-[#4d2108]">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-[#f07a1f] via-[#d25500] to-[#8f3200]" />
                </div>
                <p className="text-sm font-semibold text-white">{t("homePlanningTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-brand-100/80">{t("homePlanningBody")}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(26,58,122,0.92)_0%,rgba(10,25,49,0.96)_100%)] shadow-[0_14px_36px_rgba(15,23,42,0.18)]"
            >
              <img src={documentPrepImage} alt="Study documents preparation" className="h-48 w-full object-cover" />
              <div className="p-4">
                <div className="mb-3 h-2 w-20 overflow-hidden rounded-full bg-[#4d2108]">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-[#f07a1f] via-[#d25500] to-[#8f3200]" />
                </div>
                <p className="text-sm font-semibold text-white">{t("homeDocumentsTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-brand-100/80">{t("homeDocumentsBody")}</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {journeySteps.map(({ label, icon: Icon }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(26,58,122,0.88)_0%,rgba(10,25,49,0.96)_100%)] p-6 shadow-[0_10px_26px_rgba(15,23,42,0.18)]"
            >
              <AccentWave
                className="right-0 top-0 h-14 w-24 rounded-bl-[1.8rem] rounded-tl-[2.4rem] rounded-br-[0.35rem] opacity-70"
                shadowClassName="-left-[2%] -top-[56%] h-[78%] w-[108%]"
                glowClassName="bottom-[-34%] h-[42%] opacity-60"
              />
              <div className="flex items-center justify-between gap-4">
                <div className="relative z-10 text-sm font-semibold text-accent-300">0{index + 1}</div>
                <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-accent-300 shadow-sm backdrop-blur-sm">
                  <Icon size={21} />
                </span>
              </div>
              <p className="relative z-10 mt-5 text-lg font-medium text-white">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionTransition}
        className="overflow-hidden rounded-[2.5rem] bg-fusion px-8 py-10 text-white sm:px-10"
      >
        <h2 className="text-3xl font-semibold">
          {recognitions.length ? t("recognitionsTitle") : t("homeExperienceTitle")}
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {(recognitions.length
              ? recognitions.map((recognition) => ({
                  key: recognition._id,
                  title: recognition.title,
                  src: recognition.image || "",
                  link: recognition.link || "",
                }))
              : journeyShowcaseImages.map((image) => ({
                  key: image.title,
                  title: image.title,
                  src: image.src,
                  link: "",
                }))).map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: index * 0.1 }}
                className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 p-2 backdrop-blur-sm"
              >
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noreferrer" className="block">
                    {item.src ? (
                      <img src={item.src} alt={item.title} className="h-48 w-full rounded-[1.2rem] object-cover" />
                    ) : (
                      <div className="flex h-48 w-full flex-col justify-between rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] p-5">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-brand-100">
                          <Award size={22} />
                        </span>
                        <p className="text-lg font-semibold text-white">{item.title}</p>
                      </div>
                    )}
                    <div className="px-1 pb-1 pt-3">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-xs font-medium text-brand-100">{t("viewRecognition")}</p>
                    </div>
                  </a>
                ) : item.src ? (
                  <img src={item.src} alt={item.title} className="h-48 w-full rounded-[1.2rem] object-cover" />
                ) : (
                  <div className="flex h-48 w-full flex-col justify-between rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] p-5">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-brand-100">
                      <Award size={22} />
                    </span>
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                  </div>
                )}
              </motion.div>
            ))}
        </div>
      </motion.section>

      {services.length ? (
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition}
          className="overflow-hidden rounded-[2.5rem] bg-fusion px-8 py-10 text-white sm:px-10"
        >
          <h2 className="text-3xl font-semibold">{t("servicesTitle")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-100/85">{t("servicesBody")}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: index * 0.1 }}
                className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 p-2 backdrop-blur-sm"
              >
                {service.image ? (
                  <img src={service.image} alt={service.title} className="h-48 w-full rounded-[1.2rem] object-cover" />
                ) : (
                  <div className="flex h-48 w-full flex-col justify-between rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] p-5">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-brand-100">
                      <Award size={22} />
                    </span>
                    <p className="text-lg font-semibold text-white">{service.title}</p>
                  </div>
                )}
                <div className="px-1 pb-1 pt-3">
                  <p className="text-sm font-semibold text-white">{service.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      ) : null}

      {studyFields.length ? (
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition}
          className="panel overflow-hidden bg-[linear-gradient(180deg,rgba(20,45,93,0.98)_0%,rgba(10,25,49,0.98)_100%)] p-8 sm:p-10"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-300">{t("studyFieldsEyebrow")}</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{t("studyFieldsTitle")}</h2>
              <p className="mt-3 text-sm leading-7 text-brand-100/85">{t("studyFieldsBody")}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="hidden overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 p-2 shadow-soft backdrop-blur-sm lg:block"
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
        className="panel relative overflow-hidden border-t-4 border-t-accent-700 bg-[linear-gradient(180deg,rgba(20,45,93,0.98)_0%,rgba(10,25,49,0.98)_100%)] p-8 sm:p-10"
      >
        <AccentWave
          className="right-5 top-0 h-24 w-36 rounded-bl-[2.5rem] rounded-tl-[3.8rem] rounded-br-[0.8rem] opacity-90"
          shadowClassName="-left-[6%] -top-[56%] h-[80%] w-[112%]"
          glowClassName="bottom-[-30%] h-[46%]"
        />
        <div className="relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-300">{t("destinations")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{t("featuredDestinations")}</h2>
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
        className="panel relative overflow-hidden border-t-4 border-t-accent-700 bg-[linear-gradient(180deg,rgba(20,45,93,0.98)_0%,rgba(10,25,49,0.98)_100%)] p-8 sm:p-10"
      >
        <AccentWave
          className="right-5 top-0 h-24 w-36 rounded-bl-[2.5rem] rounded-tl-[3.8rem] rounded-br-[0.8rem] opacity-90"
          shadowClassName="-left-[6%] -top-[56%] h-[80%] w-[112%]"
          glowClassName="bottom-[-30%] h-[46%]"
        />
        <div className="relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-300">{t("universities")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{t("featuredUniversities")}</h2>
          </div>
          <img
            src={journeyShowcaseImages[1]?.src}
            alt="Featured universities"
            className="hidden h-24 w-36 rounded-[1.4rem] object-cover shadow-soft lg:block"
          />
        </div>

        <div className="relative z-10 mt-6 -mx-2 overflow-hidden sm:mx-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#10264f] to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#10264f] to-transparent sm:hidden" />
          <div className="flex snap-x gap-3 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedUniversityCountry("all")}
            className={`shrink-0 snap-start whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${
              selectedUniversityCountry === "all"
                ? "bg-white text-brand-900 shadow-soft"
                : "border border-white/15 bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {t("allCountries")}
          </button>
          {universityCountries.map((country) => (
            <button
              key={country._id}
              type="button"
              onClick={() => setSelectedUniversityCountry(country._id)}
              className={`shrink-0 snap-start whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${
                selectedUniversityCountry === country._id
                  ? "bg-white text-brand-900 shadow-soft"
                  : "border border-white/15 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {tv(country.name)}
            </button>
          ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {visibleUniversities.map((university) => (
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

      {faqs.length ? (
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition}
          className="panel overflow-hidden bg-white p-8 sm:p-10"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("faqEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">{t("faqTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t("faqBody")}</p>
          </div>

          <div className="mt-8 space-y-4">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq._id;

              return (
                <div key={faq._id} className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-50/80">
                  <button
                    type="button"
                    onClick={() => setOpenFaqId((current) => (current === faq._id ? null : faq._id))}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                  >
                    <span className="text-base font-semibold text-slate-900 sm:text-lg">{faq.question}</span>
                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 transition ${isOpen ? "rotate-180" : ""}`}>
                      <ChevronDown className="h-5 w-5" />
                    </span>
                  </button>
                  {isOpen ? <div className="border-t border-slate-200 px-6 py-5 text-sm leading-7 text-slate-600">{faq.answer}</div> : null}
                </div>
              );
            })}
          </div>
        </motion.section>
      ) : null}

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
        className="panel overflow-hidden bg-fusion p-8 text-white"
      >
        <h2 className="text-3xl font-semibold">{t("readyNextChapter")}</h2>
        <p className="mt-4 max-w-2xl text-brand-100">{t("ctaDescription")}</p>
        <div className="mt-6">
          <Link to={primaryHref} className="rounded-full bg-white px-6 py-3 font-semibold text-brand-900">
            {primaryLabel}
          </Link>
        </div>
      </motion.section>
    </div>
  );
};
