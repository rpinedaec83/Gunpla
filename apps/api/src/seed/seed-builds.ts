import { BuildProjectRecord } from '@gunpla/shared';

export const INITIAL_BUILDS: BuildProjectRecord[] = [
  {
    id: 'build-aperich-hinu',
    slug: 'rg-hi-nu-gundam-titanium-custom-aperich',
    userId: 'user-aperich',
    username: 'aperich',
    userDisplayName: 'Aldo Perich',
    kitId: 'kit-rg-hinu',
    category: 'gunpla-mecha',
    title: 'RG 1/144 Hi-Nu Gundam Titanium Finish Custom',
    subtitle: 'Construccion completa con panel line, sombreado y acabado mate sedoso',
    status: 'completed',
    coverImageUrl: '/legacy-media/plamoscale/images/aperich/fulls/1.JPG',
    likeCount: 12,
    likedByUserIds: [],
    viewCount: 145,
    tags: ['gunpla', 'rg', 'real-grade', 'amuro-ray', 'mr-color'],
    steps: [
      {
        id: 'step-aperich-1',
        buildId: 'build-aperich-hinu',
        stage: 'assembly',
        orderIndex: 0,
        title: 'Armado del Advanced MS Joint y Torso',
        description: 'Prueba de encaje en seco del esqueleto interno. Articulaciones solidas sin holguras.',
        photoUrls: ['/legacy-media/plamoscale/images/aperich/fulls/1.JPG'],
        paintUsages: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'step-aperich-2',
        buildId: 'build-aperich-hinu',
        stage: 'painting',
        orderIndex: 1,
        title: 'Pintura de Armadura con Receta Mr. Color',
        description: 'Aerografiado con Mr. Color C1 White y C110 Character Blue para los Fin Funnels.',
        photoUrls: ['/legacy-media/plamoscale/images/aperich/fulls/2.JPG', '/legacy-media/plamoscale/images/aperich/fulls/3.JPG'],
        paintUsages: [
          {
            paintId: 'pnt-mc-c1',
            partDescription: 'Armadura blanca principal',
            mixRatio: '100% C1 White',
            thinnerRatio: '1:1.5 Mr. Leveling Thinner',
            technique: 'airbrush'
          },
          {
            paintId: 'pnt-mc-c110',
            partDescription: 'Fin funnels y hombreras',
            mixRatio: '80% C110 + 20% C1 White',
            thinnerRatio: '1:1.5 Mr. Leveling Thinner',
            technique: 'airbrush'
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'step-aperich-3',
        buildId: 'build-aperich-hinu',
        stage: 'final_reveal',
        orderIndex: 2,
        title: 'Resultado Final en Pose de Accion',
        description: 'Montaje de Fin Funnels con hiper mega bazooka launcher y calcas al agua selladas con barniz mate.',
        photoUrls: ['/legacy-media/plamoscale/images/aperich/fulls/4.JPG', '/legacy-media/plamoscale/images/aperich/fulls/5.JPG'],
        paintUsages: [],
        createdAt: new Date().toISOString()
      }
    ],
    comments: [
      {
        id: 'comm-1',
        buildId: 'build-aperich-hinu',
        userId: 'user-dcampos',
        username: 'dcampos',
        userDisplayName: 'Daniel Campos',
        comment: 'Excelente gradiente en los funnels, Aldo. Quedo de concurso.',
        createdAt: new Date().toISOString()
      }
    ],
    expenses: [
      {
        id: 'exp-hinu-1',
        buildId: 'build-aperich-hinu',
        category: 'kit',
        name: 'RG 1/144 Hi-Nu Gundam (Caja Base)',
        amount: 55.0,
        currency: 'USD',
        createdAt: '2026-10-25T10:00:00.000Z'
      },
      {
        id: 'exp-hinu-2',
        buildId: 'build-aperich-hinu',
        category: 'paint',
        name: 'Mr. Color C1 White & C110 Character Blue (1/3 frasco)',
        amount: 8.5,
        currency: 'USD',
        paintId: 'pnt-mc-c1',
        paintBottleFraction: 0.33,
        createdAt: '2026-10-25T10:05:00.000Z'
      },
      {
        id: 'exp-hinu-3',
        buildId: 'build-aperich-hinu',
        category: 'aftermarket',
        name: 'Delpi Decal Water-slide Hi-Nu Holo',
        amount: 7.5,
        currency: 'USD',
        createdAt: '2026-10-25T10:10:00.000Z'
      },
      {
        id: 'exp-hinu-4',
        buildId: 'build-aperich-hinu',
        category: 'labor',
        name: 'Mano de Obra (Aerografia, Masillado y Sellado)',
        amount: 150.0,
        currency: 'USD',
        laborHours: 10,
        createdAt: '2026-10-25T10:15:00.000Z'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'build-fog1labs1-tiger1',
    slug: 'tiger-i-early-production-kursk-1943',
    userId: 'user-fog1labs1',
    username: 'fog1labs1',
    userDisplayName: 'Fog1 Labs',
    kitId: 'kit-tamiya-tiger1',
    category: 'military',
    title: 'Tiger I Early Production - Frente Oriental Kursk 1943',
    subtitle: 'Detallado con faldones doblados, orugas de metal y efectos de barro seco',
    status: 'completed',
    coverImageUrl: '/legacy-media/plamoscale/images/fog1labs1/fulls/50.jpg',
    likeCount: 8,
    likedByUserIds: [],
    viewCount: 98,
    tags: ['military', 'wwii', 'tank', 'tamiya', '1-35', 'weathering'],
    steps: [
      {
        id: 'step-tiger-1',
        buildId: 'build-fog1labs1-tiger1',
        stage: 'assembly',
        orderIndex: 0,
        title: 'Montaje de Barcaza y Suspension Escalonada',
        description: 'Ensamblaje de ruedas intercaladas y canon de 88mm.',
        photoUrls: ['/legacy-media/plamoscale/images/fog1labs1/fulls/50.jpg'],
        paintUsages: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'step-tiger-2',
        buildId: 'build-fog1labs1-tiger1',
        stage: 'weathering',
        orderIndex: 1,
        title: 'Efectos de Desgaste, Oxido y Polvo Ruso',
        description: 'Lavados con esmalte y pigmentos secos en los bajos y ruedas tractoras.',
        photoUrls: ['/legacy-media/plamoscale/images/fog1labs1/fulls/51.jpg', '/legacy-media/plamoscale/images/fog1labs1/fulls/52.jpg'],
        paintUsages: [
          {
            paintId: 'pnt-tam-xf1',
            partDescription: 'Sombreado previo y bajos de chasis',
            technique: 'airbrush'
          }
        ],
        createdAt: new Date().toISOString()
      }
    ],
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
