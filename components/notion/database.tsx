import { PageCard } from "@/components/page-card";
import { PageListItem } from "@/components/page-list-item";
import type { PageData } from "@/lib/types";
import Image from "next/image";


interface DatabaseProps {
  page: PageData;
  items: PageData[];
  header: boolean;
}

export function Database({ page, items, header }: DatabaseProps) {
  const displayType = page.displayType || "grid";

  return (
    <article className="mt-10">
      {header && (
        <header className="mb-8 space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">{page.title}</h1>
          {page.cover && (
            <div className="relative h-[40vh] overflow-hidden border border-foreground bg-muted">
              <Image
                src={page.cover.url}
                placeholder={page.cover.blurDataURL ? "blur" : undefined}
                blurDataURL={page.cover.blurDataURL}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>
      )}

      {/* Grid View */}
      {displayType === "grid" && (
        <div className="my-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <PageCard key={item.id} page={item} />
          ))}
        </div>
      )}

      {/* List views */}
      {(displayType === "list" || displayType === "list-compact") && (
        <ul className="my-8 list-none border-t border-foreground p-0">
          {items.map((item) => (
            <PageListItem
              key={item.id}
              page={item}
              variant={displayType === "list-compact" ? "compact" : "default"}
            />
          ))}
        </ul>
      )}
    </article>
  );
}
