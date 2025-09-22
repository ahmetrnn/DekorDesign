'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ProductMetadata, StageMetadata } from '../lib/types';
import { fallbackRoomAnalysis } from '../lib/defaults';

interface StageControlsProps {
  products: ProductMetadata[];
  selectedImageIds: Set<string>;
  roomPath?: string;
  onStageComplete: (stage: StageMetadata) => void;
}

export function StageControls({ products, selectedImageIds, roomPath, onStageComplete }: StageControlsProps) {
  const [isStaging, setIsStaging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selections = useMemo(
    () =>
      Array.from(selectedImageIds).map((key) => {
        const [productId, imageId] = key.split(':');
        return { productId, imageId };
      }),
    [selectedImageIds]
  );

  const selectedProducts = useMemo(() => {
    return products.filter((product) => selections.some((selection) => selection.productId === product.id));
  }, [products, selections]);

  const readyToStage = Boolean(roomPath?.trim() && selections.length);

  const handleStage = async () => {
    const trimmedRoomPath = roomPath?.trim();
    if (!trimmedRoomPath) {
      setError('Upload or select a room image before staging.');
      return;
    }
    if (!selections.length) {
      setError('Select at least one product image.');
      return;
    }

    setIsStaging(true);
    setError(null);

    try {
      const response = await fetch('/api/stage-nano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomPath: trimmedRoomPath,
          roomAnalysis: fallbackRoomAnalysis(),
          selections
        })
      });
      const payload = (await response.json()) as { success: boolean; data?: StageMetadata; error?: string };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || 'Staging failed.');
      }
      onStageComplete(payload.data);
      window.dispatchEvent(new CustomEvent('dekor:stageComplete', { detail: payload.data }));
    } catch (fetchError) {
      setError((fetchError as Error).message);
    } finally {
      setIsStaging(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-3xl p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dekor-accent">4. Stage the Room</h2>
          <p className="text-sm text-neutral-600">
            Generate photorealistic composites by combining your room image with selected products.
          </p>
        </div>
        <span className={`text-xs font-semibold ${readyToStage ? 'text-dekor-success' : 'text-neutral-400'}`}>
          {readyToStage ? 'Ready' : 'Awaiting inputs'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl border border-dekor-accent/20 bg-white/60 p-4">
          <span className="text-sm font-semibold text-neutral-700">Selected Products</span>
          {selectedProducts.length ? (
            <ul className="flex flex-wrap gap-3">
              {selectedProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-2 rounded-full bg-dekor-success/20 px-3 py-1 text-xs text-neutral-700">
                  <span>{product.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-neutral-500">No products selected yet.</span>
          )}
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-dekor-accent/20 bg-white/60 p-4">
          <span className="text-sm font-semibold text-neutral-700">Room Image</span>
          {roomPath ? (
            <span className="text-xs text-neutral-600">{roomPath}</span>
          ) : (
            <span className="text-xs text-neutral-500">Upload or paste a path via the Room Image section.</span>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleStage}
          disabled={!readyToStage || isStaging}
          className="rounded-full bg-dekor-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-dekor-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStaging ? 'Generating…' : 'Generate Staged Image'}
        </button>
        {error && <span className="text-sm text-rose-500">{error}</span>}
      </div>

      {selections.length > 0 && (
        <div className="mt-6 grid gap-3 text-xs text-neutral-600 md:grid-cols-3">
          {selections.map((selection) => {
            const product = products.find((item) => item.id === selection.productId);
            const image = product?.images.find((img) => img.id === selection.imageId);
            if (!product || !image) return null;
            return (
              <div key={`${selection.productId}:${selection.imageId}`} className="flex items-center gap-3 rounded-2xl border border-dekor-accent/10 bg-white/60 p-2">
                <Image
                  src={image.processedPath ?? image.originalPath}
                  alt={product.title}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-neutral-700">{product.title}</span>
                  <span>Conf.: {Math.round(image.confidence * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
