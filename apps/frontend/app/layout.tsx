import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Nav } from './components/nav';
import { Footer } from '@/app/components/footer';

export const metadata: Metadata = {
  title: 'Anvara Marketplace',
  description: 'Sponsorship marketplace connecting sponsors with publishers',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased flex flex-col pt-4">
        <Nav />
        <main className="mx-auto max-w-6xl p-4 flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
