"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

/** Weight of what the browser fetched for this page (document + assets), read from the Performance API. */
export function PageSize() {
  const pathname = usePathname();
  const [kb, setKb] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const doc = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      // transferSize is 0 for cache hits and cross-origin entries without CORS headers: fall back to the decoded size.
      const bytes = [...(doc ? [doc] : []), ...entries].reduce((n, e) => n + (e.transferSize || e.encodedBodySize || 0), 0);
      setKb(Math.round(bytes / 1024));
    }, 500);
    return () => clearTimeout(t);
  }, [pathname]);

  return <>{kb === null ? "… ko" : `${kb} ko`}</>;
}
