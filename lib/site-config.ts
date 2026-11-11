/**
 * Pure (no Node, no env) site configuration read from `SITE_DATA`: texts and dither-field zones,
 * with built-in defaults. Safe to import from client components (e.g. the /dev-env editor).
 */

/**
 * Every interface string, kept to one simple word where possible. Override in `SITE_DATA.texts` (site-wide)
 * or in a structure entry's `texts`. Content labels (section titles, "see all") are not here: they use the
 * database's own `label`.
 */
export const DEFAULT_TEXTS = {
  // Generic interface
  skip: "contenu",
  menu: "menu",
  newTab: "nouvel onglet",
  footer: "polices système · images tramées",
  error: "erreur",
  confirm: "relancer ?",
  search: "rechercher",
  all: "tout",
  none: "aucun",
  /** `{shown}` and `{total}` are the filtered and total entry counts. */
  count: "{shown}/{total}",
  done: "fait",
  todo: "à faire",
  link: "lien",
  video: "vidéo",
  audio: "audio",
  file: "fichier",
  code: "code",
  // One-off pages
  notFound: "404",
  home: "← accueil",
};

export type SiteTexts = typeof DEFAULT_TEXTS;
export type TextKey = keyof SiteTexts;

export const mergeTexts = (...layers: (Partial<SiteTexts> | undefined)[]): SiteTexts =>
  Object.assign({}, DEFAULT_TEXTS, ...layers.map((l) => Object.fromEntries(Object.entries(l ?? {}).filter(([, v]) => typeof v === "string"))));

/** Replaces `{name}` placeholders. */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
