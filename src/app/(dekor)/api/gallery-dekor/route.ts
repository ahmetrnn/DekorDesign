import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { listFiles, paths, readJson } from '../../dekor/lib/fs';
import type { ApiResponse, GalleryItem, StageMetadata } from '../../dekor/lib/types';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Math.max(Number(url.searchParams.get('page') ?? '1'), 1);
    const pageSize = Math.max(Math.min(Number(url.searchParams.get('pageSize') ?? '12'), 48), 1);

    const metaFiles = (await listFiles(paths.stagingMeta())).filter((file) => file.endsWith('.json'));
    const stageRecords: StageMetadata[] = await Promise.all(
      metaFiles.map((file) => readJson<StageMetadata>(path.join(paths.stagingMeta(), file)))
    );

    const sorted = stageRecords.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    const start = (page - 1) * pageSize;
    const paginated = sorted.slice(start, start + pageSize);

    const items: GalleryItem[] = paginated.map((item) => ({
      ...item,
      downloadUrl: item.outputImagePath
    }));

    return NextResponse.json<ApiResponse<{ items: GalleryItem[]; total: number; page: number }>>({
      success: true,
      data: { items, total: sorted.length, page }
    });
  } catch (error) {
    console.error('[gallery-dekor] error', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: (error as Error).message, details: null },
      { status: 500 }
    );
  }
}
