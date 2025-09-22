import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import path from 'path';
import {
  createId,
  paths,
  readJson,
  saveBuffer,
  publicUrlFromPath,
  writeJson
} from '../../dekor/lib/fs';
import { buildStagingPrompt } from '../../dekor/lib/prompts';
import type {
  ApiResponse,
  ProductMetadata,
  RoomAnalysisResult,
  StageMetadata
} from '../../dekor/lib/types';
import { runFalEdit } from '../../dekor/lib/fal';
import { compositeWithSharp } from '../../dekor/lib/image';

interface StageRequestBody {
  roomPath: string;
  roomAnalysis: RoomAnalysisResult;
  selections: Array<{ productId: string; imageId: string }>;
}

function toAbsolute(publicPath: string) {
  return path.join(process.cwd(), 'public', publicPath.replace(/^\/+/, ''));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StageRequestBody;
    if (!body.roomPath || !body.roomAnalysis || !body.selections?.length) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Missing roomPath, analysis, or selections.' },
        { status: 400 }
      );
    }

    const uniqueProductIds = Array.from(new Set(body.selections.map((selection) => selection.productId)));
    const productMetas = await Promise.all(
      uniqueProductIds.map((productId) =>
        readJson<ProductMetadata>(paths.productsProcessed(productId, 'meta.json'))
      )
    );

    const processedImagePaths = body.selections.map((selection) => {
      const productMeta = productMetas.find((meta) => meta.id === selection.productId);
      const image = productMeta?.images.find((img) => img.id === selection.imageId);
      if (!productMeta || !image?.processedPath) {
        throw new Error(`Missing processed image for product ${selection.productId}`);
      }
      return { product: productMeta, processedPath: image.processedPath };
    });

    const prompt = buildStagingPrompt();
    const roomAbsolute = toAbsolute(body.roomPath);
    const productAbsolutePaths = processedImagePaths.map((item) => toAbsolute(item.processedPath));

    let outputPath: string | null = null;
    let generator: StageMetadata['generator'] = 'fal';
    let confidence = 0.9;

    try {
      const falResult = await runFalEdit({
        prompt,
        roomImagePath: roomAbsolute,
        productImagePaths: productAbsolutePaths
      });
      if (!falResult?.images?.[0]?.url) {
        throw new Error('Fal.ai did not return images.');
      }
      const falImageResponse = await fetch(falResult.images[0].url);
      if (!falImageResponse.ok) {
        throw new Error('Fal.ai image download failed.');
      }
      const buffer = await falImageResponse.arrayBuffer();
      outputPath = paths.stagingOutput(`${createId('staged')}.png`);
      await saveBuffer(outputPath, buffer);
      confidence = 0.9;
    } catch (error) {
      console.warn('[stage-nano] Fal.ai generation failed, using Sharp fallback', error);
      generator = 'sharp-fallback';
      confidence = 0.6;
      outputPath = await compositeWithSharp({
        roomImagePath: roomAbsolute,
        productImagePaths: productAbsolutePaths
      });
    }

    if (!outputPath) {
      throw new Error('Failed to produce staged image.');
    }

    const stageId = createId('stage');
    const metadata: StageMetadata = {
      id: stageId,
      createdAt: new Date().toISOString(),
      productIds: uniqueProductIds,
      roomImagePath: body.roomPath,
      outputImagePath: publicUrlFromPath(outputPath),
      prompt,
      generator,
      confidence
    };

    const metaPath = paths.stagingMeta(`${stageId}.json`);
    await writeJson(metaPath, metadata);

    return NextResponse.json<ApiResponse<StageMetadata>>({ success: true, data: metadata });
  } catch (error) {
    console.error('[stage-nano] error', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: (error as Error).message, details: null },
      { status: 500 }
    );
  }
}
