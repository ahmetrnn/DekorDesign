'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export interface GalleryItem {
  id: string;
  imgUrl: string;
  prompt: string;
  confidence: number;
  generator: string;
}

interface GalleryProps {
  items: GalleryItem[];
  onDownload?: (item: GalleryItem) => void;
  loading?: boolean;
  showHeader?: boolean;
}

export function Gallery({ items, onDownload, loading, showHeader = true }: GalleryProps) {
  if (!items.length) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--text)]/60 shadow-md shadow-black/5">
        Stage an image to populate the gallery.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text)]">Staging Gallery</h3>
          <span className="text-xs text-[var(--text)]/60">{items.length} renders</span>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.24, ease: 'easeOut' }}
            className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white shadow-md shadow-black/5"
          >
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-[var(--bg-soft)] ${
                loading ? 'animate-pulse' : ''
              }`}
            >
              <Image
                src={item.imgUrl}
                alt={`Staged scene ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4 text-sm">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[var(--text)]/60">
                <span>{item.generator}</span>
                <span>{Math.round(item.confidence * 100)}% confidence</span>
              </div>
              <p className="line-clamp-3 text-[var(--text)]/80">{item.prompt}</p>
              {onDownload && (
                <button
                  type="button"
                  onClick={() => onDownload(item)}
                  className="mt-auto inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2 text-xs font-medium text-[var(--text)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] hover:border-[var(--accent)] hover:text-[var(--text)]"
                >
                  Download
                </button>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
