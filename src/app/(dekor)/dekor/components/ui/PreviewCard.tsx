'use client';

import Image from 'next/image';

interface PreviewMeta {
  confidence: number;
  generator: string;
  prompt: string;
}

interface PreviewCardProps {
  imgUrl?: string;
  meta?: PreviewMeta;
  loading?: boolean;
}

export function PreviewCard({ imgUrl, meta, loading }: PreviewCardProps) {
  return (
    <section className="grid gap-6 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-md shadow-black/5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div
        className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-[var(--bg-soft)] ${
          loading ? 'animate-pulse' : ''
        }`}
        aria-busy={loading}
      >
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt="Latest staged result"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
          />
        ) : (
          <span className="text-sm text-[var(--text)]/60">No staged result yet</span>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-[var(--text)]">Latest Stage Details</h3>
        {meta ? (
          <div className="space-y-3 text-sm text-[var(--text)]/80">
            <p><span className="font-semibold text-[var(--text)]">Confidence:</span> {Math.round(meta.confidence * 100)}%</p>
            <p><span className="font-semibold text-[var(--text)]">Generator:</span> {meta.generator}</p>
            <div>
              <p className="font-semibold text-[var(--text)]">Prompt Summary</p>
              <p className="mt-1 rounded-lg bg-[var(--bg-soft)]/70 px-3 py-2 text-xs leading-relaxed text-[var(--text)]/70">
                {meta.prompt}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text)]/60">Generate a staging to see the latest preview.</p>
        )}
      </div>
    </section>
  );
}
