import { useEffect, useState } from "react";
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
    `استكشف الجامعات وقارن البرامج الدولية وقدّم للدراسة بالخارج مع ${SITE_NAME} بالعربية والإنجليزية.`
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

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label={t("studentsHelped")} value="50,000+" icon={<UsersRound size={20} />} />
        <StatsCard label={t("programs")} value="10,000+" icon={<BookOpenCheck size={20} />} />
        <StatsCard label={t("partnerInstitutions")} value="500+" icon={<Building2 size={20} />} />
        <StatsCard label={t("studyDestinations")} value="20+" icon={<Globe2 size={20} />} />
      </section>

      <section className="panel p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("howItWorks")}</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">{t("guidedPath")}</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {journeySteps.map(({ label, icon: Icon }, index) => (
            <div key={label} className="rounded-3xl bg-slate-50 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-accent">0{index + 1}</div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
                  <Icon size={21} />
                </span>
              </div>
              <p className="mt-5 text-lg font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {studyFields.length ? (
        <section className="overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,_rgba(219,234,254,0.85),_rgba(240,249,255,0.92)_42%,_rgba(224,242,254,0.96))] p-8 sm:p-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">
                {language === "ar" ? "التخصصات" : "Study fields"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                {language === "ar" ? "اعرف المزيد عن أهم التخصصات" : "Discover the most in-demand study paths"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {language === "ar"
                  ? "أضف التخصصات من لوحة التحكم مع صورها، وسيظهر كل تخصص هنا مع رابط مباشر إلى البرامج المرتبطة به."
                  : "Manage study fields from the dashboard and spotlight them here with direct links to matching programs."}
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {studyFields.map((studyField) => (
              <StudyFieldCard key={studyField._id} studyField={studyField} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("destinations")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">{t("featuredDestinations")}</h2>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {countries.map((country) => (
            <DestinationCard key={country._id} country={country} />
          ))}
        </div>
      </section>

      <section>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("universities")}</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">{t("featuredUniversities")}</h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {universities.map((university) => (
            <UniversityCard key={university._id} university={university} />
          ))}
        </div>
      </section>

      <section>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("studentStories")}</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">{t("testimonialsTitle")}</h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial._id} testimonial={testimonial} />
          ))}
        </div>
      </section>

      <section className="panel overflow-hidden bg-brand-900 p-8 text-white">
        <h2 className="text-3xl font-semibold">{t("readyNextChapter")}</h2>
        <p className="mt-4 max-w-2xl text-sky-100">{t("ctaDescription")}</p>
        <div className="mt-6">
          <Link to={primaryHref} className="rounded-full bg-white px-6 py-3 font-semibold text-brand-900">
            {primaryLabel}
          </Link>
        </div>
      </section>
    </div>
  );
};
