import { getPlaiceholder } from "plaiceholder";
import fs from "fs/promises";

/**
 * Generate blur data for a local image file
 * @param imagePath - Path to the image file
 * @returns Blur data URL for use with Next.js Image placeholder prop
 */
export async function getBlurDataFromFile(imagePath: string) {
  const buffer = await fs.readFile(imagePath);
  const { base64 } = await getPlaiceholder(buffer);
  return base64;
}

/**
 * Generate blur data from a remote image URL
 * @param imageUrl - URL of the remote image
 * @returns Blur data URL for use with Next.js Image placeholder prop
 */
export async function getBlurDataFromUrl(imageUrl: string) {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const { base64 } = await getPlaiceholder(Buffer.from(buffer));
  return base64;
}

/**
 * Generate blur data and color palette from an image
 * @param imagePath - Path to the image file or URL
 * @returns Object containing blur data, dominant color, and other metadata
 */
export async function getImagePlaceholder(imagePath: string) {
  let buffer: Buffer;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const response = await fetch(imagePath);
    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = await fs.readFile(imagePath);
  }

  const { base64, metadata, color } = await getPlaiceholder(buffer);

  return base64
  // return {
  //   blurDataURL: base64,
  //   metadata,
  //   color,
  // };
}
