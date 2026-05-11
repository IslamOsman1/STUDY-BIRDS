import { Plus, Trash2 } from "lucide-react";

interface ArticleContentFieldsProps {
  articleTitle: string;
  articleTitleColor: string;
  articleHeadingColor: string;
  articleBodyColor: string;
  articleHeadings: string[];
  articleBodies: string[];
  onArticleTitleChange: (value: string) => void;
  onArticleTitleColorChange: (value: string) => void;
  onArticleHeadingColorChange: (value: string) => void;
  onArticleBodyColorChange: (value: string) => void;
  onArticleHeadingChange: (index: number, value: string) => void;
  onArticleBodyChange: (index: number, value: string) => void;
  onAddArticleItem: () => void;
  onRemoveArticleItem: (index: number) => void;
  language: "ar" | "en";
  titleLabel?: string;
}

const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
      />
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm outline-none" />
    </div>
  </label>
);

export const ArticleContentFields = ({
  articleTitle,
  articleTitleColor,
  articleHeadingColor,
  articleBodyColor,
  articleHeadings,
  articleBodies,
  onArticleTitleChange,
  onArticleTitleColorChange,
  onArticleHeadingColorChange,
  onArticleBodyColorChange,
  onArticleHeadingChange,
  onArticleBodyChange,
  onAddArticleItem,
  onRemoveArticleItem,
  language,
  titleLabel,
}: ArticleContentFieldsProps) => (
  <div className="space-y-5 rounded-2xl border border-slate-200 p-5 md:p-6">
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{language === "ar" ? "محتوى المقال" : "Article content"}</h3>
      <p className="mt-1 text-xs text-slate-500">
        {language === "ar"
          ? "أضف عنوان المقال ثم أنشئ أي عدد من العناوين الفرعية التي تريدها."
          : "Add the article title, then create as many subheadings as you need."}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        {language === "ar"
          ? "لإضافة زر داخل النص استخدم الصيغة: [button:نص الزر|https://example.com]"
          : "To add a button inside the text, use: [button:Button text|https://example.com]"}
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

    <div className="grid gap-4 md:grid-cols-3">
      <ColorField
        label={language === "ar" ? "لون العنوان" : "Title color"}
        value={articleTitleColor || "#0f172a"}
        onChange={onArticleTitleColorChange}
      />
      <ColorField
        label={language === "ar" ? "لون العناوين الفرعية" : "Subheading color"}
        value={articleHeadingColor || "#0f172a"}
        onChange={onArticleHeadingColorChange}
      />
      <ColorField
        label={language === "ar" ? "لون النصوص" : "Body text color"}
        value={articleBodyColor || "#475569"}
        onChange={onArticleBodyColorChange}
      />
    </div>

    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-slate-900">{language === "ar" ? "العناوين الفرعية" : "Subheadings"}</p>
      <button
        type="button"
        onClick={onAddArticleItem}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
      >
        <Plus className="h-4 w-4" />
        {language === "ar" ? "إضافة عنوان فرعي" : "Add subheading"}
      </button>
    </div>

    <div className="grid gap-5 lg:grid-cols-2">
      {articleHeadings.map((heading, index) => (
        <div key={index} className="rounded-2xl bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">
              {language === "ar" ? `عنوان فرعي ${index + 1}` : `Subheading ${index + 1}`}
            </span>
            {articleHeadings.length > 1 ? (
              <button
                type="button"
                onClick={() => onRemoveArticleItem(index)}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {language === "ar" ? "حذف" : "Remove"}
              </button>
            ) : null}
          </div>
          <input
            value={heading || ""}
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
        </div>
      ))}
    </div>
  </div>
);
