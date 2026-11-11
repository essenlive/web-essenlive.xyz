import Link from "next/link";
import { getTexts } from "@/lib/notion";

export default function NotFound() {
  const texts = getTexts();
  return (
    <article className="mt-14">
      <header className="band border-b border-foreground pb-7">
        <h1 className="title">{texts.notFound}</h1>
      </header>
      <p className="text-meta mt-7 font-mono text-muted-foreground">{texts.error}</p>
      <p className="text-meta mt-3.5 font-mono">
        <Link href="/" className="underline">{texts.home}</Link>
      </p>
    </article>
  );
}
