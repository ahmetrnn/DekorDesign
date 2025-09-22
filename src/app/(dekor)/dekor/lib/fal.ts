import * as fal from '@fal-ai/serverless-client';
import { readFile } from 'fs/promises';
import path from 'path';

interface FalEditInput {
  prompt: string;
  roomImagePath: string;
  productImagePaths: string[];
}

interface FalEditOutput {
  images?: Array<{
    url: string;
    content_type?: string;
    file_name?: string;
    file_size?: number;
  }>;
  description?: string;
}

interface FalVideoInput {
  prompt: string;
  imagePath: string;
  aspectRatio: 'auto' | '16:9' | '9:16';
  duration: '8s';
  generateAudio: boolean;
  resolution: '720p' | '1080p';
}

interface FalVideoOutput {
  video?: {
    url?: string;
    content_type?: string;
    file_name?: string;
    file_size?: number;
  };
}

export class FalClientError extends Error {}

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new FalClientError('Missing FAL_KEY environment variable.');
  }
  fal.config({ credentials: apiKey });
  configured = true;
}

async function uploadImageToFal(imagePath: string) {
  const absolute = path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath);
  const buffer = await readFile(absolute);
  const blob = new Blob([buffer instanceof Uint8Array ? new Uint8Array(buffer) : buffer], {
    type: 'image/png'
  });
  const upload = await fal.storage.upload(blob as unknown as Blob);
  if (typeof upload === 'string') {
    return upload;
  }
  const url = (upload as { url?: string }).url;
  if (!url) {
    throw new FalClientError('Fal storage upload did not return a URL.');
  }
  return url;
}

export async function runFalEdit({ prompt, roomImagePath, productImagePaths }: FalEditInput) {
  ensureConfigured();
  const roomUrl = await uploadImageToFal(roomImagePath);
  const productUrls = await Promise.all(productImagePaths.map(uploadImageToFal));
  const imageUrls = [roomUrl, ...productUrls];

  const modelName = imageUrls.length > 1 ? 'fal-ai/nano-banana/edit' : 'fal-ai/nano-banana';

  const input = {
    prompt,
    instructions: prompt,
    image_urls: imageUrls,
    num_images: 1,
    output_format: 'png' as const
  } as const;

  console.log('[fal] Request input:', {
    prompt: input.prompt,
    prompt_length: input.prompt.length,
    has_instructions: Boolean(input.instructions),
    image_urls_count: input.image_urls.length,
    num_images: input.num_images,
    output_format: input.output_format
  });
  
  console.log('[fal] Full prompt text:', input.prompt);

  try {
    const result = (await fal.subscribe(modelName, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      }
    })) as FalEditOutput;
    console.log('[fal] Response:', { 
      images_count: result.images?.length || 0,
      description: result.description 
    });
    return result;
  } catch (error) {
    console.error('[fal] Error details:', error);
    throw error;
  }
}

interface FalBackgroundInput {
  prompt: string;
  productImagePath: string;
}

export async function runFalBackgroundGeneration({ prompt, productImagePath }: FalBackgroundInput): Promise<Buffer> {
  ensureConfigured();
  console.log('[fal] Background generation request input:', {
    prompt_length: prompt.length,
    product_image_path: productImagePath,
  });

  try {
    const productUrl = await uploadImageToFal(productImagePath);

    const modelName = 'fal-ai/nano-banana/edit'; // Using the same model for editing background

    const input = {
      prompt: prompt, // The prompt describes the new background
      instructions: prompt, // Instructions for the edit
      image_urls: [productUrl], // The image to edit
      num_images: 1,
      output_format: 'png' as const
    };

    console.log('[fal] Background generation request input to FAL:', {
      prompt: input.prompt,
      image_urls_count: input.image_urls.length,
      num_images: input.num_images,
      output_format: input.output_format
    });

    const result = (await fal.subscribe(modelName, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      }
    })) as FalEditOutput; // Reusing FalEditOutput as the structure is the same

    console.log('[fal] Background generation response:', { 
      images_count: result.images?.length || 0,
      description: result.description 
    });

    if (!result?.images?.[0]?.url) {
      throw new FalClientError('Fal.ai did not return a background image URL.');
    }

    const imageResponse = await fetch(result.images[0].url);
    if (!imageResponse.ok) {
      throw new FalClientError('Failed to download generated background image.');
    }
    
    return Buffer.from(await imageResponse.arrayBuffer());

  } catch (error) {
    console.error('[fal] Background generation error:', error);
    throw error; // Re-throw to be caught by the API route
  }
}

export async function runFalImageToVideo({
  prompt,
  imagePath,
  aspectRatio,
  duration,
  generateAudio,
  resolution
}: FalVideoInput) {
  ensureConfigured();
  const imageUrl = await uploadImageToFal(imagePath);

  console.log('[fal] video request input:', {
    prompt_length: prompt.length,
    aspect_ratio: aspectRatio,
    duration,
    generate_audio: generateAudio,
    resolution
  });

  try {
    const result = (await fal.subscribe('fal-ai/veo3/fast/image-to-video', {
      input: {
        prompt,
        image_url: imageUrl,
        aspect_ratio: aspectRatio,
        duration,
        generate_audio: generateAudio,
        resolution
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs?.map((log) => log.message).forEach(console.log);
        }
      }
    })) as FalVideoOutput;

    if (!result?.video?.url) {
      throw new FalClientError('Fal.ai did not return a video URL.');
    }

    return result;
  } catch (error) {
    console.error('[fal] Video generation error:', error);
    throw error;
  }
}
