import type { CSSProperties } from 'react';
import type { Tenant } from '@/lib/tenants';
import { AssemblySequence } from './assembly-sequence';
import { ClosingCta } from './closing-cta';
import { EditorialFeatures } from './editorial-features';
import { Hero } from './hero';
import { Immersive } from './immersive';
import { Manifesto } from './manifesto';
import { RunnerSection } from './runner-section';
import { SiteFooter } from './site-footer';
import { SiteNav } from './site-nav';
import { Specs } from './specs';
import { Vitrine } from './vitrine';

export function TenantLanding({ tenant }: { tenant: Tenant }) {
  return (
    <div style={{ '--color-accent': tenant.accent } as CSSProperties}>
      <SiteNav tenant={tenant} />
      <main id="contenido">
        <Hero tenant={tenant} />
        <Manifesto tenant={tenant} />
        <RunnerSection tenant={tenant} />
        <AssemblySequence tenant={tenant} />
        <Vitrine tenant={tenant} />
        <EditorialFeatures tenant={tenant} />
        <Immersive tenant={tenant} />
        <Specs tenant={tenant} />
        <ClosingCta tenant={tenant} />
      </main>
      <SiteFooter tenant={tenant} />
    </div>
  );
}
