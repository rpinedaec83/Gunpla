import type { Tenant } from '@/lib/tenants';

const covers: Record<Tenant['slug'], string[]> = {
  plamoscale: [
    'linear-gradient(155deg, #3b4a7a 0%, #131826 65%, #0b0d14 100%)',
    'linear-gradient(155deg, #6a4030 0%, #2a1712 65%, #120a08 100%)',
    'linear-gradient(155deg, #2f5546 0%, #12211b 65%, #0a120e 100%)',
    'linear-gradient(155deg, #4d3352 0%, #201426 65%, #0e0912 100%)',
    'linear-gradient(155deg, #5b5636 0%, #242112 65%, #100f08 100%)',
    'linear-gradient(155deg, #35525e 0%, #112028 65%, #081014 100%)'
  ],
  gunplajunkies: [
    'linear-gradient(155deg, #7a2f36 0%, #261014 65%, #12080a 100%)',
    'linear-gradient(155deg, #6b3a28 0%, #24140d 65%, #100806 100%)',
    'linear-gradient(155deg, #4a2f4f 0%, #1c1020 65%, #0c0710 100%)',
    'linear-gradient(155deg, #2f4a5a 0%, #101d24 65%, #070e12 100%)',
    'linear-gradient(155deg, #5a4030 0%, #201610 65%, #0e0907 100%)',
    'linear-gradient(155deg, #39435a 0%, #141822 65%, #080a0e 100%)'
  ]
};

const navigation: Record<Tenant['slug'], string[]> = {
  plamoscale: ['Stash', 'Bitacoras', 'Pinturas', 'Herramientas', 'Tiendas', 'Comunidad'],
  gunplajunkies: ['Coleccion', 'Bitacoras', 'Concursos', 'Hall of Fame', 'Tiendas', 'Comunidad']
};

export function DeviceWindow({ tenant }: { tenant: Tenant }) {
  const items = covers[tenant.slug];

  return (
    <div className="device-window" aria-hidden="true">
      <div className="device-window-bar">
        <span className="device-dot" />
        <span className="device-dot" />
        <span className="device-dot" />
        <div className="device-url">{tenant.domain}/workbench</div>
      </div>

      <div className="device-window-body">
        <aside className="device-sidebar">
          <div className="device-brand">P</div>
          {navigation[tenant.slug].map((item, index) => (
            <span className={`device-nav ${index === 0 ? 'active' : ''}`} key={item}>
              {item}
            </span>
          ))}
        </aside>

        <div className="device-main">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="text-[8px] uppercase tracking-[0.18em] text-muted">
                {tenant.device.mode === 'community' ? 'Comunidad' : 'Coleccion'}
              </div>
              <div className="text-[15px] font-semibold tracking-[-0.02em]">
                {tenant.device.title}
              </div>
            </div>
            <div className="text-[8px] text-muted">{tenant.device.count}</div>
          </div>

          <div className="device-kpis">
            {tenant.device.kpis.map((kpi) => (
              <div className="device-kpi" key={kpi.label}>
                <strong>{kpi.value}</strong>
                <span>{kpi.label}</span>
              </div>
            ))}
          </div>

          <div className="device-grid">
            {tenant.device.kits.map((kit, index) => (
              <div className="device-kit" key={kit.name}>
                <div className="device-kit-cover" style={{ background: items[index] }} />
                <div className="device-kit-meta">
                  <span>{kit.name}</span>
                  <span>{kit.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StashScreen({ tenant }: { tenant: Tenant }) {
  const items = covers[tenant.slug];

  return (
    <>
      <div className="phone-title">Stash</div>
      <div className="phone-sub">{tenant.device.count}, 14 en progreso</div>
      <div className="phone-grid">
        {tenant.device.kits.slice(0, 4).map((kit, index) => (
          <div className="phone-card" key={kit.name}>
            <div className="phone-card-cover" style={{ background: items[index] }} />
            <div className="phone-card-meta">
              <span>{kit.name}</span>
              <span>{kit.meta}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function LogScreen({ tenant }: { tenant: Tenant }) {
  const steps = [
    { label: 'Limpieza de gates', note: 'Hoy, 18:40', done: true },
    { label: 'Panel lining', note: 'Ayer, 21:10', done: true },
    { label: 'Imprimacion', note: 'Pendiente', done: false },
    { label: 'Capa final', note: 'Pendiente', done: false }
  ];

  return (
    <>
      <div className="phone-title">Bitacora</div>
      <div className="phone-sub">
        {tenant.slug === 'gunplajunkies' ? 'MG Unicorn, dia 12' : 'RG 2.0 Unicorn, dia 12'}
      </div>
      <div className="phone-timeline">
        {steps.map((step) => (
          <div className="phone-step" key={step.label}>
            <span className={`phone-step-dot ${step.done ? 'done' : ''}`} />
            <div>
              <div className="phone-step-label">{step.label}</div>
              <div className="phone-step-note">{step.note}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PaintsScreen({ tenant }: { tenant: Tenant }) {
  const paints = [
    { name: 'Mr. Color', code: 'C-032', color: '#7c8fb5' },
    { name: 'Tamiya Acrylic', code: 'XF-63', color: '#6b7357' },
    { name: 'Vallejo Model', code: '70.950', color: '#b8a48c' },
    { name: 'Mr. Surfacer', code: '1500', color: '#8d8d90' },
    { name: 'Topcoat', code: 'B-513', color: '#d9d6cf' }
  ];

  return (
    <>
      <div className="phone-title">Pinturas</div>
      <div className="phone-sub">Rack, stock y equivalencias</div>
      <div className="mt-3">
        {paints.map((paint) => (
          <div className="phone-paint-row" key={paint.code}>
            <span className="phone-swatch" style={{ background: paint.color }} />
            <span className="phone-paint-name">{paint.name}</span>
            <span className="phone-paint-code">{paint.code}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-[10px] border border-line/60 p-2">
        <div className="text-[8px] uppercase tracking-[0.14em] text-muted">Mezcla sugerida</div>
        <div className="mt-1 text-[10px] font-medium">C-032 + C-097, 3:1</div>
      </div>
    </>
  );
}

function ContestScreen({ tenant }: { tenant: Tenant }) {
  const entries = [
    { name: 'Unicorn Full Armor', score: '38.5', place: '01' },
    { name: 'Sazabi Ver.Ka', score: '37.2', place: '02' },
    { name: 'Barbatos Lupus', score: '36.8', place: '03' }
  ];

  return (
    <>
      <div className="phone-title">Concurso</div>
      <div className="phone-sub">GBWC local, categoria abierta</div>
      <div className="mt-3 space-y-2">
        {entries.map((entry) => (
          <div
            className="flex items-center justify-between rounded-[10px] border border-line/60 px-2.5 py-2"
            key={entry.name}
          >
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold text-muted">{entry.place}</span>
              <span className="text-[9px] font-medium">{entry.name}</span>
            </div>
            <span className="text-[9px] tabular-nums text-muted">{entry.score}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-[10px] border border-line/60 p-2">
        <div className="text-[8px] uppercase tracking-[0.14em] text-muted">Mi puntaje</div>
        <div className="mt-1 flex items-end justify-between">
          <span className="text-[18px] font-semibold tracking-[-0.03em]">36.4</span>
          <span className="text-[8px] text-muted">4 criterios</span>
        </div>
      </div>
      <div className="mt-2 text-[8px] text-muted">{tenant.name} / jurado y voto comunitario</div>
    </>
  );
}

export type PhoneVariant = 'stash' | 'log' | 'paints' | 'contest';

export function DevicePhone({
  tenant,
  variant = 'stash'
}: {
  tenant: Tenant;
  variant?: PhoneVariant;
}) {
  return (
    <div className="device-phone" aria-hidden="true">
      <div className="device-phone-screen">
        <div className="phone-island" />
        <div className="phone-status">
          <span>9:41</span>
          <span>{tenant.name}</span>
        </div>
        <div className="phone-body">
          {variant === 'stash' && <StashScreen tenant={tenant} />}
          {variant === 'log' && <LogScreen tenant={tenant} />}
          {variant === 'paints' && <PaintsScreen tenant={tenant} />}
          {variant === 'contest' && <ContestScreen tenant={tenant} />}
        </div>
      </div>
    </div>
  );
}
