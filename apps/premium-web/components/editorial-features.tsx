import type { Tenant } from '@/lib/tenants';
import { SectionLabel } from './section-label';

export function EditorialFeatures({ tenant }: { tenant: Tenant }) {
  return (
    <section id="herramientas" className="bg-base">
      <div className="container-editorial py-28 sm:py-40">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionLabel index="05 / 05">Herramientas</SectionLabel>
            <h2 className="display-tight section-title mt-6 max-w-[16ch]">
              Todo lo que la mesa pide.
            </h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:pt-2">
            <p className="text-sm leading-relaxed text-muted">
              Cuatro modulos, un mismo lenguaje. La informacion viaja contigo del stash a la
              bitacora y de la bitacora a la vitrina.
            </p>
          </div>
        </div>

        <div className="mt-16">
          {tenant.features.map((feature) => (
            <div
              key={feature.index}
              className="grid gap-5 border-t border-line py-10 lg:grid-cols-12 lg:items-baseline lg:gap-6"
            >
              <span className="text-[11px] tracking-[0.16em] text-muted lg:col-span-1">
                {feature.index}
              </span>
              <h3 className="text-[length:var(--step-2)] font-medium tracking-[-0.03em] lg:col-span-4">
                {feature.title}
              </h3>
              <p className="max-w-[52ch] text-sm leading-relaxed text-muted lg:col-span-5">
                {feature.body}
              </p>
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted lg:col-span-2 lg:text-right">
                {feature.meta}
              </span>
            </div>
          ))}
          <div className="border-t border-line" />
        </div>
      </div>
    </section>
  );
}
