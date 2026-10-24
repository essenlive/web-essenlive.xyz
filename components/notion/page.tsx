'use client'
import { CoverImage } from "@/components/cover-image";
import Link from "next/link";
import { NotionRenderer } from "@/components/notion-renderer";
import type { PageData, BlockWithChildren } from "@/lib/types";
import { RenderProperties } from "@/components/notion/render-properties";


interface PageProps {
  page: PageData;
  blocks : BlockWithChildren[]
  header: boolean
  /** Section this page lives in; shown in the title as a link back. */
  parent?: { path: string; label: string }
}

const hostOf = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function Page({ page, blocks, header, parent }: PageProps) {
  const hasHero = header && (page.cover || page.properties);

  // Links (documentation, demo...) are the point of a project: set them apart from the mono metadata.
  const shown = page.pageProperties ?? Object.keys(page.properties ?? {});
  const links = shown.flatMap((key) => {
    const prop = page.properties?.[key];
    return prop?.type === "url" && prop.value ? [{ key, href: prop.value as string }] : [];
  });
  const rest = shown.filter((key) => !links.some((l) => l.key === key));

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

  return (
    <article className="mt-14">
      {header && (
        <header className="mb-7">
          <div className={`band pb-7 ${hasHero ? "" : "border-b border-foreground"}`}>{heading}</div>
          {/* Hero: the cover takes the left half, the metadata the right half. */}
          {hasHero && (
            <div className="band-flush grid border-y border-foreground md:grid-cols-2">
              {page.cover && (
                <div className="dither relative aspect-[3/2] border-b border-foreground md:border-b-0 md:border-r">
                  <CoverImage
                    src={page.cover.url}
                    alt=""
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              {page.properties && (
                <aside className="min-w-0 px-[var(--bleed-l)] py-7 md:col-start-2 md:row-start-1 md:pl-7">
                  {links.map(({ key, href }) => (
                    <p key={key} className="m-0 mb-7 font-bold">
                      <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
                        {key} → {hostOf(href)}
                        <span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    </p>
                  ))}
                  {rest.length > 0 && (
                    <RenderProperties
                      properties={page.properties}
                      filterProperties={rest}
                      pageLayout={true}
                      className="[&_dd]:mb-3.5"
                    />
                  )}
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
