import type { ReactNode } from "react";
import {
  Facebook,
  Instagram,
  Mail,
  MessageCircleMore,
  Music2,
} from "lucide-react";
import type { SiteSettings } from "../types";

export const defaultSiteSettings: SiteSettings = {
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL?.trim() || "hello@studybirds.com",
  whatsappUrl: import.meta.env.VITE_WHATSAPP_URL?.trim() || "https://wa.me/201000000000",
  facebookUrl: import.meta.env.VITE_FACEBOOK_URL?.trim() || "https://facebook.com/studybirds",
  instagramUrl: import.meta.env.VITE_INSTAGRAM_URL?.trim() || "https://instagram.com/studybirds",
  tiktokUrl: import.meta.env.VITE_TIKTOK_URL?.trim() || "https://tiktok.com/@studybirds",
  supportHours: "",
  officeLocations: "",
};

type ContactLink = {
  href: string;
  label: { en: string; ar: string };
  icon: ReactNode;
};

const socialIconClassName = "h-5 w-5";

export const mergeSiteSettings = (settings?: SiteSettings | null): SiteSettings => ({
  ...defaultSiteSettings,
  ...settings,
});

export const buildContactLinks = (settings?: SiteSettings | null): ContactLink[] => {
  const resolvedSettings = mergeSiteSettings(settings);

  return [
    {
      href: `mailto:${resolvedSettings.contactEmail}`,
      label: { en: "Email", ar: "البريد الإلكتروني" },
      icon: <Mail className={socialIconClassName} />,
    },
    {
      href: resolvedSettings.whatsappUrl || defaultSiteSettings.whatsappUrl || "#",
      label: { en: "WhatsApp", ar: "واتساب" },
      icon: <MessageCircleMore className={socialIconClassName} />,
    },
    {
      href: resolvedSettings.facebookUrl || defaultSiteSettings.facebookUrl || "#",
      label: { en: "Facebook", ar: "فيسبوك" },
      icon: <Facebook className={socialIconClassName} />,
    },
    {
      href: resolvedSettings.instagramUrl || defaultSiteSettings.instagramUrl || "#",
      label: { en: "Instagram", ar: "إنستجرام" },
      icon: <Instagram className={socialIconClassName} />,
    },
    {
      href: resolvedSettings.tiktokUrl || defaultSiteSettings.tiktokUrl || "#",
      label: { en: "TikTok", ar: "تيك توك" },
      icon: <Music2 className={socialIconClassName} />,
    },
  ];
};
