import { Link } from "react-router-dom";
import { Seo } from "../components/seo/Seo";
import { useLanguage } from "../hooks/useLanguage";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { SITE_NAME } from "../seo/site";

const policy = {
  ar: {
    title: "سياسة الخصوصية",
    home: "الرئيسية",
    updated: "آخر تحديث: 13 سبتمبر 2026",
    intro: `توضح هذه السياسة كيفية التعامل مع بياناتك عند استخدام ${SITE_NAME} للاستفسار عن الدراسة بالخارج، وإنشاء حساب، ومتابعة التقديم إلى الجامعات. تختلف البيانات المطلوبة بحسب الخدمة التي تختارها والمعلومات التي تقدمها لنا.`,
    sections: [
      {
        title: "الإعلانات وخدمات الأطراف الأخرى",
        body: "عند تفعيل أدوات إعلانية على الموقع، مثل أدوات Google أو Meta، سنوضح الأدوات المستخدمة والبيانات التي تستقبلها وأغراض القياس أو تخصيص الإعلانات وخيارات الموافقة المتاحة قبل تشغيل ما يتطلب موافقتك. وجود هذه السياسة أو وسم التحقق من ملكية النطاق لا يعني تفعيل تتبع إعلاني. إذا أرسلت بياناتك عبر نموذج إعلان تابع لنا، فسيكون التعامل معها للاستجابة للاستفسار أو الخدمة الموضحة في النموذج.",
      },
      {
        title: "سجلات الزيارة",
        body: "قد تسجل خدمات الاستضافة عنوان الإنترنت ونوع المتصفح وتوقيت الطلبات والأخطاء. تساعد هذه السجلات في تشخيص الأعطال ومتابعة تشغيل الموقع وحمايته.",
      },
      {
        title: "الكوكيز وتفضيلات المتصفح",
        body: "يحفظ الموقع بيانات محلية في متصفحك للإبقاء على تسجيل الدخول وتذكر اللغة وموضع المساعد، ويستخدم تخزين الجلسة لتذكر عرض نافذة التواصل. يمكنك مسح بيانات الموقع أو تقييد التخزين من إعدادات المتصفح؛ وقد يؤدي ذلك إلى تسجيل خروجك أو إعادة ضبط تفضيلاتك. وقد تستخدم الخدمات الخارجية التي تختار التفاعل معها ملفات تعريف ارتباط وفق سياساتها.",
      },
      {
        title: "المعلومات التي تقدمها لنا",
        body: "تشمل بيانات الحساب والتواصل الاسم والبريد الإلكتروني ورقم الهاتف. وعند استكمال ملفك الدراسي، قد تقدم تاريخ الميلاد والجنسية وبلد الإقامة والعنوان ورقم جواز السفر والمؤهلات والمعدل ونتائج اختبارات اللغة والوجهات الدراسية المفضلة. وقد ترفع مستندات مثل جواز السفر والشهادات أو ترسل رسائل ومرفقات للدعم. كما نعالج البيانات التي تقدمها للتسجيل في الفعاليات أو طلب خدمات الوصول أو الانضمام كشريك، بحسب الخدمة المستخدمة.",
      },
      {
        title: "أغراض استخدام المعلومات",
        body: "نستخدم بياناتك لإنشاء حسابك، وإدارة ملفك وطلباتك، ومراجعة المستندات، وتقديم المساعدة بشأن البرامج الجامعية، والرد على الاستفسارات، وإرسال تحديثات الخدمة. وتساعد معلومات الطلبات والتواصل في متابعة الخدمات التي تطلبها ومعالجة المشكلات وحماية الحسابات من إساءة الاستخدام.",
      },
      {
        title: "مشاركة البيانات ومقدمو الخدمات",
        body: "قد تتطلب متابعة طلبك إتاحة البيانات والمستندات ذات الصلة للموظفين المختصين أو للشريك الذي يتولى طلبك، وإرسال ما يلزم إلى الجامعة أو الجهة المقدمة للخدمة المطلوبة. وتعتمد المنصة على خدمات الاستضافة وقواعد البيانات وتخزين الملفات لتشغيل الموقع؛ وقد تُعالج البيانات على خوادم خارج بلد إقامتك. عند اختيار تسجيل الدخول عبر Google، تُستخدم بيانات الحساب اللازمة لإتمام الدخول، وتخضع خدمة Google لسياسة الخصوصية الخاصة بها.",
      },
      {
        title: "حماية المعلومات",
        body: "تشمل وسائل الحماية في المنصة تخزين كلمات المرور بصيغة تجزئة والتحقق من تسجيل الدخول وصلاحيات المستخدمين. لا يمكن ضمان أمان مطلق لأي نظام؛ لذلك حافظ على سرية بيانات الدخول وتواصل معنا إذا اشتبهت في استخدام غير مصرح به لحسابك.",
      },
      {
        title: "الاحتفاظ بالبيانات وطلبات الخصوصية",
        body: "ترتبط الحاجة إلى الاحتفاظ ببياناتك باستمرار حسابك ومتابعة طلباتك والخدمات ذات الصلة وأي التزامات واجبة التطبيق. يمكنك التواصل معنا لطلب الاطلاع على بياناتك أو تصحيحها أو حذفها أو الاستفسار عن استخدامها. قد نحتاج إلى التحقق من هويتك قبل تنفيذ الطلب، وقد يتعذر حذف بعض السجلات المرتبطة بطلب قائم أو التزام قانوني؛ وسنوضح لك ما ينطبق على طلبك.",
      },
      {
        title: "روابط خارجية وتحديثات السياسة",
        body: "قد يتضمن الموقع روابط للجامعات أو وسائل التواصل أو مواقع أخرى. راجع سياسة الجهة الخارجية قبل تقديم بياناتك إليها، إذ لا تشمل هذه السياسة ممارساتها. نحدّث هذه الصفحة عند تغير الخدمات أو طريقة التعامل مع البيانات، ويظهر تاريخ آخر تحديث أعلى الصفحة.",
      },
    ],
    contactTitle: "تواصل معنا بشأن خصوصيتك",
    contactBody: `لأي سؤال أو طلب متعلق ببياناتك لدى ${SITE_NAME}، استخدم صفحة التواصل أو البريد الإلكتروني التالي. يرجى توضيح طلبك وتجنب إرسال كلمات المرور.`,
    contact: "اتصل بنا",
  },
  en: {
    title: "Privacy Policy",
    home: "Home",
    updated: "Last updated: September 13, 2026",
    intro: `This policy explains how your information is handled when you use ${SITE_NAME} to explore studying abroad, create an account, and manage university applications. The information requested depends on the services you choose and the details you provide.`,
    sections: [
      {
        title: "Advertising and external services",
        body: "If advertising tools such as Google or Meta tools are enabled on this website, we will explain which tools are used, the data they receive, measurement or personalization purposes, and available consent choices before running tools that require your consent. This policy and a domain verification tag do not themselves activate advertising tracking. If you submit information through one of our advertising forms, it will be handled to respond to the inquiry or service described in that form.",
      },
      {
        title: "Visit logs",
        body: "Hosting services may log IP addresses, browser types, request times, and errors. These records help diagnose faults, maintain operation, and protect the website.",
      },
      {
        title: "Cookies and browser preferences",
        body: "The website stores data locally in your browser to keep you signed in and remember your language and assistant position. Session storage remembers whether the contact prompt has been displayed. You can clear website data or restrict storage through browser settings; doing so may sign you out or reset preferences. External services you choose to interact with may use cookies under their own policies.",
      },
      {
        title: "Information you provide",
        body: "Account and contact details include your name, email address, and phone number. Your student profile may include your birth date, nationality, country of residence, address, passport number, qualifications, grades, language test results, and preferred destinations. You may upload passports or academic records and send support messages or attachments. We also process information submitted for event registrations, arrival services, or partner applications, depending on the service used.",
      },
      {
        title: "How information is used",
        body: "We use your information to create your account, manage your profile and applications, review documents, assist with university programs, respond to inquiries, and provide service updates. Application and communication records help us follow up on requested services, resolve problems, and protect accounts against misuse.",
      },
      {
        title: "Sharing and service providers",
        body: "Processing your request may require relevant staff or the partner managing your application to access related information and documents, and necessary details to be sent to the university or provider of your requested service. The platform uses hosting, database, and file storage services; information may be processed on servers outside your country of residence. If you choose Google sign-in, account information needed to complete sign-in is used, and Google's service is subject to its own privacy policy.",
      },
      {
        title: "Information security",
        body: "Platform safeguards include password hashing, authentication, and user permissions. No system can guarantee absolute security. Keep your login credentials private and contact us if you suspect unauthorized account access.",
      },
      {
        title: "Retention and privacy requests",
        body: "The need to retain information depends on your account, ongoing applications, related services, and applicable obligations. Contact us to request access, correction, or deletion, or to ask about how your information is used. We may need to verify your identity before acting. Some records may need to be retained for an active application or legal obligation; we will explain what applies to your request.",
      },
      {
        title: "External links and policy updates",
        body: "The website may link to universities, social networks, or other websites. Review their policies before providing information, as this policy does not cover their practices. We update this page when services or data handling practices change. The latest revision date appears at the top of this page.",
      },
    ],
    contactTitle: "Contact us about your privacy",
    contactBody: `For questions or requests about your information at ${SITE_NAME}, use our contact page or the email address below. Describe your request and avoid sending passwords.`,
    contact: "Contact us",
  },
};

export const PrivacyPolicyPage = () => {
  const { language } = useLanguage();
  const settings = useSiteSettings();
  const content = policy[language === "ar" ? "ar" : "en"];

  return (
    <div className="mx-auto max-w-4xl space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      <Seo title={`${content.title} | ${SITE_NAME}`} description={content.intro} canonicalPath="/privacy-policy" />
      <nav aria-label={language === "ar" ? "مسار التنقل" : "Breadcrumb"} className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-700">{content.home}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{content.title}</span>
      </nav>
      <article className="panel border-t-4 border-t-accent-300 bg-white p-6 sm:p-10">
        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold text-brand-700">{SITE_NAME}</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">{content.title}</h1>
          <p className="mt-3 text-sm text-slate-500"><time dateTime="2026-09-13">{content.updated}</time></p>
          <p className="mt-6 leading-8 text-slate-600">{content.intro}</p>
        </header>
        <div className="space-y-8 pt-8">
          {content.sections.map((section, index) => (
            <section key={index} aria-labelledby={`privacy-section-${index}`}>
              <h2 id={`privacy-section-${index}`} className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-3 leading-8 text-slate-600">{section.body}</p>
            </section>
          ))}
          <section aria-labelledby="privacy-contact" className="rounded-2xl bg-brand-50 p-6">
            <h2 id="privacy-contact" className="text-xl font-semibold text-brand-900">{content.contactTitle}</h2>
            <p className="mt-3 leading-8 text-slate-600">{content.contactBody}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Link to="/contact" className="font-semibold text-brand-700 underline underline-offset-4">{content.contact}</Link>
              {settings.contactEmail ? <a href={`mailto:${settings.contactEmail}`} dir="ltr" className="break-all text-brand-700 underline underline-offset-4">{settings.contactEmail}</a> : null}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
};
