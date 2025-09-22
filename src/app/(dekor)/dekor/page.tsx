"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { HeaderMenu } from "../components/HeaderMenu";
import { dekorPalette } from "../components/dekorTheme";
import type { ProductMetadata, RoomAnalysisResult } from "./lib/types";

const palette = dekorPalette;

interface IngestedAsset {
  id: string;
  src: string;
  label: string;
  productId?: string;
  imageId?: string;
  selectable: boolean;
}

interface RoomInfo {
  roomPath: string;
  analysis: RoomAnalysisResult;
}

const defaultRoomPreview =
  "https://images.unsplash.com/photo-1616594039964-5c6bc9bdaf29?auto=format&fit=crop&w=1200&q=80";
const defaultGenerated =
  "https://images.unsplash.com/photo-1616627576802-1b47ecb1c440?auto=format&fit=crop&w=1200&q=80";

export default function DekorGeneratePage() {
  const [productUrl, setProductUrl] = useState("");
  const [ingestedAssets, setIngestedAssets] = useState<IngestedAsset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const [roomPreview, setRoomPreview] = useState<string>(defaultRoomPreview);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  const [generationLoading, setGenerationLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string>(defaultGenerated);
  const [generatedLabels, setGeneratedLabels] = useState<string[]>([]);
  const [generatedStamp, setGeneratedStamp] = useState<string | null>(null);
  const [backgroundPrompt, setBackgroundPrompt] = useState<string>("");
  const [backgroundProductImage, setBackgroundProductImage] = useState<string | null>(null);
  const [backgroundProductImageName, setBackgroundProductImageName] = useState<string>("");
  const [backgroundGeneratingLoading, setBackgroundGeneratingLoading] = useState<boolean>(false);
  const [backgroundGeneratingError, setBackgroundGeneratingError] = useState<string | null>(null);
  const [generatedBackgroundImage, setGeneratedBackgroundImage] = useState<string | null>(null);

  const examplePrompts = [
    "Lüks bir ortam, parlak ışıklar, güzel tabloların olduğu bir rezidans, yüklü mobilya görselini bu lüks ortama uygun şekilde entegre edecek bir düzen oluştur.",
    "Minimalist bir stüdyo, bol doğal ışık, sade renk paleti, yüklü mobilya görselini minimalist ve ferah bir atmosferde sergile.",
    "Endüstriyel bir loft, yüksek tavanlar, tuğla duvarlar, metal aksesuarlar, yüklü mobilya görselini bu ham ve şık endüstriyel mekana uyumlu şekilde yerleştir.",
    "Bohem bir atmosfer, bol bitki, renkli kilimler ve doku katmanları, yüklü mobilya görselini bu eklektik ve sıcak ortama doğal bir şekilde dahil et.",
    "Futuristik bir oda, neon ışıklar, parlak yüzeyler, modern teknoloji, yüklü mobilya görselini bu gelecekçi ve yenilikçi ortama entegre et."
  ];

  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const selectedAssets = useMemo(
    () => ingestedAssets.filter((asset) => asset.selectable && selectedAssetIds.has(asset.id)),
    [ingestedAssets, selectedAssetIds]
  );

  const addAssets = (assets: IngestedAsset[]) => {
    if (!assets.length) return;
    setIngestedAssets((prev) => {
      const next = [...assets, ...prev].slice(0, 18);
      setSelectedAssetIds((current) => {
        const allowed = new Set(next.filter((asset) => asset.selectable).map((asset) => asset.id));
        const filtered = new Set<string>();
        current.forEach((id) => {
          if (allowed.has(id)) filtered.add(id);
        });
        return filtered;
      });
      return next;
    });
  };

  const addProductMetadata = (metadata: ProductMetadata) => {
    const items = metadata.images.map((image, index) => ({
      id: `${metadata.id}:${image.id}`,
      src: image.processedPath ?? image.originalPath,
      label: metadata.images.length > 1 ? `${metadata.title} #${index + 1}` : metadata.title,
      productId: metadata.id,
      imageId: image.id,
      selectable: Boolean(image.processedPath ?? image.originalPath)
    }));
    addAssets(items);
  };

  const toggleSelection = (id: string, selectable: boolean) => {
    if (!selectable) return;
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRoomUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setRoomError(null);
    setRoomLoading(true);
    const blobUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(blobUrl);
    setRoomPreview(blobUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/room-analyze", { method: "POST", body: formData });
      const payload = (await response.json()) as {
        success: boolean;
        data?: { roomPath: string; analysis: RoomAnalysisResult };
        error?: string;
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Room analysis failed");
      }
      setRoomPreview(payload.data.roomPath);
      setRoomInfo(payload.data);
    } catch (error) {
      setRoomError((error as Error).message);
    } finally {
      setRoomLoading(false);
      event.target.value = "";
    }
  };

  const handleIngestUrl = async () => {
    if (!productUrl.trim()) return;
    setIngestError(null);
    setIngestLoading(true);
    try {
      const formData = new FormData();
      formData.append("url", productUrl.trim());
      const response = await fetch("/api/ingest", { method: "POST", body: formData });
      const payload = (await response.json()) as { success: boolean; data?: ProductMetadata; error?: string };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Ingestion failed");
      }
      addProductMetadata(payload.data);
      setProductUrl("");
    } catch (error) {
      setIngestError((error as Error).message);
    } finally {
      setIngestLoading(false);
    }
  };

  const handleIngestFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIngestError(null);
    setIngestLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/ingest", { method: "POST", body: formData });
      const payload = (await response.json()) as { success: boolean; data?: ProductMetadata; error?: string };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Upload failed");
      }
      addProductMetadata(payload.data);
    } catch (error) {
      const localUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(localUrl);
      addAssets([
        {
          id: localUrl,
          src: localUrl,
          label: file.name.replace(/\.[^.]+$/, "") || "Uploaded asset",
          selectable: false
        }
      ]);
      setIngestError((error as Error).message);
    } finally {
      setIngestLoading(false);
      event.target.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!roomInfo) {
      setGenerationError("Önce oda fotoğrafı yükleyin.");
      return;
    }
    if (!selectedAssets.length) {
      setGenerationError("Sahnelemek için ürün seçin.");
      return;
    }
    const selections = selectedAssets
      .filter((asset) => asset.productId && asset.imageId)
      .map((asset) => ({ productId: asset.productId as string, imageId: asset.imageId as string }));

    if (!selections.length) {
      setGenerationError("Sadece işlenmiş ürünler sahnelenebilir.");
      return;
    }

    setGenerationError(null);
    setGenerationLoading(true);
    try {
      const response = await fetch("/api/stage-nano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomPath: roomInfo.roomPath,
          roomAnalysis: roomInfo.analysis,
          selections
        })
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: { outputImagePath: string };
        error?: string;
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Generation failed");
      }
      setGeneratedImage(payload.data.outputImagePath);
      setGeneratedLabels(selectedAssets.map((asset) => asset.label));
      setGeneratedStamp(new Date().toLocaleTimeString());
      setSelectedAssetIds(new Set());
      document.getElementById("stage-output")?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      setGenerationError((error as Error).message);
    } finally {
      setGenerationLoading(false);
    }
  };

  const handleBackgroundProductUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBackgroundGeneratingError(null);
    const blobUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(blobUrl);
    setBackgroundProductImage(blobUrl);
    setBackgroundProductImageName(file.name);
    setGeneratedBackgroundImage(null); // Clear previous result
  };

  const handleBackgroundGenerate = async () => {
    if (!backgroundProductImage || !backgroundPrompt.trim()) {
      setBackgroundGeneratingError("Lütfen bir ürün görseli yükleyin ve bir prompt yazın.");
      return;
    }
    setBackgroundGeneratingError(null);
    setBackgroundGeneratingLoading(true);
    try {
      // NOTE: This assumes you have an API route at /api/generate-background
      // that accepts a base64 encoded image and a prompt, and returns
      // the path to the generated image.
      const response = await fetch("/api/generate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Convert the blob URL to a base64 string for API transport
          imageBase64: await blobToBase64(backgroundProductImage),
          prompt: backgroundPrompt.trim(),
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: { outputImagePath: string };
        error?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error || "Arka plan oluşturulamadı.");
      }

      setGeneratedBackgroundImage(payload.data.outputImagePath);
    } catch (error) {
      setBackgroundGeneratingError((error as Error).message);
    } finally {
      setBackgroundGeneratingLoading(false);
    }
  };

  // Helper function to convert a blob URL to a base64 string
  const blobToBase64 = (blobUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            const base64 = btoa(
              String.fromCharCode(...new Uint8Array(reader.result))
            );
            resolve(base64);
          } else {
            reject(new Error("Failed to convert blob to base64."));
          }
        };
        reader.readAsArrayBuffer(xhr.response);
      };
      xhr.onerror = () => reject(new Error("Failed to fetch blob."));
      xhr.open("GET", blobUrl);
      xhr.responseType = "blob";
      xhr.send();
    });
  };

  return (
    <main className={`${palette.bg} ${palette.text} min-h-screen pb-16`}>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[20%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[25%] h-[560px] w-[560px] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6">
        <header className="pt-6 flex justify-center">
          <HeaderMenu />
        </header>

        <section className="mt-6 space-y-4 text-left">
          <Badge>Generate</Badge>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">RNDecor Stüdyosu</h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Ürün linkini paylaşıp oda fotoğrafını yükledikten sonra, RNDecor tamamını otomatik işler. Perspektif uyumlu,
            fotogerçekçi sahneler birkaç saniye içinde hazır olur.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="grid gap-6">
            <SoftCard>
              <div className="flex items-center gap-3">
                <Badge><StarIcon className="h-3.5 w-3.5 text-cyan-300" /> Oda görseli</Badge>
                {roomInfo && !roomLoading && <span className="text-xs text-slate-400">Analiz tamamlandı</span>}
              </div>
              <div className={`mt-4 relative aspect-[5/3] overflow-hidden rounded-2xl border border-slate-800 ${roomLoading ? "animate-pulse" : ""}`}>
                <Image src={roomPreview} alt="Room preview" fill className="object-cover" sizes="(max-width:1024px) 100vw, 720px" />
                <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-slate-900/40 text-xs font-medium text-slate-200 opacity-0 transition hover:opacity-100">
                  <UploadIcon className="mb-2 h-5 w-5" />
                  Oda fotoğrafı yükle
                  <input type="file" accept="image/*" className="hidden" onChange={handleRoomUpload} />
                </label>
              </div>
              {roomError && <p className="mt-2 text-xs text-rose-400">{roomError}</p>}
            </SoftCard>

            <div className="grid gap-6 md:grid-cols-2">
              <SoftCard>
                <Badge><ImageIcon className="h-3.5 w-3.5 text-cyan-300" /> Ürün içe aktar</Badge>
                <p className="mt-3 text-xs text-slate-400">Link yapıştır veya görsel yükle. RNDecor, arka planı kaldırır ve ürünü normalize eder.</p>
                <input
                  value={productUrl}
                  onChange={(event) => setProductUrl(event.target.value)}
                  placeholder="https://yourstore.com/product"
                  className="mt-4 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/60"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    className="px-4 py-2"
                    onClick={handleIngestUrl}
                  >
                    {ingestLoading ? 'İşleniyor…' : 'URL ile içe aktar'}
                  </Button>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400/50">
                    Görsel yükle
                    <input type="file" accept="image/*" className="hidden" onChange={handleIngestFile} />
                  </label>
                </div>
                {ingestError && <p className="mt-2 text-xs text-rose-400">{ingestError}</p>}
              </SoftCard>

              <SoftCard>
                <Badge><CameraIcon className="h-3.5 w-3.5 text-cyan-300" /> Ürün önizleme</Badge>
                <p className="mt-3 text-xs text-slate-400">İçe aktarılan ürünler burada listelenir. İşlenmiş ürünleri sahneleme için seçebilirsiniz.</p>
                {ingestedAssets.length ? (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {ingestedAssets.slice(0, 4).map((asset) => (
                      <div key={asset.id} className="relative aspect-square overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                        <Image src={asset.src} alt={asset.label} fill className="object-contain" sizes="(max-width:768px) 50vw, 200px" />
                        {!asset.selectable && (
                          <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-center text-[10px] text-slate-300">
                            İşlenemedi
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Henüz ürün yok" desc="Link yapıştır veya görsel yükle." />
                )}
              </SoftCard>
            </div>

            <SoftCard>
              <div className="flex items-center justify-between">
                <Badge><GridIcon className="h-3.5 w-3.5 text-cyan-300" /> Ürün seçimi</Badge>
                <span className="text-xs text-slate-500">
                  {selectedAssets.length > 0 ? `${selectedAssets.length} seçildi` : 'Ürün seçiniz'}
                </span>
              </div>
              <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-2">
                {ingestedAssets.length ? (
                  ingestedAssets.map((asset) => {
                    const isSelected = selectedAssetIds.has(asset.id);
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => toggleSelection(asset.id, asset.selectable)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm text-slate-200 transition hover:shadow ${
                          asset.selectable
                            ? isSelected
                              ? 'border-cyan-400/50 bg-slate-900'
                              : 'border-slate-800 bg-slate-900/60'
                            : 'cursor-not-allowed border-dashed border-slate-800 bg-slate-900/30 text-slate-500'
                        }`}
                      >
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
                          <Image src={asset.src} alt={asset.label} fill className="object-cover" sizes="48px" />
                          {isSelected && (<span className="absolute inset-0 flex items-center justify-center bg-cyan-500/30 text-cyan-100"><CheckIcon className="h-4 w-4" /></span>)}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <span className="font-medium">{asset.label}</span>
                          <span className="text-xs text-slate-400">{asset.selectable ? 'İşlenmiş' : 'İşlenmedi'}</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <EmptyState title="Ürün ekleyin" desc="Seçim yapabilmek için içe aktarın." />
                )}
              </div>
            </SoftCard>
          </div>

          <SoftCard>
            <div className="flex items-center justify-between">
              <Badge><TagIcon className="h-3.5 w-3.5 text-cyan-300" /> Sahne oluştur</Badge>
              <Button variant="outline" onClick={handleGenerate}>
                {generationLoading ? 'Oluşturuluyor…' : 'Sahnele'}
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Seçili ürünler, oda fotoğrafınıza perspektif ve ışık uyumu ile yerleştirilecek.
            </p>
            <div className={`mt-6 relative aspect-[5/3] overflow-hidden rounded-2xl border border-slate-800 ${generationLoading ? 'animate-pulse' : ''}`}>
              <Image src={generatedImage} alt="Generated staging" fill className="object-cover" sizes="(max-width:768px) 100vw, 720px" />
            </div>
            {generationError && <p className="mt-3 text-xs text-rose-400">{generationError}</p>}
            {generatedLabels.length > 0 && (
              <p className="mt-3 text-xs text-slate-400">
                {generatedLabels.join(', ')} • {generatedStamp ?? ''}
              </p>
            )}
          </SoftCard>
        </section>

        <section className="mt-12 space-y-6">
          <SoftCard>
            <Badge><SparkIcon className="h-3.5 w-3.5 text-cyan-300" /> Arka Plan Oluştur/Değiştir</Badge>
            <h2 className="mt-4 text-xl font-semibold text-white">Arka Planınızı Özelleştirin</h2>
            <p className="mt-2 text-sm text-slate-400">
              Ürün görselinizi yükleyin ve arka plan için bir prompt yazın. Yapay zeka, isteğinize uygun yeni bir arka plan oluşturacaktır.
            </p>

            <div className="mt-4">
              <p className="text-sm font-medium text-slate-300 mb-2">Örnek Prompt'lar</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setBackgroundPrompt(prompt)}
                    className="inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-400/50 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="background-product-upload" className="block text-sm font-medium text-slate-300 mb-2">
                  Ürün Görseli
                </label>
                {backgroundProductImage ? (
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                    <Image src={backgroundProductImage} alt={backgroundProductImageName} fill className="object-contain" sizes="(max-width:768px) 50vw, 400px" />
                    <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-slate-900/40 text-xs font-medium text-slate-200 opacity-0 transition hover:opacity-100">
                      <UploadIcon className="mb-2 h-5 w-5" />
                      Görseli Değiştir
                      <input
                        id="background-product-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBackgroundProductUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <label className={`relative aspect-square overflow-hidden rounded-2xl border-2 border-dashed ${palette.border} bg-slate-900/40 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400/50 transition-colors`}>
                    <UploadIcon className="h-8 w-8 text-slate-500 mb-2" />
                    <span className="text-sm text-slate-400">Ürün görselini yükleyin</span>
                    <span className="text-xs text-slate-500 mt-1">(PNG, JPG)</span>
                    <input
                      id="background-product-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleBackgroundProductUpload}
                    />
                  </label>
                )}
                {backgroundProductImageName && (
                  <p className="mt-2 text-xs text-slate-400 truncate">{backgroundProductImageName}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="background-prompt-textarea" className="block text-sm font-medium text-slate-300 mb-2">
                  Arka Plan Prompt'u
                </label>
                <textarea
                  id="background-prompt-textarea"
                  value={backgroundPrompt}
                  onChange={(e) => setBackgroundPrompt(e.target.value)}
                  rows={4}
                  placeholder="Örn: Modern bir oturma odası, minimalist tarz, doğal ışık..."
                  className={`w-full flex-1 rounded-xl border ${palette.border} bg-slate-900/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-cyan-400/60 resize-none`}
                />
                <Button variant="primary" className="mt-4 self-end" onClick={handleBackgroundGenerate} disabled={backgroundGeneratingLoading || !backgroundProductImage}>
                  {backgroundGeneratingLoading ? 'Oluşturuluyor…' : 'Arka Planı Oluştur'}
                </Button>
              </div>
            </div>
          </SoftCard>

          {generatedBackgroundImage && (
            <SoftCard>
              <Badge><TagIcon className="h-3.5 w-3.5 text-cyan-300" /> Oluşturulan Arka Plan</Badge>
              <div className="mt-4 relative aspect-[5/3] overflow-hidden rounded-2xl border border-slate-800">
                <Image src={generatedBackgroundImage} alt="Generated background" fill className="object-cover" sizes="(max-width:1024px) 100vw, 720px" />
              </div>
              {backgroundGeneratingError && <p className="mt-3 text-xs text-rose-400">{backgroundGeneratingError}</p>}
            </SoftCard>
          )}
        </section>

      </div>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-800/80 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-300">
      {children}
    </span>
  );
}

function SoftCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl ${palette.surface} border ${palette.border} p-6 shadow-lg ${className}`}
    >
      {children}
    </motion.div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-800/70 bg-slate-900/40 p-5 text-center">
      <p className="text-sm font-medium text-slate-200">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </div>
  );
}

type ButtonVariant = "primary" | "outline" | "ghost";

function Button({ children, variant = "primary", href, onClick, className = "", disabled = false }: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2";
  const styles: Record<ButtonVariant, string> = {
    primary: `bg-gradient-to-r ${palette.accent} text-slate-900 hover:opacity-90 focus-visible:${palette.ring}`,
    outline: `border ${palette.border} bg-slate-900/50 text-slate-100 hover:border-cyan-400/50 focus-visible:${palette.ring}`,
    ghost: `bg-slate-900/40 text-slate-100 border ${palette.border} hover:border-cyan-400/40 focus-visible:${palette.ring}`
  };

  const content = (
    <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className="inline-flex">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-flex">
      {content}
    </button>
  );
}

type IconProps = { className?: string };

function StarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 14.6 8.8 22 9.2l-5 4.5 1.6 7.1L12 17.8 5.4 20.8 7 13.7 2 9.2l7.4-.4Z" />
    </svg>
  );
}

function ImageIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 5h16v14H4Z" fill="none" stroke="currentColor" strokeWidth={1.6} />
      <path d="M8 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm11 8-4.5-6-3.5 4L9 13l-4 4h14Z" />
    </svg>
  );
}

function TagIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 10 12 1H3v9l9 9 9-9Zm-14.5-4A1.5 1.5 0 1 0 6.5 3a1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}

function BookIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h11a3 3 0 0 1 3 3v14H8a3 3 0 0 1-3-3V3Zm3 3v11h11" />
    </svg>
  );
}

function CameraIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 7h4l2-2h4l2 2h4v12H4Zm8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    </svg>
  );
}

function GridIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h8v8H3Zm10 0h8v8h-8ZM3 13h8v8H3Zm10 0h8v8h-8Z" />
    </svg>
  );
}

function SparkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2 14 8l6 .5-4.5 3.6L17 18l-5-3-5 3 1.5-5.9L4 8.5 10 8Z" />
    </svg>
  );
}

function UploadIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 16V8.83L9.12 10.7 7.7 9.29 12 5l4.3 4.29-1.42 1.41L13 8.83V16Zm-6 2v2h14v-2H5Z" />
    </svg>
  );
}

function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.2 4.8 12 3.4 13.4 9 19l12-12-1.4-1.4Z" />
    </svg>
  );
}
