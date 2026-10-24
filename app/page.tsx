import { notFound } from "next/navigation";
import {
  getPageContentWithChildren,
  getDatabaseItems,
  getPageByPath,
  getFeaturedItems
} from "@/lib/notion";
import { Featured } from "@/components/featured";
import { Page } from "@/components/notion/page";
import { Database } from "@/components/notion/database";

// Enable ISR: Revalidate every hour (3600 seconds)
// export const revalidate = 3600;

const pageData = await getPageByPath(`/`);
  
export async function generateMetadata() {
  if (!pageData) {
    return { title: "Page Not Found" };
  }
  return { ...pageData.metadata, title: pageData.label ?? pageData.metadata.title };
}

export default async function HomePage() {  

  if (!pageData) { notFound();}

  // Handle database list view (/category)
  if (pageData.type === "database") {
    const items = await getDatabaseItems(pageData);
    return <Database page={pageData} items={items || []} header={!!pageData.showTitle} />;
  }

  // Handle single page view (/page-slug)
  else if ( pageData.type === "page") {
    const blocks = await getPageContentWithChildren(pageData);
    const featured = pageData.featured
      ? await getFeaturedItems(pageData.featured)
      : null;
    return (
      <>
        <Page page={pageData} blocks={blocks || []} header={!!pageData.showTitle} />
        {featured && (
          <Featured
            title={pageData.featured?.title}
            source={featured.source}
            displayType={pageData.featured?.displayType}
            columns={pageData.featured?.columns}
            items={featured.items}
          />
        )}
      </>
    );
  }

  // Handle error pages
  else{ notFound(); }
}