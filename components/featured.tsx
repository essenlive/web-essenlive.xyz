import Link from "next/link";
import { PageCard } from "@/components/page-card";
import { PageListItem } from "@/components/page-list-item";
import type { PageData, PageDefinition } from "@/lib/types";

interface FeaturedProps {
  title?: string;
  source: PageDefinition;
  items: PageData[];
}

export function Featured({ title, source, items }: FeaturedProps) {
  if (items.length === 0) return null;
  const covered = items.filter((item) => item.cover);
  const plain = items.filter((item) => !item.cover);

  return (
    <section aria-labelledby="featured-title" className="mt-16 mb-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-foreground pb-2">
        <h2 id="featured-title" className="text-lg font-bold">
          {title ?? "Sélection"}
        </h2>
        <Link href={source.path} className="-my-2 inline-block py-2 underline">
          tout voir →<span className="sr-only"> : {title ?? "Sélection"}</span>
        </Link>
      </div>
      {covered.length > 0 && (
        <div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {covered.map((item, i) => (
            <PageCard key={item.id} page={item} lead={i === 0 && covered.length > 1} />
          ))}
        </div>
      )}
      {/* Imageless items would leave holes in the grid: a ruled list closes the section instead. */}
      {plain.length > 0 && (
        <ul className="m-0 mt-8 list-none border-t border-foreground p-0">
          {plain.map((item) => (
            <PageListItem key={item.id} page={item} variant="compact" />
          ))}
        </ul>
      )}
    </section>
  );
}
