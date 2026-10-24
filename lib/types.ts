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
  /** Footer/nav links; a bare email address becomes a mailto: link. */
  socials?: { title: string; url: string }[];
};

export type PageDefinition = {
  type: "page" | "database";
  id: string;
  path: "/" | string;
  /** Navigation label; falls back to the path without its slash. */
  label?: string;
  filter?: any;
  sorts?: any;
  cardProperties?: string[];
  pageProperties?: string[];
  displayType?: "grid" | "list" | "list-compact";
  disableItemLinks?: boolean;
  /** Shows the big title block on a top-level page (sub-pages always show theirs). */
  showTitle?: boolean;
  /** Shows "— N entrées" under a database. */
  showEntryCount?: boolean;
  /** Adds a tag filter bar (select/multi_select/status values) to the header. */
  showFilter?: boolean;
  /** Properties whose values become filter tags (default: cardProperties, else all). */
  filterProperties?: string[];
  /** Adds a text search input to the header. */
  showSearch?: boolean;
  /** Properties the search looks in, besides the title (default: cardProperties, else all). */
  searchProperties?: string[];
  /** Grid columns from `lg` up (default 3). */
  columns?: number;
  featured?: FeaturedDefinition;
};

/**
 * Items of a database section shown under a page. Items link to that section's
 * pages and a "tout voir" link points to it.
 */
export type FeaturedDefinition = {
  /** Path of a database section in the structure, e.g. "/works". */
  from: string;
  title?: string;
  /** Combined (AND) with the section's own filter. */
  filter?: any;
  /** Replaces the section's sorts. */
  sorts?: any;
  limit?: number;
  /** Replaces the section's cardProperties. */
  cardProperties?: string[];
  /** Grid columns from `lg` up (default 3). */
  columns?: number;
  /** Falls back to the section's displayType, then "grid". */
  displayType?: PageDefinition["displayType"];
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
    width?: number;
    height?: number;
    /** Small file for cards and list rows; the hero is url. */
    thumbnail?: string;
    /** Dominant colors, hex, most frequent first; exactly two colors [ink, paper] (either order) when a slot is duotone. */
    palette?: string[];
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
