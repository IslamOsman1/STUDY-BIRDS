import { useLocation } from "react-router-dom";
import { LanguageRouteSync } from "../components/seo/LanguageRouteSync";
import { FloatingAssistant } from "../components/FloatingAssistant";
import { LeadCapturePrompt } from "../components/LeadCapturePrompt";
import { AppRoutes } from "../routes/AppRoutes";

export default function App() {
  const { pathname } = useLocation();
  const accountFlow = ["/login", "/register", "/forgot-password", "/account/security", "/mobile-sign-in"].includes(pathname);
  return (
    <>
      <LanguageRouteSync />
      <AppRoutes />
      {!accountFlow ? <><LeadCapturePrompt /><FloatingAssistant /></> : null}
    </>
  );
}
