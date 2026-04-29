import { LanguageRouteSync } from "../components/seo/LanguageRouteSync";
import { FloatingAssistant } from "../components/FloatingAssistant";
import { AppRoutes } from "../routes/AppRoutes";

export default function App() {
  return (
    <>
      <LanguageRouteSync />
      <AppRoutes />
      <FloatingAssistant />
    </>
  );
}
