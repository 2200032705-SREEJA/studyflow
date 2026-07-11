"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("studyflow-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("studyflow-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="flex w-full items-center justify-between rounded-card border border-ink/10 dark:border-paper/15 px-3 py-2 text-xs font-mono text-ink/70 dark:text-paper/70"
    >
      {dark ? "Dark mode" : "Light mode"}
      <span
        className={`ml-2 inline-flex h-4 w-8 items-center rounded-full transition-colors ${
          dark ? "bg-amber" : "bg-ink/20"
        }`}
      >
        <span
          className={`h-3 w-3 rounded-full bg-white transition-transform ${
            dark ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
