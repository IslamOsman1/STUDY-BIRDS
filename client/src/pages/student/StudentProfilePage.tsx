import { useEffect, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { DateOfBirthField } from "../../components/forms/DateOfBirthField";
import { FormInput } from "../../components/forms/FormInput";
import { PhoneNumberField } from "../../components/forms/PhoneNumberField";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { authService } from "../../services/authService";
import { studentService } from "../../services/studentService";
import type { StudentProfile } from "../../types";
import { dt } from "../../utils/dashboardTranslations";
import { getErrorMessage } from "../../utils/errors";
import { buildPhoneNumber, DEFAULT_PHONE_DIAL_CODE, splitPhoneNumber } from "../../utils/phoneCountryOptions";

type ProfileFormValues = StudentProfile & {
  name: string;
  email: string;
  englishExam?: string;
  englishScore?: string;
  targetCountriesText?: string;
};

export const StudentProfilePage = () => {
  const { language, t } = useLanguage();
  const { profile, refreshSession, user } = useAuth();
  const isPartner = user?.role === "partner";
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneDialCode, setPhoneDialCode] = useState(DEFAULT_PHONE_DIAL_CODE);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>();
  const dateOfBirthValue = watch("dateOfBirth");

  useEffect(() => {
    studentService.getProfile().then((data) =>
      {
        const { dialCode, phoneNumber: savedPhoneNumber } = splitPhoneNumber(data.phone);
        setPhoneDialCode(savedPhoneNumber ? dialCode : DEFAULT_PHONE_DIAL_CODE);
        setPhoneNumber(savedPhoneNumber);

        reset({
          ...data,
          name: data.user?.name || "",
          email: data.user?.email || "",
          englishExam: data.englishTest?.exam || "",
          englishScore: data.englishTest?.score || "",
          targetCountriesText: data.targetCountries?.join(", ") || "",
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().slice(0, 10) : "",
        });
      }
    );
  }, [reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    setFormError("");
    setFormMessage("");

    try {
      const formattedPhoneNumber = buildPhoneNumber(phoneDialCode, phoneNumber);

      await studentService.updateProfile({
        name: values.name,
        email: values.email,
        phone: formattedPhoneNumber,
        dateOfBirth: values.dateOfBirth,
        nationality: values.nationality,
        address: values.address,
        bio: values.bio,
        ...(isPartner
          ? {}
          : {
              currentEducation: values.currentEducation,
              gpa: values.gpa,
              intake: values.intake,
              targetCountries: values.targetCountriesText
                ?.split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              englishTest: {
                exam: values.englishExam,
                score: values.englishScore,
              },
            }),
      } as Partial<StudentProfile> & { name: string; email: string });

      await refreshSession();
      setFormMessage(dt(language, "profileSaved"));
    } catch (error) {
      setFormError(getErrorMessage(error, dt(language, "profileSaveFailed")));
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(dt(language, "passwordMismatch"));
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage(dt(language, "passwordUpdated"));
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordError(getErrorMessage(error, dt(language, "profileSaveFailed")));
    }
  };

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <aside className="space-y-6">
        <section className="panel p-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-900 text-2xl font-semibold text-white">
            {initials || "SB"}
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-slate-900">{dt(language, "profilePageTitle")}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{dt(language, "profilePageSubtitle")}</p>
            <div className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{dt(language, "profileNote")}</p>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold">{t("email")}:</span> {user?.email || profile?.user?.email}
              </div>
              {!isPartner ? (
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold">{t("studentProfile")}:</span> {profile?.currentEducation || dt(language, "notAvailable")}
                </div>
              ) : null}
          </div>
        </section>
      </aside>

      <div className="space-y-6">
        <section className="panel p-8">
          {formMessage ? <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{formMessage}</div> : null}
          {formError ? <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">{dt(language, "personalDetails")}</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <FormInput label={dt(language, "fullName")} {...register("name")} />
                <FormInput label={t("email")} type="email" {...register("email")} />
                <PhoneNumberField
                  label={t("phone")}
                  dialCode={phoneDialCode}
                  phoneNumber={phoneNumber}
                  onDialCodeChange={setPhoneDialCode}
                  onPhoneNumberChange={setPhoneNumber}
                />
                <input type="hidden" {...register("dateOfBirth")} />
                <DateOfBirthField
                  label={dt(language, "dateOfBirth")}
                  language={language}
                  value={dateOfBirthValue}
                  onChange={(value) => setValue("dateOfBirth", value, { shouldDirty: true })}
                />
                <FormInput label={t("nationality")} {...register("nationality")} />
                <FormInput label={t("address")} {...register("address")} />
                <label className={`block ${isPartner ? "md:col-span-2" : "md:col-span-2"}`}>
                  <span className="mb-2 block text-sm font-medium text-slate-700">{dt(language, "bio")}</span>
                  <textarea {...register("bio")} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-brand-300 focus:ring" />
                </label>
              </div>
            </div>

            {!isPartner ? (
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{dt(language, "academicDetails")}</h2>
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <FormInput label={t("currentEducation")} {...register("currentEducation")} />
                  <FormInput label={t("gpa")} {...register("gpa")} />
                  <FormInput label={t("preferredIntake")} {...register("intake")} />
                  <FormInput label={dt(language, "targetCountries")} {...register("targetCountriesText")} placeholder="Turkey, Canada, Germany" />
                  <FormInput label={dt(language, "englishExam")} {...register("englishExam")} />
                  <FormInput label={dt(language, "englishScore")} {...register("englishScore")} />
                </div>
              </div>
            ) : null}

            <button type="submit" disabled={isSubmitting} className="w-fit rounded-full bg-brand-900 px-6 py-3 font-semibold text-white">
              {isSubmitting ? dt(language, "saving") : dt(language, "saveChanges")}
            </button>
          </form>
        </section>

        <section className="panel p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{dt(language, "accountActions")}</h2>
          <p className="mt-2 text-sm text-slate-500">{dt(language, "passwordHelp")}</p>
          {passwordMessage ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordMessage}</div> : null}
          {passwordError ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{passwordError}</div> : null}
          <form onSubmit={handlePasswordSubmit} className="mt-5 grid gap-5 md:grid-cols-3">
            <FormInput
              label={dt(language, "currentPassword")}
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
            />
            <FormInput
              label={dt(language, "newPassword")}
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
            />
            <FormInput
              label={dt(language, "confirmNewPassword")}
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            />
            <button type="submit" className="w-fit rounded-full bg-slate-950 px-6 py-3 font-semibold text-white md:col-span-3">
              {dt(language, "updatePassword")}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
