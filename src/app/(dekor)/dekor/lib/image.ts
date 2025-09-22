import sharp from 'sharp';
import path from 'path';
import { saveBuffer, createId, paths } from './fs';

interface CompositeOptions {
  roomImagePath: string;
  productImagePaths: string[];
}

export async function compositeWithSharp({ roomImagePath, productImagePaths }: CompositeOptions) {
  const room = sharp(roomImagePath);
  const roomMetadata = await room.metadata();

  const overlays = await Promise.all(
    productImagePaths.map(async (productPath) => {
      const product = sharp(productPath).resize({ width: Math.round((roomMetadata.width ?? 2048) / 3) });
      return {
        input: await product.png().toBuffer(),
        top: Math.round((roomMetadata.height ?? 2048) / 2.2),
        left: Math.round((roomMetadata.width ?? 2048) / 2.6)
      };
    })
  );

  const resultBuffer = await room
    .composite(overlays)
    .modulate({ brightness: 1.02 })
    .toBuffer();

  const outputFilename = `${createId('staged')}.png`;
  const outputPath = path.join(paths.stagingOutput(), outputFilename);
  await saveBuffer(outputPath, resultBuffer);
  return outputPath;
}

export async function ensurePng(inputPath: string) {
  const image = sharp(inputPath);
  const buffer = await image.png().toBuffer();
  const filename = `${path.parse(inputPath).name}.png`;
  const normalizedPath = path.join(path.dirname(inputPath), filename);
  await saveBuffer(normalizedPath, buffer);
  return normalizedPath;
}
