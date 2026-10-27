import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { TenantLanding } from '@/components/tenant-landing';
import { gunplajunkies, plamoscale, type Tenant } from '@/lib/tenants';

type PageProps = {
  searchParams: Promise<{ tenant?: string }>;
};

function resolveTenant(host: string, preview?: string): Tenant {
  if (preview === 'gunplajunkies') {
    return gunplajunkies;
  }
  if (preview === 'plamoscale') {
    return plamoscale;
  }
  return host.includes('gunplajunkies') ? gunplajunkies : plamoscale;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const host = (await headers()).get('host') ?? '';
  const { tenant: preview } = await searchParams;
  const tenant = resolveTenant(host, preview);
  const title = `${tenant.name} - ${tenant.headline.join(' ')}`;
  const ogImage = `https://${tenant.domain}/og/${tenant.vitrine.image}.jpg`;

  return {
    title,
    description: tenant.intro,
    alternates: { canonical: `https://${tenant.domain}` },
    icons: {
      icon: tenant.slug === 'gunplajunkies' ? '/icon-gunpla.svg' : '/icon.svg'
    },
    openGraph: {
      title,
      description: tenant.intro,
      url: `https://${tenant.domain}`,
      siteName: tenant.name,
      locale: 'es_PE',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: tenant.vitrine.alt }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: tenant.intro,
      images: [ogImage]
    }
  };
}

export default async function Page({ searchParams }: PageProps) {
  const host = (await headers()).get('host') ?? '';
  const { tenant: preview } = await searchParams;
  const tenant = resolveTenant(host, preview);

  return <TenantLanding tenant={tenant} />;
}
