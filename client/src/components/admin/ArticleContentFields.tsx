import { ARTICLE_SUBTITLE_COUNT } from "../../constants/articleContent";

interface ArticleContentFieldsProps {
  articleTitle: string;
  articleHeadings: string[];
  articleBodies: string[];
  onArticleTitleChange: (value: string) => void;
  onArticleHeadingChange: (index: number, value: string) => void;
  onArticleBodyChange: (index: number, value: string) => void;
  language: "ar" | "en";
  titleLabel?: string;
}

export const ArticleContentFields = ({
  articleTitle,
  articleHeadings,
  articleBodies,
  onArticleTitleChange,
  onArticleHeadingChange,
  onArticleBodyChange,
  language,
  titleLabel,
}: ArticleContentFieldsProps) => (
  <div className="space-y-5 rounded-2xl border border-slate-200 p-5 md:p-6">
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{language === "ar" ? "محتوى المقال" : "Article content"}</h3>
      <p className="mt-1 text-xs text-slate-500">
        {language === "ar"
          ? "أضف عنوان المقال ثم 7 عناوين فرعية تظهر في صفحة العرض."
          : "Add the article title, then 7 subheadings to show on the public page."}
      </p>
    </div>

    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{titleLabel || (language === "ar" ? "عنوان المقال" : "Article title")}</span>
      <input
        value={articleTitle}
        onChange={(event) => onArticleTitleChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
      />
    </label>

    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: ARTICLE_SUBTITLE_COUNT }, (_, index) => (
        <label key={index} className="block rounded-2xl bg-slate-50 p-4">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            {language === "ar" ? `عنوان فرعي ${index + 1}` : `Subheading ${index + 1}`}
          </span>
          <input
            value={articleHeadings[index] || ""}
            onChange={(event) => onArticleHeadingChange(index, event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
          />
          <span className="mb-2 mt-4 block text-sm font-medium text-slate-700">
            {language === "ar" ? `نص العنوان ${index + 1}` : `Heading ${index + 1} text`}
          </span>
          <textarea
            value={articleBodies[index] || ""}
            onChange={(event) => onArticleBodyChange(index, event.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
          />
        </label>
      ))}
    </div>
  </div>
);
