const MOJIBAKE_PATTERN = /[ØÙÃ]/;

export const repairMojibake = (value?: string | null) => {
  if (!value || !MOJIBAKE_PATTERN.test(value)) {
    return value ?? "";
  }

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return value;
  }
};
