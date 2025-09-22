export const dekorPalette = {
  bg: "bg-slate-950",
  surface: "bg-slate-900/60",
  text: "text-slate-100",
  subtext: "text-slate-300",
  accent: "from-cyan-400 to-sky-500",
  border: "border-slate-800",
  muted: "text-slate-400",
  ring: "ring-cyan-400/60"
} as const;

export type DekorPalette = typeof dekorPalette;
