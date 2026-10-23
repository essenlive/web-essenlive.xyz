import Link from "next/link";
import { PageCard } from "@/components/page-card";
import type { PageData, PageDefinition } from "@/lib/types";

interface FeaturedProps {
  title?: string;
  source: PageDefinition;
  items: PageData[];
}

export function Featured({ title, source, items }: FeaturedProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="featured-title" className="mt-16 mb-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-foreground pb-2">
        <h2 id="featured-title" className="text-base font-bold">
          {title ?? "Sélection"}
        </h2>
        <Link href={source.path} className="text-sm underline">
          tout voir →
        </Link>
      </div>
      <div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {items.map((item) => (
          <PageCard key={item.id} page={item} />
        ))}
      </div>
    </section>
  );
}
