const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

const extractYoutubeId = (value: string) => {
  const input = value.trim();

  if (!input) {
    return null;
  }

  if (YOUTUBE_ID_PATTERN.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v") || "";
        return YOUTUBE_ID_PATTERN.test(id) ? id : null;
      }

      const segments = url.pathname.split("/").filter(Boolean);
      const candidate = segments[1] || "";

      if ((segments[0] === "embed" || segments[0] === "shorts") && YOUTUBE_ID_PATTERN.test(candidate)) {
        return candidate;
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const getYoutubeEmbedUrl = (value?: string) => {
  const id = extractYoutubeId(value || "");
  return id ? `https://www.youtube.com/embed/${id}` : null;
};
