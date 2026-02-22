import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Nav } from './components/nav';
import { NewsletterSignup } from './components/newsletter-signup';

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
        <footer className="mt-auto">
          <NewsletterSignup />
        </footer>
      </body>
    </html>
  );
}
