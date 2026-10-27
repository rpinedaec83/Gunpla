import Image from 'next/image';
import plamoscaleImage from '@/public/vitrina/plamoscale.webp';
import gunplajunkiesImage from '@/public/vitrina/gunplajunkies.webp';
import type { Tenant } from '@/lib/tenants';
import { Reveal } from './reveal';
import { SectionLabel } from './section-label';

const images = {
  plamoscale: plamoscaleImage,
  gunplajunkies: gunplajunkiesImage
};

export function Vitrine({ tenant }: { tenant: Tenant }) {
  const image = images[tenant.vitrine.image];

  return (
    <section id="vitrina" className="bg-base">
      <div className="container-editorial py-24 sm:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionLabel index="04 / 05">Vitrina</SectionLabel>
            <h2 className="display-tight mt-6 max-w-[13ch] text-[length:var(--step-3)]">
              {tenant.vitrine.title}
            </h2>
            <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-bone/70">
              {tenant.vitrine.body}
            </p>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
              <span className="text-[12px] text-muted">{tenant.vitrine.credit}</span>
              <a href={tenant.vitrine.href} className="link-quiet text-[13px]" rel="noopener">
                Ver galeria <span aria-hidden="true">+</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Reveal y={18}>
              <div className="relative overflow-hidden rounded-panel border border-line bg-surface">
                <Image
                  src={image}
                  alt={tenant.vitrine.alt}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  placeholder="blur"
                  quality={82}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
