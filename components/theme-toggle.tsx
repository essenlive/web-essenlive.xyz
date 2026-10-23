"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

/** Plain text toggle: "sombre" in light mode, "clair" in dark mode. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "cursor-pointer border-0 bg-transparent p-0 font-mono text-sm underline decoration-1 text-foreground hover:text-highlight",
        className
      )}
      aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
    >
      {isDark ? "clair" : "sombre"}
    </button>
  );
}
