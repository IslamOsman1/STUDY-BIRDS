import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { getApiAssetUrl } from "../lib/api";
import { seoText } from "../seo/site";
import { universityService } from "../services/universityService";
import type { University } from "../types";
import { dt } from "../utils/dashboardTranslations";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency } from "../utils/format";

export const UniversityDetailsPage = () => {
  const { t, tv, language } = useLanguage();
  const { id = "" } = useParams();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadUniversity = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const data = await universityService.getById(id);
        setUniversity(data);
      } catch (error) {
        setLoadError(getErrorMessage(error, dt(language, "loadUniversityFailed")));
      } finally {
        setLoading(false);
      }
    };

    loadUniversity();
  }, [id, language]);

  if (loading) {
    return (
      <>
        <Seo
          title={seoText(language, "University Details", "تفاصيل الجامعة")}
          description={seoText(
            language,
            "Explore university details, campus highlights, rankings, and tuition options.",
            "استكشف تفاصيل الجامعة وصور الحرم الجامعي والتصنيف وخيارات الرسوم."
          )}
        />
        <LoadingSpinner />
      </>
    );
  }

  if (!university || loadError) {
    return (
      <>
        <Seo
          title={seoText(language, "University Not Found", "الجامعة غير موجودة")}
          description={seoText(
            language,
            "The requested university could not be loaded.",
            "تعذر تحميل الجامعة المطلوبة."
          )}
          noIndex
        />
        <div className="panel p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("universities")}</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">{loadError || dt(language, "loadUniversityFailed")}</h1>
          <Link to="/universities" className="mt-6 inline-flex rounded-full bg-brand-900 px-5 py-3 text-sm font-semibold text-white">
            {t("universities")}
          </Link>
        </div>
      </>
    );
  }

  const coverImage = university.campusImages?.[0] || university.logo;
  const seoDescription =
    university.overview ||
    seoText(
      language,
      `Explore ${university.name}, its city, ranking, and tuition options for international students.`,
      `استكشف ${university.name} وتعرّف على المدينة والتصنيف وخيارات الرسوم للطلاب الدوليين.`
    );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: university.name,
    description: seoDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: university.city || "",
      addressCountry: university.country?.name || "",
    },
  };

  return (
    <div className="space-y-6">
      <Seo
        title={university.name}
        description={seoDescription}
        keywords={[
          university.name,
          university.city || "",
          university.country?.name || "",
          "international university",
        ]}
        structuredData={structuredData}
      />
      <section className="panel overflow-hidden p-0">
        {coverImage ? (
          <img src={getApiAssetUrl(coverImage)} alt={university.name} className="h-80 w-full object-cover" />
        ) : null}
        <div className="grid gap-6 p-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{tv(university.country?.name)}</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">{university.name}</h1>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t("city")}</div>
                <p className="mt-2 font-semibold text-slate-900">{university.city || dt(language, "notAvailable")}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t("ranking")}</div>
                <p className="mt-2 font-semibold text-slate-900">{university.ranking ? `#${university.ranking}` : dt(language, "notAvailable")}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t("partnerStatus")}</div>
                <p className="mt-2 font-semibold text-slate-900">{university.isPartnerInstitution ? t("yes") : t("no")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
            {university.logo ? (
              <img src={getApiAssetUrl(university.logo)} alt={`${university.name} logo`} className="h-20 w-20 rounded-3xl bg-white object-cover p-2" />
            ) : null}
            <h2 className="mt-5 text-2xl font-semibold">{dt(language, "browsePrograms")}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{dt(language, "applicationFormSubtitle")}</p>
            <div className="mt-6 rounded-3xl bg-white/10 p-4 text-sm text-slate-100">
              {t("tuition")}: {formatCurrency(university.tuitionRange?.min)} - {formatCurrency(university.tuitionRange?.max)}
            </div>
            <Link to={`/programs?university=${university._id}`} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">
              {dt(language, "browsePrograms")}
            </Link>
          </div>
        </div>
      </section>

      {university.overview ? (
        <section className="panel p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("overview")}</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">{university.name}</h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">{university.overview}</p>
        </section>
      ) : null}

      {university.campusImages?.length ? (
        <section className="panel p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{dt(language, "availableCampusPhotos")}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {university.campusImages.map((imageUrl) => (
              <img key={imageUrl} src={getApiAssetUrl(imageUrl)} alt={university.name} className="h-56 w-full rounded-3xl object-cover" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
