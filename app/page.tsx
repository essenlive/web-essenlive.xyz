import { notFound } from "next/navigation";
import {
  getPageContentWithChildren,
  getDatabaseItems,
  getPageByPath
} from "@/lib/notion";
import { Page } from "@/components/notion/page";
import { Database } from "@/components/notion/database";

const pageData = await getPageByPath(`/`);
  
export async function generateMetadata() {
  if (!pageData) {
    return { title: "Page Not Found" };
  }
  return pageData.metadata;
}

export default async function HomePage() {  
  
  if (!pageData) { notFound();}

  // Handle database list view (/category)
  if (pageData.type === "database") {
    const items = await getDatabaseItems(pageData);
    return <Database page={pageData} items={items || []} header={false} />;
  }

  // Handle single page view (/page-slug)
  else if ( pageData.type === "page") {
    const blocks = await getPageContentWithChildren(pageData);
    return <Page page={pageData} blocks={blocks || []} header={false} />;
  }

  // Handle error pages
  else{ notFound(); }
}