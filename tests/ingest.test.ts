import { describe, expect, it } from 'vitest';
import path from 'path';
import { createId, publicUrlFromPath, sanitizeFilename } from '../src/app/(dekor)/dekor/lib/fs';

describe('filesystem helpers', () => {
  it('sanitizes filenames to safe characters', () => {
    expect(sanitizeFilename('My Fancy File!.png')).toBe('My_Fancy_File_.png');
    expect(sanitizeFilename('café-chair.jpg')).toBe('caf__-chair.jpg');
  });

  it('creates ids with prefix and uuid', () => {
    const id = createId('product');
    expect(id.startsWith('product_')).toBe(true);
    expect(id.length).toBeGreaterThan('product_'.length);
  });

  it('builds public urls from absolute paths', () => {
    const sample = path.join(process.cwd(), 'public', 'products', 'processed', 'demo.png');
    expect(publicUrlFromPath(sample)).toBe('/products/processed/demo.png');
  });
});
