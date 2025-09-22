'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { HeaderMenu } from '../components/HeaderMenu';
import { dekorPalette } from '../components/dekorTheme';

const palette = dekorPalette;

type AspectRatio = 'auto' | '16:9' | '9:16';
type Resolution = '720p' | '1080p';

interface SelectableImage {
  id: string;
  url: string;
  label: string;
  source: 'gallery' | 'upload';
}

interface GalleryResponse {
  success: boolean;
  data?: {
    items: {
      id: string;
      outputImagePath: string;
      prompt: string;
      createdAt: string;
    }[];
  };
}

interface UploadResponse {
  success: boolean;
  data?: { imagePath: string; originalFilename: string };
  error?: string;
}

interface VideoResponse {
  success: boolean;
  data?: {
    id: string;
    outputVideoPath: string;
    prompt: string;
    aspectRatio: AspectRatio;
    resolution: Resolution;
    generateAudio: boolean;
    sourceImagePath: string;
  };
  error?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 }
};

const defaultPrompt =
  'Animate the furniture showcase image with gentle camera moves. Keep colors and lighting consistent. Add slow parallax to walls and floor, and animate soft lighting flicker for realism.';

export default function VideoPage() {
  const [galleryItems, setGalleryItems] = useState<SelectableImage[]>([]);
  const [uploads, setUploads] = useState<SelectableImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [generateAudio, setGenerateAudio] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lastJobId, setLastJobId] = useState<string | null>(null);

  useEffect(() => {
    setLoadingGallery(true);
    fetch('/api/gallery-dekor?pageSize=24')
      .then((response) => response.json())
      .then((payload: GalleryResponse) => {
        if (!payload.success || !payload.data) return;
        const mapped: SelectableImage[] = payload.data.items.map((item) => ({
          id: `gallery-${item.id}`,
          url: item.outputImagePath,
          label: new Date(item.createdAt).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'short'
          }),
          source: 'gallery'
        }));
        setGalleryItems(mapped);
      })
      .catch(() => undefined)
      .finally(() => setLoadingGallery(false));
  }, []);

  const selectableImages = useMemo(() => [...uploads, ...galleryItems], [uploads, galleryItems]);

  const selectedImage = useMemo(
    () => selectableImages.find((item) => item.id === selectedImageId) ?? null,
    [selectableImages, selectedImageId]
  );

  useEffect(() => {
    if (!selectedImageId && selectableImages.length) {
      setSelectedImageId(selectableImages[0].id);
    }
  }, [selectableImages, selectedImageId]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/video-upload', { method: 'POST', body: formData });
      const payload = (await response.json()) as UploadResponse;
      if (!payload.success || !payload.data) {
        throw new Error(payload.error || 'Yükleme başarısız oldu.');
      }
      const newItem: SelectableImage = {
        id: `upload-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
        url: payload.data.imagePath,
        label: payload.data.originalFilename,
        source: 'upload'
      };
      setUploads((prev) => [newItem, ...prev]);
      setSelectedImageId(newItem.id);
    } catch (error) {
      setUploadError((error as Error).message);
    } finally {
      event.target.value = '';
    }
  }

  async function handleGenerate() {
    if (!selectedImage) {
      setVideoError('Önce galeriden bir görsel seçin veya yeni görsel yükleyin.');
      return;
    }
    if (!prompt.trim()) {
      setVideoError('Animasyon için bir prompt girin.');
      return;
    }
    setVideoError(null);
    setIsGenerating(true);
    setVideoUrl(null);
    try {
      const response = await fetch('/api/video-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          sourceImagePath: selectedImage.url,
          aspectRatio,
          resolution,
          duration: '8s',
          generateAudio
        })
      });
      const payload = (await response.json()) as VideoResponse;
      if (!payload.success || !payload.data) {
        throw new Error(payload.error || 'Video üretimi başarısız oldu.');
      }
      setVideoUrl(payload.data.outputVideoPath);
      setLastJobId(payload.data.id);
    } catch (error) {
      setVideoError((error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className={`relative min-h-screen ${palette.bg} ${palette.text}`}>
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="mt-[-80px] h-[520px] w-[720px] rounded-full bg-gradient-to-tr from-cyan-500/30 to-sky-500/20 opacity-60 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10">
        <div className="flex justify-center">
          <HeaderMenu />
        </div>

        <motion.header
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="space-y-3 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> Video üretimi
          </span>
          <h1 className="text-4xl font-semibold text-white">Veo 3 ile Görselden Videoya</h1>
          <p className={`text-sm ${palette.subtext}`}>
            Galeri renderlarınızı veya yeni yüklediğiniz görselleri, Google Veo 3 Fast modeliyle doğal animasyonlara dönüştürün.
          </p>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <SoftCard>
              <div className="flex items-center justify-between">
                <Badge>Galeri Seçimi</Badge>
                {loadingGallery && <span className="text-xs text-slate-400">Yükleniyor…</span>}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Daha önce ürettiğiniz sahnelerden birini seçebilirsiniz. Animasyon, seçilen görseli temel alacaktır.
              </p>
              {selectableImages.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {selectableImages.map((item) => {
                    const isActive = selectedImageId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedImageId(item.id)}
                        className={`group relative overflow-hidden rounded-xl border ${
                          isActive ? 'border-cyan-400/60 ring-2 ring-cyan-400/30' : 'border-slate-800'
                        }`}
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={item.url}
                            alt={item.label}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width:768px) 50vw, 200px"
                          />
                        </div>
                        <div className="flex items-center justify-between px-2 py-2 text-xs text-slate-300">
                          <span className="truncate" title={item.label}>
                            {item.label}
                          </span>
                          <span className="rounded-full border border-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-400">
                            {item.source === 'gallery' ? 'Galeri' : 'Yüklenen'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-800/80 bg-slate-900/40 p-6 text-center text-xs text-slate-500">
                  Henüz galeri renderı bulunmuyor. Önce sahne üretip galeriyi doldurabilirsiniz.
                </div>
              )}
            </SoftCard>

            <SoftCard>
              <div className="flex items-center justify-between">
                <Badge>Yeni Görsel Yükle</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Maksimum 8MB, tercihen 16:9 oranına yakın görseller en iyi sonucu verir.
              </p>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/40 px-6 py-10 text-center text-slate-400 transition hover:border-cyan-400/40">
                <span className="text-sm font-medium text-slate-200">Görsel seç veya sürükle</span>
                <span className="text-xs text-slate-500">PNG veya JPG önerilir</span>
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
              {uploadError && <p className="mt-3 text-xs text-rose-400">{uploadError}</p>}
            </SoftCard>
          </div>

          <div className="space-y-6">
            <SoftCard>
              <Badge>Animasyon Bilgileri</Badge>
              <p className="mt-2 text-xs text-slate-400">
                Promptunuzda hareket, kamera, tarz ve atmosfer detaylarını paylaşın.
              </p>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={6}
                className="mt-4 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />

              <div className="mt-4 grid gap-3">
                <label className="text-xs text-slate-300">
                  Aspect Ratio
                  <select
                    value={aspectRatio}
                    onChange={(event) => setAspectRatio(event.target.value as AspectRatio)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="auto">Otomatik</option>
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                  </select>
                </label>

                <label className="text-xs text-slate-300">
                  Çözünürlük
                  <select
                    value={resolution}
                    onChange={(event) => setResolution(event.target.value as Resolution)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                  </select>
                </label>

                <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-300">
                  <span>Sessiz / Sesli</span>
                  <div className="flex items-center gap-2">
                    <span className={generateAudio ? 'text-slate-300' : 'text-white'}>Sessiz</span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={generateAudio}
                        onChange={(event) => setGenerateAudio(event.target.checked)}
                      />
                      <span className="relative h-5 w-10 rounded-full bg-slate-700 after:absolute after:left-[3px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-cyan-500 peer-checked:after:translate-x-5" />
                    </label>
                    <span className={generateAudio ? 'text-white' : 'text-slate-300'}>Sesli</span>
                  </div>
                </label>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
                <p>Veo 3 Fast, 8 saniyelik videolar ve doğal hareketler oluşturur. Güvenlik filtreleri giriş ve çıkışları denetler.</p>
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating} className="mt-4">
                {isGenerating ? 'Video oluşturuluyor…' : 'Video oluştur'}
              </Button>
              {videoError && <p className="mt-3 text-xs text-rose-400">{videoError}</p>}
            </SoftCard>

            <SoftCard>
              <Badge>Önizleme</Badge>
              {videoUrl ? (
                <div className="mt-4 space-y-3">
                  <video
                    key={videoUrl}
                    controls
                    className="w-full rounded-xl border border-slate-800 bg-black"
                    src={videoUrl}
                  />
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>ID: {lastJobId}</span>
                    <a
                      href={videoUrl}
                      download
                      className="rounded-lg border border-slate-800 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-400/60"
                    >
                      Videoyu indir
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-800/70 bg-slate-900/40 p-6 text-center text-xs text-slate-500">
                  Üretilen video burada görünecek.
                </div>
              )}
            </SoftCard>
          </div>
        </div>
      </div>
    </main>
  );
}

function Button({
  children,
  onClick,
  disabled,
  className = ''
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-full bg-gradient-to-r ${palette.accent} px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-300">
      {children}
    </span>
  );
}

function SoftCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl ${palette.surface} border ${palette.border} p-6`}
    >
      {children}
    </motion.div>
  );
}
