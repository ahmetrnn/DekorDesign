'use client';

import { FormEvent, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ensureLeadingSlash } from '../lib/paths';
import type { ApiResponse } from '../lib/types';

interface RoomPickerProps {
  onRoomSelected: (roomPath: string) => void;
  roomPath?: string;
}

export function RoomPicker({ onRoomSelected, roomPath }: RoomPickerProps) {
  const [localPath, setLocalPath] = useState(roomPath ?? '');
  const [preview, setPreview] = useState(roomPath ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!localPath) return;
    const normalized = ensureLeadingSlash(localPath.trim());
    setPreview(normalized);
    onRoomSelected(normalized);
    setError(null);
  };

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/room-analyze', {
        method: 'POST',
        body: formData
      });
      const payload = (await response.json()) as ApiResponse<{ roomPath: string; analysis?: unknown }>;
      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? 'Room upload failed' : payload.error);
      }
      const normalized = payload.data.roomPath;
      setLocalPath(normalized);
      setPreview(normalized);
      onRoomSelected(normalized);
    } catch (uploadError) {
      setError((uploadError as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card rounded-3xl p-6"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-dekor-accent">3. Room Image</h2>
          <p className="text-sm text-neutral-600">Provide a room photo to stage your selected furniture against.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="flex h-full flex-col gap-3 rounded-2xl border border-dashed border-dekor-accent/30 bg-white/60 p-4 text-sm text-neutral-600">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleFileSelected(event.target.files?.[0])}
            />
            <span className="font-medium text-neutral-700">Upload Room Image</span>
            <p>Drop or select a room photo. Files are saved under `/public/staging/rooms`.</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-dekor-accent px-4 py-2 text-sm font-medium text-white"
            >
              Choose File
            </button>
            <span className="text-xs text-neutral-500">Currently: {localPath || 'None'}</span>
          </label>
          <div className="flex flex-col gap-3 rounded-2xl border border-dekor-accent/20 bg-white/40 p-4">
            <span className="text-sm font-semibold text-neutral-700">Paste Path</span>
            <p className="text-xs text-neutral-600">
              Already uploaded your room image? Paste the relative URL under `/public` (e.g. `/staging/rooms/living-room.png`).
            </p>
            <input
              type="text"
              value={localPath}
              onChange={(event) => setLocalPath(event.target.value)}
              placeholder="/staging/rooms/living-room.png"
              className="rounded-2xl border border-dekor-accent/20 bg-white/70 px-4 py-2 text-sm shadow-inner focus:border-dekor-accent focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-dekor-accent/40 bg-white/70 px-4 py-2 text-sm font-medium text-dekor-accent"
            >
              Use Path
            </button>
          </div>
        </div>
        {preview && (
          <div className="overflow-hidden rounded-2xl border border-dekor-accent/20">
            <Image src={preview} alt="Room preview" width={640} height={420} className="h-full w-full object-cover" />
          </div>
        )}
        {error && <p className="text-sm text-rose-500">{error}</p>}
        {isUploading && <p className="text-sm text-neutral-500">Uploading…</p>}
      </form>
    </motion.section>
  );
}
