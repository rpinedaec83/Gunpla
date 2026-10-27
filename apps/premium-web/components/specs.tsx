import type { Tenant } from '@/lib/tenants';

export function Specs({ tenant }: { tenant: Tenant }) {
  return (
    <section id="especificaciones" className="bg-base">
      <div className="container-editorial py-20 sm:py-28">
        <div className="flex items-center justify-between gap-6 border-b border-line pb-6">
          <span className="eyebrow">Especificaciones</span>
          <span className="text-[11px] tracking-[0.16em] text-muted">Sistema / v1</span>
        </div>

        <div className="grid grid-cols-2 divide-x divide-line lg:grid-cols-4">
          {tenant.specs.map((spec) => (
            <div key={spec.label} className="border-b border-line py-10 pr-5 lg:border-b-0 lg:pl-8">
              <div className="spec-value">{spec.value}</div>
              <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted">
                {spec.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
