import type { ReactNode } from "react";

const BUTTON_SHORTCODE_REGEX = /\[button:(.*?)\|(https?:\/\/[^\]\s]+)\]/g;

const defaultButtonClassName =
  "mx-1 inline-flex rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold text-slate-950 align-middle shadow-sm transition hover:bg-orange-400";

export const renderRichTextLines = (
  text: string,
  buttonClassName = defaultButtonClassName
) =>
  text.split("\n").map((line, lineIndex) => {
    const matches = Array.from(line.matchAll(BUTTON_SHORTCODE_REGEX));

    if (!matches.length) {
      return (
        <p key={`line-${lineIndex}`} className="min-h-[1.75rem]">
          {line}
        </p>
      );
    }

    const parts: ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, matchIndex) => {
      const [token, label, url] = match;
      const startIndex = match.index ?? 0;

      if (startIndex > lastIndex) {
        parts.push(line.slice(lastIndex, startIndex));
      }

      parts.push(
        <a
          key={`button-${lineIndex}-${matchIndex}`}
          href={url}
          target="_blank"
          rel="noreferrer"
          className={buttonClassName}
        >
          {label}
        </a>
      );

      lastIndex = startIndex + token.length;
    });

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    return (
      <p key={`line-${lineIndex}`} className="min-h-[1.75rem]">
        {parts}
      </p>
    );
  });
