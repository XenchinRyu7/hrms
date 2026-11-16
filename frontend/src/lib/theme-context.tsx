import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';
export type ThemeColor = 'default' | 'emerald' | 'violet' | 'cyberpunk' | 'amber';

interface ThemeContextType {
  mode: ThemeMode;
  colorTheme: ThemeColor;
  toggleMode: () => void;
  setColorTheme: (theme: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  colorTheme: 'default',
  toggleMode: () => {},
  setColorTheme: () => {},
});

export const THEME_OPTIONS: { id: ThemeColor; name: string; icon: string; previewClass: string }[] = [
  { id: 'default', name: 'Default Ethereal', icon: '🌌', previewClass: 'bg-blue-500' },
  { id: 'emerald', name: 'Emerald Ops', icon: '🌿', previewClass: 'bg-emerald-500' },
  { id: 'violet', name: 'Obsidian Violet', icon: '🔮', previewClass: 'bg-violet-500' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: '⚡', previewClass: 'bg-rose-500' },
  { id: 'amber', name: 'Amber Gold', icon: '👑', previewClass: 'bg-amber-500' },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [colorTheme, setColorThemeState] = useState<ThemeColor>('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMode = (localStorage.getItem('ethereal_theme_mode') as ThemeMode) || 'dark';
    const savedTheme = (localStorage.getItem('ethereal_color_theme') as ThemeColor) || 'default';

    setMode(savedMode);
    setColorThemeState(savedTheme);

    applyTheme(savedMode, savedTheme);
  }, []);

  const applyTheme = (targetMode: ThemeMode, targetTheme: ThemeColor) => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    // Apply dark/light class
    if (targetMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply data-color-theme attribute
    root.setAttribute('data-color-theme', targetTheme);
  };

  const toggleMode = () => {
    const nextMode: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
    localStorage.setItem('ethereal_theme_mode', nextMode);
    applyTheme(nextMode, colorTheme);
  };

  const setColorTheme = (newTheme: ThemeColor) => {
    setColorThemeState(newTheme);
    localStorage.setItem('ethereal_color_theme', newTheme);
    applyTheme(mode, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ mode, colorTheme, toggleMode, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
