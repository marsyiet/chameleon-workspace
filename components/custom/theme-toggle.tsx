"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Toggle } from "@/components/ui/toggle";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <Toggle
      pressed={isDark}
      onPressedChange={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      size={"xs"}
      className="p-0! w-full bg-transparent! flex items-center justify-start"
    >
      {isDark ? (
        <div className="flex items-center gap-2">
          <Sun className="size-4" />
          <p>Light</p>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Moon className="size-4" />
          <p>Dark</p>
        </div>
      )}
    </Toggle>
  );
}