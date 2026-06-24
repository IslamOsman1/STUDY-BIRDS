const MOJIBAKE_PATTERN = /[ØÙÃ]/;

const repairMojibake = (value = "") => {
  const text = String(value ?? "");

  if (!text || !MOJIBAKE_PATTERN.test(text)) {
    return text;
  }

  try {
    return Buffer.from(text, "latin1").toString("utf8");
  } catch {
    return text;
  }
};

const normalizeOptionalText = (value, fallback = "") => repairMojibake(String(value ?? fallback)).trim();

const normalizeOurService = (service) => {
  if (!service) {
    return service;
  }

  return {
    ...service,
    title: normalizeOptionalText(service.title),
    detailTitle: normalizeOptionalText(service.detailTitle),
    detailBody: normalizeOptionalText(service.detailBody),
  };
};

module.exports = {
  normalizeOptionalText,
  normalizeOurService,
  repairMojibake,
};
