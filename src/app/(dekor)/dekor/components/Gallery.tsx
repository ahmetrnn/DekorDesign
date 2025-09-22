'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ApiResponse, GalleryItem } from '../lib/types';

interface GalleryPayload {
  items: GalleryItem[];
  total: number;
  page: number;
}

export function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGallery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gallery-dekor');
      const payload = (await response.json()) as ApiResponse<GalleryPayload>;
      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? 'Gallery fetch failed' : payload.error);
      }
      setItems(payload.data.items);
    } catch (fetchError) {
      setError((fetchError as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchGallery();
    const handler = () => {
      void fetchGallery();
    };
    window.addEventListener('dekor:stageComplete', handler);
    return () => {
      window.removeEventListener('dekor:stageComplete', handler);
    };
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-3xl p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dekor-accent">5. Staging Gallery</h2>
          <p className="text-sm text-neutral-600">Review generated renders, download assets, and inspect prompts.</p>
        </div>
        <button
          type="button"
          onClick={() => void fetchGallery()}
          className="rounded-full border border-dekor-accent/40 bg-white/70 px-4 py-2 text-sm font-medium text-dekor-accent"
        >
          Refresh
        </button>
      </div>
      {isLoading && <p className="text-sm text-neutral-500">Loading gallery…</p>}
      {error && <p className="text-sm text-rose-500">{error}</p>}
      {!items.length && !isLoading ? (
        <p className="text-sm text-neutral-500">Stage an image to populate the gallery.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-3 rounded-3xl border border-dekor-accent/20 bg-white/60 p-4 shadow-inner">
              <div className="relative overflow-hidden rounded-2xl border border-dekor-accent/20">
                <Image
                  src={item.outputImagePath}
                  alt={`Staged result ${item.id}`}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 text-xs text-neutral-600">
                <span className="font-semibold text-neutral-800">Prompt</span>
                <p className="whitespace-pre-wrap rounded-2xl bg-white/70 p-3 text-xs text-neutral-600">{item.prompt}</p>
                <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
                  <span>Generator: {item.generator}</span>
                  <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                </div>
              </div>
              <div className="flex justify-end">
                <a
                  href={item.downloadUrl}
                  download
                  className="rounded-full bg-dekor-accent px-4 py-2 text-sm font-medium text-white"
                >
                  Download
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </motion.section>
  );
}
