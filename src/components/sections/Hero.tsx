'use client';

import React from 'react';
import Link from 'next/link';

import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function Hero() {
  const { dict, lang, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      {/* Animated Background Elements */}
      <div className="network-pattern" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-float animation-delay-300" />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float animation-delay-500" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <AnimatedSection animation="fade-down" delay={0}>
            <div className="flex justify-center mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-white.png"
                alt="Qoura AI"
                className="h-28 w-auto"
              />
            </div>
          </AnimatedSection>

          {/* Badge */}
          <AnimatedSection animation="fade-down" delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-white/90">
                {lang === 'ar' ? 'الرائدون في حلول الذكاء الاصطناعي في الإمارات' : 'Leading AI Solutions in UAE'}
              </span>
            </div>
          </AnimatedSection>

          {/* Title */}
          <AnimatedSection animation="fade-up" delay={200}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {dict.hero.title}
            </h1>
          </AnimatedSection>

          {/* Subtitle */}
          <AnimatedSection animation="fade-up" delay={300}>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              {dict.hero.subtitle}
            </p>
          </AnimatedSection>

          {/* CTA Buttons */}
          <AnimatedSection animation="fade-up" delay={400}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button variant="secondary" size="lg" className="group">
                  {dict.hero.cta1}
                  <Arrow className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
                  {dict.hero.cta2}
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          {/* Trust indicators */}
          <AnimatedSection animation="fade-up" delay={500}>
            <div className="mt-16 pt-8 border-t border-white/10">
              <p className="text-white/60 text-sm mb-6">
                {lang === 'ar' ? 'موثوقون من قبل' : 'Trusted by'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  { ar: 'ديوان ولي العهد', en: 'Crown Prince Court' },
                  { ar: 'أدنوك', en: 'ADNOC' },
                  { ar: 'صندوق خليفة', en: 'Khalifa Fund' },
                ].map((client, index) => (
                  <div
                    key={index}
                    className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full
                              text-white/90 text-sm font-semibold hover:bg-white/20 transition-all duration-300"
                  >
                    {lang === 'ar' ? client.ar : client.en}
                  </div>
                ))}
              </div>
              <p className="text-white/50 text-sm mt-4">
                {lang === 'ar' ? '+5000 رائد أعمال تم تدريبهم' : '5,000+ Entrepreneurs Trained'}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/50 rounded-full animate-slide-up" />
        </div>
      </div>
    </section>
  );
}
