import { useEffect, useState, type FormEvent } from "react";
import { MessageSquare, PencilLine, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import { adminService } from "../../services/adminService";
import type { Country, Faq } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { dt } from "../../utils/dashboardTranslations";

const countryLabel = (country: Country) => country.name;

const emptyFaqForm = {
  question: "",
  answer: "",
  featured: true,
  sortOrder: "0",
  country: "",
};

export const AdminFaqsPage = () => {
  const { language } = useLanguage();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [faqForm, setFaqForm] = useState(emptyFaqForm);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    const [faqsData, countriesData] = await Promise.all([adminService.getFaqs(), adminService.getCountries()]);
    setFaqs(faqsData);
    setCountries(countriesData);
  };

  useEffect(() => {
    loadData().catch((error) => setFormError(getErrorMessage(error, dt(language, "loadContentFailed"))));
  }, [language]);

  const resetFaqForm = () => {
    setEditingFaqId(null);
    setFaqForm(emptyFaqForm);
  };

  const submitFaq = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      question: faqForm.question,
      answer: faqForm.answer,
      featured: faqForm.featured,
      sortOrder: Number(faqForm.sortOrder || 0),
      country: faqForm.country || null,
    };

    try {
      if (editingFaqId) {
        await adminService.updateFaq(editingFaqId, payload);
      } else {
        await adminService.createFaq(payload);
      }

      resetFaqForm();
      await loadData();
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "saveContentFailed")));
    }
  };

  return (
    <div className="space-y-6">
      {formError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{dt(language, "faqsContent")}</h1>
            <p className="mt-1 text-sm text-slate-500">{dt(language, "faqsHelp")}</p>
          </div>
        </div>

        <form onSubmit={submitFaq} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "faqQuestion")}</span>
              <input
                value={faqForm.question}
                onChange={(event) => setFaqForm((current) => ({ ...current, question: event.target.value }))}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "الترتيب" : "Sort order"}</span>
              <input
                type="number"
                min="0"
                value={faqForm.sortOrder}
                onChange={(event) => setFaqForm((current) => ({ ...current, sortOrder: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">{language === "ar" ? "الدولة" : "Country"}</span>
              <select
                value={faqForm.country}
                onChange={(event) => setFaqForm((current) => ({ ...current, country: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              >
                <option value="">{language === "ar" ? "سؤال عام لكل الدول" : "General question for all countries"}</option>
                {countries.map((country) => (
                  <option key={country._id} value={country._id}>
                    {countryLabel(country)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "faqAnswer")}</span>
            <textarea
              value={faqForm.answer}
              onChange={(event) => setFaqForm((current) => ({ ...current, answer: event.target.value }))}
              required
              rows={5}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
            <input type="checkbox" checked={faqForm.featured} onChange={(event) => setFaqForm((current) => ({ ...current, featured: event.target.checked }))} />
            <span className="text-sm font-medium text-slate-700">{dt(language, "showFeaturedFaq")}</span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              <Plus className="h-4 w-4" />
              {editingFaqId ? dt(language, "updateFaq") : dt(language, "createFaq")}
            </button>
            <button type="button" onClick={resetFaqForm} className="rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-700">
              {dt(language, "clearForm")}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq._id} className="panel p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-slate-900">{faq.question}</p>
                  {faq.featured ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{dt(language, "featured")}</span> : null}
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {language === "ar" ? `ترتيب ${faq.sortOrder || 0}` : `Order ${faq.sortOrder || 0}`}
                  </span>
                  {faq.country && typeof faq.country !== "string" ? (
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      {countryLabel(faq.country)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {language === "ar" ? "عام" : "General"}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setEditingFaqId(faq._id);
                    setFaqForm({
                      question: faq.question,
                      answer: faq.answer,
                      featured: Boolean(faq.featured),
                      sortOrder: String(faq.sortOrder || 0),
                      country: faq.country && typeof faq.country !== "string" ? faq.country._id : typeof faq.country === "string" ? faq.country : "",
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                >
                  <PencilLine className="h-4 w-4" />
                  {dt(language, "edit")}
                </button>
                <button onClick={() => adminService.removeFaq(faq._id).then(loadData)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 font-medium text-rose-700">
                  <Trash2 className="h-4 w-4" />
                  {dt(language, "delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};


