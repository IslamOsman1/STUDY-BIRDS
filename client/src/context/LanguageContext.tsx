import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { SITE_NAME } from "../seo/site";

export type Language = "en" | "ar";

type TranslationKey =
  | "about"
  | "accepted"
  | "activeReviews"
  | "address"
  | "admin"
  | "allCountries"
  | "allDegreeLevels"
  | "allFields"
  | "allIntakes"
  | "allUniversities"
  | "applications"
  | "applyOnline"
  | "authFailed"
  | "contact"
  | "country"
  | "createAccount"
  | "creatingAccount"
  | "createProfile"
  | "currentEducation"
  | "dashboard"
  | "deadline"
  | "degreeBachelor"
  | "degreeDiploma"
  | "degreeMaster"
  | "destinations"
  | "documents"
  | "email"
  | "fieldBusiness"
  | "fieldEngineering"
  | "fieldSocialSciences"
  | "fieldTechnology"
  | "explore"
  | "exploreProgram"
  | "explorePrograms"
  | "featured"
  | "featuredDestinations"
  | "featuredUniversities"
  | "fieldOfStudy"
  | "findBestProgram"
  | "flyBeyondBorders"
  | "forgotPassword"
  | "gpa"
  | "heroSubtitle"
  | "heroTitle"
  | "heroStep1"
  | "heroStep2"
  | "heroStep3"
  | "heroStep4"
  | "howItWorks"
  | "intake"
  | "intakeFall2026"
  | "intakeSpring2027"
  | "language"
  | "login"
  | "loginPrompt"
  | "logout"
  | "markStatus"
  | "maxTuition"
  | "minTuition"
  | "myApplications"
  | "name"
  | "nationality"
  | "noDocuments"
  | "noDocumentsDescription"
  | "noPrograms"
  | "noProgramsDescription"
  | "notifications"
  | "overview"
  | "partner"
  | "partnerPrice"
  | "password"
  | "phone"
  | "preferredIntake"
  | "programs"
  | "popularity"
  | "ranking"
  | "recentApplications"
  | "register"
  | "registerPrompt"
  | "requirements"
  | "role"
  | "saveProfile"
  | "searchKeyword"
  | "searchProgramsTitle"
  | "sortByFeatured"
  | "startJourney"
  | "statusAccepted"
  | "statusDraft"
  | "statusRejected"
  | "statusSubmitted"
  | "statusUnderReview"
  | "step"
  | "student"
  | "studentStories"
  | "studentProfile"
  | "students"
  | "studentsHelped"
  | "submitApplication"
  | "submitApplicationNote"
  | "submitApplicationSuccess"
  | "submitApplicationLoginRequired"
  | "submitting"
  | "submitYourApplication"
  | "testimonialsTitle"
  | "trackAdmission"
  | "tuition"
  | "university"
  | "universities"
  | "viewUniversity"
  | "uploadDocument"
  | "uploadedDocuments"
  | "yes"
  | "no"
  | "aboutBody"
  | "aboutTitle"
  | "city"
  | "contactBody"
  | "contactTitle"
  | "ctaDescription"
  | "destinationsTitle"
  | "forgotPasswordBody"
  | "guidedPath"
  | "notFoundBody"
  | "notFoundTitle"
  | "offices"
  | "partnerBody"
  | "partnerInstitutions"
  | "partnerStatus"
  | "partnerTitle"
  | "readyNextChapter"
  | "returnHome"
  | "signingIn"
  | "studyDestinations"
  | "supportHours"
  | "universitiesTitle"
  | "footerBody"
  | "welcomeBack";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    about: "About",
    accepted: "Accepted",
    activeReviews: "Active Reviews",
    address: "Address",
    admin: "Admin",
    allCountries: "All countries",
    allDegreeLevels: "All degree levels",
    allFields: "All fields",
    allIntakes: "All intakes",
    allUniversities: "All universities",
    applications: "Applications",
    applyOnline: "Apply online",
    authFailed: "Authentication failed. Please check your details and try again.",
    contact: "Contact",
    country: "Country",
    createAccount: "Create your account",
    creatingAccount: "Creating account...",
    createProfile: "Create your profile",
    currentEducation: "Current education",
    dashboard: "Dashboard",
    deadline: "Deadline",
    degreeBachelor: "Bachelor",
    degreeDiploma: "Diploma",
    degreeMaster: "Master",
    destinations: "Destinations",
    documents: "Documents",
    email: "Email",
    fieldBusiness: "Business",
    fieldEngineering: "Engineering",
    fieldSocialSciences: "Social Sciences",
    fieldTechnology: "Technology",
    explore: "Explore",
    exploreProgram: "Explore program",
    explorePrograms: "Explore Programs",
    featured: "Featured",
    featuredDestinations: "Featured study destinations",
    featuredUniversities: "Featured universities",
    fieldOfStudy: "Field of study",
    findBestProgram: "Find your best-fit program",
    flyBeyondBorders: "Fly Beyond Borders",
    forgotPassword: "Forgot password",
    gpa: "GPA",
    heroSubtitle: "Discover global universities, compare programs, and apply to study abroad with confidence.",
    heroTitle: "Your Future Takes Flight",
    heroStep1: "Find your best-fit university",
    heroStep2: "Compare deadlines and tuition",
    heroStep3: "Upload documents securely",
    heroStep4: "Track every application milestone",
    howItWorks: "How it works",
    intake: "Intake",
    intakeFall2026: "Fall 2026",
    intakeSpring2027: "Spring 2027",
    language: "العربية",
    login: "Log In",
    loginPrompt: "Already have an account?",
    logout: "Logout",
    markStatus: "Mark",
    maxTuition: "Max tuition",
    minTuition: "Min tuition",
    myApplications: "My applications",
    name: "Full name",
    nationality: "Nationality",
    noDocuments: "No documents yet",
    noDocumentsDescription: "Upload your study documents to prepare your applications.",
    noPrograms: "No programs matched",
    noProgramsDescription: "Try adjusting your search filters to explore more options.",
    notifications: "Notifications",
    overview: "Overview",
    partner: "Partner",
    partnerPrice: "Partner price",
    password: "Password",
    phone: "Phone",
    preferredIntake: "Preferred intake",
    programs: "Programs",
    popularity: "Popularity",
    ranking: "Ranking",
    recentApplications: "Recent applications",
    register: "Register",
    registerPrompt: "Do not have an account?",
    requirements: "Requirements",
    role: "Role",
    saveProfile: "Save profile",
    searchKeyword: "Search by keyword",
    searchProgramsTitle: "Search your next program",
    sortByFeatured: "Sort by featured",
    startJourney: "Start Your Journey",
    statusAccepted: "Accepted",
    statusDraft: "Draft",
    statusRejected: "Rejected",
    statusSubmitted: "Submitted",
    statusUnderReview: "Under review",
    step: "Step",
    student: "Student",
    studentStories: "Student stories",
    studentProfile: "Student profile",
    students: "Students",
    studentsHelped: "Students Helped",
    submitApplication: "Submit Application",
    submitApplicationNote: "Confirm your profile, upload your documents, add notes, and submit your application in a few steps.",
    submitApplicationSuccess: "Application submitted successfully.",
    submitApplicationLoginRequired: "Student login required to apply.",
    submitting: "Submitting...",
    submitYourApplication: "Submit your application",
    testimonialsTitle: "Testimonials from future flyers",
    trackAdmission: "Track your admission status",
    tuition: "Tuition",
    university: "University",
    universities: "Universities",
    viewUniversity: "View university",
    uploadDocument: "Upload document",
    uploadedDocuments: "Uploaded documents",
    yes: "Yes",
    no: "No",
    aboutBody: "Study Birds is a study abroad platform designed to simplify international education planning with a modern, transparent, and student-first experience.",
    aboutTitle: "Built for ambitious global learners",
    city: "City",
    contactBody: "We help students, institutions, and partners move forward with clarity.",
    contactTitle: "Talk to the Study Birds team",
    ctaDescription: "Build your profile, compare international programs, and apply from one streamlined student space.",
    destinationsTitle: "Where do you want to grow?",
    forgotPasswordBody: "Password reset delivery can be added next. For now, use seeded accounts or create a fresh student profile.",
    guidedPath: "A guided path from search to submission",
    notFoundBody: "The page you are looking for could not be found.",
    notFoundTitle: "This page could not be found",
    offices: "Offices: Istanbul, Toronto, London",
    partnerBody: "Partner institutions and recruitment teams can collaborate with Study Birds to connect with qualified international students through a clean admissions workflow.",
    partnerInstitutions: "Partner Institutions",
    partnerStatus: "Partner",
    partnerTitle: "Grow your reach with Study Birds",
    readyNextChapter: "Ready to map your next chapter?",
    returnHome: "Return Home",
    signingIn: "Signing in...",
    studyDestinations: "Study Destinations",
    supportHours: "Support: Monday to Friday, 9:00 to 18:00",
    universitiesTitle: "Explore partner institutions",
    footerBody: "Fly Beyond Borders with a platform built to help students discover, apply, and track their global education journey.",
    welcomeBack: "Welcome back",
  },
  ar: {
    about: "من نحن",
    accepted: "مقبول",
    activeReviews: "طلبات قيد المراجعة",
    address: "العنوان",
    admin: "المدير",
    allCountries: "كل الدول",
    allDegreeLevels: "كل الدرجات",
    allFields: "كل المجالات",
    allIntakes: "كل مواعيد الدراسة",
    allUniversities: "كل الجامعات",
    applications: "الطلبات",
    applyOnline: "قدّم عبر الإنترنت",
    authFailed: "تعذر تسجيل الدخول أو إنشاء الحساب. راجع البيانات وحاول مرة أخرى.",
    contact: "تواصل معنا",
    country: "الدولة",
    createAccount: "أنشئ حسابك",
    creatingAccount: "جاري إنشاء الحساب...",
    createProfile: "أنشئ ملفك الشخصي",
    currentEducation: "المؤهل الحالي",
    dashboard: "لوحة التحكم",
    deadline: "آخر موعد",
    degreeBachelor: "بكالوريوس",
    degreeDiploma: "دبلوم",
    degreeMaster: "ماجستير",
    destinations: "وجهات الدراسة",
    documents: "المستندات",
    email: "البريد الإلكتروني",
    fieldBusiness: "إدارة الأعمال",
    fieldEngineering: "الهندسة",
    fieldSocialSciences: "العلوم الاجتماعية",
    fieldTechnology: "التكنولوجيا",
    explore: "استكشف",
    exploreProgram: "استكشف البرنامج",
    explorePrograms: "استكشف البرامج",
    featured: "مميز",
    featuredDestinations: "وجهات دراسية مميزة",
    featuredUniversities: "جامعات مميزة",
    fieldOfStudy: "مجال الدراسة",
    findBestProgram: "اعثر على البرنامج الأنسب لك",
    flyBeyondBorders: "حلّق خارج الحدود",
    forgotPassword: "نسيت كلمة المرور",
    gpa: "المعدل الدراسي",
    heroSubtitle: "اكتشف جامعات عالمية، قارن بين البرامج، وقدّم للدراسة بالخارج بثقة.",
    heroTitle: "مستقبلك يبدأ رحلته",
    heroStep1: "اعثر على جامعتك المناسبة",
    heroStep2: "قارن المواعيد والرسوم",
    heroStep3: "ارفع مستنداتك بأمان",
    heroStep4: "تابع كل مرحلة في طلبك",
    howItWorks: "كيف يعمل",
    intake: "موعد الدراسة",
    intakeFall2026: "خريف 2026",
    intakeSpring2027: "ربيع 2027",
    language: "English",
    login: "تسجيل الدخول",
    loginPrompt: "لديك حساب بالفعل؟",
    logout: "تسجيل الخروج",
    markStatus: "تعيين الحالة",
    maxTuition: "أقصى رسوم",
    minTuition: "أقل رسوم",
    myApplications: "طلباتي",
    name: "الاسم الكامل",
    nationality: "الجنسية",
    noDocuments: "لا توجد مستندات بعد",
    noDocumentsDescription: "ارفع مستنداتك الدراسية لتجهيز طلباتك.",
    noPrograms: "لا توجد برامج مطابقة",
    noProgramsDescription: "جرّب تعديل فلاتر البحث لاستكشاف خيارات أكثر.",
    notifications: "الإشعارات",
    overview: "نظرة عامة",
    partner: "الشركاء",
    partnerPrice: "سعر الشريك",
    password: "كلمة المرور",
    phone: "الهاتف",
    preferredIntake: "موعد الدراسة المفضل",
    programs: "البرامج",
    popularity: "الأكثر طلباً",
    ranking: "التصنيف",
    recentApplications: "أحدث الطلبات",
    register: "إنشاء حساب",
    registerPrompt: "ليس لديك حساب؟",
    requirements: "المتطلبات",
    role: "الدور",
    saveProfile: "حفظ الملف",
    searchKeyword: "ابحث بكلمة مفتاحية",
    searchProgramsTitle: "ابحث عن برنامجك القادم",
    sortByFeatured: "ترتيب حسب المميز",
    startJourney: "ابدأ رحلتك",
    statusAccepted: "مقبول",
    statusDraft: "مسودة",
    statusRejected: "مرفوض",
    statusSubmitted: "تم الإرسال",
    statusUnderReview: "قيد المراجعة",
    step: "خطوة",
    student: "طالب",
    studentStories: "قصص الطلاب",
    studentProfile: "ملف الطالب",
    students: "الطلاب",
    studentsHelped: "طالب تمت مساعدتهم",
    submitApplication: "إرسال الطلب",
    submitApplicationNote: "راجع ملفك، ارفع مستنداتك، أضف ملاحظاتك، ثم أرسل طلبك بخطوات بسيطة.",
    submitApplicationSuccess: "تم إرسال الطلب بنجاح.",
    submitApplicationLoginRequired: "يجب تسجيل الدخول كطالب للتقديم.",
    submitting: "جاري الإرسال...",
    submitYourApplication: "أرسل طلبك",
    testimonialsTitle: "آراء طلاب بدأوا رحلتهم",
    trackAdmission: "تابع حالة القبول",
    tuition: "الرسوم الدراسية",
    university: "الجامعة",
    universities: "الجامعات",
    viewUniversity: "عرض الجامعة",
    uploadDocument: "رفع مستند",
    uploadedDocuments: "المستندات المرفوعة",
    yes: "نعم",
    no: "لا",
    aboutBody: "Study Birds منصة للدراسة بالخارج صُممت لتبسيط التخطيط للتعليم الدولي من خلال تجربة حديثة وواضحة تضع الطالب أولاً.",
    aboutTitle: "منصة للطلاب الطموحين حول العالم",
    city: "المدينة",
    contactBody: "نساعد الطلاب والجامعات والشركاء على التقدم بثقة ووضوح.",
    contactTitle: "تواصل مع فريق Study Birds",
    ctaDescription: "أنشئ ملفك، قارن البرامج العالمية، وقدّم من مساحة طالب واضحة ومنظمة.",
    destinationsTitle: "أين تريد أن تبدأ نموك؟",
    forgotPasswordBody: "يمكن إضافة إرسال رابط إعادة تعيين كلمة المرور لاحقاً. حالياً استخدم الحسابات التجريبية أو أنشئ حساب طالب جديد.",
    guidedPath: "مسار واضح من البحث حتى إرسال الطلب",
    notFoundBody: "لم نتمكن من العثور على الصفحة المطلوبة.",
    notFoundTitle: "الصفحة غير موجودة",
    offices: "المكاتب: إسطنبول، تورونتو، لندن",
    partnerBody: "يمكن للجامعات وفرق التوظيف التعاون مع Study Birds للوصول إلى طلاب دوليين مؤهلين من خلال مسار قبول واضح ومنظم.",
    partnerInstitutions: "مؤسسة شريكة",
    partnerStatus: "شريك",
    partnerTitle: "وسّع حضورك مع Study Birds",
    readyNextChapter: "جاهز لرسم خطوتك القادمة؟",
    returnHome: "العودة للرئيسية",
    signingIn: "جاري تسجيل الدخول...",
    studyDestinations: "وجهة دراسية",
    supportHours: "الدعم: من الاثنين إلى الجمعة، 9:00 إلى 18:00",
    universitiesTitle: "استكشف الجامعات الشريكة",
    footerBody: "حلّق خارج الحدود مع منصة تساعد الطلاب على الاكتشاف والتقديم ومتابعة رحلتهم التعليمية العالمية.",
    welcomeBack: "مرحباً بعودتك",
  },
};

interface LanguageContextValue {
  language: Language;
  isRtl: boolean;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  tv: (value?: string) => string;
}

const valueTranslations: Record<string, string> = {
  "Academic transcripts": "السجلات الأكاديمية",
  Australia: "أستراليا",
  Bachelor: "بكالوريوس",
  Business: "إدارة الأعمال",
  Canada: "كندا",
  Diploma: "دبلوم",
  Engineering: "الهندسة",
  "English proficiency": "إثبات إجادة اللغة الإنجليزية",
  "Fall 2026": "خريف 2026",
  Germany: "ألمانيا",
  Ireland: "أيرلندا",
  Master: "ماجستير",
  Passport: "جواز السفر",
  "Social Sciences": "العلوم الاجتماعية",
  "Spring 2027": "ربيع 2027",
  Technology: "التكنولوجيا",
  Turkey: "تركيا",
  "United Kingdom": "المملكة المتحدة",
  "United States": "الولايات المتحدة",
};

const replaceBrandName = (value: string) => value.replace(/Study Birds/g, SITE_NAME);

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const urlLanguage = new URLSearchParams(window.location.search).get("lang");
      if (urlLanguage === "ar" || urlLanguage === "en") {
        return urlLanguage;
      }
    }

    return (localStorage.getItem("studyBirdsLanguage") as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("studyBirdsLanguage", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => (current === "en" ? "ar" : "en"));
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isRtl: language === "ar",
      toggleLanguage,
      setLanguage,
      t: (key) => replaceBrandName(translations[language][key]),
      tv: (value) => {
        const nextValue = language === "ar" && value ? valueTranslations[value] || value : value || "";
        return replaceBrandName(nextValue);
      },
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
