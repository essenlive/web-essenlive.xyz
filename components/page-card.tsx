import Link from "next/link"
import Image from "next/image"
import { PageData } from "@/lib/notion"
import { RenderProperties } from "@/components/notion/render-properties"
import { cn } from "@/lib/utils"

interface PageCardProps {
  page: PageData;
  /** Full-column card; the image keeps its own ratio instead of a 4:3 crop. */
  lead?: boolean;
}

export function PageCard({ page, lead = false }: PageCardProps) {
  const leadImage = lead && page.cover?.width && page.cover?.height ? page.cover : null;
  // "Description" is shown as its own line, not folded into the mono meta line.
  const desc = page.properties?.Description;
  const summary = page.cardProperties?.includes("Description") && desc?.type === "rich_text" && desc.value
    ? String(desc.value)
    : null;
  const metaProperties = page.cardProperties?.filter((k) => k !== "Description");

  // The title link is stretched over the whole card (after:inset-0), image included.
  const title = page.disableItemLinks ? (
    page.title
  ) : (
    <Link href={page.path} className="underline decoration-1 after:absolute after:inset-0 focus-visible:outline-none">
      {page.title}
    </Link>
  );

  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col gap-2 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-foreground",
        leadImage && "sm:col-span-2",
        !page.cover && "border-t border-foreground pt-3"
      )}
    >
      {page.cover && (
        <div className="relative overflow-hidden border border-foreground bg-muted" style={leadImage ? undefined : { aspectRatio: "4 / 3" }}>
          {leadImage ? (
            <Image
              src={leadImage.url}
              placeholder={leadImage.blurDataURL ? "blur" : undefined}
              blurDataURL={leadImage.blurDataURL}
              alt=""
              width={leadImage.width!}
              height={leadImage.height!}
              className="h-auto w-full"
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          ) : (
            <Image
              src={page.cover.url}
              placeholder={page.cover.blurDataURL ? "blur" : undefined}
              blurDataURL={page.cover.blurDataURL}
              alt=""
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, 360px"
            />
          )}
        </div>
      )}
      <h3 className="mt-1 text-lg font-bold leading-snug group-hover:text-highlight">{title}</h3>
      {summary && <p className="m-0 line-clamp-2 text-base leading-snug">{summary}</p>}
      {page.properties && (
        <RenderProperties
          properties={page.properties}
          filterProperties={metaProperties}
        />
      )}
    </article>
  );
}
