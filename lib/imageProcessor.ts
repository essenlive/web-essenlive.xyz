/**
 * Image Processing Module
 *
 * This module handles downloading, processing, and optimizing images from Notion.
 * It provides two modes of operation controlled by the DITHER_IMAGES environment variable:
 *
 * 1. Dithering Mode (DITHER_IMAGES=true):
 *    - Extracts dominant colors using k-means clustering
 *    - Applies Atkinson dithering algorithm
 *    - Creates artistic, retro-style images with reduced colors
 *    - Outputs lossless WebP format
 *
 * 2. Standard Mode (DITHER_IMAGES=false or unset):
 *    - Resizes images to max 840px width
 *    - Converts to WebP with quality compression
 *    - Faster processing, smaller file sizes
 *
 * Both modes:
 * - Resize to max width of 840px (maintains aspect ratio)
 * - Convert to WebP format for optimal compression
 * - Cache processed images to avoid reprocessing
 *
 * Environment Variables:
 * - DITHER_IMAGES: Set to 'true' to enable dithering mode
 *
 * @module lib/imageProcessor
 */

import fs from "fs";
import path from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';
import { getImagePlaceholder } from "@/lib/plaiceholder";

/**
 * Extracts a dynamic color palette from an image using k-means clustering
 *
 * This function analyzes the image and extracts the most dominant colors
 * to create a custom palette for dithering.
 *
 * @param {Buffer} rawBuffer - Raw RGBA pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} numColors - Number of colors to extract (default: 16)
 * @returns {number[]} Array of packed ARGB integers representing the palette
 */
function extractPaletteFromImage(
  rawBuffer: Buffer,
  width: number,
  height: number,
  numColors: number = 16
): number[] {
  const totalPixels = width * height;
  const sampleSize = Math.min(10000, totalPixels); // Sample up to 10k pixels
  const sampleStep = Math.floor(totalPixels / sampleSize);

  // Collect sample pixels
  const samples: { r: number; g: number; b: number }[] = [];
  for (let i = 0; i < totalPixels; i += sampleStep) {
    samples.push({
      r: rawBuffer[i * 4],
      g: rawBuffer[i * 4 + 1],
      b: rawBuffer[i * 4 + 2]
    });
  }

  // Simple k-means clustering
  // Initialize centroids deterministically: each new one is the sample farthest
  // from those already chosen, so small distinct colors (UI accents) survive
  const centroids: { r: number; g: number; b: number }[] = [{ ...samples[0] }];
  const nearest = samples.map(s => (s.r - samples[0].r) ** 2 + (s.g - samples[0].g) ** 2 + (s.b - samples[0].b) ** 2);
  while (centroids.length < numColors) {
    let far = 0;
    nearest.forEach((d, i) => { if (d > nearest[far]) far = i; });
    const c = { ...samples[far] };
    centroids.push(c);
    samples.forEach((s, i) => {
      nearest[i] = Math.min(nearest[i], (s.r - c.r) ** 2 + (s.g - c.g) ** 2 + (s.b - c.b) ** 2);
    });
  }

  // Iterate k-means
  const maxIterations = 10;
  for (let iter = 0; iter < maxIterations; iter++) {
    const clusters: number[][] = Array.from({ length: numColors }, () => []);

    // Assign each sample to nearest centroid
    samples.forEach((sample, idx) => {
      let minDist = Infinity;
      let bestCluster = 0;

      centroids.forEach((centroid, ci) => {
        const dist = Math.sqrt(
          Math.pow(sample.r - centroid.r, 2) +
          Math.pow(sample.g - centroid.g, 2) +
          Math.pow(sample.b - centroid.b, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          bestCluster = ci;
        }
      });

      clusters[bestCluster].push(idx);
    });

    // Update centroids
    clusters.forEach((cluster, ci) => {
      if (cluster.length > 0) {
        let sumR = 0, sumG = 0, sumB = 0;
        cluster.forEach(idx => {
          sumR += samples[idx].r;
          sumG += samples[idx].g;
          sumB += samples[idx].b;
        });
        centroids[ci] = {
          r: Math.round(sumR / cluster.length),
          g: Math.round(sumG / cluster.length),
          b: Math.round(sumB / cluster.length)
        };
      }
    });
  }

  // Convert centroids to ARGB format
  return centroids.map(c =>
    ((0xff << 24) | (c.r << 16) | (c.g << 8) | c.b) >>> 0
  );
}

/**
 * Applies Atkinson dithering with a dynamic color palette to an image
 *
 * This function processes an image buffer using the Atkinson dithering algorithm
 * and quantizes colors to a palette extracted from the image itself.
 *
 * Process:
 * 1. Resize image to max width of 840px (maintaining aspect ratio)
 * 2. Read image with sharp and get raw RGBA pixel data
 * 3. Extract dominant colors from the image to create a custom palette
 * 4. Atkinson error diffusion directly against that palette (nearest color per pixel)
 * 5. Save as lossless WebP
 *
 * @param {string} inputPath - Path to the source image file
 * @param {string} outputPath - Path to save the dithered image (should end in .webp)
 * @returns {Promise<void>}
 */
async function applyDithering(inputPath: string, outputPath: string): Promise<void> {
  const MAX_WIDTH = 840;

  // Load image and resize to max width of 840px while maintaining aspect ratio
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;

  if (originalWidth === 0 || originalHeight === 0) {
    throw new Error('Invalid image dimensions');
  }

  // Calculate new dimensions
  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (originalWidth > MAX_WIDTH) {
    targetWidth = MAX_WIDTH;
    targetHeight = Math.round((originalHeight * MAX_WIDTH) / originalWidth);
  }

  // Resize and get raw RGBA pixel data
  const { data: rawBuffer, info } = await sharp(inputPath)
    .resize(targetWidth, targetHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  // sharp may round the size (e.g. 839 instead of 840): read rows with its width, not ours
  const { width, height } = info;

  // Extract dynamic palette from the image
  const palette = extractPaletteFromImage(rawBuffer, width, height, 32);

  // Atkinson error diffusion against the extracted palette itself
  // (diffusing against any other palette gives noise and muddy colors)
  const pal = palette.map(c => [(c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff]);
  const work = Float32Array.from(rawBuffer); // RGBA, error accumulates in RGB
  const rgbaBuffer = Buffer.alloc(width * height * 4);
  const spread = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]; // each gets 1/8

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = Math.min(255, Math.max(0, work[i]));
      const g = Math.min(255, Math.max(0, work[i + 1]));
      const b = Math.min(255, Math.max(0, work[i + 2]));

      let best = pal[0];
      let minDist = Infinity;
      for (const c of pal) {
        const d = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;
        if (d < minDist) { minDist = d; best = c; }
      }

      rgbaBuffer[i] = best[0];
      rgbaBuffer[i + 1] = best[1];
      rgbaBuffer[i + 2] = best[2];
      rgbaBuffer[i + 3] = rawBuffer[i + 3];

      const er = (r - best[0]) / 8, eg = (g - best[1]) / 8, eb = (b - best[2]) / 8;
      for (const [dx, dy] of spread) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny >= height) continue;
        const j = (ny * width + nx) * 4;
        work[j] += er; work[j + 1] += eg; work[j + 2] += eb;
      }
    }
  }

  // Save as lossless WebP
  await sharp(rgbaBuffer, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .webp({
    lossless: true,
    quality: 100,
    effort: 6  // Higher effort = better compression (0-6)
  })
  .toFile(outputPath);
}

/**
 * Downloads and caches images from Notion to the local filesystem
 *
 * This function handles image persistence for Notion-hosted images which have
 * time-limited expiring URLs. Images are downloaded to public/images/ and
 * identified by MD5 hash of the URL (excluding query params).
 *
 * Features:
 * - Automatic caching: Skips download if file already exists
 * - Deterministic naming: Same source URL always maps to same filename
 * - Time-token resilience: Ignores query params when hashing
 * - Automatic directory creation
 * - Fallback to original URL on error
 * - Image processing: Resizes, dithers, and converts to WebP
 *
 * Process:
 * 1. Generates MD5 hash from URL (without query params)
 * 2. Checks if cached version exists
 * 3. Downloads if needed and saves to temp file
 * 4. Applies dithering and converts to WebP
 * 5. Returns public URL path (/images/filename)
 *
 * @param {string} url - The Notion image URL to download
 * @returns {Promise<string>} Local public URL path or original URL on failure
 *
 * @example
 * const localUrl = await downloadImage("https://notion.so/image.jpg?expires=123");
 * // Returns: "/images/abc123def456.webp"
 * // File saved to: public/images/abc123def456.webp
 */
type DownloadedImage = { url: string; blurDataURL?: string };
const inFlight = new Map<string, Promise<DownloadedImage>>();

// Pages sharing an image (e.g. a default cover) would race on the same temp file
export function downloadImage(url: string): Promise<DownloadedImage> {
  const key = url.split('?')[0];
  let p = inFlight.get(key);
  if (!p) {
    p = downloadImageOnce(url).finally(() => inFlight.delete(key));
    inFlight.set(key, p);
  }
  return p;
}

async function downloadImageOnce(url: string): Promise<DownloadedImage> {
  try {
    // Check if dithering is enabled via environment variable
    const shouldDither = process.env.DITHER_IMAGES === 'true';

    // Create deterministic filename based on URL hash (without query params to handle time-limited tokens)
    const urlWithoutParams = url.split('?')[0];
    const hash = createHash('md5').update(urlWithoutParams).digest('hex');
    // Use .webp for output (lossless WebP provides best compression)
    const filename = `${hash}.webp`;

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
      return {
        url: fileURL,
        blurDataURL: await getImagePlaceholder(filepath),
      };
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

    if (shouldDither) {
      // Write original image to a temp file for processing
      // Use .tmp extension so Sharp can auto-detect the actual image format from the buffer
      const tempFilepath = path.join(publicImagesDir, `temp_${hash}.tmp`);
      fs.writeFileSync(tempFilepath, buffer);

      // Apply Atkinson dithering and convert to WebP
      try {
        await applyDithering(tempFilepath, filepath);
        console.log(`✅ Downloaded and dithered image: ${filename}`);
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFilepath)) {
          fs.unlinkSync(tempFilepath);
        }
      }
    } else {
      // Process without dithering: just resize and convert to WebP
      await sharp(buffer)
        .resize(840, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: 90,
          effort: 6
        })
        .toFile(filepath);
      console.log(`✅ Downloaded and optimized image: ${filename}`);
    }

    // Return the public URL path
    return {
      url: fileURL,
      blurDataURL: await getImagePlaceholder(filepath)
    };
  } catch (error) {
    console.error(`❌ Error downloading image from ${url}:`, error);
    // Return the original URL as fallback
    return {
      url,
    };
  }
}
