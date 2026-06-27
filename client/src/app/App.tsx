import { LanguageRouteSync } from "../components/seo/LanguageRouteSync";
import { FloatingAssistant } from "../components/FloatingAssistant";
import { LeadCapturePrompt } from "../components/LeadCapturePrompt";
import { AppRoutes } from "../routes/AppRoutes";

export default function App() {
  return (
    <>
      <LanguageRouteSync />
      <AppRoutes />
      <LeadCapturePrompt />
      <FloatingAssistant />
    </>
  );
}
