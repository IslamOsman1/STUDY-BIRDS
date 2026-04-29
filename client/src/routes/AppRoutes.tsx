import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useLanguage } from "../hooks/useLanguage";

const HomePage = lazy(() => import("../pages/HomePage").then((module) => ({ default: module.HomePage })));
const ProgramsPage = lazy(() => import("../pages/ProgramsPage").then((module) => ({ default: module.ProgramsPage })));
const ProgramDetailsPage = lazy(() => import("../pages/ProgramDetailsPage").then((module) => ({ default: module.ProgramDetailsPage })));
const UniversitiesPage = lazy(() => import("../pages/UniversitiesPage").then((module) => ({ default: module.UniversitiesPage })));
const UniversityDetailsPage = lazy(() => import("../pages/UniversityDetailsPage").then((module) => ({ default: module.UniversityDetailsPage })));
const StudyDestinationsPage = lazy(() => import("../pages/StudyDestinationsPage").then((module) => ({ default: module.StudyDestinationsPage })));
const ExhibitionsPage = lazy(() => import("../pages/ExhibitionsPage").then((module) => ({ default: module.ExhibitionsPage })));
const AboutPage = lazy(() => import("../pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import("../pages/ContactPage").then((module) => ({ default: module.ContactPage })));
const PartnerPage = lazy(() => import("../pages/PartnerPage").then((module) => ({ default: module.PartnerPage })));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const LoginPage = lazy(() => import("../pages/auth/LoginPage").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage").then((module) => ({ default: module.ForgotPasswordPage })));
const StudentProfilePage = lazy(() => import("../pages/student/StudentProfilePage").then((module) => ({ default: module.StudentProfilePage })));
const StudentDocumentsPage = lazy(() => import("../pages/student/StudentDocumentsPage").then((module) => ({ default: module.StudentDocumentsPage })));
const StudentApplicationsPage = lazy(() => import("../pages/student/StudentApplicationsPage").then((module) => ({ default: module.StudentApplicationsPage })));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })));
const AdminUniversitiesPage = lazy(() => import("../pages/admin/AdminUniversitiesPage").then((module) => ({ default: module.AdminUniversitiesPage })));
const AdminProgramsPage = lazy(() => import("../pages/admin/AdminProgramsPage").then((module) => ({ default: module.AdminProgramsPage })));
const AdminApplicationsPage = lazy(() => import("../pages/admin/AdminApplicationsPage").then((module) => ({ default: module.AdminApplicationsPage })));
const AdminContentPage = lazy(() => import("../pages/admin/AdminContentPage").then((module) => ({ default: module.AdminContentPage })));
const AdminExhibitionsPage = lazy(() => import("../pages/admin/AdminExhibitionsPage").then((module) => ({ default: module.AdminExhibitionsPage })));

const RouteFallback = () => {
  const { language } = useLanguage();
  return <div className="panel p-8 text-sm text-slate-500">{language === "ar" ? "جارٍ التحميل..." : "Loading..."}</div>;
};

export const AppRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:id" element={<ProgramDetailsPage />} />
        <Route path="/universities" element={<UniversitiesPage />} />
        <Route path="/universities/:id" element={<UniversityDetailsPage />} />
        <Route path="/destinations" element={<StudyDestinationsPage />} />
        <Route path="/exhibitions" element={<ExhibitionsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/partner" element={<PartnerPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student" element={<StudentProfilePage />} />
          <Route path="/student/overview" element={<Navigate replace to="/student" />} />
          <Route path="/student/profile" element={<Navigate replace to="/student" />} />
          <Route path="/student/documents" element={<StudentDocumentsPage />} />
          <Route path="/student/applications" element={<StudentApplicationsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["partner"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/partner/profile" element={<StudentProfilePage />} />
          <Route path="/partner/dashboard" element={<Navigate replace to="/partner/profile" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/students" element={<AdminUsersPage />} />
          <Route path="/admin/universities" element={<AdminUniversitiesPage />} />
          <Route path="/admin/programs" element={<AdminProgramsPage />} />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          <Route path="/admin/content" element={<AdminContentPage />} />
          <Route path="/admin/exhibitions" element={<AdminExhibitionsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);
