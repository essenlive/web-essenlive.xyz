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
    <Link href={page.path} className="h-full">
      <Card className="h-full flex flex-col group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 pt-0">
        {/* Cover Image */}
        {page.cover && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={page.cover}
              alt={page.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent" />
          </div>
        )}

        <CardHeader className="space-y-2">
          {/* Title */}
          <CardTitle className="line-clamp-2 text-xl leading-tight group-hover:text-primary transition-colors">
            {page.icon && (
              <span className="mr-2">{page.icon}</span>
            )}
            {page.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 flex-grow">
          {/* Display all properties */}
          {page.properties && (
            <>
              <RenderProperties
                properties={page.properties}
                filterProperties={page.cardProperties}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
} 