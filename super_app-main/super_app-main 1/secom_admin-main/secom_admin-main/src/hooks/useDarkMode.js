import { useState, useEffect } from 'react';

/**
 * Custom hook for managing dark mode with localStorage persistence
 * @returns {[boolean, () => void]} - [isDarkMode, toggleDarkMode]
 */
export const useDarkMode = () => {
  // Initialize from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // Check if dark class exists on body/html
      return document.body.classList.contains('dark') || 
             document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    // Apply dark mode class to both html and body for maximum compatibility
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return [isDarkMode, toggleDarkMode];
};

export default useDarkMode;

