export const FIXED_PROMPT =
  'Place the Uploaded Product realistically in the room do not make any changes on the product. Natural daylight with accurate shadows. Photorealistic, correct perspective, proper occlusion if needed, clean blending.';

export function buildStagingPrompt(): string {
  return FIXED_PROMPT;
}
