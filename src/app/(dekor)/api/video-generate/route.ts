import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import path from 'path';
import {
  createId,
  paths,
  publicUrlFromPath,
  saveBuffer,
  writeJson
} from '../../dekor/lib/fs';
import { runFalImageToVideo } from '../../dekor/lib/fal';
import type {
  ApiResponse,
  VideoAspectRatio,
  VideoJobMetadata,
  VideoResolution
} from '../../dekor/lib/types';

function toAbsolute(publicPath: string) {
  return path.join(process.cwd(), 'public', publicPath.replace(/^\/+/, ''));
}

interface VideoRequestBody {
  prompt: string;
  sourceImagePath: string;
  aspectRatio: VideoAspectRatio;
  duration?: '8s';
  generateAudio: boolean;
  resolution: VideoResolution;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VideoRequestBody;
    const { prompt, sourceImagePath, aspectRatio, generateAudio, resolution } = body;
    const duration = body.duration ?? '8s';

    if (!prompt?.trim()) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Prompt boş olamaz.' },
        { status: 400 }
      );
    }

    if (!sourceImagePath) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Bir giriş görseli seçin veya yükleyin.' },
        { status: 400 }
      );
    }

    const absoluteImagePath = toAbsolute(sourceImagePath);

    const result = await runFalImageToVideo({
      prompt: prompt.trim(),
      imagePath: absoluteImagePath,
      aspectRatio,
      duration,
      generateAudio,
      resolution
    });

    const videoUrl = result.video?.url;
    if (!videoUrl) {
      throw new Error('Fal.ai video üretimi başarısız oldu.');
    }

    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Üretilen video indirilemedi.');
    }

    const arrayBuffer = await videoResponse.arrayBuffer();
    const videoId = createId('video');
    const outputPath = paths.videoOutput(`${videoId}.mp4`);
    await saveBuffer(outputPath, arrayBuffer);

    const metadata: VideoJobMetadata = {
      id: videoId,
      createdAt: new Date().toISOString(),
      sourceImagePath,
      prompt: prompt.trim(),
      aspectRatio,
      duration,
      generateAudio,
      resolution,
      outputVideoPath: publicUrlFromPath(outputPath),
      generator: 'fal'
    };

    const metaPath = paths.videoMeta(`${videoId}.json`);
    await writeJson(metaPath, metadata);

    return NextResponse.json<ApiResponse<VideoJobMetadata>>({ success: true, data: metadata });
  } catch (error) {
    console.error('[video-generate] error', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: (error as Error).message, details: null },
      { status: 500 }
    );
  }
}
