import { notFound, redirect } from "next/navigation";
import { copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Editor } from "./editor";

// Dev-only .env editor: edits .env.local and its variants (.env.local.<name>).
const dev = process.env.NODE_ENV === "development";
const ROOT = process.cwd();
const NAME = /^\.env\.local(\.[\w-]+)?$/;

function safe(name: string) {
  if (!dev || !NAME.test(name)) throw new Error("forbidden");
  return path.join(ROOT, name);
}

async function save(form: FormData) {
  "use server";
  const content = String(form.get("content")).replace(/\r\n/g, "\n");
  const target = String(form.get("as") || form.get("file"));
  const name = target.startsWith(".env") ? target : `.env.local.${target}`;
  await writeFile(safe(name), content);
  redirect(`/dev-env?file=${encodeURIComponent(name)}`);
}

async function activate(form: FormData) {
  "use server";
  const name = String(form.get("file"));
  await copyFile(safe(name), safe(".env.local"));
  redirect(`/dev-env?file=${encodeURIComponent(name)}`);
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  if (!dev) notFound();
  const files = (await readdir(ROOT)).filter((f) => NAME.test(f)).sort();
  const file = (await searchParams).file ?? ".env.local";
  const content = files.includes(file)
    ? await readFile(safe(file), "utf8")
    : "";

  return (
    <div className="py-8 space-y-4">
      <h1>.env (dev)</h1>
      <nav className="flex flex-wrap gap-3">
        {files.map((f) => (
          <a key={f} href={`/dev-env?file=${f}`} className={f === file ? "underline" : ""}>
            {f}
          </a>
        ))}
      </nav>
      <Editor key={file} file={file} content={content} save={save} />
      {file !== ".env.local" && (
        <form action={activate}>
          <input type="hidden" name="file" value={file} />
          <button className="border border-foreground px-3 py-1">
            Activer (copier vers .env.local)
          </button>
        </form>
      )}
      <p className="text-sm">Redémarrer le serveur dev après modification pour prendre en compte les variables.</p>
    </div>
  );
}
