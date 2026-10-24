import Link from "next/link";
import { CellGrid } from "@/components/cell-grid";
import { PageCard } from "@/components/page-card";
import { PageListItem } from "@/components/page-list-item";
import type { PageData, PageDefinition } from "@/lib/types";

interface FeaturedProps {
  title?: string;
  source: PageDefinition;
  items: PageData[];
  displayType?: PageDefinition["displayType"];
  columns?: number;
}

export function Featured({ title, source, items, displayType, columns }: FeaturedProps) {
  if (items.length === 0) return null;
  const type = displayType ?? source.displayType ?? "grid";

  return (
    <section aria-labelledby="featured-title" className="mt-7">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="featured-title" className="text-title font-bold">
          {title ?? "Sélection"}
        </h2>
        <Link href={source.path} className="relative underline after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']">
          tout voir →<span className="sr-only"> : {title ?? "Sélection"}</span>
        </Link>
      </div>
      {type === "grid" ? (
        <CellGrid count={items.length} columns={columns}>
          {items.map((item) => (
            <PageCard key={item.id} page={item} />
          ))}
        </CellGrid>
      ) : (
        <ul className="index rule-t m-0 mb-7 list-none p-0">
          {items.map((item) => (
            <PageListItem key={item.id} page={item} variant={type === "list-compact" ? "compact" : "default"} />
          ))}
        </ul>
      )}
    </section>
  );
}
