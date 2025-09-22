import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import path from 'path';
import { createId, ensureDir, paths, publicUrlFromPath, saveBuffer, sanitizeFilename } from '../../dekor/lib/fs';
import type { ApiResponse } from '../../dekor/lib/types';
import { ensurePng } from '../../dekor/lib/image';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Bir görsel dosyası yükleyin.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uploadId = createId('videoimg');
    const originalName = file.name ? sanitizeFilename(file.name) : 'upload.png';
    const ext = path.extname(originalName) || '.png';
    const baseName = path.basename(originalName, ext);
    const rawFilename = `${baseName}-${uploadId}${ext}`;
    const rawPath = paths.videoInput(rawFilename);

    await ensureDir(path.dirname(rawPath));
    await saveBuffer(rawPath, arrayBuffer);

    const normalizedPath = await ensurePng(rawPath);
    const publicPath = publicUrlFromPath(normalizedPath);

    return NextResponse.json<ApiResponse<{ imagePath: string; originalFilename: string }>>({
      success: true,
      data: { imagePath: publicPath, originalFilename: file.name || rawFilename }
    });
  } catch (error) {
    console.error('[video-upload] error', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: (error as Error).message, details: null },
      { status: 500 }
    );
  }
}
