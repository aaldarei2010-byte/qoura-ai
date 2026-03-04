'use client';

import Link from 'next/link';
import { Brain, Gamepad2, Bot, Palette, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/Button';

const featureIcons = [Brain, Gamepad2, Bot, Palette, ShieldCheck];
const featureColors = [
  { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600' },
  { bg: 'from-cyan-500 to-blue-600', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600' },
  { bg: 'from-indigo-500 to-blue-700', light: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' },
  { bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
  { bg: 'from-emerald-500 to-green-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
];

export function ChildrenProgram() {
  const { dict, lang, dir } = useLanguage();
  const cp = dict.childrenProgram;

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-violet-50/30 to-white">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-violet-300/20 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl" />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-pink-300/15 rounded-full blur-2xl" />
        {/* Floating stars */}
        {[...Array(6)].map((_, i) => (
          <Star
            key={i}
            className="absolute text-yellow-400/20 animate-pulse"
            style={{
              top: `${15 + i * 15}%`,
              left: `${5 + i * 18}%`,
              width: `${12 + (i % 3) * 6}px`,
              height: `${12 + (i % 3) * 6}px`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-medium mb-6 shadow-lg shadow-violet-500/25">
            <Sparkles className="w-4 h-4" />
            {cp.badge}
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {cp.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-3">
            {cp.subtitle}
          </p>
          <span className="inline-block bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-medium">
            {cp.ageGroup}
          </span>
          <div className="w-20 h-1 bg-gradient-to-r from-violet-500 to-purple-600 mx-auto mt-6 rounded-full" />
        </AnimatedSection>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {cp.features.map((feature, index) => {
            const Icon = featureIcons[index];
            const color = featureColors[index];
            return (
              <AnimatedSection
                key={index}
                animation="fade-up"
                delay={index * 150}
              >
                <div
                  className={`group relative ${color.light} rounded-3xl p-7 border ${color.border}
                             hover:border-transparent transition-all duration-500 hover:shadow-xl hover:-translate-y-2 h-full`}
                >
                  {/* Hover overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${color.bg} rounded-3xl
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color.bg}
                                 flex items-center justify-center shadow-lg mb-5
                                 group-hover:bg-white/20 transition-all duration-500`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-3 transition-colors duration-500">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 group-hover:text-white/90 text-sm leading-relaxed transition-colors duration-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* CTA */}
        <AnimatedSection animation="fade-up" delay={600} className="text-center">
          <Link href="/contact">
            <Button variant="primary" size="lg" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 text-white border-0">
              {cp.cta}
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
