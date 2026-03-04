'use client';

import { Hero } from '@/components/sections/Hero';
import { Stats } from '@/components/sections/Stats';
import { Services } from '@/components/sections/Services';
import { ChildrenProgram } from '@/components/sections/ChildrenProgram';
import { Culture } from '@/components/sections/Culture';
import { Credibility } from '@/components/sections/Credibility';
import { CTA } from '@/components/sections/CTA';

export default function HomePage() {
  return (
    <div className="page-transition">
      <Hero />
      <Stats />
      <Services />
      <ChildrenProgram />
      <Culture />
      <Credibility />
      <CTA />
    </div>
  );
}
