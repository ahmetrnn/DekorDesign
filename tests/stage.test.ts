import { describe, expect, it } from 'vitest';
import { buildStagingPrompt } from '../src/app/(dekor)/dekor/lib/prompts';

describe('prompt builder', () => {
  it('always returns the fixed staging prompt', () => {
    const prompt = buildStagingPrompt();
    expect(prompt).toBe(
      'Place the Uploaded Product realistically in the room do not make any changes on the product. Natural daylight with accurate shadows. Photorealistic, correct perspective, proper occlusion if needed, clean blending.'
    );
  });
});
