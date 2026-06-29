import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// ─── Paletas ──────────────────────────────────────────────────────────────────

export const darkTheme = {
  dark: true,
  bg:             '#0a0a0a',
  bgCard:         '#141414',
  bgInput:        '#1e1e1e',
  bgTopBar:       '#111',
  border:         '#1e1e1e',
  borderInput:    '#2a2a2a',
  accent:         '#e8ff47',
  accentText:     '#0a0a0a',
  text:           '#ffffff',
  textMuted:      '#aaaaaa',
  textDim:        '#555555',
  textLabel:      '#888888',
  avatarBadge:    '#4cff72',
  emptyIcon:      '#333333',
  backdrop:       'rgba(0,0,0,0.6)',
};

export const lightTheme = {
  dark: false,
  bg:             '#f2f2f7',
  bgCard:         '#ffffff',
  bgInput:        '#f0f0f0',
  bgTopBar:       '#ffffff',
  border:         '#e0e0e0',
  borderInput:    '#d0d0d0',
  accent:         '#e8ff47',
  accentText:     '#0a0a0a',
  text:           '#0a0a0a',
  textMuted:      '#444444',
  textDim:        '#888888',
  textLabel:      '#666666',
  avatarBadge:    '#34c759',
  emptyIcon:      '#cccccc',
  backdrop:       'rgba(0,0,0,0.4)',
};

export type Theme = typeof darkTheme;

// ─── Context ──────────────────────────────────────────────────────────────────

const THEME_KEY = 'app_theme';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  isDark: true,
  toggleTheme: async () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved !== null) setIsDark(saved === 'dark');
      } catch {}
    })();
  }, []);

  async function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}