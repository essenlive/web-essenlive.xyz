import {
  PageObjectResponse,
  DatabaseObjectResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export type SiteData = {
  sitename: string;
  structure: {
    "/": PageDefinition;
    [key: string]: PageDefinition;
  };
  socials?: {
    mail?: string;
    github?: string;
  };
};

export type PageDefinition = {
  type: "page" | "database";
  id: string;
  path: "/" | string;
  filter?: any;
  sorts?: any;
  selectedProperties?: string[];
};

export interface CleanData {
  icon: string;
  title: string;
  url: string;
  slug: string;
  created_time: string;
  cover?: string;
  properties?: any;
  metadata: Metadata;
};

export interface PageData extends PageDefinition, CleanData {
}

export interface Metadata {
    title?: string
    icons: {
      icon: string
      shortcut: string
      apple: string
    },
    openGraph: {
      title: string
      images: string[]
    },
    twitter: {
      card: "summary_large_image",
      title: string,
      images: string[]
    },
  };

  
export type { PageObjectResponse };

export type { DatabaseObjectResponse };

export type { BlockObjectResponse };

export type BlockWithChildren = BlockObjectResponse & {
  children?: BlockWithChildren[];
};
export interface NotionRendererProps {
  blocks: BlockWithChildren[];
} 