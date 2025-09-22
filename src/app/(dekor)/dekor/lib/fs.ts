import { mkdir, writeFile, readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const PUBLIC_ROOT = path.join(process.cwd(), 'public');

export const paths = {
  productsOriginal: (...segments: string[]) =>
    path.join(PUBLIC_ROOT, 'products', 'original', ...segments),
  productsProcessed: (...segments: string[]) =>
    path.join(PUBLIC_ROOT, 'products', 'processed', ...segments),
  stagingRooms: (...segments: string[]) => path.join(PUBLIC_ROOT, 'staging', 'rooms', ...segments),
  stagingTemp: (...segments: string[]) => path.join(PUBLIC_ROOT, 'staging', 'temp', ...segments),
  stagingOutput: (...segments: string[]) =>
    path.join(PUBLIC_ROOT, 'staging', 'staged', ...segments),
  stagingMeta: (...segments: string[]) => path.join(PUBLIC_ROOT, 'staging', 'meta', ...segments),
  videoInput: (...segments: string[]) => path.join(PUBLIC_ROOT, 'videos', 'input', ...segments),
  videoOutput: (...segments: string[]) => path.join(PUBLIC_ROOT, 'videos', 'output', ...segments),
  videoMeta: (...segments: string[]) => path.join(PUBLIC_ROOT, 'videos', 'meta', ...segments)
};

export async function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function saveBuffer(filePath: string, data: ArrayBuffer | Buffer) {
  await ensureDir(path.dirname(filePath));
  let buffer: Buffer;
  if (data instanceof Buffer) {
    buffer = data;
  } else {
    buffer = Buffer.from(new Uint8Array(data));
  }
  await writeFile(filePath, buffer);
  return filePath;
}

export async function writeJson(filePath: string, value: unknown) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
  return filePath;
}

export async function readJson<T>(filePath: string) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

export async function listFiles(dirPath: string) {
  try {
    return await readdir(dirPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export function publicUrlFromPath(filePath: string) {
  const relative = path.relative(PUBLIC_ROOT, filePath).split(path.sep).join('/');
  return `/${relative}`;
}

export function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

export function sanitizeFilename(input: string) {
  return input.replace(/[^a-z0-9-_\.]/gi, '_');
}

export async function writeRoomFile(filename: string, buffer: ArrayBuffer) {
  const target = paths.stagingRooms(filename);
  await saveBuffer(target, Buffer.from(buffer));
  return publicUrlFromPath(target);
}
