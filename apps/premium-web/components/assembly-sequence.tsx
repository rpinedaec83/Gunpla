'use client';

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform
} from 'framer-motion';
import { useRef, useState } from 'react';
import type { Tenant } from '@/lib/tenants';
import { DevicePhone, type PhoneVariant } from './device-mockups';
import { SectionLabel } from './section-label';

function SequenceCopy({ title }: { title: string }) {
  return (
    <>
      <SectionLabel index="03 / 05">Secuencia</SectionLabel>
      <h2 className="display-tight section-title mt-6 max-w-[14ch]">{title}</h2>
    </>
  );
}

export function AssemblySequence({ tenant }: { tenant: Tenant }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [step, setStep] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const next = value < 0.34 ? 0 : value < 0.67 ? 1 : 2;
    setStep((current) => (current === next ? current : next));
  });

  const firstOpacity = useTransform(scrollYProgress, [0, 0.28, 0.36], [1, 1, 0]);
  const secondOpacity = useTransform(scrollYProgress, [0.3, 0.38, 0.62, 0.7], [0, 1, 1, 0]);
  const thirdOpacity = useTransform(scrollYProgress, [0.64, 0.72, 1], [0, 1, 1]);

  const screens: PhoneVariant[] = ['stash', 'log', tenant.device.phone];
  const title =
    tenant.slug === 'gunplajunkies' ? 'Del sprue al podio.' : 'De la caja a la vitrina.';

  if (reduce) {
    return (
      <section id="secuencia" className="bg-base">
        <div className="container-editorial py-24 sm:py-32">
          <SequenceCopy title={title} />
          <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {tenant.steps.map((item, index) => (
              <div key={item.label} className="space-y-6">
                <DevicePhone tenant={tenant} variant={screens[index]} />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted">
                    {item.label}
                  </div>
                  <h3 className="mt-2 text-[length:var(--step-1)] font-medium tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="secuencia" className="bg-base">
      <div className="container-editorial py-24 lg:hidden">
        <SequenceCopy title={title} />
        <div className="mt-12 space-y-14">
          {tenant.steps.map((item, index) => (
            <div key={item.label}>
              <div className="flex justify-center">
                <DevicePhone tenant={tenant} variant={screens[index]} />
              </div>
              <div className="mt-6">
                <div className="text-[11px] uppercase tracking-[0.16em] text-muted">
                  {item.label}
                </div>
                <h3 className="mt-2 text-[length:var(--step-1)] font-medium tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative hidden h-[300vh] lg:block" ref={ref}>
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
          <div className="container-editorial grid w-full items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SequenceCopy title={title} />

              <div className="relative mt-10 pl-7">
                <div className="absolute left-0 top-0 h-full w-px bg-line" aria-hidden="true" />
                <motion.div
                  className="absolute left-0 top-0 h-full w-px origin-top bg-bone"
                  style={{ scaleY: scrollYProgress }}
                  aria-hidden="true"
                />

                <div className="space-y-9">
                  {tenant.steps.map((item, index) => {
                    const active = step === index;
                    return (
                      <div key={item.label} className="relative">
                        <span
                          className={`absolute -left-[30px] top-1.5 h-2 w-2 rounded-full transition-colors duration-500 ${
                            active ? 'bg-bone' : 'bg-bone/25'
                          }`}
                          aria-hidden="true"
                        />
                        <div
                          className={`transition-opacity duration-500 ${
                            active ? 'opacity-100' : 'opacity-35'
                          }`}
                        >
                          <div className="text-[11px] uppercase tracking-[0.16em] text-muted">
                            {item.label}
                          </div>
                          <h3 className="mt-1 text-[length:var(--step-1)] font-medium tracking-[-0.02em]">
                            {item.title}
                          </h3>
                          {active && (
                            <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted">
                              {item.body}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative flex h-[560px] items-center justify-center">
                <div
                  className="absolute h-[430px] w-[430px] rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 68%)'
                  }}
                  aria-hidden="true"
                />

                <motion.div className="absolute" style={{ opacity: firstOpacity }}>
                  <DevicePhone tenant={tenant} variant="stash" />
                </motion.div>
                <motion.div className="absolute" style={{ opacity: secondOpacity }}>
                  <DevicePhone tenant={tenant} variant="log" />
                </motion.div>
                <motion.div className="absolute" style={{ opacity: thirdOpacity }}>
                  <DevicePhone tenant={tenant} variant={tenant.device.phone} />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
