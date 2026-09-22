import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";

export const LanguageRouteSync = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const previousLanguage = useRef(language);
  const previousSearch = useRef(location.search);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlLanguage = params.get("lang");
    const isValidUrlLanguage = urlLanguage === "ar" || urlLanguage === "en";
    const languageChanged = previousLanguage.current !== language;
    const searchChanged = previousSearch.current !== location.search;

    if (isValidUrlLanguage && urlLanguage !== language && searchChanged && !languageChanged) {
      setLanguage(urlLanguage);
      previousLanguage.current = language;
      previousSearch.current = location.search;
      return;
    }

    if (urlLanguage !== language) {
      params.set("lang", language);
      navigate(
        {
          pathname: location.pathname,
          search: `?${params.toString()}`,
          hash: location.hash,
        },
        { replace: true }
      );
    }

    previousLanguage.current = language;
    previousSearch.current = location.search;
  }, [language, location.hash, location.pathname, location.search, navigate, setLanguage]);

  return null;
};
