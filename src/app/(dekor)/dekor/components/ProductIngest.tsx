'use client';

import { useState, useRef, FormEvent } from 'react';
import { motion } from 'framer-motion';
import type { ProductMetadata, ApiResponse } from '../lib/types';

interface ProductIngestProps {
  onProductIngested: (product: ProductMetadata) => void;
}

export function ProductIngest({ onProductIngested }: ProductIngestProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    if (url.trim()) {
      formData.append('url', url.trim());
    }
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        body: formData
      });
      const payload = (await response.json()) as ApiResponse<ProductMetadata>;
      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? 'Ingestion failed' : payload.error);
      }
      onProductIngested(payload.data);
      setSuccessMessage(`Product “${payload.data.title}” added.`);
      setUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (fetchError) {
      setError((fetchError as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-6"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-dekor-accent">1. Product Ingestion</h2>
          <p className="text-sm text-neutral-600">
            Paste a furniture product URL or upload product imagery. Background removal runs automatically.
          </p>
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-700">Product URL</span>
          <input
            type="url"
            placeholder="https://vendor.com/product"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="rounded-2xl border border-dekor-accent/20 bg-white/70 px-4 py-2 text-sm shadow-inner focus:border-dekor-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-700">Or upload product image</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="rounded-2xl border border-dashed border-dekor-accent/30 bg-white/50 px-4 py-2 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-dekor-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-dekor-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Processing…' : 'Ingest Product'}
          </button>
          {successMessage && <span className="text-sm text-dekor-success">{successMessage}</span>}
          {error && <span className="text-sm text-rose-500">{error}</span>}
        </div>
      </form>
    </motion.section>
  );
}
