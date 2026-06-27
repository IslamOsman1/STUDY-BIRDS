import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { BRAND_LOGO_PATH, SITE_NAME } from "../seo/site";
import { useLanguage } from "../hooks/useLanguage";
import { contactService } from "../services/contactService";
import { getErrorMessage } from "../utils/errors";

type PromptFormState = {
  name: string;
  email: string;
  phone: string;
  specialization: string;
};

const STORAGE_KEY = "studyBirdsLeadPromptSeen";
const DELAY_MS = 10_000;

const emptyForm: PromptFormState = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
};

export const LeadCapturePrompt = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<PromptFormState>(emptyForm);

  const isArabic = language === "ar";
  const isPublicPage = useMemo(() => {
    const path = location.pathname;

    return !(
      path.startsWith("/admin") ||
      path.startsWith("/student") ||
      path.startsWith("/partner") ||
      path.startsWith("/login") ||
      path.startsWith("/register") ||
      path.startsWith("/forgot-password")
    );
  }, [location.pathname]);

  useEffect(() => {
    if (!isPublicPage) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (window.sessionStorage.getItem(STORAGE_KEY) === "true") {
      return;
    }

    const timer = window.setTimeout(() => {
      setOpen(true);
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    }, DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isPublicPage]);

  const closePrompt = () => {
    setOpen(false);
    setErrorMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.specialization.trim()) {
      setErrorMessage(
        isArabic
          ? "\u064a\u0631\u062c\u0649 \u062a\u0639\u0628\u0626\u0629 \u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0648\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 \u0648\u0627\u0644\u062a\u062e\u0635\u0635."
          : "Please fill in your name, email, phone number, and specialization."
      );
      return;
    }

    try {
      setSubmitting(true);
      await contactService.sendMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: isArabic
          ? `\u0637\u0644\u0628 \u062a\u0648\u0627\u0635\u0644 \u0633\u0631\u064a\u0639 - ${form.name.trim()}`
          : `Quick contact request - ${form.name.trim()}`,
        message: isArabic
          ? `\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628 \u0645\u0646 \u0627\u0644\u0646\u0627\u0641\u0630\u0629 \u0627\u0644\u0645\u0646\u0628\u062b\u0642\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u0645\u0648\u0642\u0639.\n\u0627\u0644\u062a\u062e\u0635\u0635: ${form.specialization.trim()}\n\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641: ${form.phone.trim()}`
          : `This request was submitted from the site popup.\nSpecialization: ${form.specialization.trim()}\nPhone: ${form.phone.trim()}`,
      });

      setSuccessMessage(
        isArabic
          ? "\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0628\u0646\u062c\u0627\u062d. \u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0627\u0644\u0641\u0631\u064a\u0642 \u0642\u0631\u064a\u0628\u064b\u0627."
          : "Your details were sent successfully. Our team will contact you soon."
      );
      setForm(emptyForm);
      window.setTimeout(() => setOpen(false), 1800);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          isArabic
            ? "\u062a\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0622\u0646. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0628\u0639\u062f \u0642\u0644\u064a\u0644."
            : "Unable to send your details right now. Please try again shortly."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-orange-100 via-amber-50 to-white" />

        <button
          type="button"
          onClick={closePrompt}
          className="absolute left-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm transition hover:bg-white"
          aria-label={isArabic ? "\u0625\u063a\u0644\u0627\u0642" : "Close"}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-6 pb-6 pt-8">
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-orange-100 bg-white/90 px-4 py-2 shadow-sm">
            <img src={BRAND_LOGO_PATH} alt={SITE_NAME} className="h-10 w-10 rounded-xl object-cover" />
            <div className="text-start">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">{SITE_NAME}</p>
              <p className="text-sm font-semibold text-slate-900">
                {isArabic
                  ? "\u0627\u0628\u062f\u0623 \u0631\u062d\u0644\u062a\u0643 \u0627\u0644\u062c\u0627\u0645\u0639\u064a\u0629 \u0645\u0639\u0646\u0627"
                  : "Start your academic journey with us"}
              </p>
            </div>
          </div>

          <div className="mt-5 text-center">
            <h3 className="text-2xl font-semibold text-slate-950">
              {isArabic
                ? "\u0633\u062c\u0644 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0648\u062f\u0639 \u0641\u0631\u064a\u0642\u0646\u0627 \u064a\u0628\u062f\u0623 \u0645\u0639\u0643"
                : "Share your details and let our team guide you"}
            </h3>
          </div>

          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder={isArabic ? "\u0627\u0644\u0627\u0633\u0645" : "Name"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:ring"
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder={isArabic ? "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" : "Email"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:ring"
            />
            <input
              type="text"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder={isArabic ? "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641" : "Phone number"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:ring"
            />
            <input
              type="text"
              value={form.specialization}
              onChange={(event) => setForm((current) => ({ ...current, specialization: event.target.value }))}
              placeholder={isArabic ? "\u0627\u0644\u062a\u062e\u0635\u0635 \u0627\u0644\u0630\u064a \u062a\u0628\u062d\u062b \u0639\u0646\u0647" : "Specialization you are looking for"}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:ring"
            />

            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}
            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? isArabic
                  ? "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644..."
                  : "Sending..."
                : isArabic
                  ? "\u0633\u062c\u0644 \u0627\u0644\u0622\u0646"
                  : "Register now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
