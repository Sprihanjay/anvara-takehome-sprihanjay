'use client';

import { usePathname } from 'next/navigation';
import { NewsletterSignup } from './newsletter-signup';

export function Footer() {
  const pathname = usePathname();

  // Hide footer on specific dashboard pages
  // Sponsor campaigns path: /dashboard/sponsor
  // Publisher ad slots path: /dashboard/publisher
  
  const isSponsorDashboard = pathname.startsWith('/dashboard/sponsor');
  const isPublisherDashboard = pathname.startsWith('/dashboard/publisher');

  if (isSponsorDashboard || isPublisherDashboard) {
    return null;
  }

  return (
    <footer className="mt-auto">
      <NewsletterSignup />
    </footer>
  );
}
