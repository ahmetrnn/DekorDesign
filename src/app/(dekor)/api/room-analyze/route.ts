import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { createId, paths, saveBuffer, publicUrlFromPath } from '../../dekor/lib/fs';
import type { ApiResponse, RoomAnalysisResult } from '../../dekor/lib/types';

export const dynamic = 'force-dynamic';
import { fallbackRoomAnalysis } from '../../dekor/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Provide a room image file.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const roomId = createId('room');
    const ext = path.extname(file.name || '') || '.png';
    const roomPath = paths.stagingRooms(`${roomId}${ext}`);
    await saveBuffer(roomPath, arrayBuffer);

    const analysis: RoomAnalysisResult = fallbackRoomAnalysis();

    return NextResponse.json<ApiResponse<{ roomPath: string; analysis: RoomAnalysisResult }>>({
      success: true,
      data: {
        roomPath: publicUrlFromPath(roomPath),
        analysis
      }
    });
  } catch (error) {
    console.error('[room-analyze] error', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: (error as Error).message, details: null },
      { status: 500 }
    );
  }
}
