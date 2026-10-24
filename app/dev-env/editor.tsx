"use client";

import { useState } from "react";

type Line = { raw: string } | { key: string; value: string; quote: string };
type Obj = Record<string, any>;

const box = "border border-foreground bg-background px-2 py-1 w-full";
const btn = "border border-foreground px-3 py-1";

function parse(content: string): Line[] {
  return content.split("\n").map((raw) => {
    const m = raw.match(/^([A-Za-z_][\w]*)=(.*)$/);
    if (!m) return { raw };
    const q = m[2].match(/^(["'])(.*)\1$/);
    return { key: m[1], value: q ? q[2] : m[2], quote: q ? q[1] : "" };
  });
}

const serialize = (lines: Line[]) =>
  lines
    .map((l) => ("raw" in l ? l.raw : `${l.key}=${l.quote}${l.value.replace(/\n/g, "")}${l.quote}`))
    .join("\n");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm">{label}</span>
      {children}
    </label>
  );
}

function Text({ label, value, onChange, type = "text" }: {
  label: string; value?: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <Field label={label}>
      <input type={type} className={box} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

// Keeps its own text so partial input (trailing comma, half-typed JSON) isn't rewritten.
function Lazy<T>({ label, value, onChange, toText, fromText, rows }: {
  label: string; value: T; onChange: (v: T) => void;
  toText: (v: T) => string; fromText: (s: string) => T; rows?: number;
}) {
  const [text, setText] = useState(toText(value));
  const [bad, setBad] = useState(false);
  const change = (s: string) => {
    setText(s);
    try { onChange(fromText(s)); setBad(false); } catch { setBad(true); }
  };
  return (
    <Field label={label + (bad ? " — JSON invalide" : "")}>
      {rows ? (
        <textarea rows={rows} spellCheck={false} className={`${box} font-mono text-sm ${bad ? "border-red-600" : ""}`} value={text} onChange={(e) => change(e.target.value)} />
      ) : (
        <input className={box} value={text} onChange={(e) => change(e.target.value)} />
      )}
    </Field>
  );
}

const Csv = (p: { label: string; value?: string[]; onChange: (v: string[] | undefined) => void }) => (
  <Lazy<string[] | undefined>
    label={`${p.label} (séparées par des virgules)`}
    value={p.value}
    onChange={p.onChange}
    toText={(v) => (v ?? []).join(", ")}
    fromText={(s) => { const a = s.split(",").map((x) => x.trim()).filter(Boolean); return a.length ? a : undefined; }}
  />
);

const Json = (p: { label: string; value?: unknown; onChange: (v: any) => void }) => (
  <Lazy<unknown>
    label={p.label}
    value={p.value}
    rows={4}
    onChange={p.onChange}
    toText={(v) => (v === undefined ? "" : JSON.stringify(v, null, 2))}
    fromText={(s) => (s.trim() ? JSON.parse(s) : undefined)}
  />
);

const clean = (o: Obj) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ""));

// --- Notion filter / sorts builders -------------------------------------------------
// Handles flat conditions (one level of and/or); anything else stays editable as raw JSON.

type Cond = { property: string; type: string; op: string; value: any };

const TEXT_OPS = ["equals", "does_not_equal", "contains", "does_not_contain", "starts_with", "ends_with", "is_empty", "is_not_empty"];
const NUM_OPS = ["equals", "does_not_equal", "greater_than", "less_than", "greater_than_or_equal_to", "less_than_or_equal_to", "is_empty", "is_not_empty"];
const PICK_OPS = ["equals", "does_not_equal", "is_empty", "is_not_empty"];
const DATE_OPS = ["equals", "before", "after", "on_or_before", "on_or_after", "past_week", "past_month", "past_year", "this_week", "next_week", "next_month", "next_year", "is_empty", "is_not_empty"];
const OPS: Record<string, string[]> = {
  title: TEXT_OPS, rich_text: TEXT_OPS, url: TEXT_OPS, email: TEXT_OPS, phone_number: TEXT_OPS,
  number: NUM_OPS, checkbox: ["equals", "does_not_equal"],
  select: PICK_OPS, status: PICK_OPS, multi_select: ["contains", "does_not_contain", "is_empty", "is_not_empty"],
  date: DATE_OPS, created_time: DATE_OPS, last_edited_time: DATE_OPS,
};
const TIMESTAMPS = ["created_time", "last_edited_time"];

// "none": no value input (is_empty → true, relative dates → {})
const kind = (c: Cond) =>
  /^(is_|past_|this_|next_)/.test(c.op) ? "none" : c.type === "checkbox" ? "bool" : c.type === "number" ? "num" : "text";

const condToNotion = (c: Cond) => {
  const v = kind(c) === "none" ? (c.op.startsWith("is_") ? true : {}) : c.value;
  const body = { [c.type]: { [c.op]: v } };
  return TIMESTAMPS.includes(c.type) ? { timestamp: c.type, ...body } : { property: c.property, ...body };
};

function condFromNotion(f: any): Cond | null {
  if (!f || typeof f !== "object") return null;
  const { property, timestamp, ...rest } = f;
  const keys = Object.keys(rest);
  if (keys.length !== 1) return null;
  const type = keys[0], body = rest[type];
  if (!OPS[type] || (timestamp ? timestamp !== type : typeof property !== "string")) return null;
  if (!body || typeof body !== "object" || Object.keys(body).length !== 1) return null;
  const op = Object.keys(body)[0];
  return OPS[type].includes(op) ? { property: property ?? "", type, op, value: body[op] } : null;
}

function parseFilter(v: any): { join: "and" | "or"; conds: Cond[] } | null {
  if (v == null || (typeof v === "object" && Object.keys(v).length === 0)) return { join: "and", conds: [] };
  const join = Object.keys(v).length === 1 && (Array.isArray(v.and) ? "and" : Array.isArray(v.or) ? "or" : null);
  const list = join ? v[join] : [v];
  const conds = list.map(condFromNotion);
  return conds.some((c: Cond | null) => !c) ? null : { join: join || "and", conds };
}

const emitFilter = (join: string, conds: Cond[]) =>
  conds.length === 0 ? undefined : conds.length === 1 ? condToNotion(conds[0]) : { [join]: conds.map(condToNotion) };

type Sort = { key: string; direction: string };

function parseSorts(v: any): Sort[] | null {
  if (v == null) return [];
  if (!Array.isArray(v)) return null;
  const out: (Sort | null)[] = v.map((x) => {
    const ok = x && typeof x === "object" && Object.keys(x).length === 2 && (x.direction === "ascending" || x.direction === "descending");
    if (ok && typeof x.property === "string") return { key: x.property, direction: x.direction };
    if (ok && TIMESTAMPS.includes(x.timestamp)) return { key: `@${x.timestamp}`, direction: x.direction };
    return null;
  });
  return out.some((x) => !x) ? null : (out as Sort[]);
}

const emitSorts = (sorts: Sort[]) =>
  sorts.length
    ? sorts.map((x) => (x.key.startsWith("@") ? { timestamp: x.key.slice(1), direction: x.direction } : { property: x.key, direction: x.direction }))
    : undefined;

const sel = `${box} w-auto`;

function FilterBuilder({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const { join, conds } = parseFilter(value)!;
  const emit = (c: Cond[], j = join) => onChange(emitFilter(j, c));
  const patch = (i: number, p: Partial<Cond>) => emit(conds.map((c, j) => (j === i ? { ...c, ...p } : c)));
  return (
    <div className="space-y-2">
      {conds.map((c, i) => (
        <div key={`${i}-${conds.length}`} className="flex flex-wrap items-center gap-2">
          {i > 0 && (
            i === 1
              ? <select className={sel} value={join} onChange={(e) => emit(conds, e.target.value as "and" | "or")}><option value="and">ET</option><option value="or">OU</option></select>
              : <span className="w-12 text-sm">{join === "and" ? "ET" : "OU"}</span>
          )}
          {TIMESTAMPS.includes(c.type) ? (
            <span className="text-sm">{c.type}</span>
          ) : (
            <input className={`${box} w-40`} placeholder="Propriété" aria-label="Propriété" value={c.property} onChange={(e) => patch(i, { property: e.target.value })} />
          )}
          <select className={sel} aria-label="Type" value={c.type} onChange={(e) => {
            const type = e.target.value;
            patch(i, { type, op: OPS[type][0], value: type === "checkbox" ? true : "" });
          }}>
            {Object.keys(OPS).map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className={sel} aria-label="Opérateur" value={c.op} onChange={(e) => {
            const next = { ...c, op: e.target.value };
            patch(i, { op: next.op, value: kind(next) === kind(c) ? c.value : kind(next) === "bool" ? true : "" });
          }}>
            {OPS[c.type].map((o) => <option key={o}>{o}</option>)}
          </select>
          {kind(c) === "bool" && (
            <select className={sel} aria-label="Valeur" value={String(c.value)} onChange={(e) => patch(i, { value: e.target.value === "true" })}>
              <option value="true">true</option><option value="false">false</option>
            </select>
          )}
          {kind(c) === "num" && <input type="number" className={`${box} w-32`} aria-label="Valeur" value={c.value ?? ""} onChange={(e) => patch(i, { value: e.target.value === "" ? "" : Number(e.target.value) })} />}
          {kind(c) === "text" && (
            <input
              className={`${box} w-48`}
              aria-label="Valeur"
              placeholder={c.type === "date" || TIMESTAMPS.includes(c.type) ? "2025-01-31" : "Valeur"}
              value={c.value ?? ""}
              onChange={(e) => patch(i, { value: e.target.value })}
            />
          )}
          <button type="button" className={btn} aria-label="Supprimer la condition" onClick={() => emit(conds.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <button type="button" className={btn} onClick={() => emit([...conds, { property: "", type: "checkbox", op: "equals", value: true }])}>+ Condition</button>
    </div>
  );
}

function SortsBuilder({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const sorts = parseSorts(value)!;
  const emit = (n: Sort[]) => onChange(emitSorts(n));
  const patch = (i: number, p: Partial<Sort>) => emit(sorts.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, d: number) => {
    const n = [...sorts];
    [n[i], n[i + d]] = [n[i + d], n[i]];
    emit(n);
  };
  return (
    <div className="space-y-2">
      {sorts.map((x, i) => (
        <div key={`${i}-${sorts.length}`} className="flex flex-wrap items-center gap-2">
          <span className="w-12 text-sm">{i === 0 ? "Trier" : "puis"}</span>
          {x.key.startsWith("@") ? (
            <span className="text-sm">{x.key.slice(1)}</span>
          ) : (
            <input className={`${box} w-40`} placeholder="Propriété" aria-label="Propriété" value={x.key} onChange={(e) => patch(i, { key: e.target.value })} />
          )}
          <select className={sel} aria-label="Source" value={x.key.startsWith("@") ? x.key : ""} onChange={(e) => patch(i, { key: e.target.value || "" })}>
            <option value="">propriété</option>
            {TIMESTAMPS.map((t) => <option key={t} value={`@${t}`}>{t}</option>)}
          </select>
          <select className={sel} aria-label="Sens" value={x.direction} onChange={(e) => patch(i, { direction: e.target.value })}>
            <option value="ascending">croissant</option><option value="descending">décroissant</option>
          </select>
          <button type="button" className={btn} disabled={i === 0} aria-label="Monter" onClick={() => move(i, -1)}>↑</button>
          <button type="button" className={btn} disabled={i === sorts.length - 1} aria-label="Descendre" onClick={() => move(i, 1)}>↓</button>
          <button type="button" className={btn} aria-label="Supprimer le tri" onClick={() => emit(sorts.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <button type="button" className={btn} onClick={() => emit([...sorts, { key: "", direction: "descending" }])}>+ Tri</button>
    </div>
  );
}

// Visual builder when the value is representable, raw JSON otherwise (or on demand).
function Query({ label, value, onChange, parsable, Builder }: {
  label: string; value: any; onChange: (v: any) => void; parsable: boolean;
  Builder: (p: { value: any; onChange: (v: any) => void }) => React.ReactNode;
}) {
  const [raw, setRaw] = useState(!parsable);
  const rawMode = raw || !parsable;
  return (
    <fieldset className="space-y-2 border border-foreground p-3 md:col-span-2">
      <legend className="px-1 text-sm">{label}</legend>
      {rawMode ? <Json label={parsable ? "JSON Notion" : "JSON Notion (structure non éditable visuellement)"} value={value} onChange={onChange} /> : <Builder value={value} onChange={onChange} />}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={rawMode} disabled={!parsable} onChange={(e) => setRaw(e.target.checked)} />
        JSON brut
      </label>
    </fieldset>
  );
}

const Filter = (p: { label: string; value: any; onChange: (v: any) => void }) => (
  <Query {...p} parsable={parseFilter(p.value) !== null} Builder={FilterBuilder} />
);
const Sorts = (p: { label: string; value: any; onChange: (v: any) => void }) => (
  <Query {...p} parsable={parseSorts(p.value) !== null} Builder={SortsBuilder} />
);

function PageEditor({ path, def, databases, onChange, onRename, onRemove }: {
  path: string; def: Obj; databases: string[]; onChange: (d: Obj) => void; onRename: (p: string) => void; onRemove: () => void;
}) {
  const set = (k: string, v: unknown) => onChange(clean({ ...def, [k]: v }));
  const f = def.featured as Obj | undefined;
  const setF = (k: string, v: unknown) => set("featured", clean({ ...f, [k]: v }));
  return (
    <details className="border border-foreground p-3" open={path === "/"}>
      <summary className="cursor-pointer">{path || "(sans chemin)"} — {def.type}{def.label ? ` « ${def.label} »` : ""}</summary>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Text label="Chemin" value={path} onChange={onRename} />
        <Field label="Type">
          <select className={box} value={def.type} onChange={(e) => set("type", e.target.value)}>
            <option>page</option><option>database</option>
          </select>
        </Field>
        <Text label="ID Notion" value={def.id} onChange={(v) => set("id", v)} />
        <Text label="Label de navigation" value={def.label} onChange={(v) => set("label", v)} />
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" checked={!!def.showTitle} onChange={(e) => set("showTitle", e.target.checked || undefined)} />
          Afficher le titre
        </label>
        {def.type === "database" && (
          <>
            <Field label="Affichage">
              <select className={box} value={def.displayType ?? ""} onChange={(e) => set("displayType", e.target.value || undefined)}>
                <option value="">grid (défaut)</option><option>grid</option><option>list</option><option>list-compact</option>
              </select>
            </Field>
            <Text label="Colonnes (grid, dès lg, défaut 3)" type="number" value={def.columns?.toString()} onChange={(v) => set("columns", v ? Number(v) : undefined)} />
            <label className="flex items-center gap-2 self-end">
              <input type="checkbox" checked={!!def.disableItemLinks} onChange={(e) => set("disableItemLinks", e.target.checked || undefined)} />
              Désactiver les liens des items
            </label>
            <label className="flex items-center gap-2 self-end">
              <input type="checkbox" checked={!!def.showEntryCount} onChange={(e) => set("showEntryCount", e.target.checked || undefined)} />
              Afficher le nombre d'entrées
            </label>
            <label className="flex items-center gap-2 self-end">
              <input type="checkbox" checked={!!def.showFilter} onChange={(e) => set("showFilter", e.target.checked || undefined)} />
              Barre de filtre
            </label>
            <label className="flex items-center gap-2 self-end">
              <input type="checkbox" checked={!!def.showSearch} onChange={(e) => set("showSearch", e.target.checked || undefined)} />
              Barre de recherche
            </label>
            <Csv label="filterProperties (tags du filtre, défaut cardProperties)" value={def.filterProperties} onChange={(v) => set("filterProperties", v)} />
            <Csv label="searchProperties (recherche, défaut cardProperties)" value={def.searchProperties} onChange={(v) => set("searchProperties", v)} />
            <Csv label="cardProperties" value={def.cardProperties} onChange={(v) => set("cardProperties", v)} />
            <Csv label="pageProperties" value={def.pageProperties} onChange={(v) => set("pageProperties", v)} />
            <Filter label="filter" value={def.filter} onChange={(v) => set("filter", v)} />
            <Sorts label="sorts" value={def.sorts} onChange={(v) => set("sorts", v)} />
          </>
        )}
      </div>
      {def.type === "page" && (
        <div className="mt-3 space-y-3">
          {f ? (
            <fieldset className="grid gap-3 border border-foreground p-3 md:grid-cols-2">
              <legend className="px-1 text-sm">featured</legend>
              <Field label={!f.from || databases.includes(f.from) ? "Section" : "Section — introuvable dans la structure"}>
                <select className={box} value={f.from ?? ""} onChange={(e) => setF("from", e.target.value)}>
                  <option value="" disabled>choisir…</option>
                  {f.from && !databases.includes(f.from) && <option value={f.from}>{f.from} (introuvable)</option>}
                  {databases.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Text label="Titre" value={f.title} onChange={(v) => setF("title", v)} />
              <Text label="Limite" type="number" value={f.limit?.toString()} onChange={(v) => setF("limit", v ? Number(v) : undefined)} />
              <Text label="Colonnes (défaut 3)" type="number" value={f.columns?.toString()} onChange={(v) => setF("columns", v ? Number(v) : undefined)} />
              <Field label="Affichage">
                <select className={box} value={f.displayType ?? ""} onChange={(e) => setF("displayType", e.target.value || undefined)}>
                  <option value="">comme la section (ou grid)</option><option>grid</option><option>list</option><option>list-compact</option>
                </select>
              </Field>
              <Csv label="cardProperties (remplace celles de la section)" value={f.cardProperties} onChange={(v) => setF("cardProperties", v)} />
              <Filter label="filter (ET avec celui de la section)" value={f.filter} onChange={(v) => setF("filter", v)} />
              <Sorts label="sorts (remplacent ceux de la section)" value={f.sorts} onChange={(v) => setF("sorts", v)} />
              <button type="button" className={btn} onClick={() => set("featured", undefined)}>Retirer featured</button>
            </fieldset>
          ) : (
            <button type="button" className={btn} onClick={() => set("featured", { from: databases[0] ?? "" })}>Ajouter featured</button>
          )}
        </div>
      )}
      <button type="button" className={`${btn} mt-3`} onClick={onRemove}>Supprimer cette page</button>
    </details>
  );
}

function SiteData({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  let data: Obj;
  try { data = JSON.parse(value); } catch { data = null as never; }
  if (!data || typeof data !== "object")
    return <Json label="SITE_DATA (JSON illisible, édition brute)" value={undefined} onChange={(v) => onChange(JSON.stringify(v))} />;

  const emit = (d: Obj) => onChange(JSON.stringify(d));
  const set = (k: string, v: unknown) => emit(clean({ ...data, [k]: v }));
  const structure: Obj = data.structure ?? {};
  const entries = Object.entries(structure);
  const setStructure = (e: [string, Obj][]) => set("structure", Object.fromEntries(e));
  const socials: Obj[] = Array.isArray(data.socials) ? data.socials : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Text label="siteUrl" value={data.siteUrl} onChange={(v) => set("siteUrl", v)} />
        <Text label="sitename" value={data.sitename} onChange={(v) => set("sitename", v)} />
      </div>
      <fieldset className="space-y-2 border border-foreground p-3">
        <legend className="px-1 text-sm">socials</legend>
        {socials.map((l, i) => {
          const setS = (n: Obj[]) => set("socials", n.length ? n : undefined);
          return (
            <div key={`${i}-${socials.length}`} className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
              <Text label="Titre" value={l.title} onChange={(v) => setS(socials.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
              <Text label="URL ou email" value={l.url} onChange={(v) => setS(socials.map((x, j) => (j === i ? { ...x, url: v } : x)))} />
              <button type="button" className={btn} onClick={() => setS(socials.filter((_, j) => j !== i))}>Supprimer</button>
            </div>
          );
        })}
        <button type="button" className={btn} onClick={() => set("socials", [...socials, { title: "", url: "" }])}>+ Ajouter un lien</button>
      </fieldset>
      <div className="space-y-2">
        <h3>structure</h3>
        {entries.map(([path, def], i) => (
          <PageEditor
            key={`${i}-${entries.length}`}
            path={path}
            def={def}
            databases={entries.filter(([, d]) => d.type === "database").map(([p]) => p)}
            onChange={(d) => setStructure(entries.map((e, j) => (j === i ? [path, d] : e)))}
            onRename={(p) => setStructure(entries.map((e, j) => (j === i ? [p, def] : e)))}
            onRemove={() => setStructure(entries.filter((_, j) => j !== i))}
          />
        ))}
        <button type="button" className={btn} onClick={() => setStructure([...entries, [`/nouvelle-page-${entries.length}`, { type: "page", id: "" }]])}>
          + Ajouter une page
        </button>
      </div>
    </div>
  );
}

function Copy({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="text-sm underline"
      onClick={() => navigator.clipboard.writeText(value).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })}
    >
      {done ? "copié" : "copier"}
    </button>
  );
}

function Variable({ k, value, onChange }: { k: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  if (k === "SITE_DATA") return <SiteData value={value} onChange={onChange} />;
  if (k === "IMAGES_PROCESS") {
    let cur: Record<string, string> = {};
    try { cur = JSON.parse(value || "{}"); } catch { /* keep defaults */ }
    const slot = (name: "thumbnail" | "hero", label: string) => (
      <label className="flex items-center gap-2">
        <span className="w-24">{label}</span>
        <select className={box} value={cur[name] ?? "webp"} onChange={(e) => onChange(JSON.stringify({ thumbnail: cur.thumbnail ?? "webp", hero: cur.hero ?? "webp", [name]: e.target.value }))}>
          <option value="webp">WebP simple</option>
          <option value="dithering">Dithering Atkinson, 16 couleurs</option>
          <option value="duotone">Duotone, 2 couleurs de l&apos;image</option>
        </select>
      </label>
    );
    return (
      <div className="flex flex-col gap-2">
        {slot("thumbnail", "Vignettes (480px)")}
        {slot("hero", "Hero (840px)")}
      </div>
    );
  }
  if (k === "NOTION_SECRET")
    return (
      <div className="flex gap-2">
        <input type={show ? "text" : "password"} className={`${box} font-mono`} value={value} onChange={(e) => onChange(e.target.value)} />
        <button type="button" className={btn} onClick={() => setShow(!show)}>{show ? "Cacher" : "Voir"}</button>
      </div>
    );
  return <input className={box} value={value} onChange={(e) => onChange(e.target.value)} type={k.includes("URL") ? "url" : "text"} />;
}

export function Editor({ file, content, save }: { file: string; content: string; save: (f: FormData) => void }) {
  const [lines, setLines] = useState(() => parse(content));
  const [newKey, setNewKey] = useState("");
  const update = (i: number, value: string) =>
    setLines(lines.map((l, j) => (j === i && "key" in l ? { ...l, value } : l)));

  return (
    <form action={save} className="space-y-6">
      <input type="hidden" name="file" value={file} />
      <textarea hidden readOnly name="content" value={serialize(lines)} />
      {lines.map((l, i) =>
        "key" in l ? (
          <section key={i} className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h2 className="font-mono">{l.key}</h2>
              <span className="flex gap-3">
                <Copy value={l.value} />
                <button type="button" className="text-sm underline" onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                  supprimer
                </button>
              </span>
            </div>
            <Variable k={l.key} value={l.value} onChange={(v) => update(i, v)} />
          </section>
        ) : null,
      )}
      <div className="flex gap-2">
        <input className={box} placeholder="NOUVELLE_VARIABLE" value={newKey} onChange={(e) => setNewKey(e.target.value.toUpperCase())} />
        <button
          type="button"
          className={btn}
          disabled={!/^[A-Z_][A-Z0-9_]*$/.test(newKey)}
          onClick={() => { setLines([...lines, { key: newKey, value: "", quote: "" }]); setNewKey(""); }}
        >
          Ajouter
        </button>
      </div>
      <details>
        <summary className="cursor-pointer text-sm">Aperçu du fichier</summary>
        <div className="my-1"><Copy value={serialize(lines)} /></div>
        <pre className="overflow-x-auto border border-foreground p-2 text-xs">{serialize(lines)}</pre>
      </details>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={btn}>Enregistrer {file}</button>
        <input name="as" placeholder="nouveau nom (ex: blog)" className={`${box} w-auto`} />
        <button type="submit" className={btn}>Enregistrer sous .env.local.&lt;nom&gt;</button>
      </div>
    </form>
  );
}
