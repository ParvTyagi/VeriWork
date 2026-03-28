import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const DARK = "business";
const LIGHT = "corporate";
const LEGACY_DARK = new Set(["abyss", DARK]);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("vw-theme") : null;
    if (stored && (LEGACY_DARK.has(stored) || stored === LIGHT)) {
      return LEGACY_DARK.has(stored) ? DARK : LIGHT;
    }
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return DARK;
    }
    return LIGHT;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme === DARK ? "dark" : "light";
    localStorage.setItem("vw-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((currentTheme) => (currentTheme === DARK ? LIGHT : DARK));
  const isDark = theme === DARK;

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};