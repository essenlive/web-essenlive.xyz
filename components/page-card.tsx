import Link from "next/link"
import { CoverImage } from "@/components/cover-image"
import { PageData } from "@/lib/notion"
import { RenderProperties } from "@/components/notion/render-properties"

interface PageCardProps {
  page: PageData;
  /** Heading level of the title: 2 under a page H1, 3 under a section H2. */
  level?: 2 | 3;
}

export function PageCard({ page, level = 3 }: PageCardProps) {
  // "Description" is shown as its own line, not folded into the mono meta line.
  const desc = page.properties?.Description;
  const summary = page.cardProperties?.includes("Description") && desc?.type === "rich_text" && desc.value
    ? String(desc.value)
    : null;
  const Heading = `h${level}` as const;
  const metaProperties = page.cardProperties?.filter((k) => k !== "Description");

  // The title link is stretched over the whole card (after:inset-0), image included.
  const title = page.disableItemLinks ? (
    page.title
  ) : (
    <Link href={page.path} prefetch={false} className="underline decoration-1 after:absolute after:inset-0 group-hover:[text-decoration-thickness:3px] group-hover:decoration-highlight focus-visible:outline-none">
      {page.title}
    </Link>
  );

  return (
    <article className="group relative flex min-w-0 flex-col has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-4 has-[a:focus-visible]:outline-foreground">
      {/* Same 4:3 frame for every card, flush with the cell; without a cover the hatch is the picture. */}
      <div className="dither relative aspect-[4/3] overflow-hidden border-b border-foreground">
        {page.cover && (
          <CoverImage
            src={page.cover.thumbnail ?? page.cover.url}
            alt=""
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <Heading className="text-title font-bold">{title}</Heading>
        {summary && <p className="m-0 line-clamp-2 text-body">{summary}</p>}
        {page.properties && (
          <RenderProperties
            properties={page.properties}
            filterProperties={metaProperties}
          />
        )}
      </div>
    </article>
  );
}
