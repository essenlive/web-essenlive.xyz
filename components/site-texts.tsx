"use client"

import { createContext, useContext, type ReactNode } from "react"
import { DEFAULT_TEXTS, type SiteTexts } from "@/lib/site-config"

const Ctx = createContext<SiteTexts>(DEFAULT_TEXTS)

/** Gives client components the interface strings resolved on the server (SITE_DATA.texts). Nest one to override per section. */
export function TextsProvider({ texts, children }: { texts: SiteTexts; children: ReactNode }) {
  return <Ctx.Provider value={texts}>{children}</Ctx.Provider>
}

export const useTexts = () => useContext(Ctx)

/** Screen-reader note for links that open a new tab; usable from server components. */
export function NewTab() {
  return <span className="sr-only"> {useTexts().newTab}</span>
}
