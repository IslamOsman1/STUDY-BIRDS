const MOJIBAKE_PATTERN = /[\u00C3\u00D8\u00D9]/;

const decodeUtf8Bytes = (text: string) => {
  const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
};

export const repairMojibake = (value?: string | null) => {
  let text = value ?? "";

  if (!text || !MOJIBAKE_PATTERN.test(text)) {
    return text;
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const decoded = decodeUtf8Bytes(text);

      if (decoded === text) {
        break;
      }

      text = decoded;

      if (!MOJIBAKE_PATTERN.test(text)) {
        break;
      }
    } catch {
      break;
    }
  }

  return text;
};
