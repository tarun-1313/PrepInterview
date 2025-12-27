"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  initialTheme?: "light" | "dark";
};

const ThemeToggle = ({ initialTheme = "dark" }: ThemeToggleProps) => {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("prepwise-theme") as
      | "light"
      | "dark"
      | null;
    const next = stored || initialTheme;

    setTheme(next);

    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [initialTheme]);

  const applyTheme = (value: "light" | "dark") => {
    setTheme(value);

    if (value === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("prepwise-theme", value);
    }
  };

  const handleToggle = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-dark-200 text-white hover:bg-dark-300 border border-white/10 transition-colors"
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export { ThemeToggle };

