import type { Tenant } from '@/lib/tenants';
import { HeroDevice } from './hero-device';
import { Reveal } from './reveal';

export function Hero({ tenant }: { tenant: Tenant }) {
  return (
    <section id="producto" className="grain relative overflow-hidden pb-28 pt-28 sm:pb-36 sm:pt-36">
      <div className="hero-spotlight" aria-hidden="true" />
      <div className="container-editorial relative z-10">
        <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <Reveal>
              <span className="eyebrow">{tenant.eyebrow}</span>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="display hero-title mt-7 text-balance">
                <span className="block">{tenant.headline[0]}</span>
                <span className="block text-bone/55">{tenant.headline[1]}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-8 max-w-[46ch] text-[length:var(--step-1)] leading-snug text-bone/75">
                {tenant.intro}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-4 lg:pb-3">
            <Reveal delay={0.18}>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                {tenant.heroMeta}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href={tenant.appUrl} className="pill pill-primary" rel="noopener">
                  {tenant.ctaPrimary}
                </a>
                <a href="#precision" className="pill pill-ghost">
                  Ver el sistema
                </a>
              </div>
              <p className="mt-6 text-[13px] leading-relaxed text-muted">{tenant.heroNote}</p>
            </Reveal>
          </div>
        </div>

        <div className="mt-16 sm:mt-24">
          <HeroDevice tenant={tenant} />
        </div>

        <div className="mt-24 grid gap-6 border-t border-line pt-6 text-[12px] text-muted sm:grid-cols-3 sm:gap-8">
          <span>Web y movil, con la misma cuenta.</span>
          <span className="sm:text-center">Acceso con Google o correo.</span>
          <span className="sm:text-right">Datos alojados en tu comunidad.</span>
        </div>
      </div>
    </section>
  );
}
