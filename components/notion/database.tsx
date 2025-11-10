import { PageCard } from "@/components/page-card";
import type { PageData } from "@/lib/types";


interface DatabaseProps {
  page: PageData;
  items: PageData[];
  header: boolean;
}

export function Database({ page, items, header }: DatabaseProps) {

  return (
    <article className="mt-4">
      {/* Section Header */}
      {header && (
        <div className="text-left space-y-2 top-0 bg-background pt-7 pb-4 z-10">
          <h2 className="text-2xl md:text-3xl font-bold">{page.title}</h2>
        </div>
      )}

      {/* Grid - Client Component */}

      <div className="my-7 w-full grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <PageCard key={item.id} page={item} />
        ))}
      </div>
    </article>
  );
}
