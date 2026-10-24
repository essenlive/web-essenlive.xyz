import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Ruled cell grid: `columns` wide from `lg` up (2 from `sm`, 1 below).
 * An incomplete last row is filled with empty cells so every rule runs to the end.
 */
export function CellGrid({ count, columns = 3, children }: { count: number; columns?: number; children: ReactNode }) {
  const cols = Math.max(1, Math.round(columns))
  const lgFill = (cols - (count % cols)) % cols
  const smFill = cols > 1 ? (2 - (count % 2)) % 2 : 0

  return (
    <div
      className={cn("index cells grid lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]", cols > 1 && "sm:grid-cols-2")}
      style={{ "--cols": cols } as React.CSSProperties}
    >
      {children}
      {Array.from({ length: Math.max(lgFill, smFill) }, (_, i) => (
        <div
          key={`fill-${i}`}
          aria-hidden
          className={cn("hidden", i < smFill && "sm:block", i < smFill && i >= lgFill && "lg:hidden", i < lgFill && "lg:block")}
        />
      ))}
    </div>
  )
}
