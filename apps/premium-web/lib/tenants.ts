export type TenantSlug = 'plamoscale' | 'gunplajunkies';

export type TenantSpec = {
  value: string;
  label: string;
};

export type TenantFeature = {
  index: string;
  title: string;
  body: string;
  meta: string;
};

export type TenantVitrine = {
  title: string;
  body: string;
  credit: string;
  alt: string;
  image: 'plamoscale' | 'gunplajunkies';
  href: string;
};

export type TenantStep = {
  label: string;
  title: string;
  body: string;
};

export type Tenant = {
  slug: TenantSlug;
  name: string;
  domain: string;
  appUrl: string;
  accent: string;
  eyebrow: string;
  headline: [string, string];
  intro: string;
  heroMeta: string;
  heroNote: string;
  nav: { href: string; label: string }[];
  manifesto: string;
  manifestoNotes: string[];
  runnerTitle: string;
  runnerBody: string;
  runnerStat: string;
  runnerStatLabel: string;
  steps: TenantStep[];
  features: TenantFeature[];
  vitrine: TenantVitrine;
  immersiveWord: string;
  immersiveTitle: string;
  immersiveBody: string;
  specs: TenantSpec[];
  ctaTitle: string;
  ctaBody: string;
  ctaPrimary: string;
  ctaSecondary: string;
  alternate: { label: string; href: string };
  device: {
    mode: 'stash' | 'community';
    title: string;
    count: string;
    kpis: { value: string; label: string }[];
    kits: { name: string; meta: string }[];
    phone: 'paints' | 'contest';
  };
};

const sharedNav = [
  { href: '#producto', label: 'Producto' },
  { href: '#vitrina', label: 'Vitrina' },
  { href: '#precision', label: 'Precision' },
  { href: '#herramientas', label: 'Herramientas' },
  { href: '#acceso', label: 'Acceso' }
];

export const plamoscale: Tenant = {
  slug: 'plamoscale',
  name: 'PlamoScale',
  domain: 'plamoscale.com',
  appUrl: 'https://plamoscale.com/workbench',
  accent: '#2a63f0',
  eyebrow: 'PlamoScale 2026',
  headline: ['El taller,', 'en otra escala.'],
  intro:
    'Stash, bitacoras, pinturas y herramientas en un solo sistema. Para quien trata cada pieza como un oficio.',
  heroMeta: 'Edicion 01 / Modelismo a escala',
  heroNote: 'Migrado desde plamoscale.com y gunplajunkies.com.',
  nav: sharedNav,
  manifesto:
    'No es una app de inventario. Es la memoria de tu taller, ordenada pieza por pieza, para que nada se pierda entre una caja y la siguiente.',
  manifestoNotes: ['92 fotografias migradas', '4 colecciones fundadoras', '2 comunidades activas'],
  runnerTitle: 'Cada grapa cuenta.',
  runnerBody:
    'Del primer corte al ultimo topcoat, el runner deja de ser un desecho. Se convierte en el registro de como se construyo la pieza.',
  runnerStat: '1:144 a 1:35',
  runnerStatLabel: 'Escalas soportadas',
  steps: [
    {
      label: 'Registra',
      title: 'Cada kit entra con contexto.',
      body: 'Marca, escala, grado, precio y estado. El stash deja de ser una caja y empieza a ser una coleccion.'
    },
    {
      label: 'Documenta',
      title: 'La bitacora se lee como un proceso.',
      body: 'Pasos, fotos y recetas de pintura en orden. Lo que hiciste, cuando lo hiciste y por que.'
    },
    {
      label: 'Pinta',
      title: 'La mezcla deja de ser intuicion.',
      body: 'Ratios, PSI y equivalencias calculadas para tu aerografo, con la quimica correcta.'
    }
  ],
  features: [
    {
      index: '01',
      title: 'Stash con memoria',
      body: '92 kits, 6 escalas, un solo lugar. Busca por marca, grado o estado sin abrir una hoja de calculo.',
      meta: 'Stash'
    },
    {
      index: '02',
      title: 'Bitacoras que se leen',
      body: 'Cada build se documenta como un proceso, no como un album. Fotos, pasos y recetas conectadas.',
      meta: 'Bitacoras'
    },
    {
      index: '03',
      title: 'Pintura, medida',
      body: 'Cinco quimicas, equivalencias entre marcas y calculadora de dilucion con clima real.',
      meta: 'Pinturas'
    }
  ],
  vitrine: {
    title: 'El resultado se ve. El proceso queda.',
    body: 'Cada build termina en una foto, pero empieza en una decision. La bitacora guarda las dos, con la receta y el contexto.',
    credit: 'Build de @fog1labs1',
    alt: 'Mecha weathering blanco con espada de cadena sobre fondo claro',
    image: 'plamoscale',
    href: 'https://plamoscale.com/showcase'
  },
  immersiveWord: 'TALLER',
  immersiveTitle: 'Hecho para la mesa de trabajo.',
  immersiveBody: 'Sin menus de mas. Sin ruido. Solo tu, la pieza y el siguiente paso.',
  specs: [
    { value: '1:144 a 1:35', label: 'Escalas' },
    { value: '5', label: 'Quimicas de pintura' },
    { value: '4', label: 'Modulos conectados' },
    { value: 'Offline', label: 'Trabajo sin conexion' }
  ],
  ctaTitle: 'Abre tu taller.',
  ctaBody: 'Tu coleccion ya existe. Dale un lugar donde crecer.',
  ctaPrimary: 'Entrar a PlamoScale',
  ctaSecondary: 'Conocer GunplaJunkies',
  alternate: { label: 'GunplaJunkies', href: 'https://gunplajunkies.com' },
  device: {
    mode: 'stash',
    title: 'Mi stash',
    count: '92 kits',
    kpis: [
      { value: '92', label: 'Kits' },
      { value: '14', label: 'En progreso' },
      { value: '6', label: 'Escalas' }
    ],
    kits: [
      { name: 'RX-78-2', meta: 'RG 1/144' },
      { name: 'Unicorn', meta: 'MG 1/100' },
      { name: 'Barbatos', meta: 'HG 1/144' },
      { name: 'Sazabi', meta: 'MG 1/100' },
      { name: 'Zaku II', meta: 'RG 1/144' },
      { name: 'Aerial', meta: 'FM 1/100' }
    ],
    phone: 'paints'
  }
};

export const gunplajunkies: Tenant = {
  slug: 'gunplajunkies',
  name: 'GunplaJunkies',
  domain: 'gunplajunkies.com',
  appUrl: 'https://gunplajunkies.com/workbench',
  accent: '#d23b40',
  eyebrow: 'GunplaJunkies 2026',
  headline: ['El mecha,', 'en su vitrina.'],
  intro:
    'Stash, bitacoras, concursos y comunidad para quien vive el Gunpla como cultura, no como pasatiempo.',
  heroMeta: 'Edicion 01 / Mecha y ciencia ficcion',
  heroNote: 'La comunidad de Gunpla de habla hispana.',
  nav: sharedNav,
  manifesto:
    'No es una galeria. Es el archivo de tus builds, con el contexto que una foto sola nunca cuenta.',
  manifestoNotes: ['4 colecciones fundadoras', 'Concursos con jurado', 'Hall of Fame permanente'],
  runnerTitle: 'Cada corte deja una marca.',
  runnerBody:
    'El Gunpla se construye dos veces: en la mesa y en la memoria. Documenta la segunda.',
  runnerStat: '1:144 a 1:60',
  runnerStatLabel: 'Escalas de mecha',
  steps: [
    {
      label: 'Registra',
      title: 'Tu coleccion, sin planillas.',
      body: 'Kits por grado, escala y estado. Se acabo el inventario en notas sueltas.'
    },
    {
      label: 'Documenta',
      title: 'El proceso es la obra.',
      body: 'Pasos, fotos y recetas listas para presentar. El jurado ve como se construyo, no solo el resultado.'
    },
    {
      label: 'Compite',
      title: 'El podio tambien se documenta.',
      body: 'Inscribe tu build, recibe puntaje del jurado y compite por el reconocimiento de la comunidad.'
    }
  ],
  features: [
    {
      index: '01',
      title: 'Stash de mecha',
      body: 'Grados, escalas y estado en un solo lugar. Tu coleccion deja de vivir en la memoria.',
      meta: 'Stash'
    },
    {
      index: '02',
      title: 'Bitacoras de concurso',
      body: 'Cada paso queda registrado con fotos y recetas. Presenta el proceso, no solo la vitrina.',
      meta: 'Bitacoras'
    },
    {
      index: '03',
      title: 'Hall of Fame',
      body: 'Podios, insignias y certificados digitales que quedan en el archivo de la comunidad.',
      meta: 'Comunidad'
    }
  ],
  vitrine: {
    title: 'La vitrina empieza en la mesa.',
    body: 'Un build no se explica con una sola foto. La bitacora guarda los cortes, las mezclas y las decisiones que lo hicieron posible.',
    credit: 'Build de @fog1labs1',
    alt: 'Gundam Nu con acabado limpio sobre fondo rojo',
    image: 'gunplajunkies',
    href: 'https://gunplajunkies.com/showcase'
  },
  immersiveWord: 'GUNPLA',
  immersiveTitle: 'La mesa es el primer ring.',
  immersiveBody: 'Cada build empieza en silencio y termina en vitrina. El proceso es la obra.',
  specs: [
    { value: '1:144 a 1:60', label: 'Escalas de mecha' },
    { value: '5', label: 'Quimicas de pintura' },
    { value: '4', label: 'Modulos conectados' },
    { value: 'Comunidad', label: 'Concursos y podios' }
  ],
  ctaTitle: 'Entra al taller.',
  ctaBody: 'Tu proximo build merece un archivo.',
  ctaPrimary: 'Abrir GunplaJunkies',
  ctaSecondary: 'Ver PlamoScale',
  alternate: { label: 'PlamoScale', href: 'https://plamoscale.com' },
  device: {
    mode: 'community',
    title: 'Mi coleccion',
    count: '48 kits',
    kpis: [
      { value: '48', label: 'Kits' },
      { value: '9', label: 'En progreso' },
      { value: '4', label: 'Concursos' }
    ],
    kits: [
      { name: 'Unicorn', meta: 'MG 1/100' },
      { name: 'Sazabi', meta: 'MG 1/100' },
      { name: 'Strike', meta: 'PG 1/60' },
      { name: 'Barbatos', meta: 'HG 1/144' },
      { name: 'Red Frame', meta: 'MG 1/100' },
      { name: 'Wing Zero', meta: 'RG 1/144' }
    ],
    phone: 'contest'
  }
};

export const tenants: Record<TenantSlug, Tenant> = {
  plamoscale,
  gunplajunkies
};
