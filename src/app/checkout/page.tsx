"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon, ShieldIcon } from "../components/icons";

/* ====== Tema ====== */
const ui = {
  bg: "bg-slate-950",
  surface: "bg-slate-900/60",
  border: "border-slate-800",
  text: "text-slate-100",
  sub: "text-slate-400",
  accentFrom: "from-cyan-400",
  accentTo: "to-sky-500",
  ring: "focus-visible:ring-2 focus-visible:ring-cyan-400/60"
};

/* ====== Planlar (pricing ile uyumlu) ====== */
type PlanKey = "starter" | "growth" | "pro";

type Plan = {
  id: PlanKey;
  name: string;
  priceMonthly: number;
  credits: number;
  approx: string;
  perks: string[];
};

const PLANS: Record<PlanKey, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    credits: 120,
    approx: "≈ 120 görsel veya 7 video",
    perks: ["Fotogerçekçi sahneleme", "Kredi devri (1 ay)", "Ticari kullanım", "E-posta destek"]
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 99,
    credits: 600,
    approx: "≈ 600 görsel veya 37 video",
    perks: [
      "Fotogerçekçi sahneleme",
      "Video üretimi",
      "Kredi devri (1 ay)",
      "Ticari kullanım",
      "Öncelikli destek"
    ]
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 249,
    credits: 2000,
    approx: "≈ 2.000 görsel veya 125 video",
    perks: ["Öncelikli render kuyruğu", "5 ekip üyesi", "Kredi devri (1 ay)", "Ticari kullanım"]
  }
};

/* ====== Yardımcılar ====== */
const fmt = (n: number) => `$${n.toFixed(2)}`;
const percent = (n: number) => `${Math.round(n * 100)}%`;

/* ====== Button ====== */
function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "outline";
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all " +
    ui.ring;
  const style =
    variant === "primary"
      ? `bg-gradient-to-r ${ui.accentFrom} ${ui.accentTo} text-slate-900 hover:opacity-95 disabled:opacity-60`
      : variant === "outline"
      ? `border ${ui.border} text-slate-100 hover:border-cyan-400/50`
      : `bg-slate-900/40 text-slate-100 border ${ui.border} hover:border-cyan-400/40`;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${style} ${className}`}>
      {children}
    </button>
  );
}

/* ====== TextField ====== */
function Field({
  label,
  placeholder,
  type = "text",
  required,
  autoComplete,
  name
}: {
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  name?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-300">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`w-full rounded-lg border ${ui.border} bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ${ui.ring}`}
      />
    </label>
  );
}

/* ====== Checkout Page ====== */
export default function CheckoutPage() {
  const [planKey, setPlanKey] = useState<PlanKey>("starter");

  useEffect(() => {
    const q = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const p = q.get("plan") as PlanKey | null;
    if (p && ["starter", "growth", "pro"].includes(p)) setPlanKey(p);
  }, []);

  const [yearly, setYearly] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; pct: number } | null>(null);

  const plan = PLANS[planKey];

  const basePrice = useMemo(() => plan.priceMonthly * (yearly ? 12 : 1), [plan, yearly]);
  const yearlyDiscount = yearly ? 0.15 : 0;
  const discounted = basePrice * (1 - yearlyDiscount);

  const couponPct = couponApplied?.pct ?? 0;
  const subtotal = discounted * (1 - couponPct);
  const vatPct = 0.18;
  const vat = subtotal * vatPct;
  const total = subtotal + vat;

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    if (code === "RN10") setCouponApplied({ code, pct: 0.1 });
    else if (code === "WELCOME15") setCouponApplied({ code, pct: 0.15 });
    else setCouponApplied({ code, pct: 0 });
  }

  function removeCoupon() {
    setCouponApplied(null);
    setCoupon("");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert(`Ödeme başlatılıyor: Plan ${plan.name} • ${yearly ? "Yıllık" : "Aylık"} • Tutar ${fmt(total)} USD`);
  }

  return (
    <main className={`${ui.bg} ${ui.text} relative min-h-screen`}>
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="mt-[-80px] h-[520px] w-[720px] rounded-full bg-gradient-to-tr from-cyan-500/25 to-sky-500/10 opacity-60 blur-[120px]" />
      </div>

      <div className="sticky top-0 z-30 border-b border-slate-900 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-md bg-gradient-to-tr from-cyan-400 to-sky-500" />
            <span className="font-semibold">RNDecor</span>
          </div>
          <a href="/#pricing" className="text-sm text-slate-300 hover:text-white">
            Planlara dön
          </a>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-3">
        <section className={`lg:col-span-2 rounded-2xl ${ui.surface} border ${ui.border} p-6`}>
          <h1 className="text-2xl font-semibold">Ödeme</h1>
          <p className={`${ui.sub} mt-1 text-sm`}>Bilgilerinizi girin ve aboneliğinizi başlatın.</p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {(["starter", "growth", "pro"] as PlanKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setPlanKey(k)}
                className={`rounded-lg border ${ui.border} px-3 py-2 text-sm transition-colors ${
                  planKey === k ? "border-cyan-400/60 bg-slate-900/70" : "hover:border-cyan-400/30"
                }`}
              >
                {PLANS[k].name}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-3">
            <div className="text-sm">
              <div className="font-medium">Faturalandırma</div>
              <div className="text-xs text-slate-400">Yıllık ödemede %15 indirim</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${yearly ? "text-slate-400" : "text-white"}`}>Aylık</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={yearly}
                  onChange={(event) => setYearly(event.target.checked)}
                />
                <span className="relative h-6 w-11 rounded-full bg-slate-700 after:absolute after:left-[4px] after:top-[3px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-cyan-500 peer-checked:after:translate-x-5" />
              </label>
              <span className={`text-xs ${yearly ? "text-white" : "text-slate-400"}`}>Yıllık</span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Ad" name="firstName" autoComplete="given-name" required />
              <Field label="Soyad" name="lastName" autoComplete="family-name" required />
            </div>
            <Field label="E-posta" type="email" name="email" autoComplete="email" required />
            <Field label="Şirket / Marka (opsiyonel)" name="company" />

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Ülke" name="country" placeholder="TR" />
              <Field label="Şehir" name="city" />
              <Field label="Vergi No (opsiyonel)" name="tax" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="mb-3 text-sm font-medium">Kart Bilgileri</div>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Kart Numarası" name="card" placeholder="4242 4242 4242 4242" />
                <Field label="SKT" name="exp" placeholder="MM/YY" />
                <Field label="CVC" name="cvc" placeholder="123" />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Ödeme sağlayıcısı ile güvenli şekilde şifrelenir. Kart bilgileri RNDecor tarafından saklanmaz.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-300">Kupon Kodu</span>
                <input
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  placeholder="Örn. RN10"
                  className={`w-full rounded-lg border ${ui.border} bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none ${ui.ring}`}
                />
              </label>
              {!couponApplied ? (
                <Button variant="outline" onClick={applyCoupon} className="md:w-32">
                  Uygula
                </Button>
              ) : (
                <Button variant="ghost" onClick={removeCoupon} className="md:w-32">
                  Kaldır
                </Button>
              )}
              <div className="self-end text-xs text-slate-400">
                {couponApplied
                  ? couponApplied.pct > 0
                    ? `${couponApplied.code} kuponu uygulandı: ${percent(couponApplied.pct)}`
                    : `${couponApplied.code} geçersiz.`
                  : "RN10 / WELCOME15 örnek kupon."}
              </div>
            </div>

            <Button type="submit" className="mt-2">
              Güvenli Ödeme Yap
            </Button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldIcon className="h-4 w-4 text-cyan-300" /> 256-bit TLS • PCI-DSS uyumlu sağlayıcı • İptal/geri ödeme seçeneği
            </div>
          </form>
        </section>

        <aside className={`h-fit rounded-2xl ${ui.surface} border ${ui.border} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-300">Seçili Plan</div>
              <div className="text-lg font-semibold">{plan.name}</div>
            </div>
            <span className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300">
              {yearly ? "Yıllık" : "Aylık"}
            </span>
          </div>

          <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <div className="font-medium text-slate-100">{plan.credits} kredi</div>
            <div className="text-xs text-slate-400">{plan.approx}</div>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {plan.perks.map((perk) => (
              <li key={perk} className="flex gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 text-cyan-300" /> {perk}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 border-t border-slate-800 pt-4 text-sm">
            <Row label={yearly ? "Yıllık toplam" : "Aylık"} value={fmt(basePrice)} />
            {yearly && <Row label="Yıllık indirim" value={`– ${percent(0.15)}`} muted />}
            {couponApplied && couponApplied.pct > 0 && (
              <Row label={`Kupon (${couponApplied.code})`} value={`– ${percent(couponApplied.pct)}`} muted />
            )}
            <Row label="Ara toplam" value={fmt(subtotal)} />
            <Row label="KDV (18%)" value={fmt(vat)} />
            <Row label="Ödenecek" value={fmt(total)} bold />
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Kullanmadığınız krediler bir ay devreder. Aşım durumunda ek kredi satın alabilirsiniz.
          </div>

          <div className="mt-6 flex items-center gap-2 opacity-80">
            <CardLogo label="VISA" />
            <CardLogo label="MC" />
            <CardLogo label="AMEX" />
            <CardLogo label="APPLE PAY" />
          </div>
        </aside>
      </div>
    </main>
  );
}

/* ====== Yardımcı bileşenler ====== */
function Row({
  label,
  value,
  muted,
  bold
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-slate-400 ${muted ? "opacity-80" : ""}`}>{label}</span>
      <span className={bold ? "font-semibold text-white" : "text-slate-200"}>{value}</span>
    </div>
  );
}

function CardLogo({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/60 px-2 py-1 text-[10px] tracking-wide text-slate-300">
      {label}
    </div>
  );
}
