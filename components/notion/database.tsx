import { CellGrid } from "@/components/cell-grid";
import { PageCard } from "@/components/page-card";
import { PageListItem } from "@/components/page-list-item";
import type { PageData } from "@/lib/types";
import { FilterTags, FilterProvider, SearchInput, FilterableItems } from "@/components/notion/filterable-items";
import Image from "next/image";
import { Fragment } from "react";


interface DatabaseProps {
  page: PageData;
  items: PageData[];
  header: boolean;
}

export function Database({ page, items, header }: DatabaseProps) {
  const displayType = page.displayType || "grid";
  const title = page.label ?? (header ? page.title : page.path.split("/").pop());

  const tagFilter = page.showFilter;
  const search = page.showSearch;
  const interactive = tagFilter || search;
  const Wrap = interactive ? FilterProvider : Fragment;
  // Both default to the displayed properties (cardProperties), else all.
  const propsOf = (item: PageData, names?: string[]) =>
    Object.entries(item.properties ?? {}).filter(([k]) => !(names ?? page.cardProperties) || (names ?? page.cardProperties)!.includes(k)).map(([, p]: [string, any]) => p);
  // Tags = select / multi_select / status values.
  const tagsOf = (item: PageData) =>
    propsOf(item, page.filterProperties)
      .flatMap((p) =>
        p.type === "multi_select" ? p.value.map((v: any) => v.name) : p.type === "select" || p.type === "status" ? [p.value?.name] : []
      )
      .filter(Boolean) as string[];
  // ponytail: title + string/select values; rich_text not matched
  const textOf = (item: PageData) =>
    [item.title, ...propsOf(item, page.searchProperties).map((p) =>
      Array.isArray(p.value) ? p.value.map((v: any) => v.name ?? v.plain_text ?? "").join(" ") : p.value?.name ?? (typeof p.value === "string" ? p.value : "")
    )].join(" ").toLowerCase();
  const allTags = tagFilter ? [...new Set(items.flatMap(tagsOf))].sort() : [];
  const controls = (
    <>
      {tagFilter && <FilterTags tags={allTags} />}
      {search && <SearchInput />}
    </>
  );

  return (
    <Wrap>
    <article className={header || page.showEntryCount ? "mt-7" : undefined}>
      {/* Title block (showTitle): label from the site structure, entry count on its baseline when enabled. */}
      {header ? (
        <header className="band flex flex-wrap items-baseline justify-between gap-x-7 gap-y-3.5 pb-3.5">
          <h1 className="title">{title}</h1>
          {controls}
          {page.showEntryCount && (
            <p className="text-meta m-0 font-mono text-muted-foreground">{items.length}</p>
          )}
        </header>
      ) : (
        (interactive || page.showEntryCount) && (
          <div className="mb-3.5 flex items-baseline gap-x-7">
            {controls}
            {page.showEntryCount && <p className="text-meta m-0 font-mono text-muted-foreground">{items.length}</p>}
          </div>
        )
      )}
      {header && page.cover && (
        <div className="dither relative mb-7 aspect-[3/2] max-h-[60vh] w-full overflow-hidden border border-foreground">
          <Image
            src={page.cover.url}
            alt={page.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {interactive && (
        <FilterableItems
          list={displayType !== "grid"}
          columns={page.columns}
          entries={items.map((item) => ({
            id: item.id,
            tags: tagFilter ? tagsOf(item) : [],
            text: search ? textOf(item) : "",
            node: displayType === "grid"
              ? <PageCard page={item} level={2} />
              : <PageListItem page={item} variant={displayType === "list-compact" ? "compact" : "default"} />,
          }))}
        />
      )}

      {/* Grid View */}
      {!interactive && displayType === "grid" && (
        <CellGrid count={items.length} columns={page.columns}>
          {items.map((item) => (
            <PageCard key={item.id} page={item} level={2} />
          ))}
        </CellGrid>
      )}

      {/* List views */}
      {!interactive && (displayType === "list" || displayType === "list-compact") && (
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
    </Wrap>
  );
}
