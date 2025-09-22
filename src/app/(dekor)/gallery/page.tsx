'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { HeaderMenu } from '../components/HeaderMenu';
import { dekorPalette } from '../components/dekorTheme';

const palette = dekorPalette;

const fadeUp = {
  initial: { opacity: 0, y: 30, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 }
};

interface GalleryItem {
  id: string;
  imgUrl: string;
  name: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    void fetch('/api/gallery-dekor')
      .then(async (response) => {
        const payload = (await response.json()) as {
          success: boolean;
          data?: {
            items: { id: string; outputImagePath: string }[];
          };
        };
        if (!payload.success || !payload.data) return;
        setItems(
          payload.data.items.map((item, index) => ({
            id: item.id,
            imgUrl: item.outputImagePath,
            name: `Generated render ${index + 1}`
          }))
        );
      })
      .catch(() => undefined);
  }, []);

  return (
    <main className={`relative min-h-screen ${palette.bg} ${palette.text} px-4 py-12`}>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[25%] h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-[25%] -right-[20%] h-[580px] w-[580px] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10">
        <div className="flex justify-center pt-2">
          <HeaderMenu />
        </div>

        <motion.header
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <span className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
            RNDecor Studio • Galeri
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">AI Sahneleme Galerisi</h1>
          <p className={`mt-3 text-lg ${palette.subtext}`}>
            Son renderlarınız otomatik olarak burada listelenir. Yeni sahneler ürettikçe galeri güncellenir.
          </p>
        </motion.header>

        <motion.section
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
          className={`rounded-2xl ${palette.surface} border ${palette.border} p-6 shadow-xl backdrop-blur sm:p-8`}
        >
          {items.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: index * 0.08 }}
                  className="group flex flex-col gap-4"
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 shadow-lg transition duration-300 group-hover:scale-[1.02] group-hover:shadow-cyan-500/20">
                    <Image
                      src={item.imgUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 33vw, 240px"
                    />
                  </div>
                  <div className={`flex items-center justify-between text-sm ${palette.subtext}`}>
                    <span className="truncate text-slate-200">{item.name}</span>
                    <a
                      href={item.imgUrl}
                      download
                      className={`rounded-lg border ${palette.border} px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-cyan-400/60 hover:text-white`}
                    >
                      İndir
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className={`text-center text-sm ${palette.subtext}`}>
              Render ürettiğinizde görseller otomatik olarak burada görünecek.
            </p>
          )}
        </motion.section>
      </div>
    </main>
  );
}
