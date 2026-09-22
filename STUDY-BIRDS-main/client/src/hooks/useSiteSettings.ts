import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { defaultSiteSettings, mergeSiteSettings } from "../config/contactLinks";
import { contentService } from "../services/contentService";
import type { SiteSettings } from "../types";

export const useSiteSettings = () => {
  const location = useLocation();
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    let active = true;

    contentService
      .getSiteSettings(true)
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
  }, [location.pathname]);

  return settings;
};
