import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import {
  SITE_NAME,
  buildLocalizedUrl,
  normalizeSeoDescription,
  seoText,
} from "../../seo/site";

type StructuredData =
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

type SeoProps = {
  title: string;
  description: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
  canonicalPath?: string;
  structuredData?: StructuredData;
};

const setMetaTag = (
  selector: string,
  attributeName: "name" | "property",
  attributeValue: string,
  content: string
) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const setLinkTag = (rel: string, href: string, hreflang?: string) => {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    if (hreflang) {
      element.setAttribute("hreflang", hreflang);
    }
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

const setStructuredData = (payload?: StructuredData) => {
  document.head
    .querySelectorAll('script[data-seo-jsonld="study-birds"]')
    .forEach((node) => node.remove());

  if (!payload) {
    return;
  }

  const entries = Array.isArray(payload) ? payload : [payload];

  entries.forEach((entry, index) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoJsonld = "study-birds";
    script.id = `study-birds-jsonld-${index}`;
    script.textContent = JSON.stringify(entry);
    document.head.appendChild(script);
  });
};

export const Seo = ({
  title,
  description,
  keywords = [],
  noIndex = false,
  type = "website",
  canonicalPath,
  structuredData,
}: SeoProps) => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const pageTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const pageDescription = normalizeSeoDescription(description);
    const currentPath = canonicalPath || location.pathname || "/";
    const canonicalUrl = buildLocalizedUrl(currentPath, language);
    const robotsValue = noIndex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large";
    const keywordValue = [
      ...keywords,
      seoText(
        language,
        "study abroad, university applications, international programs",
        "الدراسة بالخارج, التقديم على الجامعات, البرامج الدولية"
      ),
    ]
      .filter(Boolean)
      .join(", ");

    document.title = pageTitle;

    setMetaTag('meta[name="description"]', "name", "description", pageDescription);
    setMetaTag('meta[name="keywords"]', "name", "keywords", keywordValue);
    setMetaTag('meta[name="robots"]', "name", "robots", robotsValue);
    setMetaTag('meta[name="googlebot"]', "name", "googlebot", robotsValue);
    setMetaTag('meta[property="og:title"]', "property", "og:title", pageTitle);
    setMetaTag(
      'meta[property="og:description"]',
      "property",
      "og:description",
      pageDescription
    );
    setMetaTag('meta[property="og:type"]', "property", "og:type", type);
    setMetaTag('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMetaTag(
      'meta[property="og:site_name"]',
      "property",
      "og:site_name",
      SITE_NAME
    );
    setMetaTag(
      'meta[property="og:locale"]',
      "property",
      "og:locale",
      language === "ar" ? "ar_AR" : "en_US"
    );
    setMetaTag(
      'meta[name="twitter:card"]',
      "name",
      "twitter:card",
      "summary_large_image"
    );
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", pageTitle);
    setMetaTag(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      pageDescription
    );

    setLinkTag("canonical", canonicalUrl);
    setLinkTag("alternate", buildLocalizedUrl(currentPath, "en"), "en");
    setLinkTag("alternate", buildLocalizedUrl(currentPath, "ar"), "ar");
    setLinkTag("alternate", buildLocalizedUrl(currentPath, "en"), "x-default");

    setStructuredData(structuredData);
  }, [
    canonicalPath,
    description,
    keywords,
    language,
    location.pathname,
    noIndex,
    structuredData,
    title,
    type,
  ]);

  return null;
};
