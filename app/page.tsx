import { notFound } from "next/navigation";
import {
  getPageContentWithChildren,
  getDatabaseItems,
  getPageByPath,
  getFeaturedItems,
  getSiteStructure,
  getTexts,
  getDither,
} from "@/lib/notion";
import { TextsProvider } from "@/components/site-texts";
import { DitherZone } from "@/components/dither-zone";
import { Featured } from "@/components/featured";
import { Page } from "@/components/notion/page";
import { Database } from "@/components/notion/database";

// Enable ISR: Revalidate every hour (3600 seconds)
// export const revalidate = 3600;

const pageData = await getPageByPath(`/`);
  
export async function generateMetadata() {
  if (!pageData) {
    return { title: getTexts().pageNotFoundTitle };
  }
  const desc = pageData.properties?.Description;
  const description = desc?.type === "rich_text" && desc.value ? String(desc.value) : undefined;
  return { ...pageData.metadata, title: { absolute: getSiteStructure().sitename }, description };
}

export default async function HomePage() {  

  if (!pageData) { notFound();}

  const texts = getTexts(pageData);
  const dither = getDither("hero", pageData.ditherField?.header);
  const band = dither && <DitherZone options={dither} className="mt-14" />;
  // Under a band the content needs less top margin.
  const body = "[&>article]:mt-7";

  // Handle database list view (/category)
  if (pageData.type === "database") {
    const items = await getDatabaseItems(pageData);
    return (
      <TextsProvider texts={texts}>
        {band}
        <div className={dither ? body : undefined}>
          <Database page={pageData} items={items || []} header={!!pageData.showTitle} />
        </div>
      </TextsProvider>
    );
  }

  // Handle single page view (/page-slug)
  else if ( pageData.type === "page") {
    const blocks = await getPageContentWithChildren(pageData);
    const featured = pageData.featured
      ? await getFeaturedItems(pageData.featured)
      : null;
    return (
      <TextsProvider texts={texts}>
        {band}
        <div className={dither ? body : undefined}>
          <Page page={pageData} blocks={blocks || []} header={!!pageData.showTitle} />
        </div>
        {featured && (
          <Featured
            texts={texts}
            title={pageData.featured?.title}
            source={featured.source}
            displayType={pageData.featured?.displayType}
            columns={pageData.featured?.columns}
            items={featured.items}
          />
        )}
      </TextsProvider>
    );
  }

  // Handle error pages
  else{ notFound(); }
}