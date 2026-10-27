'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { Tenant } from '@/lib/tenants';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } }
};

const child: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export function Manifesto({ tenant }: { tenant: Tenant }) {
  const reduce = useReducedMotion();
  const words = tenant.manifesto.split(' ');

  return (
    <section id="manifiesto" className="bg-bone text-ink">
      <div className="container-editorial py-28 sm:py-40">
        <div className="flex items-center justify-between gap-6">
          <span className="eyebrow eyebrow--ink">Manifiesto</span>
          <span className="text-[11px] font-medium tracking-[0.16em] text-ink/70">01 / 05</span>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-9">
            {reduce ? (
              <p className="statement">{tenant.manifesto}</p>
            ) : (
              <p className="statement">
                <span className="sr-only">{tenant.manifesto}</span>
                <motion.span
                  aria-hidden="true"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-20% 0px' }}
                >
                  {words.map((word, index) => (
                    <motion.span
                      key={`${word}-${index}`}
                      variants={child}
                      className="inline-block pr-[0.28em]"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.span>
              </p>
            )}
          </div>

          <div className="lg:col-span-3 lg:pt-2">
            <p className="text-sm leading-relaxed text-ink/70">
              Una vista del taller. La misma estructura que usan PlamoScale y GunplaJunkies.
            </p>
            <ul className="mt-6 space-y-3 border-t border-ink/10 pt-6">
              {tenant.manifestoNotes.map((note) => (
                <li key={note} className="text-[13px] text-ink/75">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
