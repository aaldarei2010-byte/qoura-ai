'use client';

import { Check, Star } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function Culture() {
  const { dict, lang } = useLanguage();

  return (
    <section className="py-24 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="culture-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M0 40 L40 0 L80 40 L40 80 Z"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#culture-pattern)" />
        </svg>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border border-white/10 rounded-full animate-float" />
      <div className="absolute bottom-20 right-10 w-48 h-48 border border-white/10 rounded-full animate-float animation-delay-300" />
      <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-primary-500/50 rounded-full animate-pulse-glow" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white/30 rounded-full animate-pulse-glow animation-delay-500" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimatedSection animation="fade-right">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                <Star className="w-4 h-4 text-primary-500" />
                <span className="text-sm">
                  {lang === 'ar' ? 'من نحن' : 'About Us'}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {dict.culture.title}
              </h2>

              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                {dict.culture.subtitle}
              </p>

              {/* Points */}
              <ul className="space-y-4">
                {dict.culture.points.map((point, index) => (
                  <AnimatedSection
                    key={index}
                    animation="fade-left"
                    delay={index * 100}
                  >
                    <li className="flex items-start gap-3 group">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center
                                     group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                        <Check className="w-4 h-4 text-primary-500 group-hover:text-white transition-colors" />
                      </span>
                      <span className="text-white/90 group-hover:text-white transition-colors">
                        {point}
                      </span>
                    </li>
                  </AnimatedSection>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Visual Element */}
          <AnimatedSection animation="fade-left" delay={200}>
            <div className="relative">
              {/* Main card */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="text-center">
                  {/* Logo */}
                  <div className="flex justify-center mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo-white.png"
                      alt="Qoura AI"
                      className="h-20 w-auto"
                    />
                  </div>

                  {/* UAE Flag colors representation */}
                  <div className="flex justify-center gap-2 mb-6">
                    <div className="w-3 h-12 bg-green-500 rounded-full" />
                    <div className="w-3 h-12 bg-white rounded-full" />
                    <div className="w-3 h-12 bg-black rounded-full" />
                    <div className="w-3 h-12 bg-red-500 rounded-full" />
                  </div>

                  <p className="text-white/70 text-sm mb-6">
                    {lang === 'ar'
                      ? 'شركة إماراتية متخصصة في الذكاء الاصطناعي'
                      : 'Emirati company specialized in AI'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-8">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-primary-500">5000+</div>
                      <div className="text-white/70 text-xs">
                        {lang === 'ar' ? 'متدرب' : 'Trainees'}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-primary-500">50+</div>
                      <div className="text-white/70 text-xs">
                        {lang === 'ar' ? 'شريك' : 'Partners'}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-primary-500">100%</div>
                      <div className="text-white/70 text-xs">
                        {lang === 'ar' ? 'محتوى محلي' : 'Local Content'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-500/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl" />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
