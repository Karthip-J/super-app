/* eslint-disable */
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
// chakra imports

export function SidebarLinks(props) {
  // Chakra color mode
  const location = useLocation();

  const { routes } = props;
  const [openSubMenus, setOpenSubMenus] = useState({});

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const toggleSubMenu = (index) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (
        route.layout === "/admin" ||
        route.layout === "/auth" ||
        route.layout === "/rtl"
      ) {
        if (route.subNav) {
          return (
            <div key={index}>
              <div 
                className="relative mb-3 flex hover:cursor-pointer"
                onClick={() => toggleSubMenu(index)}
              >
                <li
                  className="my-[3px] flex cursor-pointer items-center px-8"
                >
                  <span
                    className="font-medium text-gray-600"
                  >
                    {route.icon ? route.icon : <DashIcon />}
                  </span>
                  <p
                    className="leading-1 ml-4 flex font-medium text-gray-600"
                  >
                    {route.name}
                  </p>
                  <span className="ml-auto">
                    {openSubMenus[index] ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                  </span>
                </li>
              </div>
              {openSubMenus[index] && (
                <div className="ml-8">
                  {route.subNav.map((subRoute, subIndex) => {
                    if (!subRoute.path) return null;
                    return (
                      <Link key={`${index}-${subIndex}`} to={subRoute.layout + "/" + subRoute.path}>
                        <div className="relative mb-3 flex hover:cursor-pointer">
                          <li
                            className="my-[3px] flex cursor-pointer items-center px-8"
                          >
                            <span
                              className={`${
                                activeRoute(subRoute.path)
                                  ? "font-bold text-brand-500 dark:text-white"
                                  : "font-medium text-gray-600"
                              }`}
                            >
                              {subRoute.icon ? subRoute.icon : <DashIcon />}
                            </span>
                            <p
                              className={`leading-1 ml-4 flex ${
                                activeRoute(subRoute.path)
                                  ? "font-bold text-navy-700 dark:text-white"
                                  : "font-medium text-gray-600"
                              }`}
                            >
                              {subRoute.name}
                            </p>
                          </li>
                          {activeRoute(subRoute.path) && (
                            <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        } else if (route.path && route.name) {
          return (
            <Link key={index} to={route.layout + "/" + route.path}>
              <div className="relative mb-3 flex hover:cursor-pointer">
                <li
                  className="my-[3px] flex cursor-pointer items-center px-8"
                >
                  <span
                    className={`${
                      activeRoute(route.path)
                        ? "font-bold text-brand-500 dark:text-white"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {route.icon ? route.icon : <DashIcon />}
                  </span>
                  <p
                    className={`leading-1 ml-4 flex ${
                      activeRoute(route.path)
                        ? "font-bold text-navy-700 dark:text-white"
                        : "font-medium text-gray-600"
                    }`}
                  >
                    {route.name}
                  </p>
                </li>
                {activeRoute(route.path) && (
                  <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
                )}
              </div>
            </Link>
          );
        }
      }
      return null;
    });
  };
  // BRAND
  return createLinks(routes);
}

export default SidebarLinks;
