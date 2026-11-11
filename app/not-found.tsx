import Link from "next/link";
import { getTexts, getDither } from "@/lib/notion";
import { DitherZone } from "@/components/dither-zone";

export default function NotFound() {
  const texts = getTexts();
  const dither = getDither("notFound");
  return (
    <article className="mt-14">
      <header className="band border-b border-foreground pb-7">
        <h1 className="title">{texts.notFoundTitle}</h1>
      </header>
      {dither && <DitherZone options={dither} className="border-t-0" />}
      <p className="text-meta mt-7 font-mono text-muted-foreground">{texts.notFoundMessage}</p>
      <p className="text-meta mt-3.5 font-mono">
        <Link href="/" className="underline">{texts.notFoundBack}</Link>
      </p>
    </article>
  );
}
