import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Seo } from "../components/seo/Seo";
import { contentService } from "../services/contentService";
import type { Faq } from "../types";
import { useLanguage } from "../hooks/useLanguage";
import { SITE_NAME, seoText } from "../seo/site";
import { getPaginatedItems } from "../utils/pagination";

export const FaqPage = () => {
  const { t, language } = useLanguage();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    contentService.getFaqs({ paginate: false }).then((data) => setFaqs(getPaginatedItems(data)));
  }, []);

  return (
    <div className="space-y-8">
      <Seo
        title={seoText(language, `FAQ | ${SITE_NAME}`, `الأسئلة الشائعة | ${SITE_NAME}`)}
        description={seoText(
          language,
          `Read the most common questions and answers about studying abroad with ${SITE_NAME}.`,
          `تصفح أكثر الأسئلة الشائعة وإجاباتها حول الدراسة بالخارج مع ${SITE_NAME}.`
        )}
      />

      <div className="panel border-t-4 border-t-accent-300 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("faqEyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">{t("faqTitle")}</h1>
        <p className="mt-4 max-w-3xl text-slate-600">{t("faqBody")}</p>
      </div>

      <div className="space-y-4">
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
    </div>
  );
};
