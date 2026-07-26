import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarketBreja — Cervejas que contam histórias',
  description: 'Descubra rótulos artesanais escolhidos para o seu momento.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
