import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export const MainLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <main className="container-shell py-8">
      <Outlet />
    </main>
    <Footer />
  </div>
);
