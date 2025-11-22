import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


  export function formatDate(date : Date) {
    const d = new Date(date);
    // Use Intl.DateTimeFormat (en-GB) for day/month/year with short month, then lowercase month and strip leading zero
    const formatted = d.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric',
    });
    return formatted
  }

/**
 * Maps Notion select/multi-select color values to Tailwind CSS color classes
 * @param notionColor - The color value from Notion (e.g., "blue", "red", "default")
 * @returns Tailwind CSS color class string
 */
export function notionColorToTailwind(notionColor: string): string {
  const colorMap: Record<string, string> = {
    default: "bg-gray-100 text-gray-800",
    gray: "bg-gray-100 text-gray-800",
    brown: "bg-amber-100 text-amber-800",
    orange: "bg-orange-100 text-orange-800",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    pink: "bg-pink-100 text-pink-800",
    red: "bg-red-100 text-red-800",
  };

  return colorMap[notionColor] || colorMap.default;
}

/**
 * Transforms a UUID to the standard dashed format if necessary
 * @param uuid - The UUID to transform (e.g., "92299709f3be4c388344c1ab86ee4c21")
 * @returns The UUID in dashed format (e.g., "92299709-f3be-4c38-8344-c1ab86ee4c21")
 * @example
 * formatUUID("92299709f3be4c388344c1ab86ee4c21") // "92299709-f3be-4c38-8344-c1ab86ee4c21"
 * formatUUID("92299709-f3be-4c38-8344-c1ab86ee4c21") // "92299709-f3be-4c38-8344-c1ab86ee4c21"
 */
export function formatUUID(uuid: string): string {
  // Remove any existing dashes
  const cleanUUID = uuid.replace(/-/g, '');

  // Check if it's a valid UUID length (32 characters)
  if (cleanUUID.length !== 32) {
    console.warn(`Invalid UUID length: ${uuid}`);
    return uuid; // Return original if invalid
  }

  // Format as 8-4-4-4-12
  return `${cleanUUID.slice(0, 8)}-${cleanUUID.slice(8, 12)}-${cleanUUID.slice(12, 16)}-${cleanUUID.slice(16, 20)}-${cleanUUID.slice(20, 32)}`;
}

/**
 * Normalizes all UUIDs in the site structure to the standard dashed format
 * @param structure - The site structure object with page definitions
 * @returns The structure with all UUIDs properly formatted
 * @example
 * const structure = {
 *   "/": { type: "page", id: "ada129e904c54bd09c62df92eb6dc968" },
 *   "/works": { type: "database", id: "92299709f3be4c388344c1ab86ee4c21" }
 * };
 * normalizeSiteStructureUUIDs(structure);
 * // Now structure["/"].id === "ada129e9-04c5-4bd0-9c62-df92eb6dc968"
 * // And structure["/works"].id === "92299709-f3be-4c38-8344-c1ab86ee4c21"
 */
export function normalizeSiteStructureUUIDs<T extends Record<string, { id: string }>>(
  structure: T
): T {
  const normalizedStructure = { ...structure };

  for (const key in normalizedStructure) {
    const element = normalizedStructure[key];
    const originalId = element.id;
    const formattedId = formatUUID(originalId);

    if (originalId !== formattedId) {
      // console.log(`Normalized UUID for ${key}: ${originalId} -> ${formattedId}`);
      element.id = formattedId;
    }
  }

  return normalizedStructure;
}

/**
 * Generates a simple blur data URL for Next.js Image placeholder
 * Creates a 10x10 pixel gray placeholder as a base64-encoded data URI
 * @returns A base64-encoded data URI for use with Next.js Image blurDataURL
 */
export function generateBlurDataURL(): string {
  // Simple 10x10 gray SVG for blur placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
      <rect width="10" height="10" fill="#cccccc"/>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}