'use client';

import { Building2, Award, Shield, CheckCircle2, Users } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function Credibility() {
  const { dict, lang } = useLanguage();

  const partners = [
    {
      type: lang === 'ar' ? 'ديوان ولي العهد' : 'Crown Prince Court',
      icon: Building2,
    },
    {
      type: lang === 'ar' ? 'أدنوك' : 'ADNOC',
      icon: Shield,
    },
    {
      type: lang === 'ar' ? 'صندوق خليفة' : 'Khalifa Fund',
      icon: Award,
    },
    {
      type: lang === 'ar' ? '+5000 رائد أعمال' : '5,000+ Entrepreneurs',
      icon: Users,
    },
  ];

  const achievements = [
    {
      label: lang === 'ar' ? 'شراكات ناجحة' : 'Successful Partnerships',
      value: '50+',
    },
    {
      label: lang === 'ar' ? 'نسبة إعادة التعاون' : 'Repeat Collaboration Rate',
      value: '85%',
    },
    {
      label: lang === 'ar' ? 'مشاريع منفذة' : 'Projects Delivered',
      value: '200+',
    },
  ];

  return (
    <section className="py-24 bg-brand-lightGray relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-radial" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            {dict.credibility.title}
          </h2>
          <p className="text-lg text-brand-darkGray max-w-2xl mx-auto">
            {dict.credibility.subtitle}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-black to-primary-500 mx-auto mt-6 rounded-full" />
        </AnimatedSection>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {partners.map((partner, index) => (
            <AnimatedSection
              key={index}
              animation="scale"
              delay={index * 50}
            >
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300
                            hover:-translate-y-1 text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-black/5 flex items-center justify-center
                              group-hover:bg-black group-hover:scale-110 transition-all duration-300">
                  <partner.icon className="w-6 h-6 text-black group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm text-brand-darkGray group-hover:text-black transition-colors font-medium">
                  {partner.type}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Achievements */}
        <AnimatedSection animation="fade-up" delay={300}>
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {achievements.map((achievement, index) => (
                <div key={index} className="group">
                  <div className="text-4xl md:text-5xl font-bold text-black mb-2
                                group-hover:text-primary-500 transition-colors duration-300">
                    {achievement.value}
                  </div>
                  <p className="text-brand-darkGray">{achievement.label}</p>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap items-center justify-center gap-6">
                {[
                  lang === 'ar' ? 'ضمان جودة المحتوى' : 'Quality Content Guarantee',
                  lang === 'ar' ? 'دعم مستمر' : 'Continuous Support',
                  lang === 'ar' ? 'نتائج قابلة للقياس' : 'Measurable Results',
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 text-brand-darkGray">
                    <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
