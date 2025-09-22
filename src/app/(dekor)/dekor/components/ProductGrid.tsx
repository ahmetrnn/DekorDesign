'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ProductMetadata } from '../lib/types';

interface ProductGridProps {
  products: ProductMetadata[];
  selectedImageIds: Set<string>;
  onToggleImage: (productId: string, imageId: string) => void;
}

export function ProductGrid({ products, selectedImageIds, onToggleImage }: ProductGridProps) {
  if (!products.length) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-3xl p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dekor-accent">2. Product Selection</h2>
          <p className="text-sm text-neutral-600">Choose processed views to include in your staging session.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-3xl border border-dekor-accent/20 bg-white/60 p-4 shadow-inner"
          >
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">{product.title}</h3>
                <p className="text-xs text-neutral-500">
                  {[product.price, product.color, product.material, product.dimensions].filter(Boolean).join(' • ')}
                </p>
              </div>
              <span className="rounded-full bg-dekor-success/30 px-3 py-1 text-xs font-semibold text-dekor-success">
                BG Removed
              </span>
            </header>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.images.map((image) => {
                const selectionKey = `${product.id}:${image.id}`;
                const isSelected = selectedImageIds.has(selectionKey);
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => onToggleImage(product.id, image.id)}
                    className={`group relative overflow-hidden rounded-2xl border transition ${
                      isSelected ? 'border-dekor-accent shadow-lg' : 'border-transparent'
                    }`}
                  >
                    <div className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700">
                      {isSelected ? 'Selected' : 'Tap to select'}
                    </div>
                    <div className="aspect-square w-full bg-dekor-background/40">
                      <Image
                        src={image.processedPath ?? image.originalPath}
                        alt={product.title}
                        width={400}
                        height={400}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </motion.section>
  );
}
