/**
 * Notion API Integration Module for Next.js 15
 *
 * This module provides a comprehensive interface for fetching and managing Notion content
 * in a Next.js 15 application. It leverages the official @notionhq/client SDK to interact
 * with Notion's API and includes built-in caching, image downloading, and data transformation.
 *
 * Technology Stack:
 * - TypeScript: Type-safe API interactions
 * - Next.js 15: React caching with `cache()` for request deduplication
 * - @notionhq/client: Official Notion JavaScript SDK
 * - Node.js fs/crypto: File system operations and hash generation
 *
 * Architecture Overview:
 *
 * 1. Site Structure Management (getSiteStructure):
 *    - Parses SITE_DATA environment variable to define page/database routing
 *    - Normalizes UUIDs to dashed format for consistency
 *
 * 2. Data Fetching Layer:
 *    - getDefinedData: Fetches explicitly defined pages/databases from site structure
 *    - getAllData: Combines defined pages with all database items
 *    - getDatabaseItems: Queries database entries with filters and sorting
 *    - getPageByPath: Retrieves specific pages by URL path
 *
 * 3. Content Retrieval:
 *    - getPageContent: Fetches top-level blocks from a page
 *    - getPageContentWithChildren: Recursively fetches nested block hierarchies
 *    - getBlockChildren: Recursively retrieves child blocks
 *    - getTableContent: Specialized handler for table blocks
 *
 * 4. Data Transformation:
 *    - cleanData: Transforms raw Notion API responses into simplified format
 *    - cleanProperties: Normalizes property types (title, rich_text, dates, etc.)
 *    - blocksToMarkdown/blockToMarkdown: Converts Notion blocks to Markdown
 *
 * 5. Image Processing:
 *    - See lib/imageProcessor.ts for image downloading, dithering, and WebP conversion
 *
 * Caching Strategy:
 * All data fetching functions use React's `cache()` wrapper for automatic request
 * deduplication during server-side rendering. This ensures each unique API call
 * is made only once per request, even when called multiple times.
 *
 * Environment Variables:
 * - NOTION_SECRET: Notion integration auth token
 * - SITE_DATA: JSON structure defining page/database routing
 *
 * @module lib/notion
 */

import { Client } from '@notionhq/client'
import { cache } from 'react'
import { downloadImage } from './imageProcessor'
import { normalizeSiteStructureUUIDs, generateBlurDataURL } from './utils'
import type {
  SiteData,
  PageDefinition,
  PageData,
  CleanData,
  BlockObjectResponse,
  PageObjectResponse,
  DatabaseObjectResponse,
  BlockWithChildren,
} from "./types";

export type { PageData } from "./types";

/**
 * Notion API Client Instance
 *
 * Initialized with the NOTION_SECRET environment variable for authentication.
 * This client is used throughout the module to make API requests to Notion.
 *
 * @see https://developers.notion.com/reference/intro
 */
const notion = new Client({
  auth: process.env.NOTION_SECRET,
});


/**
 * Retrieves and processes the site structure configuration
 *
 * Parses the SITE_DATA environment variable which defines the routing structure
 * for the Next.js application. Each entry maps a URL path to a Notion page or database.
 *
 * Processing steps:
 * 1. Validates SITE_DATA environment variable exists
 * 2. Parses JSON structure
 * 3. Normalizes all UUIDs to dashed format (e.g., "abc123" → "abc-123-...")
 * 4. Assigns path property to each structure entry based on its key
 *
 * @returns {SiteData} The processed site structure with normalized UUIDs and paths
 * @throws {Error} If SITE_DATA environment variable is not set
 *
 * @example
 * // SITE_DATA format:
 * {
 *   "structure": {
 *     "/": { "type": "page", "id": "abc123..." },
 *     "/blog": { "type": "database", "id": "def456...", "filter": {...} }
 *   }
 * }
 */
export const getSiteStructure = cache(() => {
  if (!process.env.SITE_DATA) {
    throw new Error("SITE_DATA environment variable is not set.");
  }
  const siteData = JSON.parse(process.env.SITE_DATA) as SiteData;

  // Normalize all UUIDs in the structure to dashed format
  siteData.structure = normalizeSiteStructureUUIDs(siteData.structure);

  (Object.keys(siteData.structure) as Array<keyof typeof siteData.structure>).forEach((key) => {
    siteData.structure[key].path = key as string;
  });
  return siteData as unknown as SiteData;
})

/**
 * Fetches all pages and databases defined in the site structure
 *
 * This is the primary data fetching function that retrieves metadata for all
 * explicitly defined pages and databases from the site structure. It uses the
 * Notion API's `pages.retrieve()` and `databases.retrieve()` methods.
 *
 * Flow:
 * 1. Gets site structure configuration
 * 2. Fetches each page/database in parallel using Promise.all
 * 3. Transforms raw Notion data using cleanData()
 * 4. Returns enriched PageData objects with routing information
 *
 * The function is wrapped with React's cache() for request deduplication.
 *
 * @returns {Promise<PageData[]>} Array of processed page/database metadata
 * @returns {Promise<[]>} Empty array if an error occurs during fetching
 *
 * @see notion.pages.retrieve - https://developers.notion.com/reference/retrieve-a-page
 * @see notion.databases.retrieve - https://developers.notion.com/reference/retrieve-a-database
 *
 * @example
 * const pages = await getDefinedData();
 * // Returns: [
 * //   { id: "...", type: "page", path: "/", title: "Home", ... },
 * //   { id: "...", type: "database", path: "/blog", title: "Blog", ... }
 * // ]
 */
export const getDefinedData = cache(async (): Promise<PageData[]> => {
  try {
    console.log(
      "🔍 Grabbing all selected content from your Notion workspace..."
    );
    const siteData = getSiteStructure();
    const structure = Object.values(siteData.structure);

    const fetchedData = await Promise.all(
      structure.map(async (pageDefinition) => {
        try {
          let data;
          if (pageDefinition.type === "page") {
            data = (await notion.pages.retrieve({
              page_id: pageDefinition.id,
            })) as PageObjectResponse;

            return {
              ...data,
              ...pageDefinition,
            };
          } else if (pageDefinition.type === "database") {
            data = (await notion.databases.retrieve({
              database_id: pageDefinition.id,
            })) as DatabaseObjectResponse;

            return {
              ...data,
              ...pageDefinition,
            };
          } else {
            console.error(
              `Error fetching data for ${pageDefinition.id} of unkown type : ${pageDefinition.type}`
            );
            return null;
          }
        } catch (error) {
          console.error(
            `Error fetching data for ${pageDefinition.id} of type : ${pageDefinition.type}`,
            error
          );
          return null;
        }
      })
    );
    const data = await Promise.all(
      fetchedData
        .filter((p) => p !== null)
        .map(async (p) => ({
          id: p.id,
          type: p.type,
          path: p.path,
          filter: p.filter,
          sorts: p.sorts,
          displayType: p.displayType,
          cardProperties: p.cardProperties,
          pageProperties: p.pageProperties,
          ...(await cleanData(p)),
        }))
    );

    // console.log("Defined base data")
    // console.table(
    //   data.map((p) => ({
    //     title: p.title,
    //     icon: p.icon,
    //     path: p.path,
    //     filter: p.filter,
    //     sorts: p.sorts && p.sorts[0],
    //     type: p.type,
    //   }))
    // );
    return data;
  } catch (error) {
    console.error("❌ Error fetching content:", error);
    return [];
  }
});

/**
 * Fetches complete site data including all database items
 *
 * Combines defined pages/databases with all items contained within those databases.
 * This creates a comprehensive dataset of all content available for routing.
 *
 * Flow:
 * 1. Fetches defined pages and databases via getDefinedData()
 * 2. Queries all database items in parallel via getDatabaseItems()
 * 3. Flattens and combines both datasets
 *
 * Use this function when you need a complete list of all routable content,
 * including individual blog posts, project entries, etc.
 *
 * @returns {Promise<PageData[]>} Combined array of defined pages and all database entries
 *
 * @example
 * const allPages = await getAllData();
 * // Returns: [
 * //   { type: "page", path: "/", title: "Home" },
 * //   { type: "database", path: "/blog", title: "Blog" },
 * //   { type: "page", path: "/blog/post-1", title: "My First Post" },
 * //   { type: "page", path: "/blog/post-2", title: "Another Post" }
 * // ]
 */
export const getAllData = cache(async (): Promise<PageData[]> => {
  const definedData = await getDefinedData();
  const databaseItems = await Promise.all(
    definedData
      .filter((page) => page.type === "database")
      .map((page) => getDatabaseItems(page))
  );

  const allData: PageData[] = [
    ...definedData,
    ...databaseItems.flat(),
  ];

  // console.log("All data");
  // console.table(
  //   allData.map((p) => ({
  //     title: p.title,
  //     icon: p.icon,
  //     path: p.path,
  //     type: p.type,
  //   }))
  // );

  return allData;
})
/**
 * Retrieves a specific page by its URL path
 *
 * Searches through all available content (defined pages and database items)
 * to find a page matching the given path. Useful for dynamic routing in Next.js.
 *
 * @param {string} path - The URL path to search for (e.g., "/", "/blog/my-post")
 * @returns {Promise<PageData | null>} The matching page data or null if not found
 *
 * @example
 * const homePage = await getPageByPath("/");
 * const blogPost = await getPageByPath("/blog/my-first-post");
 */
export const getPageByPath = cache(
  async (path: string): Promise<PageData | null> => {
    try {
      const allContent =  await getAllData();
      return allContent.find((p) => p.path === path) || null
    } catch (error) {
      console.error("Error fetching page by path:", error);
      return null;
    }
  }
);

// export const getPageById = cache(
//   async (id: string): Promise<PageData | null> => {
//     try {
//       const allContent = await getAllContent();
//       return allContent.find((page) => page.id === id) || null;
//     } catch (error) {
//       console.error("Error fetching page by id:", error);
//       return null;
//     }
//   }
// );

/**
 * Queries all items from a Notion database
 *
 * Retrieves all pages within a database using the Notion API's query endpoint.
 * Supports filtering and sorting based on the database definition. Each database
 * item is transformed into a PageData object with a generated path.
 *
 * Path generation:
 * - Combines database path with item slug: `{databasePath}/{itemSlug}`
 * - Slug is generated from title (lowercase, hyphenated)
 *
 * Filtering and Sorting:
 * - Filter and sort configurations come from the PageDefinition
 * - Maximum 100 items per query (Notion API limitation)
 *
 * @param {PageDefinition} databaseDefinition - Database configuration with filter/sort rules
 * @returns {Promise<PageData[]>} Array of database items as PageData objects
 * @returns {Promise<[]>} Empty array if an error occurs
 *
 * @see notion.databases.query - https://developers.notion.com/reference/post-database-query
 *
 * @example
 * const blogPosts = await getDatabaseItems({
 *   id: "abc123...",
 *   type: "database",
 *   path: "/blog",
 *   filter: { property: "Published", checkbox: { equals: true } },
 *   sorts: [{ property: "Date", direction: "descending" }]
 * });
 * // Returns: [
 * //   { path: "/blog/my-first-post", title: "My First Post", ... },
 * //   { path: "/blog/another-post", title: "Another Post", ... }
 * // ]
 */
export const getDatabaseItems = async (
  databaseDefinition: PageDefinition
): Promise<PageData[]> => {
  // console.log(
  //   `🔍 Grabbing items from database : ${databaseDefinition.path} with filter : ${JSON.stringify(databaseDefinition.filter)}`
  // );

  try {
    const response = await notion.databases.query({
      database_id: databaseDefinition.id,
      page_size: 100,
      filter: databaseDefinition.filter,
      sorts: databaseDefinition.sorts,
    });

    const data = await Promise.all(
      response.results
        .filter((p): p is PageObjectResponse => p.object === 'page' && 'properties' in p)
        .map(async (p) => {
          const cleanedData = await cleanData(p);
          return {
            id: p.id,
            type: "page" as const,
            path: `${databaseDefinition.path}/${cleanedData.slug}`,
            pageProperties: databaseDefinition.pageProperties,
            cardProperties: databaseDefinition.cardProperties,
            ...cleanedData,
          };
        })
    );

    return data;
  } catch (error) {
    console.error(`Error fetching items from database ${databaseDefinition.id}:`, error);
    return [];
  }
};


/**
 * Fetches top-level blocks from a Notion page
 *
 * Retrieves only the direct children blocks of a page (no nested children).
 * For nested content, use getPageContentWithChildren() instead.
 *
 * Maximum 100 blocks per request (Notion API pagination limit).
 *
 * @param {PageDefinition} pageDefinition - Page configuration with ID
 * @returns {Promise<BlockObjectResponse[]>} Array of top-level blocks
 * @returns {Promise<[]>} Empty array if an error occurs
 *
 * @see notion.blocks.children.list - https://developers.notion.com/reference/get-block-children
 *
 * @example
 * const blocks = await getPageContent({ id: "abc123...", type: "page" });
 * // Returns: [
 * //   { type: "heading_1", heading_1: { ... } },
 * //   { type: "paragraph", paragraph: { ... } }
 * // ]
 */
export const getPageContent = cache(
  async (pageDefinition: PageDefinition): Promise<BlockObjectResponse[]> => {
  console.log("🔍 Grabbing all content from page : " + pageDefinition.id);
    try {
      const response = await notion.blocks.children.list({
        block_id: pageDefinition.id,
        page_size: 100,
      });

      return response.results as BlockObjectResponse[];
    } catch (error) {
      console.error("Error fetching page content:", error);
      return [];
    }
  }
);

/**
 * Fetches page content with full nested block hierarchy
 *
 * Recursively retrieves all blocks and their children from a Notion page,
 * creating a complete content tree. Also downloads and caches image blocks
 * to the local public/images directory.
 *
 * Features:
 * - Recursive child block fetching
 * - Automatic image downloading for external and file-hosted images
 * - Maintains block hierarchy in the returned data structure
 *
 * Use this when you need to render the complete page content, including
 * nested lists, toggle blocks, columns, etc.
 *
 * @param {PageDefinition} pageDefinition - Page configuration with ID
 * @returns {Promise<BlockWithChildren[]>} Array of blocks with children property
 * @returns {Promise<[]>} Empty array if an error occurs
 *
 * @see getPageContent - For top-level blocks only
 * @see getBlockChildren - For recursive child fetching
 *
 * @example
 * const content = await getPageContentWithChildren({ id: "abc123...", type: "page" });
 * // Returns nested structure:
 * // [
 * //   { type: "toggle", toggle: {...}, children: [
 * //     { type: "paragraph", paragraph: {...} }
 * //   ]}
 * // ]
 */
export const getPageContentWithChildren = cache(
  async (pageDefinition: PageDefinition): Promise<BlockWithChildren[]> => {
    try {
      const blocks = await getPageContent(pageDefinition);

      const blocksWithChildren = await Promise.all(
        blocks.map(async (block): Promise<BlockWithChildren> => {
          if(block.type === 'image'){

            if (block.image) {
              if (block.image.type === "external") {
                block.image.external.url = await downloadImage(
                  block.image.external.url
                );
              } else if (block.image.type === "file") {
                block.image.file.url = await downloadImage(
                  block.image.file.url
                );
              }
            }

          }
          if (block.has_children) {
            const children = await getBlockChildren(block.id);
            return {
              ...block,
              children,
            };
          }
          return block;
        })
      );

      // console.table(
      //   blocksWithChildren.map((b) => ({
      //     object: b.object,
      //     has_children: b.has_children,
      //     type : b.type
      //   }))
      // );

      return blocksWithChildren;
    } catch (error) {
      console.error("Error fetching page content with children:", error);
      return [];
    }
  }
);

/**
 * Recursively fetches all child blocks for a given block
 *
 * This is a utility function used by getPageContentWithChildren() to build
 * the complete block hierarchy. It recursively calls itself for nested children.
 *
 * Supports all Notion block types that can have children:
 * - Toggle blocks
 * - Column lists and columns
 * - Bulleted/numbered list items
 * - Quote blocks
 * - Callout blocks
 *
 * @param {string} blockId - The Notion block ID to fetch children for
 * @returns {Promise<BlockWithChildren[]>} Array of child blocks with their children
 * @returns {Promise<[]>} Empty array if an error occurs
 *
 * @see notion.blocks.children.list - https://developers.notion.com/reference/get-block-children
 *
 * @example
 * const children = await getBlockChildren("block-id-123");
 * // Returns: [
 * //   { type: "paragraph", paragraph: {...}, children: [...] }
 * // ]
 */
export const getBlockChildren = cache(async (blockId: string): Promise<BlockWithChildren[]> => {
  try {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100
    })

    const blocks = response.results as BlockObjectResponse[]

    const blocksWithChildren = await Promise.all(
      blocks.map(async (block): Promise<BlockWithChildren> => {
        if (block.has_children) {
          const children = await getBlockChildren(block.id)
          return {
            ...block,
            children
          }
        }
        return block
      })
    )

    return blocksWithChildren
  } catch (error) {
    console.error(`Error fetching children for block ${blockId}:`, error)
    return []
  }
})

/**
 * Fetches all rows from a Notion table block
 *
 * Specialized function for retrieving table data. Filters child blocks to
 * return only table_row types.
 *
 * @param {string} tableBlockId - The Notion table block ID
 * @returns {Promise<any[]>} Array of table row blocks
 * @returns {Promise<[]>} Empty array if an error occurs
 *
 * @example
 * const rows = await getTableContent("table-block-id-123");
 * // Returns: [{ type: "table_row", table_row: { cells: [[...]] } }]
 */
export const getTableContent = cache(async (tableBlockId: string): Promise<any[]> => {
  try {
    const children = await getBlockChildren(tableBlockId)
    return children.filter(block => block.type === 'table_row')
  } catch (error) {
    console.error('Error fetching table content:', error)
    return []
  }
})

/**
 * Transforms raw Notion API data into a simplified, app-friendly format
 *
 * This internal function processes PageObjectResponse or DatabaseObjectResponse
 * objects from the Notion API and extracts key information like title, icon,
 * cover image, and properties. It also generates metadata for Next.js.
 *
 * Processing steps:
 * 1. Extracts and cleans properties using cleanProperties()
 * 2. Determines title (from title property or database title)
 * 3. Processes icon (emoji, external URL, or file URL)
 * 4. Downloads and caches cover images
 * 5. Generates URL slug from title
 * 6. Creates Next.js metadata (OpenGraph, Twitter, favicons)
 *
 * @param {PageObjectResponse | DatabaseObjectResponse} data - Raw Notion API response
 * @returns {Promise<CleanData>} Cleaned data with metadata
 *
 * @internal This is a private utility function
 *
 * @example
 * const cleaned = await cleanData(notionPageResponse);
 * // Returns: {
 * //   title: "My Page",
 * //   slug: "my-page",
 * //   icon: "📄",
 * //   cover: "/images/abc123.jpg",
 * //   properties: {...},
 * //   metadata: {...}
 * // }
 */
async function cleanData(
  data: PageObjectResponse | DatabaseObjectResponse
): Promise<CleanData> {
  
  const properties = cleanProperties(data.properties);

  let title = "";
  if(data.object === "database"){ 
    title = data.title.map(t=>t.plain_text).join("");
  }
  else if ( data.object === "page") {
    let titleProps = Object.keys(data.properties).filter(p=>data.properties[p].type === "title")
    title = properties[titleProps[0]].value;
  }

  let icon = "";
    if (data?.icon) {
      if (data.icon.type === "emoji") {
        icon = data.icon.emoji;
      } else if (data.icon.type === "external") {
        icon = data.icon.external.url;
      } else if (data.icon.type === "file") {
        icon = data.icon.file.url;
      }
    }

  let cover = "";
  let blurDataURL = "";
  if (data?.cover) {
    if (data.cover.type === "external") {
      cover = await downloadImage(data.cover.external.url);
    } else if (data.cover.type === "file") {
      // console.log(`📥 Downloading cover image from Notion...`);
      cover = await downloadImage(data.cover.file.url);
    }
    // Generate blur data URL if we have a cover
    if (cover) {
      blurDataURL = generateBlurDataURL();
    }
  }

  const encoded =
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="64">
          ${icon}
        </text>
      </svg>`);

  return {
    icon,
    title,
    slug: title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    cover,
    blurDataURL,
    properties,
    created_time: data.created_time,
    url: data.url,
    metadata: {
      title: title,
      icons: {
        // safari/ios, favicons, and shortcut all set to the same data-uri
        icon: `data:image/svg+xml;utf8,${encoded}`,
        shortcut: `data:image/svg+xml;utf8,${encoded}`,
        apple: `data:image/svg+xml;utf8,${encoded}`,
      },
      openGraph: {
        title: title,
        images: cover ? [`${cover}`] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        images: cover ? [cover] : [],
      },
    },
  };
}

/**
 * Converts an array of Notion blocks to Markdown format
 *
 * Utility function for transforming Notion block content into Markdown syntax.
 * Useful for generating static content, blog posts, or documentation.
 *
 * Supported block types:
 * - Paragraphs, headings (h1-h3)
 * - Bulleted and numbered lists
 * - Code blocks with syntax highlighting
 * - Quotes, dividers
 * - Images with captions
 *
 * @param {BlockObjectResponse[]} blocks - Array of Notion blocks
 * @returns {string} Markdown-formatted string with blocks separated by double newlines
 *
 * @example
 * const markdown = blocksToMarkdown(pageBlocks);
 * // Returns: "# Heading\n\nParagraph text...\n\n- List item"
 */
export function blocksToMarkdown(blocks: BlockObjectResponse[]): string {
  return blocks.map(blockToMarkdown).join('\n\n')
}

/**
 * Converts a single Notion block to Markdown syntax
 *
 * Internal helper function that handles the conversion logic for individual
 * block types. Delegates rich text formatting to richTextToMarkdown().
 *
 * @param {BlockObjectResponse} block - Single Notion block object
 * @returns {string} Markdown representation of the block
 *
 * @internal This is a private utility function
 */
function blockToMarkdown(block: BlockObjectResponse): string {
  const { type } = block
  
  switch (type) {
    case 'paragraph':
      return richTextToMarkdown(block.paragraph.rich_text)
    
    case 'heading_1':
      return `# ${richTextToMarkdown(block.heading_1.rich_text)}`
    
    case 'heading_2':
      return `## ${richTextToMarkdown(block.heading_2.rich_text)}`
    
    case 'heading_3':
      return `### ${richTextToMarkdown(block.heading_3.rich_text)}`
    
    case 'bulleted_list_item':
      return `- ${richTextToMarkdown(block.bulleted_list_item.rich_text)}`
    
    case 'numbered_list_item':
      return `1. ${richTextToMarkdown(block.numbered_list_item.rich_text)}`
    
    case 'code':
      const language = block.code.language || 'text'
      const code = richTextToMarkdown(block.code.rich_text)
      return `\`\`\`${language}\n${code}\n\`\`\``
    
    case 'quote':
      return `> ${richTextToMarkdown(block.quote.rich_text)}`
    
    case 'divider':
      return '---'
    
    case 'image':
      let imageUrl = ''
      if ('file' in block.image && block.image.file) {
        imageUrl = block.image.file.url
      } else if ('external' in block.image && block.image.external) {
        imageUrl = block.image.external.url
      }
      const caption = block.image.caption ? richTextToMarkdown(block.image.caption) : ''
      return `![${caption}](${imageUrl})`
    
    default:
      return ''
  }
}

/**
 * Converts Notion rich text objects to Markdown syntax
 *
 * Handles text formatting annotations and links in Notion's rich text format.
 * Supports nested formatting (e.g., bold + italic).
 *
 * Supported annotations:
 * - Bold: **text**
 * - Italic: *text*
 * - Code: `text`
 * - Strikethrough: ~~text~~
 * - Links: [text](url)
 *
 * @param {any[]} richText - Array of Notion rich text objects
 * @returns {string} Markdown-formatted text string
 *
 * @internal This is a private utility function
 *
 * @example
 * const markdown = richTextToMarkdown([
 *   { plain_text: "Hello", annotations: { bold: true } }
 * ]);
 * // Returns: "**Hello**"
 */
function richTextToMarkdown(richText: any[]): string {
  return richText.map((text) => {
    let content = text.plain_text

    if (text.annotations.bold) {
      content = `**${content}**`
    }
    if (text.annotations.italic) {
      content = `*${content}*`
    }
    if (text.annotations.code) {
      content = `\`${content}\``
    }
    if (text.annotations.strikethrough) {
      content = `~~${content}~~`
    }
    if (text.href) {
      content = `[${content}](${text.href})`
    }

    return content
  }).join('')
}

/**
 * Normalizes Notion property values into a consistent format
 *
 * Transforms Notion's complex property structure into simpler {type, value} pairs.
 * This function mutates the properties object in place and removes unsupported types.
 *
 * Supported property types:
 * - title, rich_text: Extracted as plain text strings
 * - checkbox, email, number, phone_number, url: Direct value passthrough
 * - date, created_time, last_edited_time: Converted to Date objects
 * - select, status: Extracted as {name, color} objects
 * - multi_select: Array of {name, color} objects
 * - people, created_by, last_edited_by: Extracted as email strings/arrays
 * - place: Extracted as location name
 *
 * Unsupported types (deleted):
 * - files, formula, relation, rollup
 *
 * @param {any} properties - Raw Notion properties object
 * @returns {any} Transformed properties with {type, value} structure
 *
 * @internal This is a private utility function
 *
 * @example
 * const cleaned = cleanProperties({
 *   Title: { id: "...", type: "title", title: [{plain_text: "Hello"}] }
 * });
 * // Returns: { Title: { type: "title", value: "Hello" } }
 */
function cleanProperties(properties:any): any {
  for(const prop in properties){
    const type = properties[prop].type
    let value = properties[prop][properties[prop].type];
    const name = prop;
    switch (type) {
      case "title":
      case "rich_text":
        value = Array.isArray(value)
          ? value.map((v: any) => v.plain_text).join("")
          : "";
        properties[prop] = {
          type,
          value,
        };
        break;
      case "checkbox":
      case "email":
      case "number":
      case "phone_number":
      case "url":
        properties[prop] = {
          type,
          value,
        };
        break;
      case "files":
      case "formula":
      case "relation":
      case "rollup":
        // TO DO : Manage the types ?
        // console.log("🗑️ Deleting unsupported property : " + type)
        delete properties[prop];
        break;
      case "last_edited_by":
      case "created_by":
        value = value[value.type]?.email;
        properties[prop] = {
          type,
          value,
        };
        break;

      case "last_edited_time":
      case "created_time":
        value = new Date(value);
        properties[prop] = {
          type,
          value,
        };
        break;

      case "date":
        // TO DO : Manage ranges
        if(!value?.start) break
        value = new Date(value.start);
        properties[prop] = {
          type,
          value,
        };
        break;
      case "multi_select":
        value = Array.isArray(value)
          ? value.map((v: any) => ({ name: v.name, color: v.color }))
          : [];
        properties[prop] = {
          type,
          value,
        };
        break;
      case "people":
        value = Array.isArray(value)
          ? value.map((v: any) => v[v.type]?.email)
          : [];
        properties[prop] = {
          type,
          value,
        };
        break;
      case "place":
        value = value?.name ?? null;
        properties[prop] = {
          type,
          value,
        };
        break;
      case "select":
      case "status":
        value = { name: value.name, color: value.color };
        properties[prop] = {
          type,
          value,
        };
        break;
      default:
        break;
    }
  }
  return properties
}
