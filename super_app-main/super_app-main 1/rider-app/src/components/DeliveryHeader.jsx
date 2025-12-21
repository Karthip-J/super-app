import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HiBell,
  HiUserCircle,
  HiMenu,
  HiOutlineSparkles,
  HiMoon,
  HiSun
} from 'react-icons/hi';

const DeliveryHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Dark mode state
  const [dark, setDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    }
    return false;
  });
  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-md dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Back arrow or Logo/Brand */}
          <div className="flex items-center space-x-3">
            {location.pathname === '/dashboard' && localStorage.getItem('professionalType') === 'delivery' && (
              <button
                onClick={() => navigate('/select-profession')}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 mr-2"
                aria-label="Back to profession select"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5 19L8.5 12L15.5 5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm">
              <HiOutlineSparkles className="text-xl text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Super Delivery</h1>
          </div>

          {/* Right side - Navigation icons */}
          <div className="flex items-center space-x-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {dark ? <HiSun className="text-lg" /> : <HiMoon className="text-lg" />}
            </button>
            <Link 
              to="/notification-center" 
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
            >
              <HiBell className="text-lg" />
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-xs font-bold rounded-full">
                3
              </span>
            </Link>
            <Link 
              to="/profile" 
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
            >
              <HiUserCircle className="text-lg" />
            </Link>
            {/* Optional hamburger menu for future mobile nav */}
            <button className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200">
              <HiMenu className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DeliveryHeader; 