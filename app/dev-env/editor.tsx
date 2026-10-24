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

function PageEditor({ path, def, onChange, onRename, onRemove }: {
  path: string; def: Obj; onChange: (d: Obj) => void; onRename: (p: string) => void; onRemove: () => void;
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
            <Csv label="cardProperties" value={def.cardProperties} onChange={(v) => set("cardProperties", v)} />
            <Csv label="pageProperties" value={def.pageProperties} onChange={(v) => set("pageProperties", v)} />
            <Json label="filter (JSON Notion)" value={def.filter} onChange={(v) => set("filter", v)} />
            <Json label="sorts (JSON Notion)" value={def.sorts} onChange={(v) => set("sorts", v)} />
          </>
        )}
      </div>
      {def.type === "page" && (
        <div className="mt-3 space-y-3">
          {f ? (
            <fieldset className="grid gap-3 border border-foreground p-3 md:grid-cols-2">
              <legend className="px-1 text-sm">featured</legend>
              <Text label="from (chemin d'une database)" value={f.from} onChange={(v) => setF("from", v)} />
              <Text label="Titre" value={f.title} onChange={(v) => setF("title", v)} />
              <Text label="Limite" type="number" value={f.limit?.toString()} onChange={(v) => setF("limit", v ? Number(v) : undefined)} />
              <Text label="Colonnes (défaut 3)" type="number" value={f.columns?.toString()} onChange={(v) => setF("columns", v ? Number(v) : undefined)} />
              <Field label="Affichage">
                <select className={box} value={f.displayType ?? ""} onChange={(e) => setF("displayType", e.target.value || undefined)}>
                  <option value="">comme la database</option><option>grid</option><option>list</option><option>list-compact</option>
                </select>
              </Field>
              <Json label="filter" value={f.filter} onChange={(v) => setF("filter", v)} />
              <Json label="sorts" value={f.sorts} onChange={(v) => setF("sorts", v)} />
              <button type="button" className={btn} onClick={() => set("featured", undefined)}>Retirer featured</button>
            </fieldset>
          ) : (
            <button type="button" className={btn} onClick={() => set("featured", { from: "/" })}>Ajouter featured</button>
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
  const socials: Obj = data.socials ?? {};

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Text label="siteUrl" value={data.siteUrl} onChange={(v) => set("siteUrl", v)} />
        <Text label="sitename" value={data.sitename} onChange={(v) => set("sitename", v)} />
      </div>
      <fieldset className="grid gap-3 border border-foreground p-3 md:grid-cols-2">
        <legend className="px-1 text-sm">socials</legend>
        {["mail", "github", "linkedin", "instagram"].map((k) => (
          <Text key={k} label={k} value={socials[k]} onChange={(v) => set("socials", clean({ ...socials, [k]: v }))} />
        ))}
      </fieldset>
      <div className="space-y-2">
        <h3>structure</h3>
        {entries.map(([path, def], i) => (
          <PageEditor
            key={`${i}-${entries.length}`}
            path={path}
            def={def}
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

function Variable({ k, value, onChange }: { k: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  if (k === "SITE_DATA") return <SiteData value={value} onChange={onChange} />;
  if (k === "DITHER_IMAGES")
    return (
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={value === "true"} onChange={(e) => onChange(String(e.target.checked))} />
        Dithering Atkinson activé
      </label>
    );
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
              <button type="button" className="text-sm underline" onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                supprimer
              </button>
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
