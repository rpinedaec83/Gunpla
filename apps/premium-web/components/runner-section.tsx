'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { Tenant } from '@/lib/tenants';
import { SectionLabel } from './section-label';

export function RunnerSection({ tenant }: { tenant: Tenant }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const pathLength = useTransform(scrollYProgress, [0.08, 0.82], [0.02, 1]);
  const partOpacity = useTransform(scrollYProgress, [0.4, 0.86], [0.12, 1]);

  return (
    <section
      id="precision"
      ref={ref}
      className="runner-stage grain relative overflow-hidden py-24 sm:py-32"
    >
      <div className="container-editorial relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionLabel index="02 / 05">Precision</SectionLabel>
            <h2 className="display-tight section-title mt-6 max-w-[14ch]">{tenant.runnerTitle}</h2>
            <p className="mt-6 max-w-[42ch] text-[15px] leading-relaxed text-bone/70">
              {tenant.runnerBody}
            </p>

            <div className="mt-10 max-w-[260px] border-t border-line pt-5">
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted">
                {tenant.runnerStatLabel}
              </div>
              <div className="mt-2 text-[length:var(--step-1)] font-medium tracking-[-0.02em]">
                {tenant.runnerStat}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <svg
              viewBox="0 0 900 640"
              role="img"
              aria-label="Runner de maqueta dibujado a linea, con partes y etiquetas"
              className="h-auto w-full"
            >
              <motion.g style={reduce ? undefined : { opacity: partOpacity }}>
                <circle className="runner-part" cx="326" cy="62" r="16" />
                <rect className="runner-part" x="594" y="122" width="34" height="28" rx="6" />
                <rect className="runner-part" x="282" y="350" width="36" height="28" rx="6" />
                <circle className="runner-part" cx="604" cy="446" r="17" />
                <rect className="runner-part" x="328" y="552" width="36" height="28" rx="6" />

                <text className="runner-label" x="326" y="34" textAnchor="middle">
                  A1
                </text>
                <text className="runner-label" x="611" y="114" textAnchor="middle">
                  B4
                </text>
                <text className="runner-label" x="300" y="342" textAnchor="middle">
                  C2
                </text>
                <text className="runner-label" x="604" y="418" textAnchor="middle">
                  D1
                </text>
                <text className="runner-label" x="346" y="544" textAnchor="middle">
                  E3
                </text>
              </motion.g>

              <motion.path
                className="runner-line"
                d="M450 10 C450 130 438 210 450 330 C462 450 450 540 450 630"
                style={reduce ? undefined : { pathLength }}
              />
              <motion.path
                className="runner-line"
                d="M450 96 C396 96 372 74 326 62"
                style={reduce ? undefined : { pathLength }}
              />
              <motion.path
                className="runner-line"
                d="M450 170 C512 170 546 146 594 136"
                style={reduce ? undefined : { pathLength }}
              />
              <motion.path
                className="runner-line"
                d="M450 318 C386 318 350 344 300 364"
                style={reduce ? undefined : { pathLength }}
              />
              <motion.path
                className="runner-line"
                d="M450 404 C518 404 556 428 604 446"
                style={reduce ? undefined : { pathLength }}
              />
              <motion.path
                className="runner-line"
                d="M450 522 C400 522 374 540 346 566"
                style={reduce ? undefined : { pathLength }}
              />

              <circle className="runner-part" cx="450" cy="250" r="3" />
              <circle className="runner-part" cx="450" cy="470" r="3" />
              <text className="runner-label" x="860" y="620" textAnchor="end">
                RUNNER A / 1:144
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
