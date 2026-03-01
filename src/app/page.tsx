'use client';

import { Hero } from '@/components/sections/Hero';
import { Stats } from '@/components/sections/Stats';
import { Services } from '@/components/sections/Services';
import { Culture } from '@/components/sections/Culture';
import { Credibility } from '@/components/sections/Credibility';
import { CTA } from '@/components/sections/CTA';

export default function HomePage() {
  return (
    <div className="page-transition">
      <Hero />
      <Stats />
      <Services />
      <Culture />
      <Credibility />
      <CTA />
    </div>
  );
}
