import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { PageData } from "@/lib/notion";

interface PageCardProps {
  page: PageData;
}

export function PageCard({ page }: PageCardProps) {
  
  const formattedDate = formatDistanceToNow(new Date(page.created_time), {
    addSuffix: true,
  });

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 pt-0">
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

      <CardHeader className="space-y-4">
        {/* Tags */}
        {/* {page.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {page.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
            {page.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{page.tags.length - 2}
              </Badge>
            )}
          </div>
        )} */}

        {/* Title */}
        <CardTitle className="line-clamp-2 text-xl leading-tight group-hover:text-primary transition-colors">
          <Link href={page.path} className="hover:underline">
            {page.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </CardContent>
    </Card>
  );
} 