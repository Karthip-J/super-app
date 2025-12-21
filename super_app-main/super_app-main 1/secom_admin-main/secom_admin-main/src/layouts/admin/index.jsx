import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar/Sidebar";
import Footer from "components/footer/Footer";
import routes from "routes.js";
import adminRoutes from "routes/admin.routes.js";
import { getUserRole, filterRoutesByRole } from "utils/roleAccess";
import { FiMenu } from "react-icons/fi";

export default function Admin(props) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentRoute, setCurrentRoute] = useState("Main Dashboard");
  
  // Get user role and memoize the filtered routes
  const userRole = getUserRole();
  const accessibleRoutes = useMemo(() => filterRoutesByRole(routes, userRole), [userRole]);
  
  const handleSidenavToggle = () => {
    if (window.innerWidth < 1200) {
      setOpen(!open);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setOpen(false);
        setIsCollapsed(false);
      } else {
        setOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getActiveRoute(accessibleRoutes);
  }, [location.pathname, accessibleRoutes]);

  const getActiveRoute = (routes) => {
    for (let route of routes) {
      if (window.location.href.includes(route.layout + "/" + route.path)) {
        setCurrentRoute(route.name);
        return;
      }
      if (route.subNav) {
        for (let subRoute of route.subNav) {
          if (window.location.href.includes(subRoute.layout + "/" + subRoute.path)) {
            setCurrentRoute(subRoute.name);
            return;
          }
        }
      }
    }
  };

  const getRoutes = (routes) => {
    return routes.flatMap((prop, key) => {
      let routeComponents = [];
      if (prop.layout === "/admin") {
        routeComponents.push(
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
        if (prop.subNav) {
          prop.subNav.forEach((sub, subKey) => {
            routeComponents.push(
              <Route path={`/${sub.path}`} element={sub.component} key={`${key}-${subKey}`} />
            );
            if (sub.subNav) {
              sub.subNav.forEach((nested, nestedKey) => {
                routeComponents.push(
                  <Route path={`/${nested.path}`} element={nested.component} key={`${key}-${subKey}-${nestedKey}`} />
                );
              });
            }
          });
        }
      }
      return routeComponents;
    });
  };

  const getAdminRoutes = (routes) => {
    return routes.map((prop, key) => {
      return (
        <Route path={prop.path} element={prop.element} key={key} />
      );
    });
  };

  return (
    <div className="flex h-full w-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Removed sidebar toggle from layout. Only sidebar header should have it. */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        open={open} 
        onClose={() => setOpen(false)}
        onSidenavToggle={handleSidenavToggle}
        routes={accessibleRoutes}
      /> 
      <div 
        className={`relative h-full w-full transition-all duration-300 ease-in-out
          ${isCollapsed ? "xl:ml-20" : "xl:ml-64"}`}
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <main className="mx-auto h-full p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <Navbar
            logoText={currentRoute}
            brandText={currentRoute}
            secondary={true}
            {...rest}
          />
          <div className="pt-5 mx-auto mb-auto h-full min-h-[84vh]" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Routes>
              {getRoutes(accessibleRoutes)}
              {getAdminRoutes(adminRoutes)}
              <Route
                path="/"
                element={<Navigate to="/admin/default" replace />}
              />
              {/* Redirect unknown routes to dashboard */}
              <Route
                path="*"
                element={<Navigate to="/admin/default" replace />}
              />
            </Routes>
          </div>
          <div className="p-3">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
