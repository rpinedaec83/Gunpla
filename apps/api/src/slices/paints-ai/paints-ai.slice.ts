import { Router, Request, Response } from 'express';
import {
  PaintConversionRequest,
  PaintConversionResult,
  PaintConversionMatch,
  PaintRecipeAiRequest,
  PaintRecipeAiResponse,
  PaintRecipeAiComponent,
  PaintMedium
} from '@gunpla/shared';
import { getDb } from '../../core/db';
import { sendProblem } from '../../core/problem-details';
import jwt from 'jsonwebtoken';

export const paintsAiRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'gunpla-plamoscale-dev-secret-key-2026';

// ---------------------------------------------------------------------------
// Expert Deterministic Paint Conversion Table (4-Way Chemical Division)
// 1. Laca (Mr. Color)
// 2. Acrílico (Tamiya X/XF)
// 3. Poliuretano (Vallejo Mecha/Model Color)
// 4. Montana Colors (MTN 94, MTN Water Based, MTN PRO)
// ---------------------------------------------------------------------------
interface ConversionEntry {
  mrColor: { code: string; name: string; hex: string; finish: string };
  tamiya: { code: string; name: string; hex: string; finish: string; line: string };
  vallejo: { code: string; name: string; hex: string; finish: string; line: string };
  montanaColors: { code: string; name: string; hex: string; finish: string; line: string; recommendedCap: string };
}

const CONVERSION_DATABASE: ConversionEntry[] = [
  {
    mrColor: { code: 'C1', name: 'White', hex: '#FFFFFF', finish: 'gloss' },
    tamiya: { code: 'X-2', name: 'White', hex: '#FFFFFF', finish: 'gloss', line: 'Acrylic X' },
    vallejo: { code: '70.951', name: 'White', hex: '#FFFFFF', finish: 'flat/matte', line: 'Model Color' },
    montanaColors: { code: 'RV-01', name: 'Blanco Blanco / Pure White', hex: '#FFFFFF', finish: 'flat/matte', line: 'MTN 94 (Baja Presión)', recommendedCap: 'Pocket Cap / Skinny Universal Cap' }
  },
  {
    mrColor: { code: 'C2', name: 'Black', hex: '#101010', finish: 'gloss' },
    tamiya: { code: 'X-1', name: 'Black', hex: '#0D0D0D', finish: 'gloss', line: 'Acrylic X' },
    vallejo: { code: '70.950', name: 'Black', hex: '#111111', finish: 'flat/matte', line: 'Model Color' },
    montanaColors: { code: 'RV-242', name: 'Negro / Matt Black', hex: '#121212', finish: 'flat/matte', line: 'MTN 94 (Baja Presión)', recommendedCap: 'Pocket Cap' }
  },
  {
    mrColor: { code: 'C33', name: 'Flat Black', hex: '#1C1C1C', finish: 'flat/matte' },
    tamiya: { code: 'XF-1', name: 'Flat Black', hex: '#1A1A1A', finish: 'flat/matte', line: 'Acrylic XF' },
    vallejo: { code: '70.950', name: 'Black', hex: '#111111', finish: 'flat/matte', line: 'Model Color' },
    montanaColors: { code: 'WB-9011', name: 'Carbon Black (Water Based)', hex: '#1A1A1A', finish: 'flat/matte', line: 'MTN Water Based (Cero Olor)', recommendedCap: 'Skinny Cream Cap' }
  },
  {
    mrColor: { code: 'C62', name: 'Flat White', hex: '#F5F5F5', finish: 'flat/matte' },
    tamiya: { code: 'XF-2', name: 'Flat White', hex: '#FAFAFA', finish: 'flat/matte', line: 'Acrylic XF' },
    vallejo: { code: '70.951', name: 'White', hex: '#FFFFFF', finish: 'flat/matte', line: 'Model Color' },
    montanaColors: { code: 'RV-01', name: 'Blanco Blanco / Pure White', hex: '#FFFFFF', finish: 'flat/matte', line: 'MTN 94 (Baja Presión)', recommendedCap: 'Pocket Cap' }
  },
  {
    mrColor: { code: 'C8', name: 'Silver', hex: '#C0C0C0', finish: 'metallic' },
    tamiya: { code: 'XF-16', name: 'Flat Aluminum', hex: '#D1D5DB', finish: 'metallic', line: 'Acrylic XF' },
    vallejo: { code: '77.724', name: 'Silver', hex: '#C4C4C4', finish: 'metallic', line: 'Metal Color' },
    montanaColors: { code: 'PRO-Silver', name: 'Aluminio / Cromo Spray', hex: '#C0C0C0', finish: 'metallic', line: 'MTN PRO Pintura Metálica', recommendedCap: 'Pocket Cap' }
  },
  {
    mrColor: { code: 'C108', name: 'Character Red', hex: '#B71C1C', finish: 'semi-gloss' },
    tamiya: { code: 'X-7', name: 'Red', hex: '#DC2626', finish: 'gloss', line: 'Acrylic X' },
    vallejo: { code: '69.008', name: 'Mecha Red', hex: '#DC2626', finish: 'satin', line: 'Mecha Color' },
    montanaColors: { code: 'RV-3012', name: 'Rojo Madrid / Vivid Red', hex: '#C8102E', finish: 'flat/matte', line: 'MTN 94 (Baja Presión)', recommendedCap: 'Skinny Universal Cap' }
  },
  {
    mrColor: { code: 'C110', name: 'Character Blue', hex: '#1565C0', finish: 'semi-gloss' },
    tamiya: { code: 'X-4', name: 'Blue', hex: '#1D4ED8', finish: 'gloss', line: 'Acrylic X' },
    vallejo: { code: '69.011', name: 'Mecha Dark Blue', hex: '#1E3A8A', finish: 'satin', line: 'Mecha Color' },
    montanaColors: { code: 'RV-5005', name: 'Azul Profundo / Deep Blue', hex: '#002F6C', finish: 'flat/matte', line: 'MTN 94 (Baja Presión)', recommendedCap: 'Skinny Universal Cap' }
  },
  {
    mrColor: { code: 'C113', name: 'RLM04 Yellow', hex: '#FBC02D', finish: 'flat/matte' },
    tamiya: { code: 'XF-3', name: 'Flat Yellow', hex: '#F59E0B', finish: 'flat/matte', line: 'Acrylic XF' },
    vallejo: { code: '70.953', name: 'Flat Yellow', hex: '#EAB308', finish: 'flat/matte', line: 'Model Color' },
    montanaColors: { code: 'RV-1021', name: 'Amarillo Canario / Yellow', hex: '#FFD100', finish: 'flat/matte', line: 'MTN 94 (Baja Presión)', recommendedCap: 'Pocket Cap' }
  },
  {
    mrColor: { code: 'C28', name: 'Steel', hex: '#4B5563', finish: 'metallic' },
    tamiya: { code: 'XF-56', name: 'Metallic Grey', hex: '#4B5563', finish: 'metallic', line: 'Acrylic XF' },
    vallejo: { code: '77.712', name: 'Steel', hex: '#475569', finish: 'metallic', line: 'Metal Color' },
    montanaColors: { code: 'RV-242', name: 'Matt Black Base + Mist Silver', hex: '#374151', finish: 'metallic', line: 'MTN 94 & PRO', recommendedCap: 'Pocket Cap' }
  },
  {
    mrColor: { code: 'C71', name: 'Midnight Blue', hex: '#0F172A', finish: 'semi-gloss' },
    tamiya: { code: 'XF-17', name: 'Sea Blue', hex: '#172554', finish: 'flat/matte', line: 'Acrylic XF' },
    vallejo: { code: '70.898', name: 'Dark Sea Blue', hex: '#1E293B', finish: 'flat/matte', line: 'Model Color' },
    montanaColors: { code: 'RV-5005', name: 'Azul Profundo / Shadow Blue', hex: '#0F172A', finish: 'flat/matte', line: 'MTN 94 (Baja Presión)', recommendedCap: 'Pocket Cap' }
  },
  {
    mrColor: { code: 'C12', name: 'Olive Drab (1)', hex: '#365314', finish: 'flat/matte' },
    tamiya: { code: 'XF-62', name: 'Olive Drab', hex: '#3F4E24', finish: 'flat/matte', line: 'Acrylic XF' },
    vallejo: { code: '70.887', name: 'US Olive Drab', hex: '#3B4D28', finish: 'flat/matte', line: 'Model Color' },
    montanaColors: { code: 'RV-6018', name: 'Verde Valle / Field Green', hex: '#48A23F', finish: 'flat/matte', line: 'MTN 94 (Baja Presión)', recommendedCap: 'Skinny Universal Cap' }
  },
  {
    mrColor: { code: 'C40', name: 'German Gray', hex: '#334155', finish: 'flat/matte' },
    tamiya: { code: 'XF-63', name: 'German Grey', hex: '#374151', finish: 'flat/matte', line: 'Acrylic XF' },
    vallejo: { code: '70.995', name: 'German Grey', hex: '#2F3947', finish: 'flat/matte', line: 'Model Color' },
    montanaColors: { code: 'RV-7016', name: 'Gris Antracita / Industrial Grey', hex: '#374151', finish: 'flat/matte', line: 'MTN 94 (Baja Presión)', recommendedCap: 'Pocket Cap' }
  }
];

function getMediumGuide(brand: string, type: string, medium?: PaintMedium) {
  const norm = (brand + ' ' + type + ' ' + (medium || '')).toLowerCase();
  if (norm.includes('montana') || norm.includes('spray') || norm.includes('graffiti') || medium === 'montana_colors') {
    return {
      medium: 'montana_colors',
      mediumTitle: 'Montana Colors (Aerosoles de Graffiti & Water Based - https://www.montanacolors.com)',
      recommendedThinner: 'Aerosol listo para usar. Para desatascar boquillas usar MTN Solvent / Acetona.',
      thinningRatio: 'Directo del bote. Agitar vigorosamente durante 2 minutos hasta oír la bolilla mezcladora.',
      recommendedPSI: 'Presión calibrada de fábrica: MTN 94 (Baja Presión para control Gunpla). Boquilla recomendada: Pocket Cap o Skinny Universal Cap.',
      dryingTime: '10-15 minutos al tacto; curado completo en 24 horas.',
      proTips: 'Pintura en spray sobre plástico: Aplica pasadas rápidas ("sweep passes") a 20-25 cm de distancia. NUNCA detengas el spray sobre un punto fijo para evitar ablandar el poliestireno (PS). Si usas MTN Water Based, es 100% inodoro, seguro para interiores y no ataca plásticos delicados.'
    };
  } else if (norm.includes('polyurethane') || norm.includes('vallejo') || medium === 'polyurethane') {
    return {
      medium: 'polyurethane',
      mediumTitle: 'Poliuretano Acrílico (Vallejo Mecha / Model Color)',
      recommendedThinner: 'Vallejo Airbrush Thinner (71.161) + 1 gota de Flow Improver por cada 10 gotas.',
      thinningRatio: '70% pintura : 30% thinner (consistencia cremosa ligera)',
      recommendedPSI: '18 - 22 PSI (1.2 - 1.5 bar) con boquilla 0.3mm - 0.4mm.',
      dryingTime: '20 minutos al tacto; curado total de la resina de poliuretano en 48 horas.',
      proTips: 'La resina de poliuretano ofrece máxima resistencia al roce en articulaciones mecánicas Gunpla. NUNCA uses thinner con solventes o alcoholes fuertes (como Thinner laca o IPA), ya que coagulan instantáneamente la resina en el aerógrafo.'
    };
  } else if (norm.includes('lacquer') || norm.includes('mr. color') || norm.includes('gaia') || medium === 'lacquer') {
    return {
      medium: 'lacquer',
      mediumTitle: 'Laca (Mr. Color / Gaia Notes)',
      recommendedThinner: 'Mr. Color Leveling Thinner (con retardante) o Mr. Rapid Thinner',
      thinningRatio: '1:1.5 a 1:2 (Pintura : Thinner) con textura de leche líquida',
      recommendedPSI: '12 - 16 PSI (0.8 - 1.1 bar) con boquilla 0.2mm - 0.3mm',
      dryingTime: '15 minutos al tacto; curado completo en 12 horas',
      proTips: 'La laca tiene el grano de pigmento más fino del modelismo y adherencia insuperable. Usa siempre cabina de extracción o respirador para vapores orgánicos. El Leveling Thinner ralentiza el secado para crear superficies de espejo sin rugosidad.'
    };
  } else {
    return {
      medium: 'acrylic',
      mediumTitle: 'Acrílico (Tamiya X / XF)',
      recommendedThinner: 'Tamiya X-20A Thinner o Alcohol Isopropílico (IPA 90%+)',
      thinningRatio: '1:1 (Pintura : Thinner)',
      recommendedPSI: '15 - 20 PSI (1.0 - 1.4 bar)',
      dryingTime: '30 minutos al tacto; curado en 24 horas',
      proTips: 'Fácil de usar y de bajo olor. Para un acabado ultra liso libre de piel de naranja, puedes diluir el acrílico Tamiya con Mr. Color Leveling Thinner (técnica de solvente para acrílicos de base alcohólica).'
    };
  }
}

function tryExtractUserId(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; id?: string };
    return decoded.sub || decoded.id || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. POST /api/v1/paints/ai/convert
// ---------------------------------------------------------------------------
paintsAiRouter.post('/convert', (req: Request, res: Response) => {
  const { sourceBrand, sourceCode, targetMedium } = req.body as PaintConversionRequest;

  if (!sourceCode || typeof sourceCode !== 'string') {
    return sendProblem(
      req,
      res,
      400,
      'Código de Pintura Requerido',
      'Debes proporcionar un código de pintura (ej. "XF-1", "C108", "70.950" o "RV-242").',
      'validation-error'
    );
  }

  const cleanCode = sourceCode.trim().toUpperCase().replace(/\s+/g, '');
  const cleanBrand = (sourceBrand || '').trim().toLowerCase();

  // Find in conversion database
  const entry = CONVERSION_DATABASE.find(e => {
    const mcMatch = e.mrColor.code.toUpperCase().replace(/\s+/g, '') === cleanCode;
    const tamMatch = e.tamiya.code.toUpperCase().replace(/\s+/g, '') === cleanCode;
    const valMatch = e.vallejo.code.toUpperCase().replace(/\s+/g, '') === cleanCode;
    const mtnMatch = e.montanaColors.code.toUpperCase().replace(/\s+/g, '') === cleanCode;
    return mcMatch || tamMatch || valMatch || mtnMatch;
  });

  const db = getDb();
  const userId = tryExtractUserId(req);
  const userRack = userId ? db.paintRackItems.filter(p => p.userId === userId) : [];

  function checkRack(brand: string, code: string): { ownedInRack: boolean; rackQuantity?: number } {
    const matchingPaint = db.paints.find(p => 
      p.code.toUpperCase().replace(/\s+/g, '') === code.toUpperCase().replace(/\s+/g, '') &&
      p.brand.toLowerCase().includes(brand.toLowerCase().split(' ')[0])
    );
    if (!matchingPaint) return { ownedInRack: false };
    const rackItem = userRack.find(r => r.paintId === matchingPaint.id);
    if (!rackItem) return { ownedInRack: false };
    return { ownedInRack: true, rackQuantity: rackItem.quantity };
  }

  if (entry) {
    let matches: PaintConversionMatch[] = [
      {
        brand: 'Mr. Hobby',
        line: 'Mr. Color',
        code: entry.mrColor.code,
        name: entry.mrColor.name,
        type: 'lacquer',
        finish: entry.mrColor.finish,
        hexColor: entry.mrColor.hex,
        similarity: 'exact',
        ...checkRack('Mr. Hobby', entry.mrColor.code)
      },
      {
        brand: 'Tamiya',
        line: entry.tamiya.line,
        code: entry.tamiya.code,
        name: entry.tamiya.name,
        type: 'acrylic',
        finish: entry.tamiya.finish,
        hexColor: entry.tamiya.hex,
        similarity: 'exact',
        ...checkRack('Tamiya', entry.tamiya.code)
      },
      {
        brand: 'Vallejo',
        line: entry.vallejo.line,
        code: entry.vallejo.code,
        name: entry.vallejo.name,
        type: 'polyurethane',
        finish: entry.vallejo.finish,
        hexColor: entry.vallejo.hex,
        similarity: 'exact',
        ...checkRack('Vallejo', entry.vallejo.code)
      },
      {
        brand: 'Montana Colors',
        line: entry.montanaColors.line,
        code: entry.montanaColors.code,
        name: entry.montanaColors.name,
        type: 'spray_graffiti',
        finish: entry.montanaColors.finish,
        hexColor: entry.montanaColors.hex,
        similarity: 'exact',
        ...checkRack('Montana Colors', entry.montanaColors.code)
      }
    ];

    // If targetMedium is specified, prioritize that match first
    if (targetMedium) {
      matches.sort((a, b) => {
        const aMatch = (targetMedium === 'montana_colors' && a.brand === 'Montana Colors') ||
                       (targetMedium === 'polyurethane' && a.type === 'polyurethane') ||
                       (targetMedium === 'lacquer' && a.type === 'lacquer') ||
                       (targetMedium === 'acrylic' && a.type === 'acrylic');
        const bMatch = (targetMedium === 'montana_colors' && b.brand === 'Montana Colors') ||
                       (targetMedium === 'polyurethane' && b.type === 'polyurethane') ||
                       (targetMedium === 'lacquer' && b.type === 'lacquer') ||
                       (targetMedium === 'acrylic' && b.type === 'acrylic');
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    let sourceType: string = 'lacquer';
    if (cleanBrand.includes('montana') || cleanCode.startsWith('RV-') || cleanCode.startsWith('WB-') || cleanCode.startsWith('PRO-')) {
      sourceType = 'spray_graffiti';
    } else if (cleanBrand.includes('vallejo') || cleanCode.includes('.')) {
      sourceType = 'polyurethane';
    } else if (cleanBrand.includes('tamiya') || cleanCode.startsWith('X-') || cleanCode.startsWith('XF-')) {
      sourceType = 'acrylic';
    }

    const source = {
      brand: sourceBrand || 'Pintura de Origen',
      code: sourceCode,
      name: entry.mrColor.name,
      hexColor: entry.mrColor.hex,
      type: sourceType
    };

    const guide = getMediumGuide(
      targetMedium === 'montana_colors' ? 'Montana Colors' : (targetMedium === 'polyurethane' ? 'Vallejo' : (targetMedium === 'acrylic' ? 'Tamiya' : source.brand)),
      targetMedium === 'montana_colors' ? 'spray_graffiti' : (targetMedium === 'polyurethane' ? 'polyurethane' : source.type),
      targetMedium
    );

    const result: PaintConversionResult = {
      source,
      matches,
      airbrushGuide: guide
    };

    return res.json(result);
  }

  // Fallback: search in catalog by partial code or name
  const catalogPaint = db.paints.find(p => p.code.toUpperCase().includes(cleanCode) || p.name.toLowerCase().includes(cleanCode.toLowerCase()));
  if (catalogPaint) {
    const guide = getMediumGuide(catalogPaint.brand, catalogPaint.type, targetMedium);
    const rackCheck = checkRack(catalogPaint.brand, catalogPaint.code);

    const result: PaintConversionResult = {
      source: {
        brand: catalogPaint.brand,
        code: catalogPaint.code,
        name: catalogPaint.name,
        hexColor: catalogPaint.hexColor,
        type: catalogPaint.type
      },
      matches: [
        {
          brand: catalogPaint.brand,
          code: catalogPaint.code,
          name: catalogPaint.name,
          line: catalogPaint.line,
          type: catalogPaint.type,
          finish: catalogPaint.finish,
          hexColor: catalogPaint.hexColor,
          similarity: 'exact',
          ...rackCheck
        }
      ],
      airbrushGuide: guide
    };
    return res.json(result);
  }

  // Not found in database
  return sendProblem(
    req,
    res,
    404,
    'Equivalencia No Encontrada',
    `No se encontró una equivalencia directa para la pintura "${sourceCode}". Prueba con códigos estándar como XF-1, C108, C110, XF-56, 70.950 o RV-242.`,
    'not-found'
  );
});

// ---------------------------------------------------------------------------
// 2. POST /api/v1/paints/ai/recipe
// ---------------------------------------------------------------------------
paintsAiRouter.post('/recipe', async (req: Request, res: Response) => {
  const { query, preferredMedium, preferredBrand, style } = req.body as PaintRecipeAiRequest;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Descripción Requerida',
      'Debes proporcionar una descripción o nombre del tono a mezclar (ej. "Azul Titan Gundam", "Zaku II Verde Militar", "Gundam Barbatos Frame").',
      'validation-error'
    );
  }

  const q = query.toLowerCase().trim();
  const db = getDb();
  const userId = tryExtractUserId(req);
  const userRack = userId ? db.paintRackItems.filter(p => p.userId === userId) : [];

  function inRack(code: string): boolean {
    const paint = db.paints.find(p => p.code.toUpperCase().replace(/\s+/g, '') === code.toUpperCase().replace(/\s+/g, ''));
    if (!paint) return false;
    return userRack.some(r => r.paintId === paint.id);
  }

  // Check if GEMINI_API_KEY is configured
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      let mediumInstruction = 'Mr. Color (Laca), Tamiya (Acrílico) o Vallejo (Poliuretano)';
      if (preferredMedium === 'montana_colors') {
        mediumInstruction = `IMPORTANTE: El usuario ha seleccionado MONTANA COLORS (sprays de graffiti y bellas artes: https://www.montanacolors.com/graffiti/spray/).
Debes recomendar sprays Montana Colors como MTN 94 (acabado mate, baja presión), MTN Water Based (base agua libre de olor y seguro para poliestireno), o MTN PRO (imprimaciones y barnices).
Indica códigos reales de MTN (ej. RV-01, RV-242, RV-3012, RV-5005, RV-1021, RV-6018, WB-9011, etc.),
especifica la boquilla recomendada (Pocket Cap, Skinny Universal Cap) y técnica de pasadas rápidas ("sweep passes") a 20-25 cm.`;
      } else if (preferredMedium === 'polyurethane') {
        mediumInstruction = `El usuario ha seleccionado POLIURETANO (Vallejo Mecha Color, Model Color). Recomienda tonos Vallejo con Mecha Color, dilución con Flow Improver y presión 18-22 PSI.`;
      } else if (preferredMedium === 'lacquer') {
        mediumInstruction = `El usuario ha seleccionado LACA (Mr. Color, Gaia Notes). Recomienda dilución con Mr. Color Leveling Thinner a 12-16 PSI.`;
      } else if (preferredMedium === 'acrylic') {
        mediumInstruction = `El usuario ha seleccionado ACRÍLICO (Tamiya X/XF). Recomienda dilución con Tamiya X-20A a 15-20 PSI.`;
      }

      const prompt = `Eres un maestro modelista experto en Gunpla, pintura a escala, aerografía y técnicas de aerosoles.
Genera una fórmula y recomendación profesional para la siguiente solicitud: "${query}".
Medio químico elegido: ${preferredMedium || 'No especificado'}.
Instrucción de medio: ${mediumInstruction}
Marca preferida: ${preferredBrand || 'Según medio elegido'}.
Estilo: ${style || 'anime_accurate'}.

Responde ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "recipeName": "Nombre descriptivo de la receta",
  "description": "Explicación técnica del tono, química seleccionada y referencia visual",
  "colorPaletteHex": ["#hex1", "#hex2", "#hex3"],
  "components": [
    {
      "partOrTonalStep": "Color Base / Sombra / Luces",
      "recommendedPaint": "Nombre de la pintura o spray",
      "brand": "Montana Colors / Mr. Hobby / Tamiya / Vallejo",
      "code": "Código de frasco o bote (ej. RV-6018, C110, XF-1, 69.008)",
      "hexColor": "#hexColor",
      "percentage": 70
    }
  ],
  "mixingInstructions": "Instrucciones paso a paso para mezclar o aplicar los tonos y capas",
  "airbrushApplication": {
    "primer": "Recomendación de imprimación adecuada al medio",
    "baseCoat": "Técnica de capa base (distancia, sweep passes o patrón aerógrafo)",
    "shadingOrHighlight": "Técnica de sombreado o realce",
    "topCoat": "Barniz final protector",
    "thinnerRatio": "Proporción pintura/thinner o indicación de spray listo para usar",
    "psi": "Presión recomendada en PSI o especificación de boquilla / cap para aerosol"
  }
}`;

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (geminiRes.ok) {
        const geminiData = (await geminiRes.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText) as PaintRecipeAiResponse;
          parsed.aiEngine = 'gemini-3.8-flash';
          parsed.components = (parsed.components || []).map(c => ({
            ...c,
            inUserRack: inRack(c.code)
          }));
          return res.json(parsed);
        }
      }
    } catch (err) {
      console.warn('[Gemini API Fallback]:', err);
    }
  }

  // -------------------------------------------------------------------------
  // Expert Deterministic Color Recipes Fallback (Split by Medium & Theme)
  // -------------------------------------------------------------------------
  let recipe: PaintRecipeAiResponse;

  if (preferredMedium === 'montana_colors') {
    // Montana Colors Dedicated Spray Recipes
    if (q.includes('zaku') || q.includes('verde') || q.includes('green') || q.includes('militar')) {
      recipe = {
        recipeName: 'Verde Táctico Zaku II (Montana Colors MTN 94 Spray Graffiti)',
        description: 'Formulación con aerosoles MTN 94 de baja presión y acabado mate sintético (https://www.montanacolors.com/graffiti/spray/), calibrada para armaduras mecha sin saturar las líneas de panel.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#48A23F', '#121212', '#FFD100'],
        components: [
          {
            partOrTonalStep: 'Armadura Principal (Verde Militar)',
            recommendedPaint: 'MTN 94 Verde Valle',
            brand: 'Montana Colors',
            code: 'RV-6018',
            hexColor: '#48A23F',
            percentage: 70,
            inUserRack: inRack('RV-6018')
          },
          {
            partOrTonalStep: 'Torso, Zapatos & Contraste',
            recommendedPaint: 'MTN 94 Negro Mate',
            brand: 'Montana Colors',
            code: 'RV-242',
            hexColor: '#121212',
            percentage: 25,
            inUserRack: inRack('RV-242')
          },
          {
            partOrTonalStep: 'Detalles de Escudo & Ojos Monoeye',
            recommendedPaint: 'MTN 94 Amarillo Canario',
            brand: 'Montana Colors',
            code: 'RV-1021',
            hexColor: '#FFD100',
            percentage: 5,
            inUserRack: inRack('RV-1021')
          }
        ],
        mixingInstructions: 'No requiere mezcla líquida: aplica los botes directamente. Agitar cada aerosol MTN durante 2 minutos completos antes de pulsar la válvula.',
        airbrushApplication: {
          primer: 'MTN PRO Imprimación para Plásticos (1 capa rápida para generar mordiente sobre el poliestireno).',
          baseCoat: 'MTN 94 con Pocket Cap a 20-25 cm en pasadas rápidas continuas ("sweep passes").',
          shadingOrHighlight: 'Sombreado perimetral a distancia con MTN 94 RV-242 con boquilla Skinny Universal.',
          topCoat: 'MTN PRO Barniz Acrílico Mate (PRO-Matte) para protección contra arañazos y cero reflejo.',
          thinnerRatio: 'Listo para usar en aerosol. Desatascar boquillas pulverizando el bote boca abajo 3 segundos.',
          psi: 'Aerosol de baja presión MTN 94 con boquilla Pocket Cap (fina y de pulverizado suave).'
        }
      };
    } else if (q.includes('char') || q.includes('rojo') || q.includes('red') || q.includes('sazabi')) {
      recipe = {
        recipeName: 'Rojo Cometa Char Aznable (Montana Colors MTN 94 & Water Based)',
        description: 'Esquema bicolor del Cometa Rojo utilizando sprays MTN 94 de acabado mate suave sobre poliestireno imprimado.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#C8102E', '#121212', '#FFD100'],
        components: [
          {
            partOrTonalStep: 'Armadura Carmesí de Char',
            recommendedPaint: 'MTN 94 Rojo Madrid',
            brand: 'Montana Colors',
            code: 'RV-3012',
            hexColor: '#C8102E',
            percentage: 80,
            inUserRack: inRack('RV-3012')
          },
          {
            partOrTonalStep: 'Torso & Estructura Oscura',
            recommendedPaint: 'MTN 94 Negro Mate',
            brand: 'Montana Colors',
            code: 'RV-242',
            hexColor: '#121212',
            percentage: 15,
            inUserRack: inRack('RV-242')
          },
          {
            partOrTonalStep: 'Detalles & Emblemas V-Fin',
            recommendedPaint: 'MTN 94 Amarillo Canario',
            brand: 'Montana Colors',
            code: 'RV-1021',
            hexColor: '#FFD100',
            percentage: 5,
            inUserRack: inRack('RV-1021')
          }
        ],
        mixingInstructions: 'Agitar durante 2 minutos. Aplicar 2 capas finas de RV-3012 dejando secar 15 minutos entre capas. Para piezas interiores utilizar MTN Water Based.',
        airbrushApplication: {
          primer: 'MTN PRO Imprimación Blanca (para maximizar la luminosidad y saturación del rojo).',
          baseCoat: 'Pasadas horizontales continuas a 22 cm sin mantener el chorro estático.',
          shadingOrHighlight: 'Post-shading con spray lejano (30 cm) de RV-242 en bordes.',
          topCoat: 'MTN PRO Barniz Acrílico Satinado o Mate.',
          thinnerRatio: 'No diluir. Aerosol presurizado listo para usar.',
          psi: 'Baja presión MTN 94 con boquilla Skinny Universal Cap.'
        }
      };
    } else if (q.includes('titans') || q.includes('mk-ii') || q.includes('azul') || q.includes('blue')) {
      recipe = {
        recipeName: 'Azul Titán Táctico (Montana Colors MTN 94 Stealth)',
        description: 'Azul marino táctico con sprays de graffiti de baja presión MTN 94 de secado ultra rápido para Mecha militar.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#002F6C', '#121212', '#C0C0C0'],
        components: [
          {
            partOrTonalStep: 'Armadura Azul Titán',
            recommendedPaint: 'MTN 94 Azul Profundo',
            brand: 'Montana Colors',
            code: 'RV-5005',
            hexColor: '#002F6C',
            percentage: 75,
            inUserRack: inRack('RV-5005')
          },
          {
            partOrTonalStep: 'Torso y Partes de Sigilo',
            recommendedPaint: 'MTN 94 Negro Mate',
            brand: 'Montana Colors',
            code: 'RV-242',
            hexColor: '#121212',
            percentage: 20,
            inUserRack: inRack('RV-242')
          },
          {
            partOrTonalStep: 'Mecanismos y Pistones',
            recommendedPaint: 'MTN PRO Pintura Metálica Cromo',
            brand: 'Montana Colors',
            code: 'PRO-Silver',
            hexColor: '#C0C0C0',
            percentage: 5,
            inUserRack: inRack('PRO-Silver')
          }
        ],
        mixingInstructions: 'Aplicar el negro mate como preshading base y luego aplicar el azul profundo en pasadas rápidas para lograr volumen tridimensional.',
        airbrushApplication: {
          primer: 'MTN PRO Imprimación Gris o Negra.',
          baseCoat: 'MTN 94 RV-5005 con Pocket Cap a 20 cm.',
          shadingOrHighlight: 'Sombreado natural gracias a la base oscura.',
          topCoat: 'MTN PRO Barniz Acrílico Mate.',
          thinnerRatio: 'Listo para usar. Limpiar válvula boca abajo tras terminar.',
          psi: 'Baja presión MTN 94 con Pocket Cap de trazo fino.'
        }
      };
    } else {
      // Classic Tri-Color with Montana Colors
      recipe = {
        recipeName: 'Paleta Clásica Mecha RX-78-2 (Montana Colors MTN 94)',
        description: 'Colores primarios clásicos con la gama de baja presión MTN 94 (https://www.montanacolors.com), seguros para modelismo a escala.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#FFFFFF', '#002F6C', '#C8102E', '#FFD100'],
        components: [
          {
            partOrTonalStep: 'Armadura Blanca Principal',
            recommendedPaint: 'MTN 94 Blanco Blanco',
            brand: 'Montana Colors',
            code: 'RV-01',
            hexColor: '#FFFFFF',
            percentage: 60,
            inUserRack: inRack('RV-01')
          },
          {
            partOrTonalStep: 'Pecho Azul',
            recommendedPaint: 'MTN 94 Azul Profundo',
            brand: 'Montana Colors',
            code: 'RV-5005',
            hexColor: '#002F6C',
            percentage: 20,
            inUserRack: inRack('RV-5005')
          },
          {
            partOrTonalStep: 'Pies, Escudo & Torso Rojo',
            recommendedPaint: 'MTN 94 Rojo Madrid',
            brand: 'Montana Colors',
            code: 'RV-3012',
            hexColor: '#C8102E',
            percentage: 15,
            inUserRack: inRack('RV-3012')
          },
          {
            partOrTonalStep: 'Ventilas & V-Fin Amarillo',
            recommendedPaint: 'MTN 94 Amarillo Canario',
            brand: 'Montana Colors',
            code: 'RV-1021',
            hexColor: '#FFD100',
            percentage: 5,
            inUserRack: inRack('RV-1021')
          }
        ],
        mixingInstructions: 'Aerosoles individuales de precisión. Usar Pocket Cap para piezas pequeñas y Skinny Universal para blindajes grandes.',
        airbrushApplication: {
          primer: 'MTN PRO Imprimación Blanca para plásticos.',
          baseCoat: '2 pasadas ligeras a 22 cm de distancia.',
          shadingOrHighlight: 'Preshading previo con WB-9011 (Water Based) para cero olor en cabina.',
          topCoat: 'MTN PRO Barniz Acrílico Mate.',
          thinnerRatio: 'No diluir. Aerosol listo para disparar.',
          psi: 'MTN 94 Baja Presión con Pocket Cap.'
        }
      };
    }
  } else if (preferredMedium === 'polyurethane') {
    // Vallejo Polyurethane Acrylic Recipes
    if (q.includes('zaku') || q.includes('verde') || q.includes('green') || q.includes('militar')) {
      recipe = {
        recipeName: 'Verde Zaku II en Poliuretano (Vallejo Mecha Color Resistente)',
        description: 'Fórmula de resina de poliuretano al agua de máxima adherencia, diseñada específicamente para las fricciones de articulaciones Gunpla.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#3B4D28', '#111111', '#EAB308'],
        components: [
          {
            partOrTonalStep: 'Armadura Principal Verde',
            recommendedPaint: 'Vallejo US Olive Drab',
            brand: 'Vallejo',
            code: '70.887',
            hexColor: '#3B4D28',
            percentage: 80,
            inUserRack: inRack('70.887')
          },
          {
            partOrTonalStep: 'Torso Oscuro',
            recommendedPaint: 'Vallejo Model Color Black',
            brand: 'Vallejo',
            code: '70.950',
            hexColor: '#111111',
            percentage: 15,
            inUserRack: inRack('70.950')
          },
          {
            partOrTonalStep: 'Detalle de Monoeye / Ventilas',
            recommendedPaint: 'Vallejo Flat Yellow',
            brand: 'Vallejo',
            code: '70.953',
            hexColor: '#EAB308',
            percentage: 5,
            inUserRack: inRack('70.953')
          }
        ],
        mixingInstructions: 'Mezcla 7 partes de 70.887 con 3 partes de Vallejo Airbrush Thinner y 1 gota de Flow Improver para evitar el secado en aguja ("dry tip").',
        airbrushApplication: {
          primer: 'Vallejo Mecha Primer Gris o Negro (resina de poliuretano).',
          baseCoat: 'Capa media húmeda a 18-20 PSI.',
          shadingOrHighlight: 'Añadir 20% de blanco 70.951 a la mezcla para luces cenitales.',
          topCoat: 'Vallejo Mecha Varnish Mate (69.702) con curado de 48 horas.',
          thinnerRatio: '70% pintura : 30% Vallejo Thinner + Flow Improver.',
          psi: '18 a 22 PSI con boquilla 0.35mm.'
        }
      };
    } else {
      recipe = {
        recipeName: 'Rojo Carmesí Mecha en Poliuretano (Vallejo Mecha Color)',
        description: 'Resina de poliuretano de alta resistencia mecánica para modelos Gunpla articulados.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#DC2626', '#1E3A8A', '#111111'],
        components: [
          {
            partOrTonalStep: 'Armadura Roja',
            recommendedPaint: 'Mecha Red',
            brand: 'Vallejo',
            code: '69.008',
            hexColor: '#DC2626',
            percentage: 80,
            inUserRack: inRack('69.008')
          },
          {
            partOrTonalStep: 'Torso Oscuro',
            recommendedPaint: 'Mecha Dark Blue',
            brand: 'Vallejo',
            code: '69.011',
            hexColor: '#1E3A8A',
            percentage: 15,
            inUserRack: inRack('69.011')
          },
          {
            partOrTonalStep: 'Estructura Interna',
            recommendedPaint: 'Metal Color Steel',
            brand: 'Vallejo',
            code: '77.712',
            hexColor: '#475569',
            percentage: 5,
            inUserRack: inRack('77.712')
          }
        ],
        mixingInstructions: 'Vallejo Mecha viene pre-diluido para aerógrafo; añade únicamente 1 gota de Flow Improver por cada 10 gotas de pintura para fluidez continua.',
        airbrushApplication: {
          primer: 'Vallejo Mecha Primer Blanco.',
          baseCoat: '2 capas finas con 10 minutos de intervalo.',
          shadingOrHighlight: 'Post-shading con Mecha Red aclarado.',
          topCoat: 'Vallejo Mecha Varnish Satin.',
          thinnerRatio: '90% pintura : 10% Thinner/Flow Improver.',
          psi: '20 PSI constante.'
        }
      };
    }
  } else {
    // Standard Lacquer / Acrylic / Multi-medium recipes
    if (q.includes('zaku') || q.includes('verde') || q.includes('green') || q.includes('militar')) {
      recipe = {
        recipeName: 'Verde Táctico Zaku II (Real Type Military Camo)',
        description: 'Paleta militar icónica del MS-06 Zaku II, calibrada para contraste entre armadura clara y torso oscuro.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#3F4E24', '#365314', '#1A1A1A'],
        components: [
          {
            partOrTonalStep: 'Armadura Principal (Verde Claro)',
            recommendedPaint: 'Olive Drab + Flat White',
            brand: 'Tamiya',
            code: 'XF-62',
            hexColor: '#3F4E24',
            percentage: 75,
            inUserRack: inRack('XF-62')
          },
          {
            partOrTonalStep: 'Luces de Armadura',
            recommendedPaint: 'Flat White',
            brand: 'Tamiya',
            code: 'XF-2',
            hexColor: '#FAFAFA',
            percentage: 25,
            inUserRack: inRack('XF-2')
          },
          {
            partOrTonalStep: 'Torso & Cintura (Verde Bosque Profundo)',
            recommendedPaint: 'Olive Drab (1)',
            brand: 'Mr. Hobby',
            code: 'C12',
            hexColor: '#365314',
            percentage: 85,
            inUserRack: inRack('C12')
          },
          {
            partOrTonalStep: 'Sombra de Torso',
            recommendedPaint: 'Flat Black',
            brand: 'Mr. Hobby',
            code: 'C33',
            hexColor: '#1C1C1C',
            percentage: 15,
            inUserRack: inRack('C33')
          }
        ],
        mixingInstructions: 'Para la armadura clara, mezcla 3 partes de XF-62 con 1 parte de XF-2 Flat White. Para el torso oscuro, añade 1 gota de C33 Black por cada 5 gotas de C12 Olive Drab.',
        airbrushApplication: {
          primer: 'Imprimante Gris 1200 (Mr. Surfacer 1200) para un tono neutro uniforme.',
          baseCoat: '2 capas finas y uniformes a distancia de 8-10 cm.',
          shadingOrHighlight: 'Preshading negro sobre líneas de panel y post-shading con verde aclarado en centros.',
          topCoat: 'Barniz Flat/Matte (Mr. Color GX114 o Tamiya XF-86) para eliminar reflejos.',
          thinnerRatio: '1 parte de pintura por 1.5 partes de thinner.',
          psi: '14 a 16 PSI con boquilla 0.3mm.'
        }
      };
    } else if (q.includes('char') || q.includes('rojo') || q.includes('red') || q.includes('sazabi')) {
      recipe = {
        recipeName: 'Rojo Cometa Char Aznable (Salmon & Deep Crimson)',
        description: 'El esquema bicolor representativo del Cometa Rojo en Mobile Suit Gundam: torso carmesí oscuro y extremidades salmón/rojo claro.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#B71C1C', '#DC2626', '#F59E0B'],
        components: [
          {
            partOrTonalStep: 'Torso Carmesí Oscuro',
            recommendedPaint: 'Character Red',
            brand: 'Mr. Hobby',
            code: 'C108',
            hexColor: '#B71C1C',
            percentage: 85,
            inUserRack: inRack('C108')
          },
          {
            partOrTonalStep: 'Sombra Torso / Matiz Borgoña',
            recommendedPaint: 'Midnight Blue',
            brand: 'Mr. Hobby',
            code: 'C71',
            hexColor: '#0F172A',
            percentage: 15,
            inUserRack: inRack('C71')
          },
          {
            partOrTonalStep: 'Extremidades Salmón Char',
            recommendedPaint: 'Character Red + White + Yellow',
            brand: 'Mr. Hobby',
            code: 'C108',
            hexColor: '#DC2626',
            percentage: 60,
            inUserRack: inRack('C108')
          },
          {
            partOrTonalStep: 'Aclarador de Salmón',
            recommendedPaint: 'Flat White',
            brand: 'Tamiya',
            code: 'XF-2',
            hexColor: '#FAFAFA',
            percentage: 30,
            inUserRack: inRack('XF-2')
          },
          {
            partOrTonalStep: 'Cálido Anime',
            recommendedPaint: 'RLM04 Yellow',
            brand: 'Mr. Hobby',
            code: 'C113',
            hexColor: '#FBC02D',
            percentage: 10,
            inUserRack: inRack('C113')
          }
        ],
        mixingInstructions: 'Para el tono salmón Char, combina 6 partes de C108 Red con 3 partes de XF-2 White y 1 parte de C113 Yellow. Para el torso, oscurece el C108 con un 15% de C71 Midnight Blue.',
        airbrushApplication: {
          primer: 'Imprimación Rosa o Blanca (Mr. Surfacer Pink/White) para resaltar la vivacidad del rojo.',
          baseCoat: 'Aplicar 3 capas semi-húmedas evitando encharcamientos.',
          shadingOrHighlight: 'Post-highlight suave en el centro de paneles con el tono salmón diluido al 80%.',
          topCoat: 'Barniz Semi-Gloss satinado para un look industrial de mecha.',
          thinnerRatio: '1:1.7 con Mr. Leveling Thinner para máxima nivelación.',
          psi: '15 PSI constante.'
        }
      };
    } else if (q.includes('titans') || q.includes('mk-ii') || q.includes('azul') || q.includes('blue')) {
      recipe = {
        recipeName: 'Azul Titán Táctico (Gundam MK-II Titans Stealth)',
        description: 'Azul marino militar de alta saturación y sigilo utilizado por la facción Titans en Zeta Gundam.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#0F172A', '#1565C0', '#4B5563'],
        components: [
          {
            partOrTonalStep: 'Base Azul Marino Stealth',
            recommendedPaint: 'Midnight Blue',
            brand: 'Mr. Hobby',
            code: 'C71',
            hexColor: '#0F172A',
            percentage: 70,
            inUserRack: inRack('C71')
          },
          {
            partOrTonalStep: 'Tonalidad Azul Saturada',
            recommendedPaint: 'Character Blue',
            brand: 'Mr. Hobby',
            code: 'C110',
            hexColor: '#1565C0',
            percentage: 25,
            inUserRack: inRack('C110')
          },
          {
            partOrTonalStep: 'Matiz de Profundidad',
            recommendedPaint: 'Flat Black',
            brand: 'Tamiya',
            code: 'XF-1',
            hexColor: '#1A1A1A',
            percentage: 5,
            inUserRack: inRack('XF-1')
          }
        ],
        mixingInstructions: '7 partes de C71 Midnight Blue + 2.5 partes de C110 Character Blue + 0.5 partes de XF-1 Flat Black.',
        airbrushApplication: {
          primer: 'Imprimante Negro (Mr. Surfacer Black 1500) para crear sombras naturales profundas.',
          baseCoat: '2 capas finas para que el negro base enriquezca la profundidad del azul.',
          shadingOrHighlight: 'Resaltado de aristas con azul cielo muy sutil.',
          topCoat: 'Barniz Mate extra fino para look militar furtivo.',
          thinnerRatio: '1:2 pintura a thinner.',
          psi: '12 a 15 PSI.'
        }
      };
    } else if (q.includes('frame') || q.includes('esqueleto') || q.includes('barbatos') || q.includes('metal')) {
      recipe = {
        recipeName: 'Inner Frame Gunmetal & Titanio (Gundam Barbatos Skeletal)',
        description: 'Acabado metálico multicapa para pistones hidráulicos, engranajes y articulaciones mecánicas pesadas.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#4B5563', '#C0C0C0', '#101010'],
        components: [
          {
            partOrTonalStep: 'Estructura Principal del Esqueleto',
            recommendedPaint: 'Steel / Metallic Grey',
            brand: 'Mr. Hobby',
            code: 'C28',
            hexColor: '#4B5563',
            percentage: 80,
            inUserRack: inRack('C28')
          },
          {
            partOrTonalStep: 'Sombra Mecánica',
            recommendedPaint: 'Black Gloss',
            brand: 'Mr. Hobby',
            code: 'C2',
            hexColor: '#101010',
            percentage: 20,
            inUserRack: inRack('C2')
          },
          {
            partOrTonalStep: 'Pistones Hidráulicos & Detallado',
            recommendedPaint: 'Silver / Flat Aluminum',
            brand: 'Tamiya',
            code: 'XF-16',
            hexColor: '#D1D5DB',
            percentage: 100,
            inUserRack: inRack('XF-16')
          }
        ],
        mixingInstructions: 'Capa base directa de C28 Steel con un toque de C2 Black. Pistones y tubos pintados a pincel seco con XF-16 Silver puro.',
        airbrushApplication: {
          primer: 'Negro Brillante pulido (Gloss Black Base) para reflectividad metálica.',
          baseCoat: 'Capa ligera sin saturar para mantener el grano metálico fino.',
          shadingOrHighlight: 'Lavado con panel line marrón oscuro / negro en ranuras.',
          topCoat: 'Barniz Satinado (evita barniz ultra mate para no apagar el brillo del metal).',
          thinnerRatio: '1:1.5 con thinner rápido o leveling.',
          psi: '15 PSI.'
        }
      };
    } else {
      // Default: RX-78-2 Anime Tri-Color Classic
      recipe = {
        recipeName: 'Blanco Cálido & Azul Real Grade (RX-78-2 Anime Master)',
        description: 'Fórmula balanceada para armaduras principales estilo Bandai RG/MG con sutil contraste de paneles.',
        aiEngine: 'expert-local-rules',
        colorPaletteHex: ['#F5F5F5', '#1565C0', '#B71C1C'],
        components: [
          {
            partOrTonalStep: 'Armadura Blanca Primaria',
            recommendedPaint: 'Flat White',
            brand: 'Mr. Hobby',
            code: 'C62',
            hexColor: '#F5F5F5',
            percentage: 95,
            inUserRack: inRack('C62')
          },
          {
            partOrTonalStep: 'Tinte de Escala',
            recommendedPaint: 'German Gray',
            brand: 'Mr. Hobby',
            code: 'C40',
            hexColor: '#334155',
            percentage: 5,
            inUserRack: inRack('C40')
          },
          {
            partOrTonalStep: 'Pecho Azul Real Grade',
            recommendedPaint: 'Character Blue',
            brand: 'Mr. Hobby',
            code: 'C110',
            hexColor: '#1565C0',
            percentage: 90,
            inUserRack: inRack('C110')
          },
          {
            partOrTonalStep: 'Sombra Pecho',
            recommendedPaint: 'Character Red',
            brand: 'Mr. Hobby',
            code: 'C108',
            hexColor: '#B71C1C',
            percentage: 10,
            inUserRack: inRack('C108')
          }
        ],
        mixingInstructions: 'Para el blanco principal, añade 1 sola gota de C40 German Gray por cada 20 gotas de C62 White para romper la translucidez del plástico y lograr escala.',
        airbrushApplication: {
          primer: 'Imprimación Gris Claro o Blanca 1500.',
          baseCoat: '2 capas finas cruzadas a 90 grados.',
          shadingOrHighlight: 'Preshading sutil en bordes.',
          topCoat: 'Barniz Flat Matte GX114.',
          thinnerRatio: '1:1.8 con Mr. Leveling Thinner.',
          psi: '15 PSI.'
        }
      };
    }
  }

  return res.json(recipe);
});
