import { NavLink } from "react-router-dom";
import { Home, User, List } from "lucide-react";

const FooterNav = () => {
  const navItems = [
    { label: "Home", path: "/home", icon: <Home size={20} /> },
    { label: "History", path: "/porter/history", icon: <List size={20} /> },
    { label: "Profile", path: "/porter/profile", icon: <User size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center text-sm font-medium ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default FooterNav;
