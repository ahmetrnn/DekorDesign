import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { randomUUID } from 'crypto';
import path from 'path';
import { readFile } from 'fs/promises';

export const dynamic = 'force-dynamic';
import {
  createId,
  paths,
  writeJson,
  sanitizeFilename,
  saveBuffer,
  ensureDir,
  publicUrlFromPath
} from '../../dekor/lib/fs';
import type { ProductMetadata, ProductImage, ApiResponse } from '../../dekor/lib/types';
import { ensurePng } from '../../dekor/lib/image';

interface ScrapedProductData {
  title: string;
  price?: string;
  color?: string;
  material?: string;
  dimensions?: string;
  images: string[];
}

async function scrapeProduct(url: string): Promise<ScrapedProductData> {
  const response = await fetch(url, { headers: { 'User-Agent': 'DekorBot/1.0 (+https://dekor.example)' } });
  if (!response.ok) {
    throw new Error(`Scrape failed with status ${response.status}`);
  }
  const html = await response.text();
  const $ = cheerio.load(html);

  const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text() || 'Untitled Furniture';
  const price =
    $('meta[itemprop="price"]').attr('content') ||
    $('[data-price], .price, [itemprop="price"]').first().text() ||
    undefined;
  const color =
    $('meta[itemprop="color"]').attr('content') ||
    $('[data-color], .color, [itemprop="color"]').first().text() ||
    undefined;
  const material =
    $('meta[itemprop="material"]').attr('content') ||
    $('[data-material], .material, [itemprop="material"]').first().text() ||
    undefined;
  const dimensions =
    $('[data-dimensions], .dimensions, [itemprop="size"]').first().text() ||
    $('meta[itemprop="size"]').attr('content') ||
    undefined;

  const images = new Set<string>();
  $('meta[property="og:image"], img').each((_, element) => {
    const src = $(element).attr('content') || $(element).attr('src');
    if (src) {
      images.add(new URL(src, url).toString());
    }
  });

  return {
    title: title.trim() || 'Untitled Furniture',
    price: price?.trim(),
    color: color?.trim(),
    material: material?.trim(),
    dimensions: dimensions?.trim(),
    images: Array.from(images)
  };
}

async function downloadImage(url: string, productId: string, imageId: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const fileExt = path.extname(new URL(url).pathname) || '.jpg';
  const originalFilename = sanitizeFilename(`${imageId}${fileExt}`);
  const originalPath = paths.productsOriginal(productId, originalFilename);
  await saveBuffer(originalPath, arrayBuffer);

  const normalizedOriginal = await ensurePng(originalPath);
  const processedFilename = sanitizeFilename(`${imageId}.png`);
  const processedPath = paths.productsProcessed(productId, processedFilename);
  const processedBuffer = await readFile(normalizedOriginal);
  await saveBuffer(processedPath, processedBuffer);

  return {
    originalPath: publicUrlFromPath(originalPath),
    processedPath: publicUrlFromPath(processedPath)
  };
}

async function persistUpload(file: File, productId: string, imageId: string) {
  const arrayBuffer = await file.arrayBuffer();
  const originalFilename = sanitizeFilename(`${imageId}-${file.name || 'upload'}`);
  const originalPath = paths.productsOriginal(productId, originalFilename);
  await saveBuffer(originalPath, arrayBuffer);
  const normalizedOriginal = await ensurePng(originalPath);
  const processedPath = paths.productsProcessed(productId, `${imageId}.png`);
  const processedBuffer = await readFile(normalizedOriginal);
  await saveBuffer(processedPath, processedBuffer);
  return {
    originalPath: publicUrlFromPath(originalPath),
    processedPath: publicUrlFromPath(processedPath)
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const url = formData.get('url')?.toString();
    const file = formData.get('file');

    if (!url && !(file instanceof File)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Provide a product URL or upload an image.' },
        { status: 400 }
      );
    }

    const productId = createId('product');
    await Promise.all([
      ensureDir(paths.productsOriginal(productId)),
      ensureDir(paths.productsProcessed(productId))
    ]);

    let metadataFromSource: ScrapedProductData | null = null;
    if (url) {
      metadataFromSource = await scrapeProduct(url);
    }

    const images: ProductImage[] = [];

    if (metadataFromSource?.images?.length) {
      for (const imageUrl of metadataFromSource.images.slice(0, 4)) {
        try {
          const imageId = randomUUID();
          const { originalPath, processedPath } = await downloadImage(imageUrl, productId, imageId);
          images.push({
            id: imageId,
            originalPath,
            processedPath,
            backgroundRemoved: true,
            confidence: 0.85
          });
        } catch (error) {
          console.warn('[ingest] image download failed', error);
        }
      }
    }

    if (file instanceof File) {
      const imageId = randomUUID();
      const { originalPath, processedPath } = await persistUpload(file, productId, imageId);
      images.push({
        id: imageId,
        originalPath,
        processedPath,
        backgroundRemoved: true,
        confidence: 0.8
      });
    }

    if (!images.length) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'No product images were available. Try uploading an image directly.'
        },
        { status: 422 }
      );
    }

    const metadata: ProductMetadata = {
      id: productId,
      source: url ? 'url' : 'upload',
      sourceUrl: url,
      title: metadataFromSource?.title || (file instanceof File ? file.name : 'Uploaded Product'),
      price: metadataFromSource?.price,
      color: metadataFromSource?.color,
      material: metadataFromSource?.material,
      dimensions: metadataFromSource?.dimensions,
      createdAt: new Date().toISOString(),
      images
    };

    const metaPath = path.join(paths.productsProcessed(productId), 'meta.json');
    await writeJson(metaPath, metadata);

    return NextResponse.json<ApiResponse<ProductMetadata>>({ success: true, data: metadata });
  } catch (error) {
    console.error('[ingest] error', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: (error as Error).message, details: null },
      { status: 500 }
    );
  }
}
