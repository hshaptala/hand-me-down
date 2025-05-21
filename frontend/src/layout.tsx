import { Outlet } from "react-router-dom";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col font-montserrat">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
