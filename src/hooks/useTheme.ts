import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = (): [Theme, () => void] => {
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        return storedTheme;
      }
      // Fallback to system preference if no theme is stored
      // return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      // For simplicity, defaulting to 'light' if nothing is set or system preference is not used initially.
      // You can uncomment the line above to use system preference as a fallback.
    }
    return 'light'; // Default theme
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const applyTheme = useCallback((selectedTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('theme', selectedTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Optional: Listen to system theme changes if you want to sync with it
  // useEffect(() => {
  //   const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  //   const handleChange = (e: MediaQueryListEvent) => {
  //     const newTheme = e.matches ? 'dark' : 'light';
  //     // Only update if no theme is explicitly set by the user, or if you want to always sync
  //     if (!localStorage.getItem('theme')) {
  //        setTheme(newTheme);
  //        applyTheme(newTheme);
  //     }
  //   };
  //   mediaQuery.addEventListener('change', handleChange);
  //   return () => mediaQuery.removeEventListener('change', handleChange);
  // }, [applyTheme]);


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return [theme, toggleTheme];
};
