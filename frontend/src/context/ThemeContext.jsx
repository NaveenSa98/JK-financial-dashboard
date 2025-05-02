import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  // Theme types
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  };

  // Check local storage or set system as default theme preference
  const getInitialThemePreference = () => {
    const savedTheme = localStorage.getItem('themePreference');
    if (savedTheme) {
      return savedTheme;
    }
    return THEMES.SYSTEM;
  };

  // Get the actual dark mode state (true/false) based on theme preference
  const getInitialDarkMode = () => {
    const themePreference = getInitialThemePreference();
    
    if (themePreference === THEMES.SYSTEM) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return themePreference === THEMES.DARK;
  };

  const [themePreference, setThemePreference] = useState(getInitialThemePreference);
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  // Toggle dark mode (for light/dark toggle)
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    setThemePreference(newDarkMode ? THEMES.DARK : THEMES.LIGHT);
  };

  // Set theme preference
  const setTheme = (theme) => {
    setThemePreference(theme);
    
    if (theme === THEMES.SYSTEM) {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setDarkMode(theme === THEMES.DARK);
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (themePreference === THEMES.SYSTEM) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [themePreference]);

  // Store theme preference in local storage
  useEffect(() => {
    localStorage.setItem('themePreference', themePreference);
    
    // Apply dark mode class to HTML element for global styling
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, themePreference]);

  const value = {
    darkMode,
    toggleDarkMode,
    themePreference,
    setTheme,
    THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};