import { AppShellData } from '../index';

export function generateRobotsTxt(canonicalDomain: string): string {
  const domain = canonicalDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `# Robots.txt for ${domain}
User-agent: *
Allow: /
Allow: /builds
Allow: /kits
Allow: /paints
Allow: /showcase
Allow: /marketplace
Allow: /contests
Allow: /shops
Allow: /hall-of-fame
Allow: /privacy
Allow: /terms

# Disallow private user-state, authentication and API endpoints from crawling
Disallow: /api/
Disallow: /icons/
Disallow: /workbench
Disallow: /stash
Disallow: /admin
Disallow: /profile

Sitemap: https://${domain}/sitemap.xml
`;
}

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export function generateSitemapXml(canonicalDomain: string, data?: Partial<AppShellData>): string {
  const domain = canonicalDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const baseUrl = `https://${domain}`;
  const now = new Date().toISOString().split('T')[0];

  const staticUrls: SitemapUrlEntry[] = [
    { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${baseUrl}/showcase`, changefreq: 'daily', priority: '0.9' },
    { loc: `${baseUrl}/builds`, changefreq: 'daily', priority: '0.8' },
    { loc: `${baseUrl}/kits`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/paints`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/marketplace`, changefreq: 'daily', priority: '0.8' },
    { loc: `${baseUrl}/contests`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/hall-of-fame`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/shops`, changefreq: 'weekly', priority: '0.7' },
    { loc: `${baseUrl}/privacy`, changefreq: 'monthly', priority: '0.3' },
    { loc: `${baseUrl}/terms`, changefreq: 'monthly', priority: '0.3' }
  ];

  const buildUrls: SitemapUrlEntry[] = (data?.builds || []).map((b: any) => ({
    loc: `${baseUrl}/builds/${encodeURIComponent(b.slug || b.id)}`,
    lastmod: (b.updatedAt || b.createdAt || now).split('T')[0],
    changefreq: 'weekly',
    priority: '0.7'
  }));

  const contestUrls: SitemapUrlEntry[] = (data?.contests || []).flatMap((c: any) => [
    {
      loc: `${baseUrl}/contests/${encodeURIComponent(c.id)}`,
      lastmod: (c.updatedAt || c.createdAt || now).split('T')[0],
      changefreq: 'weekly',
      priority: '0.7'
    },
    {
      loc: `${baseUrl}/contests/${encodeURIComponent(c.id)}/podium`,
      lastmod: (c.updatedAt || c.createdAt || now).split('T')[0],
      changefreq: 'weekly',
      priority: '0.6'
    }
  ]);

  const allUrls = [...staticUrls, ...buildUrls, ...contestUrls];

  const xmlEntries = allUrls
    .map((u) => {
      let entry = `  <url>\n    <loc>${u.loc}</loc>\n`;
      if (u.lastmod) {
        entry += `    <lastmod>${u.lastmod}</lastmod>\n`;
      }
      entry += `    <changefreq>${u.changefreq}</changefreq>\n`;
      entry += `    <priority>${u.priority}</priority>\n  </url>`;
      return entry;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}
