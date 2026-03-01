'use client';

import Link from 'next/link';
import { GraduationCap, MessageSquareText, Cpu, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/Button';

export function Services() {
  const { dict, lang, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const services = [
    {
      icon: GraduationCap,
      title: dict.services.training.title,
      description: dict.services.training.description,
      href: '/programs',
      gradient: 'from-black to-brand-darkGray',
      bgGradient: 'from-gray-50 to-orange-50',
    },
    {
      icon: MessageSquareText,
      title: dict.services.consulting.title,
      description: dict.services.consulting.description,
      href: '/consulting',
      gradient: 'from-primary-500 to-primary-700',
      bgGradient: 'from-orange-50 to-amber-50',
    },
    {
      icon: Cpu,
      title: dict.services.solutions.title,
      description: dict.services.solutions.description,
      href: '/consulting',
      gradient: 'from-brand-darkGray to-black',
      bgGradient: 'from-gray-50 to-gray-100',
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            {dict.services.title}
          </h2>
          <p className="text-lg text-brand-darkGray max-w-2xl mx-auto">
            {dict.services.subtitle}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-black to-primary-500 mx-auto mt-6 rounded-full" />
        </AnimatedSection>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <AnimatedSection
              key={service.title}
              animation="fade-up"
              delay={index * 150}
            >
              <div
                className={`group relative bg-gradient-to-br ${service.bgGradient} rounded-3xl p-8
                           border border-gray-100 hover:border-transparent
                           transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full`}
              >
                {/* Hover overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-3xl
                             opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient}
                               flex items-center justify-center shadow-lg mb-6
                               group-hover:bg-white transition-all duration-500`}
                  >
                    <service.icon className="w-8 h-8 text-white group-hover:text-black transition-colors duration-500" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-black group-hover:text-white mb-4 transition-colors duration-500">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-brand-darkGray group-hover:text-white/90 mb-6 transition-colors duration-500 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Link */}
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-2 text-black group-hover:text-primary-500 font-medium
                              transition-colors duration-500"
                  >
                    {dict.cta.learnMore}
                    <Arrow className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection animation="fade-up" delay={500} className="text-center mt-16">
          <Link href="/contact">
            <Button variant="secondary" size="lg">
              {dict.cta.inquiry}
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
