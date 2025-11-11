'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NotionRenderer } from "@/components/notion-renderer";
import type { PageData, BlockWithChildren } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RenderProperties } from "@/components/notion/render-properties";


interface PageProps {
  page: PageData;
  blocks : BlockWithChildren[]
  header: boolean
}


export function Page({ page, blocks, header }: PageProps) {
  const router = useRouter();
  // console.log(page);

  // Calculate the parent path by going up one level
  const getParentPath = () => {
    const pathParts = page.path.split('/').filter(Boolean);
    if (pathParts.length === 0) return '/';
    if (pathParts.length === 1) return '/';
    return '/' + pathParts.slice(0, -1).join('/');
  };

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

          {/* Display all properties */}
          {page.properties && (
            <>
              <RenderProperties
                properties={page.properties}
                filterProperties={page.pageProperties}
                pageLayout={true}
              />
            </>
          )}

          {/* Title */}
          <div className="text-left space-y-2 top-0 bg-background pt-7 pb-4 z-10">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              {page.icon && (
                <span className="text-3xl md:text-4xl">{page.icon}</span>
              )}
              {page.title}
            </h2>
          </div>
        </header>
      )}

      {/* Content */}
      <section className="pb-4">
        {blocks && blocks.length > 0 ? (
          <div className="prose prose-lg max-w-none">
            <NotionRenderer blocks={blocks} />
          </div>
        ) : (
          <></>
        )}
      </section>

      {/* Footer Navigation */}
      {page.path !== "/" && (
        <footer className="border-t py-12">
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(getParentPath())}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {getParentPath().slice(1)}
            </Button>
          </div>
        </footer>
      )}
    </article>
  );
}
