import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const DARK  = "veriwork_dark";
const LIGHT = "veriwork_light";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("vw-theme");
    if (stored === DARK || stored === LIGHT) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("vw-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === DARK ? LIGHT : DARK));
  const isDark  = theme === DARK;

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