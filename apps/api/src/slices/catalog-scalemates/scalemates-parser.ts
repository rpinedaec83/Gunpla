import { KitRecord, ScaleCategory } from '@gunpla/shared';

export interface ParsedScalematesResult {
  name: string;
  brand: string;
  scale: string;
  grade?: string;
  category: ScaleCategory;
  kitNumber?: string;
  releaseYear?: number;
  boxartUrl?: string;
  manualUrl?: string;
  scalematesUrl: string;
  source: 'scalemates' | 'scalemates-fallback';
  warnings: string[];
}

const KNOWN_BRANDS: Record<string, string> = {
  bandai: 'Bandai',
  'bandai-spirits': 'Bandai Spirits',
  tamiya: 'Tamiya',
  hasegawa: 'Hasegawa',
  kotobukiya: 'Kotobukiya',
  revell: 'Revell',
  italeri: 'Italeri',
  airfix: 'Airfix',
  dragon: 'Dragon',
  eduard: 'Eduard',
  trumpeter: 'Trumpeter',
  meng: 'MENG Model',
  aoshima: 'Aoshima',
  finemolds: 'FineMolds',
  wave: 'Wave',
  fujimi: 'Fujimi',
  academy: 'Academy',
  takom: 'Takom',
  hobbyboss: 'Hobby Boss',
  zvezda: 'Zvezda'
};

export function parseScalematesSlug(urlStr: string): Partial<ParsedScalematesResult> {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    throw new Error('Formato de URL inválido. Ingrese una URL válida de Scalemates (ej: https://www.scalemates.com/kits/...)');
  }

  if (!url.hostname.includes('scalemates.com')) {
    throw new Error('El dominio debe ser de scalemates.com');
  }

  const parts = url.pathname.split('/').filter(Boolean);
  const kitIndex = parts.indexOf('kits');
  const slug = kitIndex >= 0 && parts[kitIndex + 1] ? parts[kitIndex + 1] : parts[parts.length - 1] || '';

  // E.g. bandai-5061919-rg-1-144-hi-nu-gundam--1359732
  const [corePart] = slug.split('--');
  const tokens = corePart.split('-');

  let detectedBrand = 'Unknown Brand';
  let remainingTokens = [...tokens];

  // Try matching known brand (longest key first)
  const sortedBrands = Object.entries(KNOWN_BRANDS).sort((a, b) => b[0].length - a[0].length);
  for (const [key, label] of sortedBrands) {
    const keyParts = key.split('-');
    if (tokens.slice(0, keyParts.length).join('-').toLowerCase() === key) {
      detectedBrand = label;
      remainingTokens = tokens.slice(keyParts.length);
      break;
    }
  }

  // Detect grade
  let detectedGrade: string | undefined;
  const lower = corePart.toLowerCase();
  if (lower.includes('rg-') || lower.includes('-rg')) detectedGrade = 'RG (Real Grade)';
  else if (lower.includes('mg-') || lower.includes('-mg')) detectedGrade = 'MG (Master Grade)';
  else if (lower.includes('pg-') || lower.includes('-pg')) detectedGrade = 'PG (Perfect Grade)';
  else if (lower.includes('hg-') || lower.includes('hguc-') || lower.includes('-hg')) detectedGrade = 'HG (High Grade)';
  else if (lower.includes('eg-') || lower.includes('-eg')) detectedGrade = 'EG (Entry Grade)';
  else if (lower.includes('sd-') || lower.includes('-sd')) detectedGrade = 'SD (Super Deformed)';
  else if (lower.includes('ver-ka')) detectedGrade = 'MG Ver.Ka';

  // Detect category
  let detectedCategory: ScaleCategory = 'gunpla-mecha';
  if (detectedBrand === 'Bandai' || detectedBrand === 'Bandai Spirits' || lower.includes('gundam') || lower.includes('zaku') || lower.includes('mecha') || lower.includes('gunpla')) {
    detectedCategory = 'gunpla-mecha';
  } else if (lower.includes('tank') || lower.includes('sherman') || lower.includes('tiger') || lower.includes('panzer') || lower.includes('army') || lower.includes('military')) {
    detectedCategory = 'military';
  } else if (lower.includes('f-14') || lower.includes('f-15') || lower.includes('f-16') || lower.includes('spitfire') || lower.includes('messerschmitt') || lower.includes('aircraft')) {
    detectedCategory = 'aviation';
  } else if (lower.includes('car') || lower.includes('porsche') || lower.includes('ferrari') || lower.includes('nissan') || lower.includes('skyline')) {
    detectedCategory = 'automotive';
  } else if (lower.includes('ship') || lower.includes('yamato') || lower.includes('destroyer') || lower.includes('carrier') || lower.includes('submarine')) {
    detectedCategory = 'naval';
  }

  // Detect scale
  let detectedScale = '1/144';
  const scaleRegex = /(1)-(\d+)/;
  const scaleMatch = corePart.match(scaleRegex);
  if (scaleMatch) {
    detectedScale = `${scaleMatch[1]}/${scaleMatch[2]}`;
  } else if (detectedCategory === 'military') {
    detectedScale = '1/35';
  } else if (detectedCategory === 'aviation') {
    detectedScale = '1/48';
  } else if (detectedCategory === 'automotive') {
    detectedScale = '1/24';
  } else if (detectedCategory === 'naval') {
    detectedScale = '1/700';
  }

  // Clean name from tokens
  const nameParts = remainingTokens.filter(t => !/^\d{4,8}$/.test(t) && !/^1$/.test(t) && !/^(144|100|72|48|35|60|32|700|350)$/.test(t) && !['rg', 'hg', 'mg', 'pg', 'eg', 'sd'].includes(t.toLowerCase()));
  const formattedName = nameParts.length > 0
    ? nameParts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    : 'Scale Model Kit';

  const kitNumMatch = corePart.match(/(\d{4,8})/);
  const detectedKitNum = kitNumMatch ? kitNumMatch[1] : undefined;

  return {
    name: formattedName,
    brand: detectedBrand,
    scale: detectedScale,
    grade: detectedGrade,
    category: detectedCategory,
    kitNumber: detectedKitNum,
    scalematesUrl: url.toString()
  };
}

export async function fetchAndParseScalematesKit(
  urlStr: string,
  categoryOverride?: ScaleCategory
): Promise<ParsedScalematesResult> {
  const fallback = parseScalematesSlug(urlStr);
  const warnings: string[] = [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s strict ceiling

  try {
    const res = await fetch(urlStr, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      warnings.push(`Scalemates HTTP ${res.status}: Datos extraídos automáticamente desde la estructura de la URL.`);
      return {
        name: fallback.name || 'Kit Importado',
        brand: fallback.brand || 'Bandai',
        scale: fallback.scale || '1/144',
        grade: fallback.grade,
        category: categoryOverride || fallback.category || 'gunpla-mecha',
        kitNumber: fallback.kitNumber,
        scalematesUrl: urlStr,
        source: 'scalemates-fallback',
        warnings
      };
    }

    const html = await res.text();

    // Extract OpenGraph / Meta Title
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
    const titleTagMatch = html.match(/<title>(.*?)<\/title>/i);
    const rawTitle = ogTitleMatch ? ogTitleMatch[1] : (titleTagMatch ? titleTagMatch[1] : fallback.name);

    // E.g. "Hi-Nu Gundam, Bandai Spirits 5061919 (2021) - Scalemates"
    let cleanName = (rawTitle || fallback.name || 'Kit Importado').replace(/\s*-\s*Scalemates.*$/i, '').trim();

    // If Scalemates redirected away from the kit or returned a generic landing page
    if (res.redirected && !res.url.includes(fallback.kitNumber || 'kits')) {
      cleanName = fallback.name || 'Kit Importado';
    }

    // Sanity check: if cleanName doesn't share any word with fallback name and fallback has multiple words, trust fallback name
    const fallbackWords = (fallback.name || '').toLowerCase().split(' ').filter(w => w.length > 2);
    const hasSharedWord = fallbackWords.some(w => cleanName.toLowerCase().includes(w));
    if (fallbackWords.length > 0 && !hasSharedWord) {
      cleanName = fallback.name || cleanName;
    }

    // Extract Year
    let releaseYear: number | undefined;
    const yearMatch = cleanName.match(/\((\d{4})\)/);
    if (yearMatch) {
      releaseYear = parseInt(yearMatch[1], 10);
      cleanName = cleanName.replace(/\(\d{4}\)/, '').trim();
    }

    // Extract Boxart image
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
    const boxartUrl = ogImageMatch && !ogImageMatch[1].includes('placeholder') ? ogImageMatch[1] : undefined;

    return {
      name: cleanName || fallback.name || 'Kit Importado',
      brand: fallback.brand || 'Bandai',
      scale: fallback.scale || '1/144',
      grade: fallback.grade,
      category: categoryOverride || fallback.category || 'gunpla-mecha',
      kitNumber: fallback.kitNumber,
      releaseYear,
      boxartUrl,
      scalematesUrl: urlStr,
      source: 'scalemates',
      warnings
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    warnings.push(isTimeout
      ? 'Tiempo de espera de Scalemates agotado (>4s): Fallback transparente aplicado sin bloquear al usuario.'
      : `Conexión con Scalemates no disponible (${err instanceof Error ? err.message : 'Error de red'}): Fallback transparente aplicado.`);

    return {
      name: fallback.name || 'Kit Importado',
      brand: fallback.brand || 'Bandai',
      scale: fallback.scale || '1/144',
      grade: fallback.grade,
      category: categoryOverride || fallback.category || 'gunpla-mecha',
      kitNumber: fallback.kitNumber,
      scalematesUrl: urlStr,
      source: 'scalemates-fallback',
      warnings
    };
  }
}
