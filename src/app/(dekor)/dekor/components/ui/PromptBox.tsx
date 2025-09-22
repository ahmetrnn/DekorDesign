'use client';

import { Button } from './Button';
import { useState } from 'react';

interface PromptBoxProps {
  text: string;
}

export function PromptBox({ text }: PromptBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-md shadow-black/5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-[var(--text)]">Prompt</h3>
        <Button variant="ghost" onClick={handleCopy} aria-label="Copy prompt text">
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="max-h-64 overflow-y-auto rounded-xl bg-[var(--bg-soft)]/70 px-4 py-3 text-sm text-[var(--text)]/90">
        {text}
      </pre>
    </section>
  );
}
