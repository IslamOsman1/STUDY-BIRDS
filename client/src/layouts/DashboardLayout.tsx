import {
  Building2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  Settings2,
  Users,
  Video,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { Seo } from "../components/seo/Seo";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { seoText } from "../seo/site";
import { dt } from "../utils/dashboardTranslations";

export const DashboardLayout = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isPartner = user?.role === "partner";

  const studentLinks = [
    { label: dt(language, "profileHub"), href: "/student", icon: Settings2, description: dt(language, "profileHubDesc") },
    { label: t("documents"), href: "/student/documents", icon: FileText, description: dt(language, "documentsDesc") },
    { label: t("applications"), href: "/student/applications", icon: LayoutDashboard, description: dt(language, "applicationsDescStudent") },
  ];

  const partnerLinks = [
    { label: dt(language, "profileHub"), href: "/partner/profile", icon: Settings2, description: dt(language, "profileHubDesc") },
  ];

  const adminLinks = [
    { label: t("overview"), href: "/admin", icon: LayoutDashboard, description: dt(language, "executiveSummary") },
    { label: dt(language, "users"), href: "/admin/users", icon: Users, description: dt(language, "userAccessDesc") },
    { label: t("universities"), href: "/admin/universities", icon: Building2, description: dt(language, "institutionsDesc") },
    { label: t("programs"), href: "/admin/programs", icon: GraduationCap, description: dt(language, "programsDesc") },
    { label: t("applications"), href: "/admin/applications", icon: FileText, description: dt(language, "applicationsDesc") },
    { label: dt(language, "content"), href: "/admin/content", icon: Layers3, description: dt(language, "contentDesc") },
    {
      label: language === "ar" ? "محطة المعارض" : "Exhibitions Station",
      href: "/admin/exhibitions",
      icon: Video,
      description: language === "ar" ? "إدارة المقالات وروابط فيديو يوتيوب." : "Manage articles and YouTube video links.",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#d8e1f1_0%,_#f6f8fc_40%,_#f8fafc_100%)]">
      <Seo
        title={
          user?.role === "admin"
            ? seoText(language, "Admin Dashboard", "لوحة الإدارة")
            : isPartner
              ? seoText(language, "Partner Profile", "الملف الشخصي للشريك")
              : seoText(language, "Student Dashboard", "لوحة الطالب")
        }
        description={
          user?.role === "admin"
            ? seoText(language, "Private admin workspace for Study Birds.", "مساحة إدارية خاصة لمنصة Study Birds.")
            : isPartner
              ? seoText(language, "Private partner profile workspace for Study Birds.", "مساحة الملف الشخصي الخاصة بالشريك داخل Study Birds.")
              : seoText(language, "Private student workspace for Study Birds.", "مساحة خاصة للطالب داخل Study Birds.")
        }
        noIndex
      />
      <Navbar />
      <main className="container-shell grid gap-6 py-8 lg:grid-cols-[320px_1fr]">
        <DashboardSidebar
          links={user?.role === "admin" ? adminLinks : isPartner ? partnerLinks : studentLinks}
          sectionLabel={user?.role === "admin" ? dt(language, "controlCenter") : dt(language, "profileHub")}
          title={user?.role === "admin" ? dt(language, "adminTitle") : dt(language, "profileTitle")}
          subtitle={user?.role === "admin" ? dt(language, "manageUsersContent") : dt(language, "profileIntro")}
        />
        <Outlet />
      </main>
    </div>
  );
};
