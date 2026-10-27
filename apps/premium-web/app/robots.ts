import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { gunplajunkies, plamoscale } from '@/lib/tenants';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host') ?? '';
  const tenant = host.includes('gunplajunkies') ? gunplajunkies : plamoscale;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/workbench', '/stash', '/admin', '/profile']
      }
    ],
    sitemap: `https://${tenant.domain}/sitemap.xml`,
    host: `https://${tenant.domain}`
  };
}
