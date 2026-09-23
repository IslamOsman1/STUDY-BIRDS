// Student document types (PRD 28) with Arabic/English labels. Document.type
// stays free text for older records; these are the types the clients offer.
const DOCUMENT_TYPES = Object.freeze({
  passport: ["جواز السفر", "Passport"],
  "biometric-photo": ["الصورة الشخصية", "Personal photo"],
  "latest-qualification": ["آخر مؤهل دراسي", "Latest qualification"],
  "high-school-certificate": ["شهادة الثانوية", "High school certificate"],
  "university-degree": ["الشهادة الجامعية", "University degree"],
  transcript: ["كشف الدرجات", "Transcript"],
  "birth-certificate": ["شهادة الميلاد", "Birth certificate"],
  "recommendation-letter": ["خطاب توصية", "Recommendation letter"],
  "language-certificate": ["شهادة اللغة", "Language certificate"],
  "personal-statement": ["خطاب الدافع", "Personal statement"],
  cv: ["السيرة الذاتية", "CV"],
  translation: ["ترجمة معتمدة", "Certified translation"],
  other: ["مستند آخر", "Other document"],
  // Older website upload keys, kept so existing records read correctly.
  "personal-photos": ["صور شخصية", "Personal photos"],
  "language-certificates": ["شهادات اللغة", "Language certificates"],
  "english-test": ["شهادة اختبار الإنجليزية", "English test certificate"],
  resume: ["السيرة الذاتية", "CV"],
  "other-documents": ["مستندات أخرى", "Other documents"],
});

const documentLabel = (type, lang = "ar") => {
  const entry = DOCUMENT_TYPES[type];
  if (!entry) return lang === "ar" ? "مستند" : "Document";
  return lang === "ar" ? entry[0] : entry[1];
};

module.exports = { DOCUMENT_TYPES, documentLabel };
