'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { Tenant } from '@/lib/tenants';
import { DevicePhone, DeviceWindow } from './device-mockups';

export function HeroDevice({ tenant }: { tenant: Tenant }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -50]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.97, 1, 1.015]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -84]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1020px]">
      <motion.div style={reduce ? undefined : { y, scale }} className="relative">
        <div className="hidden sm:block">
          <DeviceWindow tenant={tenant} />
        </div>
        <motion.div
          style={reduce ? undefined : { y: phoneY }}
          className="mt-10 flex justify-center sm:absolute sm:-bottom-14 sm:right-4 sm:mt-0 lg:-right-8"
        >
          <div className="rotate-2">
            <DevicePhone tenant={tenant} variant={tenant.device.phone} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
