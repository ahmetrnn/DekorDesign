"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { HeaderMenu } from "./(dekor)/components/HeaderMenu";
import { CameraIcon, CheckIcon, GridIcon, PlugIcon, ShieldIcon, SparkIcon } from "./components/icons";

const palette = {
  bg: "bg-slate-950",
  surface: "bg-slate-900/60",
  text: "text-slate-100",
  subtext: "text-slate-300",
  accent: "from-cyan-400 to-sky-500",
  ring: "ring-cyan-400/60",
  border: "border-slate-800",
  muted: "text-slate-400"
};

function Header() {
  return (
    <header className="sticky top-4 z-50 flex justify-center">
      <HeaderMenu />
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className={`${palette.bg} ${palette.text} relative overflow-hidden`}>        
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="mt-[-80px] h-[520px] w-[720px] rounded-full bg-gradient-to-tr from-cyan-500/30 to-sky-500/20 blur-[120px] opacity-60" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs text-slate-300"
        >
          <SparkIcon className="h-3.5 w-3.5 text-cyan-400" />
          RNDecor Studio • AI Virtual Staging
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
          className="mt-4 text-4xl font-semibold leading-tight md:text-6xl"
        >
          Mobilya satış fotoğraflarınızı yapay zekâ ile saniyeler içinde {" "}
          <span className="bg-gradient-to-r from-cyan-400 to-sky-500 bg-clip-text text-transparent">
            fotogerçekçi sahnelere dönüştürün.
          </span>{" "}
        </motion.h1>

        <p className={`mt-4 max-w-3xl ${palette.subtext}`}>
          RNDecor Studio, mobilya ve dekorasyon markaları için geliştirilmiş AI destekli sanal sahneleme platformudur. 
          Ürünlerinizi gerçekçi oda görsellerine ölçek, perspektif, ışık ve gölge uyumuyla yerleştirir. 
          Profesyonel fotoğraf çekimine gerek kalmadan koleksiyonlarınızı satışa hazır hale getirin.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="primary" href="/dekor">
            Ücretsiz Deneyin
          </Button>
          <Button variant="ghost" href="/gallery#gallery">
            Örnek Galeriyi Görün
          </Button>
        </div>

        <TrustBar />
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: 1,
      t: "Ürünü Ekleyin",
      d: "Mobilya veya dekor ürününüzün fotoğrafını ya da linkini yükleyin. Yapay zekâ arka planı temizler, boyut ve açı analizi yaparak sahnelemeye hazır hale getirir."
    },
    {
      n: 2,
      t: "Odayı Seçin",
      d: "Kendi oda fotoğrafınızı yükleyin veya hazır şablonlardan seçin. Sistem ışık yönünü, renk sıcaklığını ve perspektifi otomatik algılar."
    },
    {
      n: 3,
      t: "Tek Tıkla Gerçekçi Sahneleme",
      d: "Ürün, seçtiğiniz odaya doğru ölçek, gölge ve ışık uyumuyla yerleştirilir. Sonuç: e-ticaret siteniz, kataloglarınız veya sosyal medya için profesyonel görseller."
    }
  ];

  return (
    <section className="bg-slate-950 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-2xl font-semibold text-white md:text-3xl">
          3 Adımda Yapay Zekâ ile Satış Görsellerinizi Hazırlayın
        </h2>
        <p className="mt-2 text-center text-slate-400">
          RNDecor, ürün görsellerinizi saniyeler içinde gerçekçi oda fotoğraflarına dönüştürür. Profesyonel çekim maliyeti olmadan satışa hazır içerikler oluşturun.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: step.n * 0.06 }}
              className={`rounded-2xl ${palette.surface} border ${palette.border} p-6`}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-content-center rounded-full border border-slate-800 bg-gradient-to-tr from-cyan-400/20 to-sky-500/20 text-sm font-semibold text-cyan-300">
                  {step.n}
                </div>
                <h3 className="font-medium text-white">{step.t}</h3>
              </div>
              <p className={`mt-3 ${palette.muted}`}>{step.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const data = [
    { t: "Gerçekçi Yerleşim", d: "Ürünleriniz, yapay zekâ ile otomatik ölçeklendirilir ve ışık-gölge uyumu sağlanır. Böylece müşteri gerçek bir yaşam alanında ürünü görür.", i: CameraIcon },
    { t: "Otomatik Matching", d: "Arka plan kaldırma, açı düzeltme ve renk sıcaklığı analizi otomatik yapılır. En doğru sahneleme saniyeler içinde hazırlanır.", i: GridIcon },
    { t: "Hızlı Varyasyon", d: "Renk ve kumaş alternatiflerini saniyeler içinde test edin. Katalog güncellemeleri için zaman ve maliyetten %80’e varan tasarruf sağlayın.", i: SparkIcon }
  ];

  return (
    <section id="gallery" className="bg-slate-950 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-2xl font-semibold text-white md:text-3xl">Neden RNDecor?</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {data.map((feature, index) => (
            <motion.div
              key={feature.t}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className={`rounded-2xl ${palette.surface} border ${palette.border} p-5`}
            >
              <feature.i className="h-5 w-5 text-cyan-300" />
              <h3 className="mt-3 font-medium text-white">{feature.t}</h3>
              <p className={`mt-2 text-sm ${palette.muted}`}>{feature.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29 / ay',
      credits: '120 kredi',
      approx: '≈ 120 görsel veya 7 video',
      cta: 'Planı seç',
      recommended: false,
      features: [
        'Fotogerçekçi sahneleme',
        'Kredi devri (1 ay)',
        'Ticari kullanım',
        'E-posta destek'
      ]
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '$99 / ay',
      credits: '600 kredi',
      approx: '≈ 600 görsel veya 37 video',
      cta: 'En popüler',
      recommended: true,
      features: [
        'Fotogerçekçi sahneleme',
        'Video üretimi',
        'Kredi devri (1 ay)',
        'Ticari kullanım',
        'Öncelikli destek'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$249 / ay',
      credits: '2.000 kredi',
      approx: '≈ 2.000 görsel veya 125 video',
      cta: 'Pro planı incele',
      recommended: false,
      features: [
        'Öncelikli render kuyruğu',
        '5 ekip üyesi',
        'Kredi devri (1 ay)',
        'Ticari kullanım'
      ]
    }
  ];

  return (
    <section id="pricing" className="bg-slate-950 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-2xl font-semibold text-white md:text-3xl">Planlar & Fiyatlandırma</h2>
        <p className="mt-2 text-center text-slate-400">
          Kredi sistemi ile esnek fiyatlandırma. 1 kredi = 1 görsel, 16 kredi = 1 video. Kullanmadığınız krediler bir sonraki aya devreder. Küçük ölçekli denemelerden kurumsal kullanımına kadar esnek çözümler.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className={`relative rounded-2xl ${palette.surface} border ${palette.border} p-6 transition-shadow hover:shadow-cyan-500/10 hover:shadow-2xl ${
                plan.recommended ? 'ring-2 ring-cyan-500/60' : ''
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 px-2 py-1 text-xs font-semibold text-slate-900 shadow">
                  ÖNERİLEN
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-2xl text-white">{plan.price}</p>
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-white font-medium">{plan.credits}</p>
                <p className="text-sm text-slate-400">{plan.approx}</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-cyan-300" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-2">
                <Button variant={plan.recommended ? 'primary' : 'outline'} href={`/checkout?plan=${plan.id}`}>
                  {plan.cta}
                </Button>
                <Link href={`/checkout?plan=${plan.id}`} className="text-center text-xs text-slate-500 hover:text-slate-300">
                  Kredi ekle
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200 md:flex-row">
          <div>
            <h4 className="text-white font-semibold">Custom / Enterprise</h4>
            <p className="text-sm text-slate-400">Esnek kredi, API erişimi, SLA ve sınırsız ekip üyeliği.</p>
          </div>
          <Button variant="ghost" href="#contact">
            Satışla iletişime geç
          </Button>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Plan fiyatları USD cinsindedir. Aşım durumunda “Kredi ekle” ile devam edebilirsiniz.
        </p>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-slate-950 py-14" id="docs">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/70 to-slate-900/30 px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h3 className="text-xl font-semibold text-white md:text-2xl">
              Fikirlerinizi sahnelemeye hazır mısınız?
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Ücretsiz deneyin veya API dokümanları ile kendi iş akışınıza entegre edin.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" href="/dekor">
              Ücretsiz deneyin
            </Button>
            <Button variant="ghost" href="#pricing">
              Planları görün
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <main className={`${palette.bg} ${palette.text} selection:bg-cyan-500/20 selection:text-white`}>
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}

type ButtonVariant = "primary" | "ghost" | "outline";

function Button({ children, variant = "primary", href }: { children: React.ReactNode; variant?: ButtonVariant; href?: string }) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 transition-all focus-visible:ring-offset-0';
  const variantClasses: Record<ButtonVariant, string> = {
    primary: `bg-gradient-to-r ${palette.accent} text-slate-900 hover:opacity-90 focus-visible:${palette.ring}`,
    ghost: `bg-slate-900/40 text-slate-100 border ${palette.border} hover:border-cyan-400/50 focus-visible:${palette.ring}`,
    outline: `border ${palette.border} bg-slate-900/50 text-slate-100 hover:border-cyan-400/50 focus-visible:${palette.ring}`
  };

  const className = `${baseClasses} ${variantClasses[variant]}`;

  if (href) {
    return (
      <motion.a href={href} className={className} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button type="button" className={className} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      {children}
    </motion.button>
  );
}

function TrustBar() {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-6 text-slate-400">
      <ShieldIcon className="h-4 w-4 text-cyan-300" />
      <span className="text-xs">Veri gizliliği • İş sürekliliği • Güvenli üretim</span>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-900 py-10 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} RNDecor Studio. Tüm hakları saklıdır.
    </footer>
  );
}
