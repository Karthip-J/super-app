import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdDashboard } from "react-icons/md";
import { HiX } from "react-icons/hi";
import { FiMenu } from "react-icons/fi";

const Sidebar = ({ isCollapsed, open, onClose, onSidenavToggle, routes }) => {
  const location = useLocation();
  const [dropdowns, setDropdowns] = useState({});

  // Filter out authentication routes from the passed `routes` prop
  const sidebarRoutes = routes.filter(route => route.layout === '/admin');

  const toggleDropdown = (key) => {
    setDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity xl:hidden ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      ></div>

      <div
        className={`fixed z-30 flex h-screen flex-col font-bold transition-all duration-300 ease-in-out border-r
          ${isCollapsed ? "w-20" : "w-64"}
          ${open ? "translate-x-0" : "-translate-x-full"}
          xl:translate-x-0`}
        style={{ 
          backgroundColor: 'var(--bg-sidebar)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        {/* Sidebar Toggle - always visible, vertically centered with icons */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b`} style={{ borderColor: 'var(--border-color)' }}>
          <span 
            className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 delay-200'}`}
            style={{ color: 'var(--text-primary)' }}
          >
            Admin Panel
          </span>
          <span
            className={`flex cursor-pointer text-xl ${isCollapsed ? 'mx-auto' : ''}`}
            style={{ color: 'var(--text-primary)' }}
            onClick={onSidenavToggle}
            aria-label="Toggle sidebar"
            tabIndex={0}
          >
            <FiMenu className="h-5 w-5" />
          </span>
        </div>
        {/* Mobile Close Button */}
        <span
          className="absolute top-4 right-4 block cursor-pointer xl:hidden"
          style={{ color: 'var(--text-primary)' }}
          onClick={onClose}
        >
          <HiX />
        </span>
        <nav className={`flex-grow overflow-y-auto overflow-x-hidden ${isCollapsed ? '' : 'pr-2'}`}>
          {/* Dashboard Link - Always visible at the top */}
          <Link 
            to="/admin/default" 
            className={`flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'p-3'} transition-colors border-b ${
              location.pathname === '/admin/default' || location.pathname === '/admin'
                ? "font-bold" 
                : ""
            }`}
            style={{ 
              color: (location.pathname === '/admin/default' || location.pathname === '/admin') ? '#4318ff' : 'var(--text-primary)',
              backgroundColor: (location.pathname === '/admin/default' || location.pathname === '/admin') ? 'var(--bg-secondary)' : 'transparent',
              borderColor: 'var(--border-color)'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/admin/default' && location.pathname !== '/admin') {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.color = '#4318ff';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/admin/default' && location.pathname !== '/admin') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
          >
            <span className={isCollapsed ? 'flex justify-center items-center' : ''}>
              <MdDashboard className="h-6 w-6" />
            </span>
            <span
              className={`whitespace-nowrap transition-all duration-200 ${
                isCollapsed ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100 w-auto ml-2'
              }`}
            >
              Dashboard
            </span>
          </Link>
          
          {sidebarRoutes.map((item, index) => (
            <div key={index}>
              {item.subNav ? (
                <div 
                  className={`flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'justify-between p-3'} cursor-pointer hover:bg-opacity-10 transition-colors`} 
                  style={{ 
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => !isCollapsed && toggleDropdown(index)}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <span className={isCollapsed ? 'flex justify-center items-center' : ''}>
                      {item.icon}
                    </span>
                    <span
                      className={`whitespace-nowrap transition-all duration-200 ${
                        isCollapsed ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100 w-auto ml-2'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                  {!isCollapsed && (dropdowns[index] ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />)}
                </div>
              ) : (
                <Link 
                  to={`/admin/${item.path}`} 
                  className={`flex items-center ${isCollapsed ? 'justify-center px-0 py-3' : 'p-3'} transition-colors ${
                    location.pathname === `/admin/${item.path}` 
                      ? "font-bold" 
                      : ""
                  }`}
                  style={{ 
                    color: location.pathname === `/admin/${item.path}` ? '#4318ff' : 'var(--text-primary)',
                    backgroundColor: location.pathname === `/admin/${item.path}` ? 'var(--bg-secondary)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== `/admin/${item.path}`) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      e.currentTarget.style.color = '#4318ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== `/admin/${item.path}`) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                >
                  <span className={isCollapsed ? 'flex justify-center items-center' : ''}>
                    {item.icon}
                  </span>
                  <span
                    className={`whitespace-nowrap transition-all duration-200 ${
                      isCollapsed ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100 w-auto ml-2'
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              )}
              {/* Dropdown should not be visible when collapsed */}
              {!isCollapsed && dropdowns[index] && item.subNav && (
                <div className="ml-4">
                  {item.subNav.map((subItem, subIndex) => (
                    <div key={subIndex}>
                      <Link 
                        to={`/admin/${subItem.path}`} 
                        className={`ml-4 flex items-center p-2 transition-colors ${
                          location.pathname === `/admin/${subItem.path}` 
                            ? "font-bold" 
                            : ""
                        }`}
                        style={{ 
                          color: location.pathname === `/admin/${subItem.path}` ? '#4318ff' : 'var(--text-secondary)',
                          backgroundColor: location.pathname === `/admin/${subItem.path}` ? 'var(--bg-secondary)' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (location.pathname !== `/admin/${subItem.path}`) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                            e.currentTarget.style.color = '#4318ff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (location.pathname !== `/admin/${subItem.path}`) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        {subItem.icon}
                        <span className="ml-2 whitespace-nowrap">{subItem.name}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 