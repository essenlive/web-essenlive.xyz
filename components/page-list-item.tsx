import Link from "next/link"
import Image from "next/image"
import { PageData } from "@/lib/notion"
import { RenderProperties } from "@/components/notion/render-properties"

interface PageListItemProps {
  page: PageData;
}

export function PageListItem({ page }: PageListItemProps) {
  const listContent = (
    <div className="flex gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-300 hover:border-primary/50 group">
      {/* Cover Image */}
      {page.cover && (
        <div className="relative w-32 h-24 shrink-0 overflow-hidden rounded-md">
          <Image
            src={page.cover}
            alt={page.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            sizes="128px"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {/* Title */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {page.icon && <span className="mr-2">{page.icon}</span>}
          {page.title}
        </h3>

        {/* Properties */}
        {page.properties && (
          <RenderProperties
            properties={page.properties}
            filterProperties={page.cardProperties}
            className="gap-2"
          />
        )}
      </div>
    </div>
  );

  if (page.disableItemLinks) {
    return <div className="block">{listContent}</div>;
  }

  return (
    <Link href={page.path} className="block">
      {listContent}
    </Link>
  );
}
