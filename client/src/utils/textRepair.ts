const MOJIBAKE_PATTERN = /[ØÙÃ]/;

export const repairMojibake = (value?: string | null) => {
  const text = value ?? "";

  if (!text || !MOJIBAKE_PATTERN.test(text)) {
    return text;
  }

  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return text;
  }
};
