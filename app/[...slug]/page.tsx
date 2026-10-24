import { notFound } from "next/navigation";
import {
  getPageByPath,
  getPageContentWithChildren,
  getDatabaseItems,
  getAllData,
  getSiteStructure,
} from "@/lib/notion";
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
    return { title: "Page Not Found" };
  }
  return { ...pageData.metadata, title: pageData.label ?? pageData.metadata.title };
}


export default async function DynamicPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  const pageData = await getPageByPath(`/${slug.join("/")}`);


  if (!pageData) { notFound();}

  // Handle database list view (/category)
  if (pageData.type === "database") {
    const items = await getDatabaseItems(pageData);
    return (
      <Database page={pageData} items={items || []} header={slug.length > 1 || !!pageData.showTitle} />
    );
  }
  
  // Handle single page view (/page-slug)
  else if ( pageData.type === "page") {
    const blocks = await getPageContentWithChildren(pageData);
    // The title doubles as a breadcrumb: the parent section links back.
    const parentPath = slug.length > 1 ? `/${slug.slice(0, -1).join("/")}` : null;
    const parentDef = parentPath ? Object.values(getSiteStructure().structure).find((p) => p.path === parentPath) : null;
    const parent = parentPath ? { path: parentPath, label: parentDef?.label ?? parentPath.slice(1) } : undefined;
    return <Page page={pageData} blocks={blocks || []} header={slug.length > 1 || !!pageData.showTitle} parent={parent} />;
  }

  // Handle error pages
  else{ notFound(); }
}
