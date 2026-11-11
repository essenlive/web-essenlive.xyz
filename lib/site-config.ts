/**
 * Pure (no Node, no env) site configuration read from `SITE_DATA`: texts and dither-field zones,
 * with built-in defaults. Safe to import from client components (e.g. the /dev-env editor).
 */

/** Every interface string of the site. Override any of them in `SITE_DATA.texts` (site-wide) or in a structure entry's `texts`. */
export const DEFAULT_TEXTS = {
  skipLink: "Aller au contenu",
  navLabel: "Pages",
  newTab: "(nouvel onglet)",
  footer: "polices système · images tramées",
  /** Appended to `footer` from the `sm` breakpoint up. */
  footerExtra: "32 couleurs",
  sizeUnit: "ko",
  /** `{date}` is the build date (YYYY-MM-DD). */
  buildDate: "généré le {date}",
  redeployConfirm: "Relancer le déploiement ?",
  redeployOk: "déploiement lancé",
  redeployError: "échec",
  pageNotFoundTitle: "Page introuvable",
  notFoundTitle: "404",
  notFoundMessage: "Cette page n'existe pas (ou plus).",
  notFoundBack: "← accueil",
  featuredTitle: "Sélection",
  seeAll: "tout voir →",
  searchPlaceholder: "rechercher",
  searchLabel: "Rechercher dans les entrées",
  filterAll: "tout",
  noResults: "aucun résultat",
  /** `{shown}` and `{total}` are the filtered and total entry counts. */
  resultCount: "{shown} sur {total}",
  checkboxDone: "fait",
  checkboxTodo: "à faire",
  linkKind: "lien",
  videoKind: "vidéo",
  videoName: "Vidéo",
  videoAction: "regarder →",
  audioKind: "audio",
  audioName: "Audio",
  audioAction: "écouter →",
  fileKind: "fichier",
  fileName: "Fichier",
  fileAction: "télécharger →",
  embedTitle: "Contenu intégré",
  mermaidError: "Erreur de rendu du diagramme",
  mermaidErrorHint: "Vérifie la syntaxe du diagramme",
  mermaidShowCode: "Voir le code du diagramme",
};

export type SiteTexts = typeof DEFAULT_TEXTS;
export type TextKey = keyof SiteTexts;

export const mergeTexts = (...layers: (Partial<SiteTexts> | undefined)[]): SiteTexts =>
  Object.assign({}, DEFAULT_TEXTS, ...layers.map((l) => Object.fromEntries(Object.entries(l ?? {}).filter(([, v]) => typeof v === "string"))));

/** Replaces `{name}` placeholders. */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));

export const DITHER_PATTERNS = ["horizon", "glow", "aurora", "waves", "clouds"] as const;

/** Props of the Magic UI DitherField, plus the height of the band. */
export type DitherOptions = {
  pattern?: (typeof DITHER_PATTERNS)[number];
  /** Image or video to dither instead of the pattern (a file in public/ or a CORS-enabled URL). */
  src?: string;
  /** Any CSS colour (`var(--foreground)`), or a [low, mid, high] ramp. */
  color?: string | [string, string, string];
  dotSize?: number;
  intensity?: number;
  /** 0 holds a still frame. */
  speed?: number;
  fps?: number;
  interactive?: boolean;
  /** CSS height of a band (ignored on cards, which fill their frame). */
  height?: string;
};

/** `false` turns the zone off, `true` or `{}` uses the defaults, an object overrides them. */
export type DitherSetting = boolean | DitherOptions;

/** Where the effect shows. Absent = on with the defaults; `false` = off. */
export type DitherZones = {
  /** Band at the top of the home page. */
  hero?: DitherSetting;
  /** Band at the top of the other top-level pages and databases. */
  sections?: DitherSetting;
  /** Band at the top of a database item's page. */
  items?: DitherSetting;
  /** Fills the frame of cards that have no cover. */
  cards?: DitherSetting;
  /** Band on the 404 page. */
  notFound?: DitherSetting;
};

/** Per structure entry: overrides the zones for that section only. */
export type DitherEntry = {
  /** The band at the top of this page. */
  header?: DitherSetting;
  /** The cards of this database. */
  cards?: DitherSetting;
};

export type DitherZone = keyof DitherZones;

const BASE: Required<Omit<DitherOptions, "src" | "height">> = {
  pattern: "horizon",
  color: "var(--foreground)",
  dotSize: 1,
  intensity: 0.75,
  speed: 1,
  fps: 30,
  interactive: true,
};

const ZONE_DEFAULTS: Record<DitherZone, DitherOptions> = {
  hero: { pattern: "horizon", height: "18rem" },
  sections: { pattern: "waves", height: "8rem" },
  items: { pattern: "clouds", height: "6rem" },
  // Many cards on a page: bigger dots, fewer frames, no pointer glow.
  cards: { pattern: "glow", dotSize: 2, fps: 15, interactive: false },
  notFound: { pattern: "aurora", height: "14rem" },
};

/** Final options for a zone, or null when it is off. The first defined setting wins (entry before site-wide); it is not merged with the others. */
export function resolveDither(zone: DitherZone, ...settings: (DitherSetting | undefined)[]): (DitherOptions & typeof BASE) | null {
  let chosen: DitherSetting = true;
  for (const s of settings) if (s !== undefined) { chosen = s; break; }
  if (chosen === false) return null;
  const own = chosen === true ? {} : chosen;
  return { ...BASE, ...ZONE_DEFAULTS[zone], ...Object.fromEntries(Object.entries(own).filter(([, v]) => v !== undefined && v !== "")) };
}
