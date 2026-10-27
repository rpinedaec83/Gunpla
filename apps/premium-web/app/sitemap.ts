import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { gunplajunkies, plamoscale } from '@/lib/tenants';

const routes = [
  { path: '', priority: 1, changeFrequency: 'weekly' as const },
  { path: '/showcase', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/builds', priority: 0.8, changeFrequency: 'daily' as const },
  { path: '/kits', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/contests', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/hall-of-fame', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/shops', priority: 0.6, changeFrequency: 'weekly' as const },
  { path: '/marketplace', priority: 0.6, changeFrequency: 'daily' as const }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get('host') ?? '';
  const tenant = host.includes('gunplajunkies') ? gunplajunkies : plamoscale;
  const base = `https://${tenant.domain}`;
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${base}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
