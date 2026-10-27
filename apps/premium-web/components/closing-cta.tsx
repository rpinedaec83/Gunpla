import type { Tenant } from '@/lib/tenants';

export function ClosingCta({ tenant }: { tenant: Tenant }) {
  return (
    <section id="acceso" className="relative overflow-hidden bg-base">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 100%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 70%)'
        }}
        aria-hidden="true"
      />

      <div className="container-editorial relative z-10 py-28 text-center sm:py-40">
        <span className="eyebrow">Acceso</span>
        <h2 className="display section-title mt-6 text-balance">{tenant.ctaTitle}</h2>
        <p className="mx-auto mt-6 max-w-[40ch] text-[15px] leading-relaxed text-bone/70">
          {tenant.ctaBody}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a href={tenant.appUrl} className="pill pill-accent" rel="noopener">
            {tenant.ctaPrimary}
          </a>
          <a href={tenant.alternate.href} className="pill pill-ghost" rel="noopener">
            {tenant.ctaSecondary}
          </a>
        </div>

        <p className="mt-8 text-[12px] text-muted">
          Gratis para empezar. Tus datos quedan en tu comunidad.
        </p>
      </div>
    </section>
  );
}
