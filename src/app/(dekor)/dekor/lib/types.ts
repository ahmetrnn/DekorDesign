export type ProductSource = 'url' | 'upload';

export interface ProductImage {
  id: string;
  originalPath: string;
  processedPath?: string;
  backgroundRemoved: boolean;
  confidence: number;
  promptNotes?: string;
}

export interface ProductMetadata {
  id: string;
  source: ProductSource;
  sourceUrl?: string;
  title: string;
  price?: string;
  color?: string;
  material?: string;
  dimensions?: string;
  createdAt: string;
  images: ProductImage[];
}

export interface RoomAnalysisResult {
  wallColor: string;
  floorColor: string;
  palette: string[];
  brightness: number;
  style: string;
  notes?: string;
}

export interface StageRequestPayload {
  productIds: string[];
  roomImagePath: string;
  roomContext: RoomAnalysisResult;
}

export interface StageMetadata {
  id: string;
  createdAt: string;
  productIds: string[];
  roomImagePath: string;
  outputImagePath: string;
  prompt: string;
  generator: 'fal' | 'sharp-fallback' | 'fal-background';
  confidence: number;
}

export interface GalleryItem extends StageMetadata {
  downloadUrl: string;
}

export type VideoAspectRatio = 'auto' | '16:9' | '9:16';
export type VideoResolution = '720p' | '1080p';

export interface VideoJobMetadata {
  id: string;
  createdAt: string;
  sourceImagePath: string;
  prompt: string;
  aspectRatio: VideoAspectRatio;
  duration: '8s';
  generateAudio: boolean;
  resolution: VideoResolution;
  outputVideoPath: string;
  generator: 'fal';
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
