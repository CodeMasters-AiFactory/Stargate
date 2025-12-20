import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { trackRender } from '@/utils/renderTracker';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage immediately to prevent flash
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('stargate-theme') as Theme;
      if (savedTheme) {
        return savedTheme;
      }
    }
    return 'dark';
  });
  const prevThemeRef = useRef(theme);

  useEffect(() => {
    // Apply theme to document immediately
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('stargate-theme', theme);
  }, [theme]);

  // Track re-renders
  useEffect(() => {
    if (prevThemeRef.current !== theme) {
      trackRender('ThemeProvider', `Theme changed: ${prevThemeRef.current} -> ${theme}`);
      prevThemeRef.current = theme;
    } else {
      trackRender('ThemeProvider', 'Unknown');
    }
  });

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
