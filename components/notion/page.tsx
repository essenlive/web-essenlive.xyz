'use client'
import { CoverImage } from "@/components/cover-image";
import Link from "next/link";
import { NotionRenderer } from "@/components/notion-renderer";
import type { PageData, BlockWithChildren } from "@/lib/types";
import { accentFromPalette } from "@/lib/utils";
import { RenderProperties } from "@/components/notion/render-properties";


interface PageProps {
  page: PageData;
  blocks : BlockWithChildren[]
  header: boolean
  /** Section this page lives in; shown in the title as a link back. */
  parent?: { path: string; label: string }
}

export function Page({ page, blocks, header, parent }: PageProps) {
  const hasHero = header && (page.cover || page.properties);

  const shown = page.pageProperties ?? Object.keys(page.properties ?? {});

  const heading = (
    <h1 className="title" title={page.title}>
      {parent && (
        <>
          <Link href={parent.path} className="-my-2 inline-block py-2 font-normal text-muted-foreground">{parent.label}</Link>
          <span aria-hidden className="font-normal text-muted-foreground"> / </span>
        </>
      )}
      {page.title}
    </h1>
  );

  // Duotone covers give the page one accent (selection, link hover, frames); other pages keep plain ink.
  const accent = accentFromPalette(page.cover?.palette);

  return (
    <article className={accent ? "accented mt-14" : "mt-14"} style={accent ? ({ "--accent": accent } as React.CSSProperties) : undefined}>
      {header && (
        <header className="mb-7">
          <div className={`band pb-7 ${hasHero ? "" : "border-b border-foreground"}`}>{heading}</div>
          {/* Hero: the cover takes the left half, the metadata the right half. */}
          {hasHero && (
            <div className="band-flush accent-border grid border-y border-foreground md:grid-cols-2">
              {page.cover && (
                <div className="dither accent-border relative aspect-[3/2] border-b border-foreground md:border-b-0 md:border-r">
                  <CoverImage
                    src={page.cover.url}
                    alt={page.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              {page.properties && (
                <aside className="min-w-0 px-[var(--bleed-l)] py-7 md:col-start-2 md:row-start-1 md:pl-7">
                  <RenderProperties
                    properties={page.properties}
                    filterProperties={shown}
                    pageLayout={true}
                  />
                </aside>
              )}
            </div>
          )}
        </header>
      )}

      <section className={`max-w-[40rem] pb-14 ${header ? "" : "lead"}`}>
        {blocks && blocks.length > 0 && <NotionRenderer blocks={blocks} />}
      </section>
    </article>
  );
}
