import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArticleContentSection } from "../components/content/ArticleContentSection";
import { FormInput } from "../components/forms/FormInput";
import { PhoneNumberField } from "../components/forms/PhoneNumberField";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Seo } from "../components/seo/Seo";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { getApiAssetUrl } from "../lib/api";
import { SITE_NAME, seoText } from "../seo/site";
import { applicationService } from "../services/applicationService";
import { programService } from "../services/programService";
import { studentService } from "../services/studentService";
import type { Program } from "../types";
import { dt } from "../utils/dashboardTranslations";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, formatDate } from "../utils/format";
import { buildPhoneNumber, DEFAULT_PHONE_DIAL_CODE, splitPhoneNumber } from "../utils/phoneCountryOptions";

type ApplicationFormState = {
  name: string;
  email: string;
  nationality: string;
  currentEducation: string;
  gpa: string;
  intake: string;
  englishExam: string;
  englishScore: string;
  address: string;
  notes: string;
};

const emptyForm: ApplicationFormState = {
  name: "",
  email: "",
  nationality: "",
  currentEducation: "",
  gpa: "",
  intake: "",
  englishExam: "",
  englishScore: "",
  address: "",
  notes: "",
};

export const ProgramDetailsPage = () => {
  const { t, tv, language } = useLanguage();
  const { id = "" } = useParams();
  const { profile, refreshSession, user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [applicationForm, setApplicationForm] = useState<ApplicationFormState>(emptyForm);
  const [phoneDialCode, setPhoneDialCode] = useState(DEFAULT_PHONE_DIAL_CODE);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [biometricPhoto, setBiometricPhoto] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [latestQualificationFile, setLatestQualificationFile] = useState<File | null>(null);
  const biometricInputRef = useRef<HTMLInputElement | null>(null);
  const passportInputRef = useRef<HTMLInputElement | null>(null);
  const latestQualificationInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProgram = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const data = await programService.getById(id);
        setProgram(data);
      } catch (error) {
        setLoadError(getErrorMessage(error, dt(language, "loadProgramFailed")));
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [id, language]);

  useEffect(() => {
    setApplicationForm((current) => ({
      ...current,
      name: current.name || user?.name || profile?.user?.name || "",
      email: current.email || user?.email || profile?.user?.email || "",
      nationality: current.nationality || profile?.nationality || "",
      currentEducation: current.currentEducation || profile?.currentEducation || "",
      gpa: current.gpa || profile?.gpa || "",
      intake: current.intake || profile?.intake || "",
      englishExam: current.englishExam || profile?.englishTest?.exam || "",
      englishScore: current.englishScore || profile?.englishTest?.score || "",
      address: current.address || profile?.address || "",
    }));
  }, [profile, user]);

  useEffect(() => {
    const { dialCode, phoneNumber: savedPhoneNumber } = splitPhoneNumber(profile?.phone);
    setPhoneDialCode(savedPhoneNumber ? dialCode : DEFAULT_PHONE_DIAL_CODE);
    setPhoneNumber((current) => current || savedPhoneNumber);
  }, [profile?.phone]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!user) {
      setErrorMessage(t("submitApplicationLoginRequired"));
      return;
    }

    if (user.role !== "student") {
      setErrorMessage(dt(language, "studentOnlyApplication"));
      return;
    }

    if (!program) {
      setErrorMessage(dt(language, "loadProgramFailed"));
      return;
    }

    const formattedPhoneNumber = buildPhoneNumber(phoneDialCode, phoneNumber);

    if (!formattedPhoneNumber) {
      setErrorMessage(t("phone"));
      return;
    }

    if (!biometricPhoto || !passportFile || !latestQualificationFile) {
      setErrorMessage(dt(language, "fillRequiredDocuments"));
      return;
    }

    setSubmitting(true);

    try {
      await studentService.updateProfile({
        name: applicationForm.name,
        email: applicationForm.email,
        phone: formattedPhoneNumber,
        nationality: applicationForm.nationality,
        currentEducation: applicationForm.currentEducation,
        gpa: applicationForm.gpa,
        intake: applicationForm.intake,
        englishTest: {
          exam: applicationForm.englishExam,
          score: applicationForm.englishScore,
        },
        address: applicationForm.address,
      });

      const [passportDocument, biometricDocument, latestQualificationDocument] = await Promise.all([
        studentService.uploadDocument(passportFile, "passport"),
        studentService.uploadDocument(biometricPhoto, "biometric-photo"),
        studentService.uploadDocument(latestQualificationFile, "latest-qualification"),
      ]);

      await applicationService.create({
        programId: program._id,
        notes: applicationForm.notes,
        documentIds: [passportDocument._id, biometricDocument._id, latestQualificationDocument._id],
        applicantProfile: {
          name: applicationForm.name,
          email: applicationForm.email,
          phone: formattedPhoneNumber,
          dateOfBirth: profile?.dateOfBirth,
          nationality: applicationForm.nationality,
          currentEducation: applicationForm.currentEducation,
          gpa: applicationForm.gpa,
          intake: applicationForm.intake,
          address: applicationForm.address,
          englishTest: {
            exam: applicationForm.englishExam,
            score: applicationForm.englishScore,
          },
        },
      });

      await refreshSession();
      setMessage(t("submitApplicationSuccess"));
      setApplicationForm((current) => ({ ...current, notes: "" }));
      setBiometricPhoto(null);
      setPassportFile(null);
      setLatestQualificationFile(null);

      if (biometricInputRef.current) {
        biometricInputRef.current.value = "";
      }

      if (passportInputRef.current) {
        passportInputRef.current.value = "";
      }

      if (latestQualificationInputRef.current) {
        latestQualificationInputRef.current.value = "";
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, dt(language, "applicationFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Seo
          title={seoText(language, "Program Details", "تفاصيل البرنامج")}
          description={seoText(
            language,
            "Discover detailed information about this international program and start your study abroad application.",
            "اكتشف التفاصيل الكاملة لهذا البرنامج الدولي وابدأ التقديم للدراسة بالخارج."
          )}
        />
        <LoadingSpinner />
      </>
    );
  }

  if (!program || loadError) {
    return (
      <>
        <Seo
          title={seoText(language, "Program Not Found", "البرنامج غير موجود")}
          description={seoText(
            language,
            "The requested program could not be loaded.",
            "تعذر تحميل البرنامج المطلوب."
          )}
          noIndex
        />
        <div className="panel p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{t("programs")}</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">{loadError || dt(language, "loadProgramFailed")}</h1>
          <Link to="/programs" className="mt-6 inline-flex rounded-full bg-brand-900 px-5 py-3 text-sm font-semibold text-white">
            {t("explorePrograms")}
          </Link>
        </div>
      </>
    );
  }

  const coverImage = program.coverImage || program.university?.campusImages?.[0] || program.university?.logo;
  const isPartnerUser = user?.role === "partner";
  const visibleTuition = isPartnerUser ? program.partnerTuition ?? program.tuition : program.tuition;
  const seoDescription =
    program.summary ||
    seoText(
      language,
      `Explore ${program.title} at ${program.university?.name || SITE_NAME} and review tuition, intake, and admission requirements.`,
      `استكشف برنامج ${program.title} في ${program.university?.name || SITE_NAME} وتعرّف على الرسوم وموعد الدراسة ومتطلبات القبول.`
    );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: seoDescription,
    provider: {
      "@type": "CollegeOrUniversity",
      name: program.university?.name || SITE_NAME,
    },
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <Seo
        title={program.title}
        description={seoDescription}
        keywords={[
          program.title,
          program.university?.name || "",
          program.fieldOfStudy,
          program.degreeLevel,
        ]}
        structuredData={structuredData}
      />
      <section className="panel overflow-hidden p-0">
        {coverImage ? (
          <img src={getApiAssetUrl(coverImage)} alt={program.university?.name || program.title} className="h-72 w-full object-cover" />
        ) : null}
        <div className="p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{tv(program.degreeLevel)}</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">{program.title}</h1>
          <p className="mt-4 text-slate-600">{program.summary}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t("university")}</div>
              {program.university ? (
                <Link to={`/universities/${program.university._id}`} className="mt-2 inline-flex font-semibold text-brand-700">
                  {program.university.name}
                </Link>
              ) : (
                <p className="mt-2 font-semibold text-slate-900">{dt(language, "unknownUniversity")}</p>
              )}
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t("country")}</div>
              <p className="mt-2 font-semibold text-slate-900">{tv(program.university?.country?.name)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{isPartnerUser ? t("partnerPrice") : t("tuition")}</div>
              <p className="mt-2 font-semibold text-slate-900">{formatCurrency(visibleTuition)}</p>
              {isPartnerUser && typeof program.partnerTuition === "number" && typeof program.tuition === "number" ? (
                <p className="mt-2 text-sm text-slate-500">{t("tuition")}: {formatCurrency(program.tuition)}</p>
              ) : null}
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t("deadline")}</div>
              <p className="mt-2 font-semibold text-slate-900">{formatDate(program.applicationDeadline)}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900">{t("requirements")}</h2>
            {program.requirements?.length ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
                {program.requirements.map((item) => (
                  <li key={item}>{tv(item)}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-slate-500">{dt(language, "notAvailable")}</p>
            )}
          </div>
        </div>
      </section>

      <ArticleContentSection article={program} language={language} />

      <section className="panel p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">{dt(language, "submitUniversityApplication")}</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">{dt(language, "applicationFormTitle")}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{dt(language, "applicationFormSubtitle")}</p>

        {message ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
        {errorMessage ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div> : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              label={t("name")}
              value={applicationForm.name}
              onChange={(event) => setApplicationForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <FormInput
              label={t("email")}
              type="email"
              value={applicationForm.email}
              onChange={(event) => setApplicationForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
            <PhoneNumberField
              label={t("phone")}
              dialCode={phoneDialCode}
              phoneNumber={phoneNumber}
              onDialCodeChange={setPhoneDialCode}
              onPhoneNumberChange={setPhoneNumber}
              required
            />
            <FormInput
              label={t("nationality")}
              value={applicationForm.nationality}
              onChange={(event) => setApplicationForm((current) => ({ ...current, nationality: event.target.value }))}
              required
            />
            <FormInput
              label={t("currentEducation")}
              value={applicationForm.currentEducation}
              onChange={(event) => setApplicationForm((current) => ({ ...current, currentEducation: event.target.value }))}
              required
            />
            <FormInput
              label={t("gpa")}
              value={applicationForm.gpa}
              onChange={(event) => setApplicationForm((current) => ({ ...current, gpa: event.target.value }))}
            />
            <FormInput
              label={t("preferredIntake")}
              value={applicationForm.intake}
              onChange={(event) => setApplicationForm((current) => ({ ...current, intake: event.target.value }))}
            />
            <FormInput
              label={dt(language, "englishExam")}
              value={applicationForm.englishExam}
              onChange={(event) => setApplicationForm((current) => ({ ...current, englishExam: event.target.value }))}
            />
            <FormInput
              label={dt(language, "englishScore")}
              value={applicationForm.englishScore}
              onChange={(event) => setApplicationForm((current) => ({ ...current, englishScore: event.target.value }))}
            />
            <FormInput
              label={t("address")}
              value={applicationForm.address}
              onChange={(event) => setApplicationForm((current) => ({ ...current, address: event.target.value }))}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "applicationNotes")}</span>
            <textarea
              value={applicationForm.notes}
              onChange={(event) => setApplicationForm((current) => ({ ...current, notes: event.target.value }))}
              rows={4}
              placeholder={dt(language, "applicationNotesPlaceholder")}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-300 focus:ring"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "biometricPhoto")}</span>
              <input
                ref={biometricInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={(event) => setBiometricPhoto(event.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">{dt(language, "uploadHintBiometric")}</p>
              {biometricPhoto ? <p className="mt-2 text-sm font-medium text-slate-700">{biometricPhoto.name}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "passportFile")}</span>
              <input
                ref={passportInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                required
                onChange={(event) => setPassportFile(event.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">{dt(language, "uploadHintPassport")}</p>
              {passportFile ? <p className="mt-2 text-sm font-medium text-slate-700">{passportFile.name}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "latestQualification")}</span>
              <input
                ref={latestQualificationInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                required
                onChange={(event) => setLatestQualificationFile(event.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">{dt(language, "uploadHintQualification")}</p>
              {latestQualificationFile ? <p className="mt-2 text-sm font-medium text-slate-700">{latestQualificationFile.name}</p> : null}
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || user?.role !== "student"}
            className="rounded-full bg-brand-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? dt(language, "applyingNow") : dt(language, "saveAndApply")}
          </button>

          <p className="text-sm text-slate-500">
            {user ? (user.role === "student" ? dt(language, "fillRequiredDocuments") : dt(language, "studentOnlyApplication")) : t("submitApplicationLoginRequired")}
          </p>
        </form>
      </section>
    </div>
  );
};
