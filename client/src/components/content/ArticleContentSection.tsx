import type { ArticleContent } from "../../types";

interface ArticleContentSectionProps {
  article: ArticleContent;
  language: "ar" | "en";
}

export const ArticleContentSection = ({ article, language }: ArticleContentSectionProps) => {
  const headings = (article.articleHeadings || []).filter(Boolean);
  const bodies = article.articleBodies || [];

  if (!article.articleTitle && !headings.length && !bodies.filter(Boolean).length) {
    return null;
  }

  return (
    <section className="panel p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-700">
        {language === "ar" ? "مقال مختصر" : "Article outline"}
      </p>
      {article.articleTitle ? <h2 className="mt-3 text-2xl font-semibold text-slate-900">{article.articleTitle}</h2> : null}
      {headings.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {headings.map((heading, index) => (
            <div key={`${heading}-${index}`} className="rounded-3xl bg-slate-50 p-5">
              <p className="text-lg font-bold leading-8 text-slate-900">{heading}</p>
              {bodies[index] ? <p className="mt-3 text-sm leading-7 text-slate-600">{bodies[index]}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
