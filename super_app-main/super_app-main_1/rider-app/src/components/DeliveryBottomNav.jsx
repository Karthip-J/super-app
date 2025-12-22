import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HiHome,
  HiOutlineTruck,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineUser
} from 'react-icons/hi';

const DeliveryBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: HiHome,
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      id: 'deliveries',
      label: 'Deliveries',
      icon: HiOutlineTruck,
      path: '/deliveries',
      active: location.pathname === '/deliveries'
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: HiOutlineCash,
      path: '/delivery-earnings',
      active: location.pathname === '/delivery-earnings'
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: HiOutlineCreditCard,
      path: '/delivery-wallet',
      active: location.pathname === '/delivery-wallet'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: HiOutlineUser,
      path: '/profile',
      active: location.pathname === '/profile'
    }
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                item.active
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-300'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${item.active ? 'text-yellow-600 dark:text-yellow-400' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryBottomNav; 