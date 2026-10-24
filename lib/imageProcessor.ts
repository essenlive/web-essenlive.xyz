/**
 * Image Processing Module
 *
 * Downloads images from Notion (whose URLs expire) and caches two files per image in public/images:
 * a 480px thumbnail (cards, list rows) and an 840px hero (project page). The IMAGES_PROCESS env var
 * picks the process of each slot, see imagesProcess().
 *
 * Processes:
 * - dithering: k-means palette (16 colors) + Atkinson error diffusion, lossless WebP
 * - duotone: Atkinson diffusion to two colors taken from the image (ink, paper), lossless WebP
 * - webp: plain resized lossy WebP
 *
 * @module lib/imageProcessor
 */

import fs from "fs";
import path from 'path';
import { createHash, randomUUID } from 'crypto';
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
async function applyDithering(inputPath: string, outputPath: string, numColors = 32, MAX_WIDTH = 840): Promise<void> {

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
  const palette = extractPaletteFromImage(rawBuffer, width, height, numColors);

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
/**
 * Duotone Atkinson dithering: each cover is printed in two of its own colors.
 *
 * Ink is the most saturated dark color of the image's palette (darkest if none),
 * paper its lightest. Luminance is stretched between the 2nd and 98th percentile
 * so flat photos keep contrast, then diffused to pure ink / paper pixels.
 *
 * @param {string} inputPath - Path to the source image file
 * @param {string} outputPath - Path to save the dithered image (should end in .webp)
 * @param {number} maxWidth - Width cap in px (default 840)
 */
async function applyDuotone(inputPath: string, outputPath: string, maxWidth = 840): Promise<void> {
  const { data, info } = await sharp(inputPath)
    .resize(maxWidth, null, { fit: 'inside', withoutEnlargement: true })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  const lum = (c: number[]) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  const sat = (c: number[]) => { const m = Math.max(...c); return m ? (m - Math.min(...c)) / m : 0; };
  const pal = extractPaletteFromImage(data, width, height, 16).map(c => [(c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff]);
  const byLum = [...pal].sort((a, b) => lum(a) - lum(b));
  const paper = byLum[byLum.length - 1];
  const ink = pal.filter(c => lum(c) < 0.5).sort((a, b) => sat(b) - sat(a))[0] ?? byLum[0];

  const tone = new Float32Array(width * height);
  for (let i = 0; i < tone.length; i++) tone[i] = lum([data[i * 4], data[i * 4 + 1], data[i * 4 + 2]]);
  const sorted = [...tone].sort((a, b) => a - b);
  const lo = sorted[Math.floor(tone.length * 0.02)];
  const hi = sorted[Math.floor(tone.length * 0.98)];
  for (let i = 0; i < tone.length; i++) tone[i] = Math.min(1, Math.max(0, (tone[i] - lo) / (hi - lo || 1)));

  const out = Buffer.alloc(width * height * 3);
  const spread = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]; // each gets 1/8
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const on = tone[i] > 0.5 ? 1 : 0;
      const c = on ? paper : ink;
      out[i * 3] = c[0]; out[i * 3 + 1] = c[1]; out[i * 3 + 2] = c[2];
      const err = (tone[i] - on) / 8;
      for (const [dx, dy] of spread) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny >= height) continue;
        tone[ny * width + nx] += err;
      }
    }
  }

  await sharp(out, { raw: { width, height, channels: 3 } })
    .webp({ lossless: true, effort: 6 })
    .toFile(outputPath);
}

type DownloadedImage = { url: string; blurDataURL?: string; width?: number; height?: number; palette?: string[]; thumbnail?: string };

/** Most frequent colors of a dithered file; nearest-neighbour downscale keeps the exact palette colors. */
async function dominantColors(filepath: string, n = 10): Promise<string[]> {
  const { data } = await sharp(filepath).resize(96, null, { kernel: 'nearest' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const count = new Map<number, number>();
  for (let i = 0; i < data.length; i += 3) {
    const c = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    count.set(c, (count.get(c) ?? 0) + 1);
  }
  return [...count].sort((a, b) => b[1] - a[1]).slice(0, n).map(([c]) => `#${c.toString(16).padStart(6, '0')}`);
}

type Process = 'dithering' | 'duotone' | 'webp';
type Slot = 'thumbnail' | 'hero';

/** Max width in px of each file; thumbnails are cards and list rows, the hero is the project page. */
const WIDTH: Record<Slot, number> = { thumbnail: 480, hero: 840 };

/**
 * IMAGES_PROCESS='{"thumbnail":"duotone","hero":"dithering"}'
 * Each slot is 'dithering' (16-color Atkinson), 'duotone' (two colors from the image) or 'webp' (plain, lossy).
 * A missing or unknown value falls back to 'webp'.
 */
function imagesProcess(): Record<Slot, Process> {
  let raw: Record<string, unknown> = {};
  try { raw = JSON.parse(process.env.IMAGES_PROCESS ?? '{}'); } catch { /* use defaults */ }
  const pick = (v: unknown): Process => (v === 'dithering' || v === 'duotone' ? v : 'webp');
  return { thumbnail: pick(raw.thumbnail), hero: pick(raw.hero) };
}

async function render(mode: Process, input: string, output: string, width: number): Promise<void> {
  if (mode === 'duotone') return applyDuotone(input, output, width);
  if (mode === 'dithering') return applyDithering(input, output, 16, width);
  await sharp(input)
    .resize(width, null, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: width > WIDTH.thumbnail ? 90 : 80, effort: 6 })
    .toFile(output);
}

type Files = { hero: string; thumbnail: string; modes: Record<Slot, Process> };

async function describeImage(files: Files): Promise<DownloadedImage> {
  const { width, height } = await sharp(files.hero).metadata();
  // A duotone file has exactly two colors (ink, paper); otherwise the most frequent ones of the hero.
  const duo = (['thumbnail', 'hero'] as Slot[]).find((slot) => files.modes[slot] === 'duotone');
  const palette = duo ? await dominantColors(files[duo], 2) : await dominantColors(files.hero);
  return {
    url: `/images/${path.basename(files.hero)}`,
    thumbnail: `/images/${path.basename(files.thumbnail)}`,
    blurDataURL: await getImagePlaceholder(files.hero),
    width,
    height,
    palette,
  };
}
const inFlight = new Map<string, Promise<DownloadedImage>>();

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
    const modes = imagesProcess();

    // Deterministic names from the URL hash (without query params, which carry time-limited tokens) and the
    // process used, so changing IMAGES_PROCESS never serves a stale file.
    const hash = createHash('md5').update(url.split('?')[0]).digest('hex');
    const dir = path.join(process.cwd(), 'public', 'images');
    const files: Files = {
      hero: path.join(dir, `${hash}-hero-${modes.hero}.webp`),
      thumbnail: path.join(dir, `${hash}-thumb-${modes.thumbnail}.webp`),
      modes,
    };

    fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(files.hero) && fs.existsSync(files.thumbnail)) return describeImage(files);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    // sharp reads the original from a per-call temp file (the format is detected from the content)
    const tempFilepath = path.join(dir, `temp_${hash}_${randomUUID()}.tmp`);
    fs.writeFileSync(tempFilepath, Buffer.from(await response.arrayBuffer()));
    try {
      for (const slot of ['hero', 'thumbnail'] as Slot[]) {
        if (!fs.existsSync(files[slot])) await render(modes[slot], tempFilepath, files[slot], WIDTH[slot]);
      }
      console.log(`✅ Downloaded and processed image: ${hash} (hero ${modes.hero}, thumbnail ${modes.thumbnail})`);
    } finally {
      fs.rmSync(tempFilepath, { force: true });
    }

    return describeImage(files);
  } catch (error) {
    console.error(`❌ Error downloading image from ${url}:`, error);
    return {
      url,
    };
  }
}
