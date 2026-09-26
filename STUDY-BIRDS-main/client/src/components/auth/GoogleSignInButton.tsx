import { useEffect, useRef } from "react";
import type { Language } from "../../context/LanguageContext";

const GOOGLE_SCRIPT_ID = "study-birds-google-identity";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

type GoogleSignInButtonProps = {
  language: Language;
  mode?: "login" | "register";
  onCredential: (credential: string) => void | Promise<void>;
};

const loadGoogleScript = (onLoad: () => void) => {
  const existingScript = document.getElementById(
    GOOGLE_SCRIPT_ID
  ) as HTMLScriptElement | null;

  if (existingScript) {
    if (window.google?.accounts?.id) {
      onLoad();
      return;
    }

    existingScript.addEventListener("load", onLoad, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.id = GOOGLE_SCRIPT_ID;
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.addEventListener("load", onLoad, { once: true });
  document.head.appendChild(script);
};

export const GoogleSignInButton = ({
  language,
  mode = "login",
  onCredential,
}: GoogleSignInButtonProps) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) {
      return;
    }

    const renderButton = () => {
      if (!buttonRef.current || !window.google?.accounts?.id) {
        return;
      }

      buttonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => {
          if (credential) {
            void onCredential(credential);
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: mode === "register" ? "signup_with" : "continue_with",
        logo_alignment: "left",
        width: 320,
        locale: language,
      });
    };

    loadGoogleScript(renderButton);
  }, [language, mode, onCredential]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return <div ref={buttonRef} className="flex justify-center" />;
};
