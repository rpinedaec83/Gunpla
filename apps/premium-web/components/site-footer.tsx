import type { Tenant } from '@/lib/tenants';
import { Wordmark } from './wordmark';

export function SiteFooter({ tenant }: { tenant: Tenant }) {
  return (
    <footer className="border-t border-line">
      <div className="container-editorial py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <a href="#producto" className="text-bone no-underline" aria-label={`${tenant.name}, inicio`}>
            <Wordmark tenant={tenant} />
          </a>

          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-6 text-[12px] text-muted">
            <a href="https://plamoscale.com/privacy" className="transition-colors hover:text-bone">
              Privacidad
            </a>
            <a href="https://plamoscale.com/terms" className="transition-colors hover:text-bone">
              Terminos
            </a>
            <a href={tenant.alternate.href} className="transition-colors hover:text-bone">
              {tenant.alternate.label}
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-[11px] text-muted sm:flex-row sm:justify-between">
          <span>
            2026 {tenant.name}.
            {tenant.slug === 'gunplajunkies' ? ' Parte del ecosistema PlamoScale.' : ''}
          </span>
          <span>Hecho para la mesa de trabajo.</span>
        </div>
      </div>
    </footer>
  );
}
