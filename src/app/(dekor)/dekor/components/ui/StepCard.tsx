'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StepCardProps {
  number: number;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function StepCard({ number, title, description, actions, children }: StepCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)]/60 p-6 shadow-md shadow-black/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white">
            {number}
          </span>
          <div>
            <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
            {description && <p className="mt-1 text-sm text-[var(--text)]/70">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className="h-px bg-[var(--border)]" />
      <div className="flex flex-col gap-4">{children}</div>
    </motion.section>
  );
}
