import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";
export type ThemeColor =
  | "default"
  | "tokyo-night"
  | "catppuccin"
  | "rose-pine"
  | "cyberpunk"
  | "zen-inspired-theme"
  | "matrix"
  | "midnight"
  | "light-green"
  | "emerald"
  | "neon";

interface ThemeContextType {
  mode: ThemeMode;
  colorTheme: ThemeColor;
  toggleMode: () => void;
  setColorTheme: (theme: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  colorTheme: "default",
  toggleMode: () => {},
  setColorTheme: () => {},
});

export const THEME_OPTIONS: {
  id: ThemeColor;
  name: string;
  icon: string;
  previewClass: string;
}[] = [
  {
    id: "default",
    name: "Ethereal Default",
    icon: "🌌",
    previewClass: "bg-indigo-500",
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    icon: "🗼",
    previewClass: "bg-[#7aa2f7]",
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    icon: "☕",
    previewClass: "bg-[#8aadf4]",
  },
  {
    id: "rose-pine",
    name: "Rosé Pine",
    icon: "🌲",
    previewClass: "bg-[#eb6f92]",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: "⚡",
    previewClass: "bg-[#ff007f]",
  },
  {
    id: "zen-inspired-theme",
    name: "Zen Inspired",
    icon: "🎋",
    previewClass: "bg-[#a3b18a]",
  },
  {
    id: "matrix",
    name: "Matrix Code",
    icon: "🕶️",
    previewClass: "bg-[#00ff66]",
  },
  {
    id: "midnight",
    name: "Midnight Navy",
    icon: "🌙",
    previewClass: "bg-[#38bdf8]",
  },
  {
    id: "light-green",
    name: "Light Green",
    icon: "🍃",
    previewClass: "bg-[#22c55e]",
  },
  {
    id: "emerald",
    name: "Emerald Ops",
    icon: "🌿",
    previewClass: "bg-[#10b981]",
  },
  {
    id: "neon",
    name: "Electric Neon",
    icon: "🔮",
    previewClass: "bg-[#f43f5e]",
  },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [colorTheme, setColorThemeState] = useState<ThemeColor>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedMode =
      (localStorage.getItem("ethereal_theme_mode") as ThemeMode) || "dark";
    const savedTheme =
      (localStorage.getItem("ethereal_color_theme") as ThemeColor) || "default";

    setMode(savedMode);
    setColorThemeState(savedTheme);

    applyTheme(savedMode, savedTheme);
  }, []);

  const applyTheme = (targetMode: ThemeMode, targetTheme: ThemeColor) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    // Apply dark/light class
    if (targetMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply data-color-theme attribute per theming.mdx
    root.setAttribute("data-color-theme", targetTheme);

    // Dynamic link tag injection per theming.mdx
    if (targetTheme === "default") {
      const activeLink = document.getElementById("ethereal-active-theme");
      if (activeLink) activeLink.remove();
    } else {
      let link = document.getElementById(
        "ethereal-active-theme",
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.id = "ethereal-active-theme";
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = `/themes/${targetTheme}.css`;
    }
  };

  const toggleMode = () => {
    const nextMode: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(nextMode);
    localStorage.setItem("ethereal_theme_mode", nextMode);
    applyTheme(nextMode, colorTheme);
  };

  const setColorTheme = (newTheme: ThemeColor) => {
    setColorThemeState(newTheme);
    localStorage.setItem("ethereal_color_theme", newTheme);
    applyTheme(mode, newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{ mode, colorTheme, toggleMode, setColorTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
