"use client"

import { useState } from "react"
import { redeploy } from "@/lib/redeploy"

/** Secret button: the footer build date triggers a Netlify rebuild to pick up Notion changes. */
export function RedeployButton({ date }: { date: string }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "error">("idle");

  async function onClick() {
    if (!confirm("Relancer le déploiement ?")) return;
    setState("busy");
    setState((await redeploy()) ? "ok" : "error");
  }

  return (
    <button type="button" onClick={onClick} disabled={state === "busy"} className="cursor-default">
      {state === "ok" ? "déploiement lancé" : state === "error" ? "échec" : `généré le ${date}`}
    </button>
  );
}
