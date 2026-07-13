import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'go-viet-theme';

type ThemeMode = 'dark' | 'light';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'dark' || value === 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }

    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

      return isThemeMode(storedTheme) ? storedTheme : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures and keep the toggle usable.
    }
  }, [theme]);

  return {
    theme,
    toggleTheme: () =>
      setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
  };
}
