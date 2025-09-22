'use client';

import { ChangeEvent, FormEvent, useId, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface UploadFieldProps {
  label: string;
  hint?: string;
  accept?: string;
  actionLabel?: string;
  placeholder?: string;
  onUrlCommit?: (value: string) => void;
  onFileSelect?: (file: File) => void;
}

export function UploadField({
  label,
  hint,
  accept,
  actionLabel = 'Save',
  placeholder,
  onUrlCommit,
  onFileSelect
}: UploadFieldProps) {
  const [value, setValue] = useState('');
  const inputId = useId();
  const fileInputId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim() || !onUrlCommit) return;
    onUrlCommit(value.trim());
    setValue('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor={inputId} className="text-sm font-medium text-[var(--text)]">
        {label}
      </label>
      {hint && <p className="text-xs text-[var(--text)]/60">{hint}</p>}
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-2">
          <input
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-transparent bg-[var(--bg-soft)]/40 px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
            aria-label={label}
          />
          {onUrlCommit && (
            <div>
              <Button variant="ghost" type="submit" className="w-full sm:w-auto">
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
        {onFileSelect && (
          <motion.label
            htmlFor={fileInputId}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-soft)]/70 px-4 py-6 text-center text-xs text-[var(--text)]/70 transition hover:border-[var(--accent)] hover:text-[var(--text)]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-[var(--accent)]"
              aria-hidden
            >
              <path
                fill="currentColor"
                d="M12 16a1 1 0 0 1-1-1v-3H8a1 1 0 1 1 0-2h3V7a1 1 0 0 1 2 0v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 0 1-1 1Z"
              />
            </svg>
            <span>
              {accept ? `Upload (${accept})` : 'Upload file'}
            </span>
            <input
              id={fileInputId}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="sr-only"
            />
          </motion.label>
        )}
      </div>
    </form>
  );
}
