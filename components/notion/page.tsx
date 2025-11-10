'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NotionRenderer } from "@/components/notion-renderer";
import type { PageData, BlockWithChildren } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


interface PageProps {
  page: PageData;
  blocks : BlockWithChildren[]
  header: boolean
}


export function Page({ page, blocks, header }: PageProps) {
  const router = useRouter();

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
        <header className="py-8 pb-0 space-y-8">
          {/* Cover Image */}
          {page.cover && (
            <div className="mb-16">
              <div className="relative h-[50vh] rounded-lg overflow-hidden border">
                <Image
                  src={page.cover}
                  alt={page.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
          {/* Tags */}
          {/* {page.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {page.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )} */}

          {/* Title */}
          <h1 className="text-4xl mb-7 font-bold tracking-tight leading-tight">
            {page.title}
          </h1>
        </header>
      )}

      {/* Content */}
      <section className="pb-16">
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
