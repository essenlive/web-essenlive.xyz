import {
  PageObjectResponse,
  DatabaseObjectResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export type SiteData = {
  siteUrl: string;
  sitename: string;
  structure: {
    "/": PageDefinition;
    [key: string]: PageDefinition;
  };
  socials?: {
    mail?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
};

export type PageDefinition = {
  type: "page" | "database";
  id: string;
  path: "/" | string;
  filter?: any;
  sorts?: any;
  cardProperties?: string[];
  pageProperties?: string[];
  displayType?: "grid" | "list" | "list-compact";
  disableItemLinks?: boolean;
};

export interface CleanData {
  icon: string;
  title: string;
  url: string;
  slug: string;
  created_time: string;
  cover?: {
    url : string;
    blurDataURL?: string;
  }
  properties?: CleanPageProperties;
  metadata: Metadata;
}

export interface CleanPageProperties {
  [key: string]:
    | {
        type: "title";
        value: string;
      }
    | {
        type: "title";
        value: string;
      }
    | {
        type: "checkbox";
        value: boolean;
      }
    | {
        type: "created_by";
        value: string;
      }
    | {
        type: "created_time";
        value: Date;
      }
    | {
        type: "date";
        value: Date;
      }
    | {
        type: "email";
        value: string;
      }
    // | {
    //     type: "files";
    //   }
    // | {
    //     type: "formula";
    //   }
    | {
        type: "last_edited_by";
        value: string;
      }
    | {
        type: "last_edited_time";
        value: Date;
      }
    | {
        type: "multi_select";
        value: {
          color: string;
          name: string;
        }[];
      }
    | {
        type: "number";
        value: number;
      }
    | {
        type: "people";
        value: string;
      }
    | {
        type: "phone_number";
        value: string;
      }
    | {
        type: "place";
        value: string;
      }
    // | {
    //     type: "relation";
    //   }
    | {
        type: "rich_text";
        value: any[]; // To cleanup
      }
    // | {
    //     type: "rollup";
    //   }
    | {
        type: "select";
        value: {
          color: string;
          name: string;
        };
      }
    | {
        type: "status";
        value: {
          color: string;
          name: string;
        };
      }
    | {
        type: "url";
        value: string;
      };
}

export interface PageData extends PageDefinition, CleanData {}

export interface Metadata {
  title?: string;
  icons: {
    icon: string;
    shortcut: string;
    apple: string;
  };
  openGraph: {
    title: string;
    images: string[];
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    images: string[];
  };
}

export type { PageObjectResponse };

export type { DatabaseObjectResponse };

export type { BlockObjectResponse };

export type BlockWithChildren = BlockObjectResponse & {
  children?: BlockWithChildren[];
};
export interface NotionRendererProps {
  blocks: BlockWithChildren[];
}
