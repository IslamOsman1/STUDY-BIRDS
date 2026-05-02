export const ARTICLE_SUBTITLE_COUNT = 7;

export const createEmptyArticleHeadings = () => Array.from({ length: ARTICLE_SUBTITLE_COUNT }, () => "");
export const createEmptyArticleBodies = () => Array.from({ length: ARTICLE_SUBTITLE_COUNT }, () => "");

export const normalizeArticleHeadings = (headings: string[] = []) =>
  createEmptyArticleHeadings().map((_, index) => headings[index] || "");

export const normalizeArticleBodies = (bodies: string[] = []) =>
  createEmptyArticleBodies().map((_, index) => bodies[index] || "");
