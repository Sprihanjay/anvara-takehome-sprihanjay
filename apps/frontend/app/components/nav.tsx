'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import AnvaraLogo from '@/app/assets/images/anvara.png';
import { useEffect, useState, useRef } from 'react';
import { authClient } from '@/auth-client';
import { useUserRole } from '@/hooks/useUserRole';
import { useClickOutside } from '@/hooks/useClickOutside';

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const role = useUserRole(user?.id ?? undefined);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  useEffect(() => {
    function updatePillPosition() {
      if (!navRef.current) return;
      const activeLink = navRef.current.querySelector(
        'a[data-active="true"]'
      ) as HTMLElement;
      if (activeLink) {
        setPillStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
          opacity: 1,
        });
      } else {
        setPillStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    }

    updatePillPosition();
    window.addEventListener('resize', updatePillPosition);
    const timeoutId = setTimeout(updatePillPosition, 50);
    return () => {
      window.removeEventListener('resize', updatePillPosition);
      clearTimeout(timeoutId);
    };
  }, [pathname, role]);

  // TODO: Add active link styling using usePathname() from next/navigation
  // The current page's link should be highlighted differently

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-6xl w-full px-4 mb-8">
      <nav className="relative flex items-center justify-between rounded-2xl border border-white/50 bg-white/40 p-4 shadow-lg backdrop-blur-lg backdrop-saturate-150">
        <Link href="/" className="flex items-center cursor-pointer">
          <Image src={AnvaraLogo} alt="Anvara" height={20} className="h-5 w-auto" priority unoptimized />
        </Link>

        <div ref={navRef} className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 p-1">
          <div
            className="absolute bottom-1 top-1 rounded-full bg-nav-pill shadow-sm backdrop-blur-md transition-all duration-300 ease-out"
            style={{
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity,
            }}
          />

          <Link
            href="/marketplace"
            data-active={pathname.startsWith('/marketplace')}
            className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
              pathname.startsWith('/marketplace')
                ? 'text-primary'
                : isHome
                ? 'text-white hover:text-white/80'
                : 'text-gray-500 hover:text-primary'
            }`}
          >
            Marketplace
          </Link>

          {user && role === 'sponsor' && (
            <Link
              href="/dashboard/sponsor"
              data-active={pathname.startsWith('/dashboard/sponsor')}
              className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                pathname.startsWith('/dashboard/sponsor')
                  ? 'text-primary'
                  : isHome
                  ? 'text-white hover:text-white/80'
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              Campaigns
            </Link>
          )}
          {user && role === 'publisher' && (
            <Link
              href="/dashboard/publisher"
              data-active={pathname.startsWith('/dashboard/publisher')}
              className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                pathname.startsWith('/dashboard/publisher')
                  ? 'text-primary'
                  : isHome
                  ? 'text-white hover:text-white/80'
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              My Ad Slots
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isPending ? (
            <span className="text-[--color-muted] font-semibold">...</span>
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-avatar-circle text-sm font-bold text-avatar-circle transition-transform hover:scale-105 hover:cursor-pointer"
              >
                {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl">
                  {role && (
                    <div className="mb-4">
                      <span className="rounded-full bg-avatar-circle px-3 py-1 text-xs font-bold uppercase tracking-wider text-avatar-circle">
                        {role}
                      </span>
                    </div>
                  )}
                  <div className="text-lg font-bold text-black leading-tight">
                    {user.name}
                  </div>
                  <div className="mb-6 truncate text-sm text-gray-500 mt-0.5">
                    {user.email}
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={async () => {
                        await authClient.signOut({
                          fetchOptions: {
                            onSuccess: () => {
                              window.location.href = '/';
                            },
                          },
                        });
                      }}
                      className="w-full rounded-xl px-4 py-3 text-left font-bold text-black transition-colors hover:bg-red-50 hover:text-red-600 hover:cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-btn-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-btn-primary-hover"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
