import type { RoomAnalysisResult } from './types';

export function fallbackRoomAnalysis(): RoomAnalysisResult {
  return {
    wallColor: '#F7F4EA',
    floorColor: '#EBD9D1',
    palette: ['#F7F4EA', '#EBD9D1', '#A8BBA3'],
    brightness: 0.6,
    style: 'contemporary',
    notes: 'Fallback default values'
  };
}
