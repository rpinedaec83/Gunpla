'use client';

import { useEffect, useState } from 'react';
import type { Tenant } from '@/lib/tenants';
import { Wordmark } from './wordmark';

export function SiteNav({ tenant }: { tenant: Tenant }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-line bg-base/75 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav
        aria-label="Navegacion principal"
        className="container-editorial flex h-16 items-center justify-between"
      >
        <a href="#producto" className="text-bone no-underline" aria-label={`${tenant.name}, inicio`}>
          <Wordmark tenant={tenant} />
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {tenant.nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-bone/70 transition-colors duration-200 hover:text-bone"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href={tenant.appUrl}
          className="pill pill-primary min-h-11 px-4 text-[13px]"
          rel="noopener"
        >
          Abrir taller
        </a>
      </nav>
    </header>
  );
}
