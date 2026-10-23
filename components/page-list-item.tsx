import Link from "next/link"
import Image from "next/image"
import { PageData } from "@/lib/notion"
import { RenderProperties } from "@/components/notion/render-properties"
import { cn } from "@/lib/utils"

interface PageListItemProps {
  page: PageData;
  variant?: "default" | "compact";
}

export function PageListItem({ page, variant = "default" }: PageListItemProps) {
  const isCompact = variant === "compact";

  const title = page.disableItemLinks ? (
    <span className="font-semibold">{page.title}</span>
  ) : (
    <Link href={page.path} className="font-semibold underline decoration-1 hover:text-highlight">
      {page.title}
    </Link>
  );

  return (
    <li
      className={cn(
        "flex items-center border-b border-border",
        isCompact ? "gap-3 py-2.5" : "gap-4 py-4"
      )}
    >
      {page.cover && (
        <div
          className={cn(
            "relative shrink-0 overflow-hidden border border-foreground bg-muted",
            isCompact ? "h-8 w-8" : "h-24 w-32"
          )}
        >
          <Image
            src={page.cover.url}
            placeholder={page.cover.blurDataURL ? "blur" : undefined}
            blurDataURL={page.cover.blurDataURL}
            alt=""
            fill
            className="object-cover"
            loading="lazy"
            sizes={isCompact ? "32px" : "128px"}
          />
        </div>
      )}
      <div
        className={cn(
          "flex min-w-0 flex-1",
          isCompact
            ? "flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5"
            : "flex-col gap-1"
        )}
      >
        {title}
        {page.properties && (
          <RenderProperties
            properties={page.properties}
            filterProperties={page.cardProperties}
          />
        )}
      </div>
    </li>
  );
}
