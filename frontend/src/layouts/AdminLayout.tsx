import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

const STORAGE_KEY = "sholex:admin:sidebar-collapsed";

const AdminLayout = () => {
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // Adjust state during render when the route changes — React's official
  // pattern for "reset derived state on prop change". Avoids the
  // react-hooks/set-state-in-effect lint error and skips an extra render.
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  // Persist collapse preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Focus main on route change (matches app convention)
  useEffect(() => {
    const main = document.getElementById("main-content");
    main?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FCFAF5] dark:bg-[#0A0A0B]">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={`transition-[padding] duration-200 ease-out
          pt-16
          ${sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"}`}
      >
        <AdminTopbar
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="px-4 md:px-6 lg:px-8 py-6 focus:outline-none"
          style={{
            paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;