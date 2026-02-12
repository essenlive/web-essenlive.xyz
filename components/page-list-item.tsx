import Link from "next/link"
import Image from "next/image"
import { PageData } from "@/lib/notion"
import { RenderProperties } from "@/components/notion/render-properties"

interface PageListItemProps {
  page: PageData;
  variant?: "default" | "compact";
}

export function PageListItem({ page, variant = "default" }: PageListItemProps) {
  const isCompact = variant === "compact";

  const listContent = isCompact ? (
    <div className="flex items-center gap-3 py-1.5 group">
      {page.cover && (
        <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded">
          <Image
            src={page.cover.url}
            placeholder={page.cover.blurDataURL ? "blur" : undefined}
            blurDataURL={page.cover.blurDataURL}
            alt={page.title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="32px"
          />
        </div>
      )}
      <span className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
        {page.icon && <span className="mr-1.5">{page.icon}</span>}
        {page.title}
      </span>
      {page.properties && (
        <RenderProperties
          properties={page.properties}
          filterProperties={page.cardProperties}
          className="gap-2 ml-auto shrink-0"
          pageLayout
        />
      )}
    </div>
  ) : (
    <div className="flex gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50 group">
      {page.cover && (
        <div className="relative w-32 h-24 shrink-0 overflow-hidden rounded-md">
          <Image
            src={page.cover.url}
            placeholder={page.cover.blurDataURL ? "blur" : undefined}
            blurDataURL={page.cover.blurDataURL}
            alt={page.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            sizes="128px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {page.icon && <span className="mr-2">{page.icon}</span>}
          {page.title}
        </h3>
        {page.properties && (
          <RenderProperties
            properties={page.properties}
            filterProperties={page.cardProperties}
            className="gap-2"
            pageLayout
          />
        )}
      </div>
    </div>
  );

  console.log(page.disableItemLinks);
  
  if (page.disableItemLinks) {
    return <div className="block">{listContent}</div>;
  }

  return (
    <Link href={page.path} className="block">
      {listContent}
    </Link>
  );
}


