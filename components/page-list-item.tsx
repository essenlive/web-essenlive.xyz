import Link from "next/link"
import { CoverImage } from "@/components/cover-image"
import { PageData } from "@/lib/notion"
import { RenderProperties } from "@/components/notion/render-properties"
import { cn } from "@/lib/utils"

interface PageListItemProps {
  page: PageData;
  variant?: "default" | "compact";
}

export function PageListItem({ page, variant = "default" }: PageListItemProps) {
  const isCompact = variant === "compact";

  const row = page.disableItemLinks ? "" : "row";
  const title = page.disableItemLinks ? (
    <span className="hang font-semibold" data-index>{page.title}</span>
  ) : (
    <Link href={page.path} prefetch={false} data-index className="hang font-semibold underline decoration-1">
      {page.title}
    </Link>
  );

  const thumb = page.cover && (
    <div
      className={cn(
        "dither relative shrink-0 overflow-hidden border border-foreground",
        isCompact ? "h-8 w-8" : "h-24 w-32"
      )}
    >
      <CoverImage
        src={page.cover.thumbnail ?? page.cover.url}
        alt=""
        fill
        className="object-cover"
        loading="lazy"
        sizes={isCompact ? "32px" : "128px"}
      />
    </div>
  );

  const meta = page.properties && (
    <RenderProperties
      properties={page.properties}
      filterProperties={page.cardProperties}
    />
  );

  // Compact rows share the 16rem name column of the colophon table: titles left, metadata starting on one edge.
  if (isCompact) {
    return (
      <li className={cn(row, "rule-bd py-1.75 md:grid md:grid-cols-[40%_minmax(0,1fr)] md:items-baseline")}>
        <div className="flex min-w-0 items-center gap-3.5 md:pr-6">
          {thumb}
          {title}
        </div>
        {meta}
      </li>
    );
  }

  return (
    <li className={cn(row, "flex items-center gap-3.5 rule-bd py-3.5")}>
      {thumb}
      <div className="flex min-w-0 flex-1 flex-col gap-1.75">
        {title}
        {meta}
      </div>
    </li>
  );
}
