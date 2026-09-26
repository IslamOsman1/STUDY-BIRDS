import { buildContactLinks } from "../config/contactLinks";
import { useLanguage } from "../hooks/useLanguage";
import type { SiteSettings } from "../types";

type SocialLinksProps = {
  className?: string;
  itemClassName?: string;
  labelClassName?: string;
  settings?: SiteSettings;
};

export const SocialLinks = ({
  className = "",
  itemClassName = "",
  labelClassName = "",
  settings,
}: SocialLinksProps) => {
  const { language } = useLanguage();
  const contactLinks = buildContactLinks(settings);

  return (
    <div className={className}>
      {contactLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target={link.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
          aria-label={language === "ar" ? link.label.ar : link.label.en}
          className={itemClassName}
        >
          {link.icon}
          <span className={labelClassName}>{language === "ar" ? link.label.ar : link.label.en}</span>
        </a>
      ))}
    </div>
  );
};
