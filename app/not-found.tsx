import Link from "next/link";

export default function NotFound() {
  return (
    <article className="mt-14">
      <header className="band border-b border-foreground pb-7">
        <h1 className="title">404</h1>
      </header>
      <p className="text-meta mt-7 font-mono text-muted-foreground">Cette page n&apos;existe pas (ou plus).</p>
      <p className="text-meta mt-3.5 font-mono">
        <Link href="/" className="underline">← accueil</Link>
      </p>
    </article>
  );
}
