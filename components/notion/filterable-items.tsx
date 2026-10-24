"use client";

import { createContext, Fragment, useContext, useState, type ReactNode } from "react";
import { CellGrid } from "@/components/cell-grid";

export type FilterEntry = { id: string; tags: string[]; text: string; node: ReactNode };

const Ctx = createContext<{ on: string[]; toggle: (t: string) => void; q: string; setQ: (q: string) => void; clear: () => void }>({ on: [], toggle: () => {}, q: "", setQ: () => {}, clear: () => {} });

export function FilterProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const toggle = (t: string) => setOn((o) => (o.includes(t) ? o.filter((x) => x !== t) : [...o, t]));
  return <Ctx.Provider value={{ on, toggle, q, setQ, clear: () => setOn([]) }}>{children}</Ctx.Provider>;
}

export function SearchInput() {
  const { q, setQ } = useContext(Ctx);
  return (
    <input
      type="search"
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder="rechercher"
      aria-label="Rechercher dans les entrées"
      className="text-meta min-w-32 border border-foreground bg-transparent px-2 py-0.5 font-mono"
    />
  );
}

/** Toggle tags; selected tags are ORed. Plain mono text, underlined when on; "tout" clears. */
export function FilterTags({ tags }: { tags: string[] }) {
  const { on, toggle, clear } = useContext(Ctx);
  const btn = "underline-offset-[3px] decoration-1 focus-visible:outline-2 focus-visible:outline-foreground";
  return (
    <ul className="text-meta m-0 flex list-none flex-wrap gap-x-3.5 gap-y-1 p-0 font-mono">
      <li>
        <button type="button" aria-pressed={!on.length} onClick={clear} className={`${btn} aria-pressed:font-bold aria-pressed:underline`}>tout</button>
      </li>
      {tags.map((t) => (
        <li key={t}>
          <button type="button" aria-pressed={on.includes(t)} onClick={() => toggle(t)} className={`${btn} text-muted-foreground aria-pressed:font-bold aria-pressed:text-foreground aria-pressed:underline`}>
            {t}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Items pre-rendered on the server. */
export function FilterableItems({ entries, list, columns }: { entries: FilterEntry[]; list: boolean; columns?: number }) {
  const { on, q } = useContext(Ctx);
  const needle = q.trim().toLowerCase();
  const shown = entries.filter(
    (e) => (!on.length || e.tags.some((t) => on.includes(t))) && (!needle || e.text.includes(needle))
  );
  const nodes = shown.map((e) => <Fragment key={e.id}>{e.node}</Fragment>);

  return (
    <>
      <p aria-live="polite" className="text-meta m-0 mb-3.5 font-mono text-muted-foreground">
        {shown.length === 0 ? "aucun résultat" : shown.length < entries.length ? `${shown.length} sur ${entries.length}` : null}
      </p>
      {list ? (
        <ul className="index rule-t mb-7 list-none p-0">{nodes}</ul>
      ) : (
        <CellGrid count={shown.length} columns={columns}>{nodes}</CellGrid>
      )}
    </>
  );
}
