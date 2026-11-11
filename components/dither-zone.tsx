"use client"

import dynamic from "next/dynamic"
import type { ReactNode } from "react"
import type { DitherOptions } from "@/lib/site-config"
import { cn } from "@/lib/utils"

// WebGL only: nothing is rendered on the server and the code loads after hydration.
const DitherField = dynamic(() => import("@/components/ui/dither-field").then((m) => m.DitherField), { ssr: false })

type Resolved = DitherOptions & { pattern: NonNullable<DitherOptions["pattern"]> }

/**
 * The dither-field effect configured from SITE_DATA (see lib/site-config.ts).
 * `band` is a ruled strip with a fixed height; `fill` covers its positioned parent (card frames).
 */
export function DitherZone({
  options,
  mode = "band",
  className,
  children,
}: {
  options: Resolved
  mode?: "band" | "fill"
  className?: string
  children?: ReactNode
}) {
  const { height, ...field } = options
  const props = { ...field, "aria-hidden": children ? undefined : true }

  if (mode === "fill") {
    return <DitherField {...props} className={cn("absolute inset-0", className)}>{children}</DitherField>
  }
  return (
    <div className={cn("band-flush border-y border-foreground", className)} style={{ height }}>
      <DitherField {...props} className="h-full w-full">{children}</DitherField>
    </div>
  )
}
