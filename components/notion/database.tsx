import { PageCard } from "@/components/page-card";
import type { PageData } from "@/lib/types";
import Image from "next/image";


interface DatabaseProps {
  page: PageData;
  items: PageData[];
  header: boolean;
}

export function Database({ page, items, header }: DatabaseProps) {

  return (
        <article className="mt-4">
          {header && (
            <header className="pb-0 space-y-4">
              {/* Cover Image */}
              {page.cover && (
                <div className="relative h-[50vh] rounded-lg overflow-hidden border">
                  <Image
                    src={page.cover}
                    alt={page.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
    
    
              {/* Title */}
              <div className="text-left space-y-2 top-0 bg-background z-10">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                  {page.icon && (
                    <span className="text-3xl md:text-4xl">{page.icon}</span>
                  )}
                  {page.title}
                </h2>
              </div>
            </header>
          )}

      {/* Grid - Client Component */}

      <div className="my-7 w-full grid gap-7 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {items.map((item) => (
          <PageCard key={item.id} page={item} />
        ))}
      </div>
    </article>
  );
}
