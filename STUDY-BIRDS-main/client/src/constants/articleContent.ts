export const ARTICLE_SUBTITLE_COUNT = 1;

export const createEmptyArticleHeadings = (count = ARTICLE_SUBTITLE_COUNT) => Array.from({ length: count }, () => "");
export const createEmptyArticleBodies = (count = ARTICLE_SUBTITLE_COUNT) => Array.from({ length: count }, () => "");

export const normalizeArticleHeadings = (headings: string[] = [], count?: number) => {
  const nextCount = count ?? Math.max(ARTICLE_SUBTITLE_COUNT, headings.length);
  return Array.from({ length: nextCount }, (_, index) => headings[index] || "");
};

export const normalizeArticleBodies = (bodies: string[] = [], count?: number) => {
  const nextCount = count ?? Math.max(ARTICLE_SUBTITLE_COUNT, bodies.length);
  return Array.from({ length: nextCount }, (_, index) => bodies[index] || "");
};
