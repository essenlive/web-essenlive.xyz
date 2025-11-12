import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageData } from "@/lib/notion"
import { RenderProperties } from "@/components/notion/render-properties"

interface PageCardProps {
  page: PageData;
}

export function PageCard({ page }: PageCardProps) {

  return (
    <Link href={page.path} className="">
      <Card className="flex h-full flex-col group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 pt-0">
        {/* Cover Image */}
        {page.cover && (
          <div className="relative min-h-36 grow overflow-hidden">
            <Image
              src={page.cover}
              alt={page.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent" /> */}
          </div>
        )}

        <CardHeader>
          {/* Title */}
          <CardTitle className="my-4 line-clamp-2 text-l leading-tight group-hover:text-primary transition-colors">
            {page.icon && <span className="mr-2">{page.icon}</span>}
            {page.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-2">
          {/* Display all properties */}
          {page.properties && (
            <>
              <RenderProperties
                properties={page.properties}
                filterProperties={page.cardProperties}
                className="gap-2"
              />
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
} 