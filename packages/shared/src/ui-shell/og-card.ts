export interface SocialCardOptions {
  tenantName: string;
  tenantSlug: 'plamoscale' | 'gunplajunkies';
  primaryColor?: string;
  accentColor?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  metadataPills?: string[];
  stats?: Array<{ label: string; value: string }>;
  podium?: Array<{ rankTitle: string; medal: string; entryTitle: string; builderName: string; score?: string }>;
  canonicalDomain?: string;
}

function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSocialCardSvg(options: SocialCardOptions): string {
  const isGunpla = options.tenantSlug === 'gunplajunkies';
  const primaryColor = options.primaryColor || (isGunpla ? '#ef4444' : '#2563eb');
  const accentColor = options.accentColor || (isGunpla ? '#f97316' : '#38bdf8');
  const bgDark = '#0b0f19';
  const cardBg = '#111827';
  const domain = options.canonicalDomain || (isGunpla ? 'gunplajunkies.com' : 'plamoscale.com');
  const badgeText = options.badge || (isGunpla ? 'GUNPLA JUNKIES PERU' : 'PLAMOSCALE LATAM');

  // Truncate title into 1 or 2 lines for clean SVG rendering
  const maxTitleChars = 40;
  let titleLine1 = options.title || '';
  let titleLine2 = '';

  if (titleLine1.length > maxTitleChars) {
    const lastSpace = titleLine1.slice(0, maxTitleChars).lastIndexOf(' ');
    if (lastSpace > 20) {
      titleLine2 = titleLine1.slice(lastSpace + 1).trim();
      titleLine1 = titleLine1.slice(0, lastSpace).trim();
    } else {
      titleLine2 = titleLine1.slice(maxTitleChars).trim();
      titleLine1 = titleLine1.slice(0, maxTitleChars).trim();
    }
    if (titleLine2.length > maxTitleChars) {
      titleLine2 = titleLine2.slice(0, maxTitleChars - 3) + '...';
    }
  }

  // Render metadata pills
  const pills = options.metadataPills || [];
  let pillX = 64;
  const pillsSvg = pills.slice(0, 4).map((p) => {
    const textWidth = Math.max(70, p.length * 11 + 28);
    const svg = `
      <rect x="${pillX}" y="${titleLine2 ? 370 : 315}" width="${textWidth}" height="38" rx="19" fill="#1e293b" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
      <text x="${pillX + textWidth / 2}" y="${titleLine2 ? 395 : 340}" fill="#cbd5e1" font-size="16" font-weight="600" text-anchor="middle" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${escapeXml(p)}</text>
    `;
    pillX += textWidth + 14;
    return svg;
  }).join('');

  // Render stats (e.g. Pasos, Likes, etc.)
  const stats = options.stats || [];
  let statX = 64;
  const statsSvg = stats.slice(0, 3).map((st) => {
    const svg = `
      <g transform="translate(${statX}, ${titleLine2 ? 435 : 380})">
        <text x="0" y="24" fill="${accentColor}" font-size="28" font-weight="700" font-family="'Inter', sans-serif">${escapeXml(st.value)}</text>
        <text x="0" y="44" fill="#94a3b8" font-size="14" font-weight="500" font-family="'Inter', sans-serif">${escapeXml(st.label)}</text>
      </g>
    `;
    statX += 130;
    return svg;
  }).join('');

  // Render author block if present
  let authorSvg = '';
  if (options.authorDisplayName || options.authorUsername) {
    const authorName = options.authorDisplayName || options.authorUsername || '';
    const authorHandle = options.authorUsername ? `@${options.authorUsername}` : '';
    authorSvg = `
      <g transform="translate(64, ${titleLine2 ? 295 : 240})">
        <circle cx="20" cy="20" r="20" fill="${primaryColor}" opacity="0.3"/>
        <text x="20" y="26" fill="${accentColor}" font-size="18" font-weight="bold" text-anchor="middle" font-family="'Inter', sans-serif">👤</text>
        <text x="52" y="18" fill="#ffffff" font-size="20" font-weight="600" font-family="'Inter', sans-serif">${escapeXml(authorName)}</text>
        <text x="52" y="36" fill="#94a3b8" font-size="14" font-family="'Inter', sans-serif">${escapeXml(authorHandle)}</text>
      </g>
    `;
  }

  // Render podium block for contest results if present
  let podiumSvg = '';
  if (Array.isArray(options.podium) && options.podium.length > 0) {
    let podX = 64;
    const cards = options.podium.slice(0, 3).map((pod) => {
      const cardW = 340;
      const c = `
        <g transform="translate(${podX}, 245)">
          <rect width="${cardW}" height="240" rx="12" fill="#1e293b" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
          <rect width="${cardW}" height="6" rx="3" fill="${pod.medal.includes('1er') || pod.medal.includes('Oro') ? '#eab308' : (pod.medal.includes('2do') || pod.medal.includes('Plata') ? '#94a3b8' : '#ca8a04')}"/>
          <text x="24" y="44" fill="#f8fafc" font-size="20" font-weight="700" font-family="'Inter', sans-serif">${escapeXml(pod.medal)} ${escapeXml(pod.rankTitle)}</text>
          <text x="24" y="90" fill="#ffffff" font-size="18" font-weight="600" font-family="'Inter', sans-serif">${escapeXml(pod.entryTitle.slice(0, 26))}${pod.entryTitle.length > 26 ? '...' : ''}</text>
          <text x="24" y="125" fill="#94a3b8" font-size="15" font-family="'Inter', sans-serif">Por: <tspan fill="#f1f5f9" font-weight="600">${escapeXml(pod.builderName)}</tspan></text>
          ${pod.score ? `<text x="24" y="165" fill="${accentColor}" font-size="14" font-weight="600" font-family="'Inter', sans-serif">Puntaje: ${escapeXml(pod.score)}</text>` : ''}
          <rect x="24" y="185" width="90" height="26" rx="6" fill="rgba(34,197,94,0.15)"/>
          <text x="69" y="202" fill="#4ade80" font-size="12" font-weight="700" text-anchor="middle" font-family="'Inter', sans-serif">CERTIFICADO</text>
        </g>
      `;
      podX += cardW + 24;
      return c;
    });
    podiumSvg = cards.join('');
  }

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="${accentColor}"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19"/>
      <stop offset="100%" stop-color="#070a12"/>
    </linearGradient>
    <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(37,99,235,0.08)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </linearGradient>
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#gridPattern)"/>

  <!-- Top Accent Bar -->
  <rect x="0" y="0" width="1200" height="8" fill="url(#primaryGrad)"/>

  <!-- Brand Header -->
  <g transform="translate(64, 56)">
    <!-- Brand Icon -->
    <rect x="0" y="0" width="48" height="48" rx="10" fill="${primaryColor}"/>
    <text x="24" y="32" fill="#ffffff" font-size="24" font-weight="bold" text-anchor="middle" font-family="'Inter', sans-serif">P</text>
    
    <!-- Tenant Name & Tagline -->
    <text x="64" y="24" fill="#ffffff" font-size="24" font-weight="800" letter-spacing="1" font-family="'Inter', sans-serif">${escapeXml(options.tenantName.toUpperCase())}</text>
    <text x="64" y="44" fill="#94a3b8" font-size="14" font-family="'Inter', sans-serif">${escapeXml(badgeText)}</text>
    
    <!-- Top-Right Pill -->
    <rect x="880" y="6" width="190" height="34" rx="17" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <text x="975" y="28" fill="${accentColor}" font-size="13" font-weight="700" letter-spacing="0.5" text-anchor="middle" font-family="'Inter', sans-serif">MODELISMO A ESCALA</text>
  </g>

  <!-- Divider Line -->
  <line x1="64" y1="126" x2="1136" y2="126" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  ${!podiumSvg ? `
    <!-- Main Content: Title -->
    <text x="64" y="185" fill="#ffffff" font-size="44" font-weight="800" font-family="'Inter', -apple-system, sans-serif" letter-spacing="-0.5">${escapeXml(titleLine1)}</text>
    ${titleLine2 ? `<text x="64" y="240" fill="#ffffff" font-size="44" font-weight="800" font-family="'Inter', -apple-system, sans-serif" letter-spacing="-0.5">${escapeXml(titleLine2)}</text>` : ''}

    ${authorSvg}
    ${pillsSvg}
    ${statsSvg}
  ` : `
    <!-- Contest Podium Mode -->
    <text x="64" y="175" fill="#ffffff" font-size="36" font-weight="800" font-family="'Inter', sans-serif">${escapeXml(titleLine1)}</text>
    ${options.subtitle ? `<text x="64" y="210" fill="#94a3b8" font-size="18" font-family="'Inter', sans-serif">${escapeXml(options.subtitle)}</text>` : ''}
    ${podiumSvg}
  `}

  <!-- Footer -->
  <g transform="translate(64, 570)">
    <line x1="0" y1="-20" x2="1072" y2="-20" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <text x="0" y="14" fill="${accentColor}" font-size="16" font-weight="700" font-family="'Inter', sans-serif">${escapeXml(domain)}</text>
    <text x="220" y="14" fill="#64748b" font-size="14" font-family="'Inter', sans-serif">· Bitacoras de Armado · Catalogo de Pinturas · Concursos &amp; Podio</text>
    <text x="1072" y="14" fill="#64748b" font-size="13" text-anchor="end" font-family="'Inter', sans-serif">Comunidad Oficial</text>
  </g>
</svg>`;
}
