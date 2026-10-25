import { Router, Request, Response } from 'express';
import {
  RunnerInspectionRequest,
  RunnerInspectionResponse,
  NubInspectionRequest,
  NubInspectionResponse,
  analyzeRunnerPhotoOffline,
  analyzeNubPhotoOffline
} from '@gunpla/shared';
import { sendProblem } from '../../core/problem-details';

export const builderAiRouter = Router();

function parseImageData(rawImage: string): { mimeType: string; base64Data: string } | null {
  if (!rawImage || typeof rawImage !== 'string') return null;
  const match = rawImage.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      base64Data: match[2]
    };
  }
  // If it is raw base64 or a URL, return default jpeg mimeType
  if (rawImage.length > 50 && !rawImage.startsWith('http')) {
    return {
      mimeType: 'image/jpeg',
      base64Data: rawImage
    };
  }
  return null;
}

// POST /api/v1/workbench/ai/inspect-runner
builderAiRouter.post('/inspect-runner', async (req: Request, res: Response) => {
  const { image, runnerLetter, kitName } = req.body as RunnerInspectionRequest;

  if (!image || typeof image !== 'string' || image.trim().length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Imagen de Grapa Requerida',
      'Debes proporcionar una imagen de la grapa en formato data URL o base64 para realizar el analisis con Vision AI.',
      'validation-error'
    );
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    const parsedImg = parseImageData(image);
    if (parsedImg) {
      try {
        const prompt = `Eres un asistente de vision artificial experto en modelismo a escala y Gunpla.
Analiza la fotografia adjunta de la grapa (runner/sprue) de plastico de una maqueta.
Letra sugerida o identificada de la grapa: ${runnerLetter || 'Determinar de la foto (ej. A, B, C, D1)'}.
Maqueta/Kit: ${kitName || 'Maqueta a escala'}.

Instrucciones:
1. Identifica la letra de la grapa visible en la etiqueta o placa de identificacion.
2. Identifica cuantas piezas de plastico continuan unidas a la matriz (piezas intactas / restantes) y cuantas ya han sido cortadas (espacios vacios en los canales).
3. Lista las piezas detectadas con su numero (ej. A1, A2, A3), su estado ("intact", "removed", "uncertain") y un indice de confianza (0.0 a 1.0).
4. Proporciona recomendaciones utiles para el corte de piezas y organizacion de la mesa de trabajo.

Responde UNICAMENTE un objeto JSON valido con la siguiente estructura exacta:
{
  "runnerLetter": "A",
  "totalPartsDetected": 18,
  "remainingPartsCount": 11,
  "removedPartsCount": 7,
  "completionPercentage": 39,
  "parts": [
    {
      "partNumber": "A1",
      "status": "intact",
      "confidence": 0.95,
      "notes": "Pieza principal disponible"
    }
  ],
  "recommendations": [
    "Recomendacion 1",
    "Recomendacion 2"
  ]
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inlineData: {
                        mimeType: parsedImg.mimeType,
                        data: parsedImg.base64Data
                      }
                    },
                    { text: prompt }
                  ]
                }
              ],
              generationConfig: { responseMimeType: 'application/json' }
            })
          }
        );

        if (geminiRes.ok) {
          const data = (await geminiRes.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            const parsed = JSON.parse(rawJson) as RunnerInspectionResponse;
            parsed.aiEngine = 'gemini-3.5-flash-lite';
            parsed.inspectedAt = new Date().toISOString();
            return res.json(parsed);
          }
        }
      } catch (err) {
        console.warn('[Gemini Runner Vision AI Fallback]:', err);
      }
    }
  }

  // Deterministic local fallback
  const offlineResult = analyzeRunnerPhotoOffline(runnerLetter, kitName);
  return res.json(offlineResult);
});

// POST /api/v1/workbench/ai/inspect-nub
builderAiRouter.post('/inspect-nub', async (req: Request, res: Response) => {
  const { image, partName, plasticType } = req.body as NubInspectionRequest;

  if (!image || typeof image !== 'string' || image.trim().length === 0) {
    return sendProblem(
      req,
      res,
      400,
      'Imagen de Corte Requerida',
      'Debes proporcionar una fotografia macro en primer plano del punto de union o corte para evaluar la calidad del acabado (nub mark).',
      'validation-error'
    );
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    const parsedImg = parseImageData(image);
    if (parsedImg) {
      try {
        const prompt = `Eres un juez y maestro modelista de competicion internacional (Gunpla Builders World Cup / IPMS) experto en limpieza de piezas, tecnica de corte y desbastado de compuertas (nub marks).
Analiza la fotografia macro del punto de corte de la pieza de plastico.
Nombre de la pieza: ${partName || 'Pieza a escala'}.
Tipo de plastico: ${plasticType || 'PS (Poliestireno)'}.

Instrucciones:
1. Evalua la calidad del corte y pulido asignando un puntaje numerico de 0 a 100 (90-100: nivel competicion / invisible, 70-89: aceptable para ensamble directo, <70: requiere correccion con bisturi/lija).
2. Diagnostica la condicion principal: "clean_cut", "protruding_nub" (saliente sobrante), "stress_mark" (marca blanca por presion de alicate embotado), "gouge" (mordisco que penetro bajo el nivel de la superficie), o "under_sanded" (rayaduras visibles sin pulido fino).
3. Determina la severidad: "none", "minor", "moderate", "severe".
4. Indica si hay marca de estres blanquecina presente (stressMarkPresent: true/false).
5. Especifica la secuencia de lijas al agua recomendadas (ej. [800, 1000, 1500, 2000]).
6. Enumera los pasos de correccion numerados con herramienta y tecnica.

Responde UNICAMENTE un objeto JSON valido con la siguiente estructura exacta:
{
  "qualityScore": 82,
  "diagnosis": "protruding_nub",
  "severity": "minor",
  "headline": "Breve resumen en espanol del estado del corte",
  "detailedAnalysis": "Explicacion tecnica detallada del corte y estado del plastico",
  "stressMarkPresent": false,
  "correctionSteps": [
    {
      "stepOrder": 1,
      "tool": "Herramienta exacta",
      "instruction": "Instruccion tecnica de aplicacion"
    }
  ],
  "sandingGritSequence": [800, 1000, 1500]
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      inlineData: {
                        mimeType: parsedImg.mimeType,
                        data: parsedImg.base64Data
                      }
                    },
                    { text: prompt }
                  ]
                }
              ],
              generationConfig: { responseMimeType: 'application/json' }
            })
          }
        );

        if (geminiRes.ok) {
          const data = (await geminiRes.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            const parsed = JSON.parse(rawJson) as NubInspectionResponse;
            parsed.aiEngine = 'gemini-3.5-flash-lite';
            parsed.inspectedAt = new Date().toISOString();
            return res.json(parsed);
          }
        }
      } catch (err) {
        console.warn('[Gemini Nub Vision AI Fallback]:', err);
      }
    }
  }

  // Deterministic local fallback
  const offlineResult = analyzeNubPhotoOffline(partName, plasticType);
  return res.json(offlineResult);
});
