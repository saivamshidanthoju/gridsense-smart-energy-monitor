import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("app-theme");
    return savedTheme || "light";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    localStorage.setItem("app-theme", theme);
    
    if (mounted) {
      document.documentElement.classList.add("theme-transitioning");
    } else {
      setMounted(true);
    }
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (mounted) {
      const timer = setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
