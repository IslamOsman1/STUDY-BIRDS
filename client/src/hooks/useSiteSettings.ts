import { useEffect, useState } from "react";
import { defaultSiteSettings, mergeSiteSettings } from "../config/contactLinks";
import { contentService } from "../services/contentService";
import type { SiteSettings } from "../types";

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    let active = true;

    contentService
      .getSiteSettings()
      .then((data) => {
        if (active) {
          setSettings(mergeSiteSettings(data));
        }
      })
      .catch(() => {
        if (active) {
          setSettings(defaultSiteSettings);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return settings;
};
