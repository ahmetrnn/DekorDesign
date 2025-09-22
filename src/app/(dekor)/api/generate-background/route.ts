import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import {
  createId,
  paths,
  saveBuffer,
  publicUrlFromPath,
  writeJson
} from '../../dekor/lib/fs';
import type { ApiResponse, StageMetadata } from '../../dekor/lib/types';
import { runFalBackgroundGeneration } from '../../dekor/lib/fal';

interface BackgroundGenerateRequestBody {
  imageBase64: string;
  prompt: string;
}

// Helper to convert base64 to buffer
function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BackgroundGenerateRequestBody;
    if (!body.imageBase64 || !body.prompt) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Missing imageBase64 or prompt.' },
        { status: 400 }
      );
    }

    const imageBuffer = base64ToBuffer(body.imageBase64);
    const tempImageId = createId('temp_bg_input');
    const tempImagePath = paths.stagingTemp(`${tempImageId}.png`);
    await saveBuffer(tempImagePath, imageBuffer);

    let generatedImagePath: string | null = null;

    try {
      // Assuming runFalBackgroundGeneration will handle the AI background generation
      // It should take the path to the input image and the prompt
      // And return the path to the generated image buffer or a URL to download it
      const generatedImageBuffer = await runFalBackgroundGeneration({
        prompt: body.prompt,
        productImagePath: tempImagePath,
      });

      if (!generatedImageBuffer) {
        throw new Error('Background generation failed to produce an image.');
      }

      const outputImageId = createId('generated_bg');
      generatedImagePath = paths.stagingOutput(`${outputImageId}.png`);
      await saveBuffer(generatedImagePath, generatedImageBuffer);

    } catch (error) {
      console.error('[generate-background] AI generation failed', error);
      // Fallback or re-throw, for now, we re-throw a specific error
      throw new Error('AI background generation service failed.');
    }

    if (!generatedImagePath) {
      throw new Error('Failed to produce generated background image.');
    }

    const outputPublicUrl = publicUrlFromPath(generatedImagePath);

    // Save metadata for the gallery
    const metadataId = createId('stage');
    const metadataPath = paths.stagingMeta(`${metadataId}.json`);
    const metadata: StageMetadata = {
      id: metadataId,
      createdAt: new Date().toISOString(),
      productIds: [], // Background generation doesn't involve specific products from the catalog
      roomImagePath: publicUrlFromPath(tempImagePath), // Path to the original uploaded image
      outputImagePath: outputPublicUrl,
      prompt: body.prompt, // The user's prompt for the background
      generator: 'fal-background',
      confidence: 0.9 // Assuming high confidence for now
    };
    await writeJson(metadataPath, metadata);

    return NextResponse.json<ApiResponse<{ outputImagePath: string }>>({
      success: true,
      data: { outputImagePath: outputPublicUrl },
    });
  } catch (error) {
    console.error('[generate-background] error', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: (error as Error).message, details: null },
      { status: 500 }
    );
  }
}
