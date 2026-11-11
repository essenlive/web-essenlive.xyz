import { notFound } from "next/navigation";
import {
  getPageByPath,
  getPageContentWithChildren,
  getDatabaseItems,
  getAllData,
  getSiteStructure,
  getTexts,
  getDither,
} from "@/lib/notion";
import { TextsProvider } from "@/components/site-texts";
import { DitherZone } from "@/components/dither-zone";
import { Page } from "@/components/notion/page";
import { Database } from "@/components/notion/database";

// Enable ISR: Revalidate every hour (3600 seconds)
// export const revalidate = 3600;

interface DynamicPageProps {
  params: Promise<{
    slug: string[];
  }>;
}


export async function generateStaticParams() {
  const pages = await getAllData();
  const paths: { slug: string[] }[] = [];

  // Add all defined database and page routes
  for (const page of pages) {
    if (page.path !== "/") {
      // Split the path into segments (e.g., "/works/slug" -> ["works", "slug"])
      const segments = page.path.replace(/^\//, "").split('/').filter(Boolean);

      if (segments.length > 0) {
        paths.push({ slug: segments });
      }
    }
  }

  // console.log("Generated static params:");
  // console.table(paths.map(p => ({ slug: p.slug.join('/') })));

  return paths;
}

export async function generateMetadata({ params }: DynamicPageProps) {
  const { slug } = await params;
  const pageData = await getPageByPath(`/${slug.join("/")}`);

  if (!pageData) {
    return { title: getTexts().pageNotFoundTitle };
  }
  const desc = pageData.properties?.Description;
  const description = desc?.type === "rich_text" && desc.value ? String(desc.value) : undefined;
  return { ...pageData.metadata, title: pageData.label ?? pageData.metadata.title, description };
}


export default async function DynamicPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  const pageData = await getPageByPath(`/${slug.join("/")}`);


  if (!pageData) { notFound();}

  const texts = getTexts(pageData);
  // Top-level sections can override their own band; pages below them (database items) use the `items` zone.
  const dither = slug.length > 1 ? getDither("items") : getDither("sections", pageData.ditherField?.header);
  const band = dither && <DitherZone options={dither} className="mt-14" />;
  const body = dither ? "[&>article]:mt-7" : undefined;

  // Handle database list view (/category)
  if (pageData.type === "database") {
    const items = await getDatabaseItems(pageData);
    return (
      <TextsProvider texts={texts}>
        {band}
        <div className={body}>
          <Database page={pageData} items={items || []} header={slug.length > 1 || !!pageData.showTitle} />
        </div>
      </TextsProvider>
    );
  }
  
  // Handle single page view (/page-slug)
  else if ( pageData.type === "page") {
    const blocks = await getPageContentWithChildren(pageData);
    // The title doubles as a breadcrumb: the parent section links back.
    const parentPath = slug.length > 1 ? `/${slug.slice(0, -1).join("/")}` : null;
    const parentDef = parentPath ? Object.values(getSiteStructure().structure).find((p) => p.path === parentPath) : null;
    const parent = parentPath ? { path: parentPath, label: parentDef?.label ?? parentPath.slice(1) } : undefined;
    return (
      <TextsProvider texts={texts}>
        {band}
        <div className={body}>
          <Page page={pageData} blocks={blocks || []} header={slug.length > 1 || !!pageData.showTitle} parent={parent} />
        </div>
      </TextsProvider>
    );
  }

  // Handle error pages
  else{ notFound(); }
}
