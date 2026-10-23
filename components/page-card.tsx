import Link from "next/link"
import Image from "next/image"
import { PageData } from "@/lib/notion"
import { RenderProperties } from "@/components/notion/render-properties"

interface PageCardProps {
  page: PageData;
}

export function PageCard({ page }: PageCardProps) {
  const title = page.disableItemLinks ? (
    page.title
  ) : (
    <Link href={page.path} className="underline decoration-1 hover:text-highlight">
      {page.title}
    </Link>
  );

  return (
    <article className="flex flex-col gap-2 min-w-0">
      {page.cover && (
        <div className="relative aspect-[4/3] overflow-hidden border border-foreground bg-muted">
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
        </div>
      )}
      <h3 className="mt-1 text-lg font-bold leading-snug">{title}</h3>
      {page.properties && (
        <RenderProperties
          properties={page.properties}
          filterProperties={page.cardProperties}
        />
      )}
    </article>
  );
}
