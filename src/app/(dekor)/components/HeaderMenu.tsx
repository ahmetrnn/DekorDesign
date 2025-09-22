'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

import {
  BookIcon,
  ImageIcon,
  SettingsIcon,
  SparkIcon,
  StaffWithSparklesIcon,
  StarIcon,
  TagIcon,
  VideoIcon
} from '../../components/icons';

type TabKey = 'home' | 'generate' | 'video' | 'gallery' | 'settings' | 'pricing' | 'docs';

interface TabConfig {
  key: TabKey;
  label: string;
  href: string;
  icon: (props: { className?: string }) => JSX.Element;
}

const tabs: TabConfig[] = [
  { key: 'home', label: 'Home', href: '/#home', icon: StarIcon },
  { key: 'generate', label: 'Generate', href: '/dekor#generate', icon: StaffWithSparklesIcon },
  { key: 'video', label: 'Video', href: '/video', icon: VideoIcon },
  { key: 'gallery', label: 'Galeri', href: '/gallery#gallery', icon: ImageIcon },
  { key: 'settings', label: 'Ayarlar', href: '/settings#settings', icon: SettingsIcon },
  { key: 'pricing', label: 'Fiyatlar', href: '/#pricing', icon: TagIcon },
  { key: 'docs', label: 'Doküman', href: '/#docs', icon: BookIcon }
];

const TAB_TRANSITION = { duration: 0.22, ease: 'easeOut' as const };

export function HeaderMenu() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const readHash = () => setHash(window.location.hash.replace('#', ''));
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHash(window.location.hash.replace('#', ''));
  }, [pathname]);

  const activeTab = useMemo<TabKey>(() => {
    if (!pathname) return 'home';
    if (pathname.startsWith('/dekor')) return 'generate';
    if (pathname.startsWith('/video')) return 'video';
    if (pathname.startsWith('/gallery')) return 'gallery';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname === '/') {
      if (hash === 'video') return 'video';
      if (hash === 'pricing') return 'pricing';
      if (hash === 'docs') return 'docs';
      return 'home';
    }
    return 'home';
  }, [pathname, hash]);

  return (
    <nav className="rounded-full border border-slate-800 bg-slate-900/90 px-2 py-2 shadow-lg backdrop-blur">
      <ul className="flex items-center gap-2">
        <AnimatePresence initial={false}>
          {tabs.map(({ key, label, href, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <li key={key}>
                <Link
                  href={href}
                  className="relative block focus:outline-none"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <motion.div
                    layout
                    className={`flex items-center gap-2 rounded-full px-3 py-2 ${
                      isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                    }`}
                    animate={{ scale: isActive ? 1 : 0.94, opacity: isActive ? 1 : 0.95 }}
                    transition={TAB_TRANSITION}
                  >
                    <Icon className="h-4 w-4" />
                    <AnimatePresence initial={false} mode="popLayout">
                      {isActive && (
                        <motion.span
                          key={`${key}-label`}
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, rgba(34,211,238,0.18), rgba(14,165,233,0.18))'
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </AnimatePresence>
      </ul>
    </nav>
  );
}
