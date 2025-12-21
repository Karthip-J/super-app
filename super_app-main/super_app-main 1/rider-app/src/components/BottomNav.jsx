import React from "react";
import { NavLink } from "react-router-dom";
import { 
  HiHome, 
  HiOutlineHome,
  HiCurrencyDollar,
  HiOutlineCurrencyDollar,
  HiUser,
  HiOutlineUser,
  HiMap,
  HiOutlineMap 
} from "react-icons/hi2";

const navItems = [
  { 
    to: "/dashboard", 
    label: "Home", 
    icon: <HiHome className="w-6 h-6" />,
    outlineIcon: <HiOutlineHome className="w-6 h-6" />
  },
  { 
    to: "/trips", 
    label: "Trips", 
    icon: <HiMap className="w-6 h-6" />,
    outlineIcon: <HiOutlineMap className="w-6 h-6" />
  },
  { 
    to: "/profile", 
    label: "Profile", 
    icon: <HiUser className="w-6 h-6" />,
    outlineIcon: <HiOutlineUser className="w-6 h-6" />
  },
  { 
    to: "/earnings", 
    label: "Earnings", 
    icon: <span style={{fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1}}>₹</span>,
    outlineIcon: <span style={{fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1, opacity: 0.5}}>₹</span>
  },
];

const BottomNav = () => (
  <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-sm pb-[env(safe-area-inset-bottom)] h-16">
    <div className="flex h-full">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex flex-col items-center justify-center 
            flex-1 min-w-0 h-full transition-all
            ${isActive ? "text-blue-600 dark:text-blue-300" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}
          `}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                {isActive ? item.icon : item.outlineIcon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default BottomNav;