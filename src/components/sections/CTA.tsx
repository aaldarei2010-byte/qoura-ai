'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Phone, Mail, Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/Button';

export function CTA() {
  const { dict, lang, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const contactOptions = [
    {
      icon: Calendar,
      title: lang === 'ar' ? 'احجز ورشة' : 'Book a Workshop',
      description: lang === 'ar'
        ? 'ورش تدريبية مخصصة لفريقكم'
        : 'Customized training workshops for your team',
      cta: dict.cta.workshop,
      href: '/contact',
    },
    {
      icon: Phone,
      title: lang === 'ar' ? 'احجز مكالمة' : 'Book a Call',
      description: lang === 'ar'
        ? 'استشارة مجانية لمناقشة احتياجاتكم'
        : 'Free consultation to discuss your needs',
      cta: dict.cta.call,
      href: '/contact',
    },
    {
      icon: Mail,
      title: lang === 'ar' ? 'أرسل استفسار' : 'Send Inquiry',
      description: lang === 'ar'
        ? 'راسلنا وسنرد خلال 24 ساعة'
        : 'Message us and we\'ll respond within 24 hours',
      cta: dict.cta.inquiry,
      href: '/contact',
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            {lang === 'ar' ? 'ابدأ رحلتك مع الذكاء الاصطناعي' : 'Start Your AI Journey'}
          </h2>
          <p className="text-lg text-brand-darkGray max-w-2xl mx-auto">
            {lang === 'ar'
              ? 'تواصل معنا اليوم واكتشف كيف يمكننا مساعدتك في تحقيق أهدافك'
              : 'Contact us today and discover how we can help you achieve your goals'}
          </p>
        </AnimatedSection>

        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {contactOptions.map((option, index) => (
            <AnimatedSection
              key={index}
              animation="fade-up"
              delay={index * 100}
            >
              <div className="group bg-brand-lightGray rounded-2xl p-8 text-center
                            hover:bg-black hover:shadow-2xl transition-all duration-500
                            hover:-translate-y-2">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-black/10
                              group-hover:bg-primary-500/20 flex items-center justify-center
                              transition-colors duration-500">
                  <option.icon className="w-8 h-8 text-black group-hover:text-white transition-colors duration-500" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-black group-hover:text-white mb-3 transition-colors duration-500">
                  {option.title}
                </h3>

                {/* Description */}
                <p className="text-brand-darkGray group-hover:text-white/80 mb-6 transition-colors duration-500">
                  {option.description}
                </p>

                {/* CTA Button */}
                <Link href={option.href}>
                  <Button
                    variant="outline"
                    className="group-hover:border-white group-hover:text-white
                              group-hover:hover:bg-primary-500 group-hover:hover:border-primary-500"
                  >
                    {option.cta}
                    <Arrow className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Bottom text */}
        <AnimatedSection animation="fade-up" delay={400} className="text-center mt-16">
          <p className="text-brand-darkGray">
            {lang === 'ar'
              ? 'أو تواصل معنا مباشرة على '
              : 'Or contact us directly at '}
            <a
              href="mailto:info@qoura.ai"
              className="text-primary-500 hover:text-primary-700 transition-colors font-medium"
            >
              info@qoura.ai
            </a>
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
