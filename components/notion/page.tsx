'use client'
import Image from "next/image";
import Link from "next/link";
import { NotionRenderer } from "@/components/notion-renderer";
import type { PageData, BlockWithChildren } from "@/lib/types";
import { RenderProperties } from "@/components/notion/render-properties";


interface PageProps {
  page: PageData;
  blocks : BlockWithChildren[]
  header: boolean
}


export function Page({ page, blocks, header }: PageProps) {
  // Parent path, one level up
  const getParentPath = () => {
    const pathParts = page.path.split('/').filter(Boolean);
    if (pathParts.length <= 1) return '/';
    return '/' + pathParts.slice(0, -1).join('/');
  };
  const parentPath = getParentPath();

  return (
    <article className="mt-10">
      {header && (
        <header className="mb-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">{page.title}</h1>

          {page.properties && (
            <RenderProperties
              properties={page.properties}
              filterProperties={page.pageProperties}
              pageLayout={true}
            />
          )}

          {page.cover && (
            <div className="relative h-[50vh] overflow-hidden border border-foreground bg-muted">
              <Image
                src={page.cover.url}
                alt=""
                placeholder={page.cover.blurDataURL ? "blur" : undefined}
                blurDataURL={page.cover.blurDataURL}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </header>
      )}

      {/* Content */}
      <section className="pb-4">
        {blocks && blocks.length > 0 && (
          <div className="max-w-none">
            <NotionRenderer blocks={blocks} />
          </div>
        )}
      </section>

      {/* Back link */}
      {page.path !== "/" && (
        <footer className="mt-8 border-t border-foreground pt-4 font-mono text-sm">
          <Link href={parentPath} className="underline">
            ← {parentPath === "/" ? "accueil" : parentPath.slice(1)}
          </Link>
        </footer>
      )}
    </article>
  );
}
