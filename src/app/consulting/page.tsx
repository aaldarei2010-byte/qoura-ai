'use client';

import React from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  Compass,
  Cog,
  LineChart,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Shield,
  Users,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/Button';

export default function ConsultingPage() {
  const { dict, lang, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const services = [
    {
      icon: Compass,
      title: lang === 'ar' ? 'تقييم الجاهزية للـ AI' : 'AI Readiness Assessment',
      description: lang === 'ar'
        ? 'تحليل شامل لتقييم جاهزية مؤسستك لتبني تقنيات الذكاء الاصطناعي'
        : 'Comprehensive analysis to assess your organization\'s readiness for AI adoption',
      features: lang === 'ar'
        ? ['تحليل البنية التحتية التقنية', 'تقييم جاهزية الفريق', 'تحديد الفجوات', 'خطة التحسين']
        : ['Technical infrastructure analysis', 'Team readiness assessment', 'Gap identification', 'Improvement plan'],
    },
    {
      icon: Lightbulb,
      title: lang === 'ar' ? 'استراتيجية الذكاء الاصطناعي' : 'AI Strategy',
      description: lang === 'ar'
        ? 'بناء استراتيجية شاملة للذكاء الاصطناعي تتوافق مع أهداف مؤسستك'
        : 'Building a comprehensive AI strategy aligned with your organization\'s goals',
      features: lang === 'ar'
        ? ['تحديد الفرص ذات الأولوية', 'خارطة طريق التنفيذ', 'تقدير الميزانية', 'مؤشرات الأداء']
        : ['Priority opportunity identification', 'Implementation roadmap', 'Budget estimation', 'KPIs'],
    },
    {
      icon: Cog,
      title: lang === 'ar' ? 'تصميم وتنفيذ الحلول' : 'Solution Design & Implementation',
      description: lang === 'ar'
        ? 'تصميم وتنفيذ حلول ذكاء اصطناعي مخصصة تناسب احتياجاتكم'
        : 'Designing and implementing custom AI solutions tailored to your needs',
      features: lang === 'ar'
        ? ['تحليل المتطلبات', 'تصميم الحل', 'التنفيذ والتكامل', 'الاختبار والتسليم']
        : ['Requirements analysis', 'Solution design', 'Implementation & integration', 'Testing & delivery'],
    },
    {
      icon: LineChart,
      title: lang === 'ar' ? 'تحسين العمليات' : 'Process Optimization',
      description: lang === 'ar'
        ? 'تحسين العمليات الحالية باستخدام الذكاء الاصطناعي لزيادة الكفاءة'
        : 'Optimizing existing processes using AI to increase efficiency',
      features: lang === 'ar'
        ? ['تحليل العمليات الحالية', 'تحديد نقاط التحسين', 'أتمتة المهام', 'قياس الأثر']
        : ['Current process analysis', 'Improvement point identification', 'Task automation', 'Impact measurement'],
    },
  ];

  const process = [
    {
      step: 1,
      title: lang === 'ar' ? 'الاكتشاف' : 'Discovery',
      description: lang === 'ar'
        ? 'نستمع إلى احتياجاتكم ونفهم التحديات التي تواجهونها'
        : 'We listen to your needs and understand the challenges you face',
    },
    {
      step: 2,
      title: lang === 'ar' ? 'التحليل' : 'Analysis',
      description: lang === 'ar'
        ? 'نحلل الوضع الحالي ونحدد الفرص والأولويات'
        : 'We analyze the current situation and identify opportunities and priorities',
    },
    {
      step: 3,
      title: lang === 'ar' ? 'التصميم' : 'Design',
      description: lang === 'ar'
        ? 'نصمم الحل الأمثل مع خطة تنفيذ واضحة'
        : 'We design the optimal solution with a clear implementation plan',
    },
    {
      step: 4,
      title: lang === 'ar' ? 'التنفيذ' : 'Implementation',
      description: lang === 'ar'
        ? 'ننفذ الحل مع متابعة مستمرة وتحسين دائم'
        : 'We implement the solution with continuous follow-up and improvement',
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: lang === 'ar' ? 'نتائج سريعة' : 'Fast Results',
      description: lang === 'ar'
        ? 'نركز على الحلول التي تحقق نتائج ملموسة في وقت قصير'
        : 'We focus on solutions that deliver tangible results quickly',
    },
    {
      icon: Shield,
      title: lang === 'ar' ? 'خبرة موثوقة' : 'Trusted Expertise',
      description: lang === 'ar'
        ? 'فريق من الخبراء المحليين بخبرة عالمية'
        : 'Team of local experts with global experience',
    },
    {
      icon: Users,
      title: lang === 'ar' ? 'شراكة حقيقية' : 'True Partnership',
      description: lang === 'ar'
        ? 'نعمل كشريك استراتيجي وليس مجرد مقدم خدمة'
        : 'We work as a strategic partner, not just a service provider',
    },
  ];

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
        <div className="network-pattern" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-white/90">
                {lang === 'ar' ? 'استشارات وحلول متكاملة' : 'Integrated Consulting & Solutions'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {dict.consultingPage.title}
            </h1>
            <p className="text-lg text-white/80">
              {dict.consultingPage.subtitle}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black mb-4">
              {lang === 'ar' ? 'خدماتنا الاستشارية' : 'Our Consulting Services'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-black to-primary-500 mx-auto rounded-full" />
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <AnimatedSection
                key={service.title}
                animation="fade-up"
                delay={index * 100}
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl
                              transition-all duration-500 hover:-translate-y-2 h-full group">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center mb-6
                                group-hover:bg-black group-hover:scale-110 transition-all duration-500">
                    <service.icon className="w-7 h-7 text-black group-hover:text-white transition-colors duration-500" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-black mb-3">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black mb-4">
              {lang === 'ar' ? 'منهجيتنا في العمل' : 'Our Work Methodology'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-black to-primary-500 mx-auto rounded-full" />
          </AnimatedSection>

          <div className="grid md:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <AnimatedSection
                key={item.step}
                animation="fade-up"
                delay={index * 100}
              >
                <div className="text-center relative">
                  {/* Connector line */}
                  {index < process.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 -z-10" />
                  )}

                  {/* Step number */}
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black text-white
                                flex items-center justify-center text-2xl font-bold
                                shadow-lg shadow-black/30">
                    {item.step}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-black mb-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              {lang === 'ar' ? 'لماذا قرى AI؟' : 'Why Qoura AI?'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-white mx-auto rounded-full" />
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <AnimatedSection
                key={benefit.title}
                animation="scale"
                delay={index * 100}
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20
                              text-center hover:bg-white/20 transition-all duration-500">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-500/20
                                flex items-center justify-center">
                    <benefit.icon className="w-7 h-7 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-white/80">
                    {benefit.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-4">
              {lang === 'ar' ? 'هل أنتم مستعدون للتحول؟' : 'Ready for Transformation?'}
            </h2>
            <p className="text-gray-600 mb-8">
              {lang === 'ar'
                ? 'تواصل معنا اليوم للحصول على استشارة مجانية ومناقشة كيف يمكننا مساعدتكم'
                : 'Contact us today for a free consultation and discuss how we can help you'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button variant="primary" size="lg">
                  {dict.cta.call}
                  <Arrow className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                </Button>
              </Link>
              <Link href="/success">
                <Button variant="outline" size="lg">
                  {lang === 'ar' ? 'شاهد قصص النجاح' : 'View Success Stories'}
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
