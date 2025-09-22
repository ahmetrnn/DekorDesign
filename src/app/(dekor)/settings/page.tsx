'use client';

import { motion } from 'framer-motion';
import { HeaderMenu } from '../components/HeaderMenu';
import { dekorPalette } from '../components/dekorTheme';

const fadeUp = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 }
};

const palette = dekorPalette;

export default function SettingsPage() {
  return (
    <main className={`relative min-h-screen ${palette.bg} ${palette.text} px-4 py-12`}>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[25%] -top-[25%] h-[500px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-[25%] -right-[25%] h-[560px] w-[560px] rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col gap-10">
        <div className="flex justify-center pt-2">
          <HeaderMenu />
        </div>

        <motion.header
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="space-y-3 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> Studio Defaults
          </span>
          <h1 className="text-4xl font-semibold text-white">Ayarlar</h1>
          <p className={`text-sm ${palette.subtext}`}>
            Sanal sahneleme süreciniz için varsayılanları burada yönetin. Değişiklikler anında uygulanır.
          </p>
        </motion.header>

        <motion.section
          id="settings"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
          className={`space-y-6 rounded-2xl ${palette.surface} border ${palette.border} p-6 shadow-xl backdrop-blur`}
        >
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-white" htmlFor="prompt-text">
              Varsayılan prompt
            </label>
            <textarea
              id="prompt-text"
              rows={5}
              defaultValue="Place the uploaded furniture realistically in the room image without removing any existing objects. Keep walls, floors, windows, decor, and lighting unchanged. Ensure correct scale, perspective, and alignment. Match shadows/reflections and maintain occlusion and depth ordering where needed. Photorealistic blending; do not alter the room’s colors or architecture — only integrate the selected furniture."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white" htmlFor="generator-model">
                Tercih edilen jeneratör
              </label>
              <select
                id="generator-model"
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                defaultValue="fal-ai/nano-banana/edit"
              >
                <option className="bg-slate-900" value="fal-ai/nano-banana/edit">
                  fal-ai/nano-banana/edit
                </option>
                <option className="bg-slate-900" value="fal-ai/nano-banana">
                  fal-ai/nano-banana
                </option>
                <option className="bg-slate-900" value="sharp-fallback">
                  Sharp fallback
                </option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white" htmlFor="confidence-threshold">
                Güven eşiği
              </label>
              <input
                id="confidence-threshold"
                type="number"
                min={50}
                max={100}
                defaultValue={90}
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-500/40" />
              Üretim sonrası galeriyi otomatik yenile
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-400 focus:ring-cyan-500/40" />
              Açıklama istemlerini etkinleştir
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
            >
              Ayarları kaydet
            </button>
            <button
              type="button"
              className={`rounded-xl border ${palette.border} px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60`}
            >
              Varsayılanlara dön
            </button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
