import { ArrowRight, Award, Compass } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { getApiAssetUrl } from "../lib/api";
import { SITE_NAME, seoText } from "../seo/site";
import { contentService } from "../services/contentService";
import type { OurService } from "../types";
import { getErrorMessage } from "../utils/errors";

export const ServicesPage = () => {
  const { language, t } = useLanguage();
  const [services, setServices] = useState<OurService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      setError("");

      try {
        const servicesData = await contentService.getOurServices();
        setServices(servicesData.filter((service) => service.featured !== false));
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            language === "ar" ? "تعذر تحميل الخدمات حاليًا." : "Unable to load the services right now."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [language]);

  return (
    <div className="space-y-8">
      <Seo
        title={seoText(language, "Our Services", "خدماتنا")}
        description={seoText(
          language,
          `Discover the student services offered by ${SITE_NAME}, from planning and application support to guidance through each study abroad step.`,
          `تعرّف على الخدمات التي يقدمها ${SITE_NAME} للطلاب، من التخطيط والتقديم وحتى المتابعة في كل خطوة من رحلة الدراسة بالخارج.`
        )}
        keywords={["student services", "study abroad support", "our services", "خدماتنا", "خدمات الطلاب"]}
        canonicalPath="/services"
      />

      <section className="relative overflow-hidden rounded-[2rem] bg-fusion px-8 py-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-brand-100">
              <Compass className="h-4 w-4" />
              {t("servicesEyebrow")}
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">{t("servicesTitle")}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-brand-100 sm:text-lg">
              {language === "ar"
                ? "هذه الصفحة تجمع الخدمات التي نوفرها للطلاب في مكان واحد واضح، مع بطاقات مرئية تسهّل التعرف على ما نقدمه في كل مرحلة."
                : "This page brings together the services we offer students in one clear place, using visual cards that make each part of the journey easy to understand."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-brand-100">{language === "ar" ? "إجمالي الخدمات" : "Total services"}</p>
              <p className="mt-3 text-4xl font-semibold">{services.length}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-brand-100">{language === "ar" ? "دعم مخصص للطلاب" : "Student-focused support"}</p>
              <p className="mt-3 text-lg font-semibold">
                {language === "ar" ? "تخطيط، تقديم، ومتابعة في مسار واحد" : "Planning, applications, and follow-up in one flow"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {loading ? <div className="panel p-8 text-sm text-slate-500">{language === "ar" ? "جارٍ تحميل الخدمات..." : "Loading services..."}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error && services.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            {language === "ar" ? "لا توجد خدمات منشورة حاليًا" : "No services are published yet"}
          </h2>
          <p className="mt-3 text-slate-600">
            {language === "ar"
              ? "بمجرد إضافة خدمات من لوحة التحكم ستظهر هنا تلقائيًا."
              : "As soon as services are added from the dashboard, they will appear here automatically."}
          </p>
        </div>
      ) : null}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => {
          const imageUrl = service.image ? getApiAssetUrl(service.image) : "";

          return (
            <article
              key={service._id}
              className="panel overflow-hidden border border-slate-200/70 bg-white p-2 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {imageUrl ? (
                <div className="flex h-44 w-full items-center justify-center rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(17,24,39,0.04)_0%,rgba(17,24,39,0.01)_100%)] p-4 sm:h-52">
                  <img src={imageUrl} alt={service.title} className="h-full w-full rounded-[1rem] object-contain" />
                </div>
              ) : (
                <div className="flex h-44 w-full flex-col justify-between rounded-[1.4rem] bg-fusion p-5 text-white sm:h-52">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-brand-100">
                    <Award size={22} />
                  </span>
                  <p className="text-xl font-semibold leading-tight">{service.title}</p>
                </div>
              )}

              <div className="px-2 pb-3 pt-4">
                <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {language === "ar" ? `الخدمة ${index + 1}` : `Service ${index + 1}`}
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">{service.title}</h2>
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel flex flex-col gap-5 bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_100%)] p-8 text-white lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-100">{t("servicesEyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold">
            {language === "ar" ? "هل تريد معرفة الخدمة الأنسب لخطتك الدراسية؟" : "Want help choosing the right service for your study plan?"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-100/85">
            {language === "ar"
              ? "يمكنك التواصل معنا لنساعدك في اختيار المسار المناسب بحسب الدولة، الجامعة، والبرنامج الذي تستهدفه."
              : "Talk to us and we will help you choose the right path based on your destination, university, and program goals."}
          </p>
        </div>

        <Link
          to="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
        >
          {t("contact")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
};
