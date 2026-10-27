import type { ReactNode } from 'react';

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="eyebrow">{children}</span>
      <span className="text-[11px] font-medium tracking-[0.16em] text-muted">{index}</span>
    </div>
  );
}
