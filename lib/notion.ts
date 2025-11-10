import { Client } from '@notionhq/client'
import fs from "fs";
import path from 'path';
import { createHash } from 'crypto';
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
import { cache } from 'react'

const notion = new Client({
  auth: process.env.NOTION_SECRET,
});

export const getSiteStructure = cache(() => {

  if (!process.env.SITE_DATA) {
    throw new Error("SITE_DATA environment variable is not set.");
  }
  const siteData = JSON.parse(process.env.SITE_DATA) as SiteData;
  Object.keys(siteData.structure).forEach((key) => {
    siteData.structure[key].path = key;
  });
  return siteData

})

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

export const getDatabaseItems = async (
  databaseDefinition: PageDefinition
): Promise<PageData[]> => {
  console.log(
    `🔍 Grabbing items from database : ${databaseDefinition.path} with filter : ${JSON.stringify(databaseDefinition.filter)}`
  );

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

export const getTableContent = cache(async (tableBlockId: string): Promise<any[]> => {
  try {
    const children = await getBlockChildren(tableBlockId)
    return children.filter(block => block.type === 'table_row')
  } catch (error) {
    console.error('Error fetching table content:', error)
    return []
  }
})

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
  if (data?.cover) {
    if (data.cover.type === "external") {
      cover = await downloadImage(data.cover.external.url);
    } else if (data.cover.type === "file") {
      // console.log(`📥 Downloading cover image from Notion...`);
      cover = await downloadImage(data.cover.file.url);
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
        images: cover ? [cover] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        images: cover ? [cover] : [],
      },
    },
  };
}

export function blocksToMarkdown(blocks: BlockObjectResponse[]): string {
  return blocks.map(blockToMarkdown).join('\n\n')
}

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

function cleanProperties(properties:any): any {
  for(const prop in properties){
    const type = properties[prop].type
    let value = properties[prop][properties[prop].type];
    const name = prop;
    switch (type) {
      case "title":
        value = Array.isArray(value)
          ? value.map((v: any) => v.plain_text).join("")
          : "";          
        break;
      case "checkbox":
        break;
      case "created_by":
        value = value[value.type]?.email;
        break;
      case "created_time":
        value = new Date(value);
        break;
      case "date":
        // TO DO : Manage ranges
        value = new Date(value.start);
        break;
      case "email":
        break;
      case "files":
        // TO DO : Manage files ?
        break;
      case "formula":
        // TO DO : Manage formulas ?
        break;
      case "last_edited_by":
        value = value[value.type]?.email;
        break;
      case "last_edited_time":
        value = new Date(value);
        break;
      case "multi_select":
        value = Array.isArray(value)
          ? value.map((v: any) => ({ name: v.name, color: v.color }))
          : [];
        break;
      case "number":
        break;
      case "people":
        value = Array.isArray(value)
          ? value.map((v: any) => v[v.type]?.email)
          : [];
        break;
      case "phone_number":
        break;
      case "place":
        value = value?.name ?? null;
        break;
      case "relation":
        // TO DO : Manage relations ?
        break;
      case "rich_text":
        // TO DO : No comprendo
        break;
      case "rollup":
        // TO DO : Manage rollups ?
        break;
      case "select":
        value = { name: value.name, color: value.color };
        break;
      case "status":
        value = { name: value.name, color: value.color };
        break;
      case "url":
        break;
      default:
        break;
    }
    properties[prop] = {
      type, 
      value
    };
  }
  return properties
}

async function downloadImage(url: string): Promise<string> {
  try {
    // Extract file extension from URL (before query params)
    const urlWithoutParams = url.split('?')[0];
    const extension = path.extname(urlWithoutParams) || '.jpg';

    // Create deterministic filename based on URL hash (without query params to handle time-limited tokens)
    const hash = createHash('md5').update(urlWithoutParams).digest('hex');
    const filename = `${hash}${extension}`;

    // Create absolute path to public/images directory
    const publicImagesDir = path.join(process.cwd(), 'public', 'images');
    const filepath = path.join(publicImagesDir, filename);
    const fileURL = `/images/${filename}`;

    // Ensure directory exists
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }

    // Check if file already exists
    if (fs.existsSync(filepath)) {
      // console.log(`♻️  Using cached image: ${filename}`);
      return fileURL;
    }

    // Fetch the image
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error(`Failed to download image from ${url}: response body is null`);
    }

    // Convert Web ReadableStream to Node.js Buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write file synchronously to ensure it completes
    fs.writeFileSync(filepath, buffer);

    console.log(`✅ Downloaded image: ${filename}`);

    // Return the public URL path
    return fileURL;
  } catch (error) {
    console.error(`❌ Error downloading image from ${url}:`, error);
    // Return the original URL as fallback
    return url;
  }
}
