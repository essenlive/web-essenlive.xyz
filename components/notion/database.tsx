import { CellGrid } from "@/components/cell-grid";
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
  const title = page.label ?? (header ? page.title : page.path.split("/").pop());

  return (
    <article className={header || page.showEntryCount ? "mt-14" : undefined}>
      {/* Title block (showTitle): label from the site structure, entry count on its baseline when enabled. */}
      {header ? (
        <header className="band flex flex-wrap items-baseline justify-between gap-x-7 gap-y-3.5 pb-7">
          <h1 className="title">{title}</h1>
          {page.showEntryCount && (
            <p className="text-meta m-0 font-mono text-muted-foreground">{items.length}</p>
          )}
        </header>
      ) : (
        page.showEntryCount && (
          <p className="text-meta mb-3.5 font-mono text-muted-foreground">{items.length}</p>
        )
      )}
      {header && page.cover && (
        <div className="dither relative mb-7 aspect-[3/2] max-h-[60vh] w-full overflow-hidden border border-foreground">
          <Image
            src={page.cover.url}
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Grid View */}
      {displayType === "grid" && (
        <CellGrid count={items.length} columns={page.columns}>
          {items.map((item) => (
            <PageCard key={item.id} page={item} />
          ))}
        </CellGrid>
      )}

      {/* List views */}
      {(displayType === "list" || displayType === "list-compact") && (
        <ul className="index rule-t mb-7 list-none p-0">
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
