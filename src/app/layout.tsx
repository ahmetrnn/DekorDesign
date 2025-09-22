import type { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'RNDecor Studio',
  description: 'AI destekli sanal sahneleme platformu'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
