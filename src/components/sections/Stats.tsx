'use client';

import { Users, Building2, Presentation, ThumbsUp } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection, AnimatedCounter } from '@/components/ui/AnimatedSection';

export function Stats() {
  const { dict } = useLanguage();

  const stats = [
    {
      icon: Users,
      value: 5000,
      suffix: '+',
      label: dict.stats.trainees,
      color: 'from-black to-brand-darkGray',
    },
    {
      icon: Building2,
      value: 50,
      suffix: '+',
      label: dict.stats.organizations,
      color: 'from-primary-500 to-primary-700',
    },
    {
      icon: Presentation,
      value: 150,
      suffix: '+',
      label: dict.stats.workshops,
      color: 'from-primary-600 to-primary-800',
    },
    {
      icon: ThumbsUp,
      value: 98,
      suffix: '%',
      label: dict.stats.satisfaction,
      color: 'from-black to-primary-900',
    },
  ];

  return (
    <section className="py-20 bg-brand-lightGray relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-mesh opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            {dict.stats.title}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-black to-primary-500 mx-auto rounded-full" />
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <AnimatedSection
              key={stat.label}
              animation="scale"
              delay={index * 100}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center">
                {/* Icon */}
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color}
                             flex items-center justify-center shadow-lg
                             group-hover:scale-110 transition-transform duration-500`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>

                {/* Number */}
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <p className="text-brand-darkGray font-medium">{stat.label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
