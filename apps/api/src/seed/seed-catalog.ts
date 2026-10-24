import { KitRecord, PaintRecord } from '@gunpla/shared';

export const INITIAL_KITS: KitRecord[] = [
  // Gunpla / Mecha
  {
    id: 'kit-rg-hinu',
    name: 'RG 1/144 Hi-Nu Gundam',
    brand: 'Bandai Spirits',
    scale: '1/144',
    grade: 'RG (Real Grade)',
    category: 'gunpla-mecha',
    kitNumber: '5061919',
    releaseYear: 2021,
    boxartUrl: 'https://plamoscale.com/assets/images/boxart/rg-hi-nu.jpg',
    scalematesUrl: 'https://www.scalemates.com/kits/bandai-spirits-5061919-rg-1-144-hi-nu-gundam--1359732',
    manualUrl: 'http://dalong.net/reviews/rg/rg36/rg36_m.htm',
    source: 'scalemates',
    createdAt: new Date().toISOString()
  },
  {
    id: 'kit-mg-barbatos',
    name: 'MG 1/100 Gundam Barbatos',
    brand: 'Bandai Spirits',
    scale: '1/100',
    grade: 'MG (Master Grade)',
    category: 'gunpla-mecha',
    kitNumber: '5058222',
    releaseYear: 2019,
    boxartUrl: 'https://plamoscale.com/assets/images/boxart/mg-barbatos.jpg',
    scalematesUrl: 'https://www.scalemates.com/kits/bandai-5058222-asw-g-08-gundam-barbatos--1243171',
    manualUrl: 'http://dalong.net/reviews/mg/m206/m206_m.htm',
    source: 'scalemates',
    createdAt: new Date().toISOString()
  },
  {
    id: 'kit-hguc-rx78',
    name: 'HGUC 1/144 RX-78-2 Gundam (Revive)',
    brand: 'Bandai',
    scale: '1/144',
    grade: 'HG (High Grade)',
    category: 'gunpla-mecha',
    kitNumber: '0196728',
    releaseYear: 2015,
    boxartUrl: 'https://plamoscale.com/assets/images/boxart/hguc-rx78.jpg',
    scalematesUrl: 'https://www.scalemates.com/kits/bandai-0196728-rx-78-2-gundam--948332',
    manualUrl: 'http://dalong.net/reviews/hg/h191/h191_m.htm',
    source: 'scalemates',
    createdAt: new Date().toISOString()
  },
  {
    id: 'kit-koto-megami',
    name: 'Megami Device Asra Archer',
    brand: 'Kotobukiya',
    scale: '1/1',
    grade: 'Megami Device',
    category: 'gunpla-mecha',
    kitNumber: 'KP432',
    releaseYear: 2018,
    boxartUrl: 'https://plamoscale.com/assets/images/boxart/asra-archer.jpg',
    scalematesUrl: 'https://www.scalemates.com/kits/kotobukiya-kp432-asra-archer--1110034',
    source: 'scalemates',
    createdAt: new Date().toISOString()
  },

  // Military / Armor
  {
    id: 'kit-tamiya-tiger1',
    name: 'Tiger I Early Production',
    brand: 'Tamiya',
    scale: '1/35',
    grade: 'Military Miniatures',
    category: 'military',
    kitNumber: '35216',
    releaseYear: 1997,
    boxartUrl: 'https://plamoscale.com/assets/images/boxart/tiger1.jpg',
    scalematesUrl: 'https://www.scalemates.com/kits/tamiya-35216-tiger-i--132891',
    source: 'scalemates',
    createdAt: new Date().toISOString()
  },

  // Aviation
  {
    id: 'kit-tamiya-spitfire',
    name: 'Supermarine Spitfire Mk.I',
    brand: 'Tamiya',
    scale: '1/48',
    grade: 'Aircraft Series',
    category: 'aviation',
    kitNumber: '61119',
    releaseYear: 2018,
    boxartUrl: 'https://plamoscale.com/assets/images/boxart/spitfire.jpg',
    scalematesUrl: 'https://www.scalemates.com/kits/tamiya-61119-supermarine-spitfire-mki--1159987',
    source: 'scalemates',
    createdAt: new Date().toISOString()
  },

  // Automotive
  {
    id: 'kit-tamiya-skyline',
    name: 'Nissan Skyline GT-R (R32) Nismo-Custom',
    brand: 'Tamiya',
    scale: '1/24',
    grade: 'Sports Car Series',
    category: 'automotive',
    kitNumber: '24341',
    releaseYear: 2014,
    boxartUrl: 'https://plamoscale.com/assets/images/boxart/gtr-r32.jpg',
    scalematesUrl: 'https://www.scalemates.com/kits/tamiya-24341-nissan-skyline-gt-r-nismo-custom--938741',
    source: 'scalemates',
    createdAt: new Date().toISOString()
  },

  // Naval
  {
    id: 'kit-hasegawa-yamato',
    name: 'Battleship Yamato',
    brand: 'Hasegawa',
    scale: '1/450',
    grade: 'Waterline Series',
    category: 'naval',
    kitNumber: '40151',
    releaseYear: 2013,
    boxartUrl: 'https://plamoscale.com/assets/images/boxart/yamato.jpg',
    scalematesUrl: 'https://www.scalemates.com/kits/hasegawa-40151-yamato--233158',
    source: 'scalemates',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PAINTS: PaintRecord[] = [
  // Mr. Hobby - Mr. Color (Lacquer)
  {
    id: 'pnt-mc-c1',
    brand: 'Mr. Hobby',
    line: 'Mr. Color',
    code: 'C1',
    name: 'White',
    type: 'lacquer',
    finish: 'gloss',
    hexColor: '#FFFFFF',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mc-c2',
    brand: 'Mr. Hobby',
    line: 'Mr. Color',
    code: 'C2',
    name: 'Black',
    type: 'lacquer',
    finish: 'gloss',
    hexColor: '#101010',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mc-c33',
    brand: 'Mr. Hobby',
    line: 'Mr. Color',
    code: 'C33',
    name: 'Flat Black',
    type: 'lacquer',
    finish: 'flat/matte',
    hexColor: '#1C1C1C',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mc-c62',
    brand: 'Mr. Hobby',
    line: 'Mr. Color',
    code: 'C62',
    name: 'Flat White',
    type: 'lacquer',
    finish: 'flat/matte',
    hexColor: '#F5F5F5',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mc-c8',
    brand: 'Mr. Hobby',
    line: 'Mr. Color',
    code: 'C8',
    name: 'Silver',
    type: 'lacquer',
    finish: 'metallic',
    hexColor: '#C0C0C0',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mc-c108',
    brand: 'Mr. Hobby',
    line: 'Mr. Color',
    code: 'C108',
    name: 'Character Red',
    type: 'lacquer',
    finish: 'semi-gloss',
    hexColor: '#B71C1C',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mc-c110',
    brand: 'Mr. Hobby',
    line: 'Mr. Color',
    code: 'C110',
    name: 'Character Blue',
    type: 'lacquer',
    finish: 'semi-gloss',
    hexColor: '#1565C0',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mc-c113',
    brand: 'Mr. Hobby',
    line: 'Mr. Color',
    code: 'C113',
    name: 'RLM04 Yellow',
    type: 'lacquer',
    finish: 'flat/matte',
    hexColor: '#FBC02D',
    createdAt: new Date().toISOString()
  },

  // Tamiya - Acrylic
  {
    id: 'pnt-tam-xf1',
    brand: 'Tamiya',
    line: 'Acrylic XF',
    code: 'XF-1',
    name: 'Flat Black',
    type: 'acrylic',
    finish: 'flat/matte',
    hexColor: '#1A1A1A',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-tam-xf2',
    brand: 'Tamiya',
    line: 'Acrylic XF',
    code: 'XF-2',
    name: 'Flat White',
    type: 'acrylic',
    finish: 'flat/matte',
    hexColor: '#FAFAFA',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-tam-xf16',
    brand: 'Tamiya',
    line: 'Acrylic XF',
    code: 'XF-16',
    name: 'Flat Aluminum',
    type: 'acrylic',
    finish: 'metallic',
    hexColor: '#D1D5DB',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-tam-xf56',
    brand: 'Tamiya',
    line: 'Acrylic XF',
    code: 'XF-56',
    name: 'Metallic Grey',
    type: 'acrylic',
    finish: 'metallic',
    hexColor: '#4B5563',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-tam-x23',
    brand: 'Tamiya',
    line: 'Acrylic X',
    code: 'X-23',
    name: 'Clear Blue',
    type: 'acrylic',
    finish: 'clear',
    hexColor: '#1E88E5',
    createdAt: new Date().toISOString()
  },

  // Vallejo - Mecha Color & Model Color
  {
    id: 'pnt-val-70950',
    brand: 'Vallejo',
    line: 'Model Color',
    code: '70.950',
    name: 'Black',
    type: 'acrylic',
    finish: 'flat/matte',
    hexColor: '#111111',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-val-70951',
    brand: 'Vallejo',
    line: 'Model Color',
    code: '70.951',
    name: 'White',
    type: 'acrylic',
    finish: 'flat/matte',
    hexColor: '#FFFFFF',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-val-69008',
    brand: 'Vallejo',
    line: 'Mecha Color',
    code: '69.008',
    name: 'Mecha Red',
    type: 'acrylic',
    finish: 'satin',
    hexColor: '#DC2626',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-val-69011',
    brand: 'Vallejo',
    line: 'Mecha Color',
    code: '69.011',
    name: 'Mecha Dark Blue',
    type: 'acrylic',
    finish: 'satin',
    hexColor: '#1E3A8A',
    createdAt: new Date().toISOString()
  },

  // Gaia Notes
  {
    id: 'pnt-gaia-001',
    brand: 'Gaia Notes',
    line: 'Color',
    code: '001',
    name: 'Pure White',
    type: 'lacquer',
    finish: 'gloss',
    hexColor: '#FFFFFF',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-gaia-002',
    brand: 'Gaia Notes',
    line: 'Color',
    code: '002',
    name: 'Pure Black',
    type: 'lacquer',
    finish: 'gloss',
    hexColor: '#000000',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-gaia-121',
    brand: 'Gaia Notes',
    line: 'Metallic Color',
    code: '121',
    name: 'Star Bright Silver',
    type: 'lacquer',
    finish: 'metallic',
    hexColor: '#E2E8F0',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-gaia-122',
    brand: 'Gaia Notes',
    line: 'Metallic Color',
    code: '122',
    name: 'Star Bright Gold',
    type: 'lacquer',
    finish: 'metallic',
    hexColor: '#D97706',
    createdAt: new Date().toISOString()
  },

  // Citadel
  {
    id: 'pnt-cit-nulnoil',
    brand: 'Citadel',
    line: 'Shade',
    code: 'Nuln Oil',
    name: 'Nuln Oil',
    type: 'acrylic',
    finish: 'flat/matte',
    hexColor: '#262626',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-cit-leadbelcher',
    brand: 'Citadel',
    line: 'Base',
    code: 'Leadbelcher',
    name: 'Leadbelcher',
    type: 'acrylic',
    finish: 'metallic',
    hexColor: '#64748B',
    createdAt: new Date().toISOString()
  },

  // Montana Colors (MTN - Graffiti & Hobby Aerosols)
  {
    id: 'pnt-mtn-rv242',
    brand: 'Montana Colors',
    line: 'MTN 94',
    code: 'RV-242',
    name: 'Negro / Matt Black',
    type: 'spray_graffiti',
    finish: 'flat/matte',
    hexColor: '#121212',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mtn-rv01',
    brand: 'Montana Colors',
    line: 'MTN 94',
    code: 'RV-01',
    name: 'Blanco Blanco / White',
    type: 'spray_graffiti',
    finish: 'flat/matte',
    hexColor: '#FFFFFF',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mtn-rv3012',
    brand: 'Montana Colors',
    line: 'MTN 94',
    code: 'RV-3012',
    name: 'Rojo Madrid / Vivid Red',
    type: 'spray_graffiti',
    finish: 'flat/matte',
    hexColor: '#C8102E',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mtn-rv5005',
    brand: 'Montana Colors',
    line: 'MTN 94',
    code: 'RV-5005',
    name: 'Azul Profundo / Deep Blue',
    type: 'spray_graffiti',
    finish: 'flat/matte',
    hexColor: '#002F6C',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mtn-rv1021',
    brand: 'Montana Colors',
    line: 'MTN 94',
    code: 'RV-1021',
    name: 'Amarillo Canario / Yellow',
    type: 'spray_graffiti',
    finish: 'flat/matte',
    hexColor: '#FFD100',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mtn-rv6018',
    brand: 'Montana Colors',
    line: 'MTN 94',
    code: 'RV-6018',
    name: 'Verde Valle / Field Green',
    type: 'spray_graffiti',
    finish: 'flat/matte',
    hexColor: '#48A23F',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mtn-wb9011',
    brand: 'Montana Colors',
    line: 'MTN Water Based',
    code: 'WB-9011',
    name: 'Carbon Black (Water Based)',
    type: 'spray_graffiti',
    finish: 'flat/matte',
    hexColor: '#1A1A1A',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pnt-mtn-promatte',
    brand: 'Montana Colors',
    line: 'MTN PRO',
    code: 'PRO-Matte',
    name: 'Barniz Acrílico Mate Spray',
    type: 'spray_graffiti',
    finish: 'flat/matte',
    hexColor: '#E2E8F0',
    createdAt: new Date().toISOString()
  }
];
