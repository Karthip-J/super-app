import React, { useState, useEffect } from 'react';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';

const UserModuleHeader = ({
  title,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  statusFilter = "all",
  onStatusFilterChange,
  showStatusFilter = true,
  onAddClick,
  addButtonText = "Add New",
  loading = false,
  children // For additional custom elements
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide header when scrolling down, show when scrolling up or at top
      if (currentScrollY < 10) {
        // Always show at the very top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide when scrolling down past 100px
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Show when scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div 
      className={`border-b shadow-sm transition-all duration-300 overflow-hidden ${
        isVisible ? 'py-4 mb-6 max-h-96 opacity-100' : 'py-0 mb-0 max-h-0 opacity-0'
      }`}
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      
      <div className="flex gap-2 items-center">
        {/* Search Bar */}
        <div className="relative">
          <FiSearch 
            className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[250px] transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px] transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        )}

        {/* Custom Elements */}
        {children}

        {/* Add Button */}
        <button
          onClick={onAddClick}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            <FaPlus className="mr-2" />
          )}
          {addButtonText}
        </button>
      </div>
      </div>
    </div>
  );
};

export default UserModuleHeader; 