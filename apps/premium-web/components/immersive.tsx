'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { Tenant } from '@/lib/tenants';

export function Immersive({ tenant }: { tenant: Tenant }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['6%', '-12%']);

  return (
    <section
      id="inmersivo"
      ref={ref}
      className="relative overflow-hidden border-y border-line py-32 sm:py-44"
    >
      <div className="grid-lines absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--color-accent) 13%, transparent), transparent 70%)'
        }}
        aria-hidden="true"
      />

      <motion.div
        style={reduce ? undefined : { x }}
        className="pointer-events-none absolute inset-x-0 top-[80%] -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="wordmark-outline text-center">{tenant.immersiveWord}</div>
      </motion.div>

      <div className="container-editorial relative z-10 text-center">
        <div className="flex justify-center">
          <span className="eyebrow">Inmersivo</span>
        </div>
        <h2 className="display-tight section-title mx-auto mt-6 max-w-[18ch] text-balance">
          {tenant.immersiveTitle}
        </h2>
        <p className="mx-auto mt-6 max-w-[44ch] text-[15px] leading-relaxed text-bone/70">
          {tenant.immersiveBody}
        </p>
      </div>
    </section>
  );
}
