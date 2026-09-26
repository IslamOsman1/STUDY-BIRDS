// Blocked-term matching for community posts and comments.
//
// Text and terms are normalised the same way (case, Arabic diacritics and
// tatweel, alef/yaa/taa-marbuta variants) and compared as whole words or whole
// phrases, so a blocked word never matches inside an unrelated longer word.

const normalize = (value) => String(value || "")
  .toLowerCase()
  .normalize("NFKC")
  .replace(/[ً-ٰٟـ]/g, "")
  .replace(/[إأآٱ]/g, "ا")
  .replace(/ى/g, "ي")
  .replace(/ة/g, "ه")
  .split(/[^\p{L}\p{N}]+/u)
  .filter(Boolean)
  .join(" ");

const cleanTerms = (terms) => [...new Set((Array.isArray(terms) ? terms : [])
  .filter((term) => typeof term === "string")
  .map((term) => normalize(term))
  .filter((term) => term.length > 0 && term.length <= 60))];

function findBlockedTerm(text, terms) {
  const haystack = ` ${normalize(text)} `;
  return cleanTerms(terms).find((term) => haystack.includes(` ${term} `)) || null;
}

module.exports = { normalize, cleanTerms, findBlockedTerm };
