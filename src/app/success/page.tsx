'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  TrendingUp,
  Users,
  Clock,
  Target,
  ArrowLeft,
  ArrowRight,
  Quote,
  Sparkles,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection, AnimatedCounter } from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/Button';

export default function SuccessPage() {
  const { dict, lang, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const successStories = [
    {
      id: 1,
      client: lang === 'ar' ? 'جهة حكومية اتحادية كبرى' : 'Major Federal Government Entity',
      sector: lang === 'ar' ? 'القطاع الحكومي' : 'Government Sector',
      challenge: lang === 'ar'
        ? 'كان الموظفون يقتصرون على استخدام ChatGPT للمحادثات البسيطة دون استثمار إمكاناته الحقيقية في تحسين الإنتاجية'
        : 'Employees were limited to using ChatGPT for simple conversations without leveraging its real potential for productivity improvement',
      solution: lang === 'ar'
        ? 'برنامج تدريبي مكثف على مدار 3 أشهر شمل 200 موظف، مع تطوير أدلة استخدام مخصصة وورش عمل تطبيقية'
        : 'Intensive 3-month training program covering 200 employees, with custom usage guides and practical workshops',
      results: [
        {
          metric: lang === 'ar' ? 'زيادة الإنتاجية' : 'Productivity Increase',
          value: '40%',
          icon: TrendingUp,
        },
        {
          metric: lang === 'ar' ? 'توفير الوقت أسبوعياً' : 'Weekly Time Saved',
          value: lang === 'ar' ? '8 ساعات' : '8 hours',
          icon: Clock,
        },
        {
          metric: lang === 'ar' ? 'موظف تم تدريبه' : 'Employees Trained',
          value: '200',
          icon: Users,
        },
      ],
      testimonial: lang === 'ar'
        ? 'تحول فريقنا من مجرد مستخدمين لـ ChatGPT إلى خبراء يوظفون الذكاء الاصطناعي في تسريع أعمالهم اليومية'
        : 'Our team transformed from mere ChatGPT users to experts leveraging AI to accelerate their daily work',
      testimonialRole: lang === 'ar' ? 'مدير الموارد البشرية' : 'HR Director',
    },
    {
      id: 2,
      client: lang === 'ar' ? 'مؤسسة مالية رائدة' : 'Leading Financial Institution',
      sector: lang === 'ar' ? 'القطاع المالي' : 'Financial Sector',
      challenge: lang === 'ar'
        ? 'بحاجة لتحسين كفاءة معالجة طلبات العملاء وتقليل زمن الاستجابة مع الحفاظ على جودة الخدمة'
        : 'Needed to improve customer request processing efficiency and reduce response time while maintaining service quality',
      solution: lang === 'ar'
        ? 'تصميم وتنفيذ حل ذكاء اصطناعي متكامل لأتمتة معالجة الطلبات مع نظام ذكي لتوجيه الاستفسارات'
        : 'Design and implementation of integrated AI solution for automated request processing with smart inquiry routing',
      results: [
        {
          metric: lang === 'ar' ? 'تقليل زمن المعالجة' : 'Processing Time Reduction',
          value: '60%',
          icon: Clock,
        },
        {
          metric: lang === 'ar' ? 'رضا العملاء' : 'Customer Satisfaction',
          value: '95%',
          icon: Target,
        },
        {
          metric: lang === 'ar' ? 'طلب يومياً' : 'Daily Requests',
          value: '500+',
          icon: BarChart3,
        },
      ],
      testimonial: lang === 'ar'
        ? 'الحل الذي قدمته قرى AI غيّر طريقة تعاملنا مع العملاء بشكل جذري وحقق نتائج تفوق توقعاتنا'
        : 'The solution provided by Qoura AI fundamentally changed how we deal with customers and achieved results exceeding our expectations',
      testimonialRole: lang === 'ar' ? 'المدير التنفيذي للعمليات' : 'Chief Operations Officer',
    },
    {
      id: 3,
      client: lang === 'ar' ? 'جامعة إماراتية رائدة' : 'Leading UAE University',
      sector: lang === 'ar' ? 'التعليم العالي' : 'Higher Education',
      challenge: lang === 'ar'
        ? 'تأهيل أعضاء هيئة التدريس والطلاب لاستخدام أدوات الذكاء الاصطناعي بشكل مسؤول وفعّال في العملية التعليمية'
        : 'Preparing faculty and students to use AI tools responsibly and effectively in the educational process',
      solution: lang === 'ar'
        ? 'برنامج متكامل شمل تدريب أعضاء هيئة التدريس، وتطوير سياسات الاستخدام، وورش عمل للطلاب'
        : 'Integrated program including faculty training, usage policy development, and student workshops',
      results: [
        {
          metric: lang === 'ar' ? 'عضو هيئة تدريس' : 'Faculty Members',
          value: '150',
          icon: Users,
        },
        {
          metric: lang === 'ar' ? 'طالب مستفيد' : 'Benefited Students',
          value: '3000+',
          icon: Target,
        },
        {
          metric: lang === 'ar' ? 'تحسن جودة البحث' : 'Research Quality Improvement',
          value: '35%',
          icon: TrendingUp,
        },
      ],
      testimonial: lang === 'ar'
        ? 'ساعدتنا قرى AI في بناء ثقافة استخدام مسؤول للذكاء الاصطناعي تحترم الأمانة الأكاديمية وتعزز التعلم'
        : 'Qoura AI helped us build a culture of responsible AI use that respects academic integrity and enhances learning',
      testimonialRole: lang === 'ar' ? 'نائب رئيس الجامعة للشؤون الأكاديمية' : 'Vice President for Academic Affairs',
    },
  ];

  const overallStats = [
    { value: 2500, suffix: '+', label: lang === 'ar' ? 'متدرب' : 'Trainees' },
    { value: 50, suffix: '+', label: lang === 'ar' ? 'مؤسسة شريكة' : 'Partner Organizations' },
    { value: 98, suffix: '%', label: lang === 'ar' ? 'نسبة الرضا' : 'Satisfaction Rate' },
    { value: 85, suffix: '%', label: lang === 'ar' ? 'نسبة إعادة التعاون' : 'Repeat Collaboration' },
  ];

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-hero relative overflow-hidden">
        <div className="network-pattern" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-white/90">
                {lang === 'ar' ? 'نتائج حقيقية وملموسة' : 'Real and Tangible Results'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {dict.successPage.title}
            </h1>
            <p className="text-lg text-white/80">
              {dict.successPage.subtitle}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Overall Stats */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {overallStats.map((stat, index) => (
              <AnimatedSection key={index} animation="scale" delay={index * 100}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-black mb-1">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black mb-4">
              {lang === 'ar' ? 'قصص من الواقع' : 'Real Stories'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-black to-primary-500 mx-auto rounded-full" />
          </AnimatedSection>

          <div className="space-y-16">
            {successStories.map((story, index) => (
              <AnimatedSection
                key={story.id}
                animation="fade-up"
                delay={index * 100}
              >
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="grid lg:grid-cols-5">
                    {/* Left side - Main content */}
                    <div className="lg:col-span-3 p-8 md:p-12">
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center">
                          <Building2 className="w-7 h-7 text-black" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-black">
                            {story.client}
                          </h3>
                          <p className="text-sm text-gray-500">{story.sector}</p>
                        </div>
                      </div>

                      {/* Challenge */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4 text-red-500" />
                          {lang === 'ar' ? 'التحدي' : 'The Challenge'}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {story.challenge}
                        </p>
                      </div>

                      {/* Solution */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          {lang === 'ar' ? 'الحل' : 'The Solution'}
                        </h4>
                        <p className="text-gray-600 leading-relaxed">
                          {story.solution}
                        </p>
                      </div>

                      {/* Results */}
                      <div className="grid grid-cols-3 gap-4">
                        {story.results.map((result, resultIndex) => (
                          <div
                            key={resultIndex}
                            className="bg-gray-50 rounded-xl p-4 text-center"
                          >
                            <result.icon className="w-5 h-5 text-black mx-auto mb-2" />
                            <div className="text-xl font-bold text-black">
                              {result.value}
                            </div>
                            <p className="text-xs text-gray-500">{result.metric}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right side - Testimonial */}
                    <div className="lg:col-span-2 bg-black p-8 md:p-12 flex flex-col justify-center">
                      <Quote className="w-10 h-10 text-primary-500/50 mb-4" />
                      <blockquote className="text-white/90 text-lg leading-relaxed mb-6">
                        {story.testimonial}
                      </blockquote>
                      <div className="text-white/70 text-sm">
                        — {story.testimonialRole}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-4">
              {lang === 'ar' ? 'هل تريد أن تكون القصة القادمة؟' : 'Want to Be the Next Success Story?'}
            </h2>
            <p className="text-gray-600 mb-8">
              {lang === 'ar'
                ? 'تواصل معنا اليوم وابدأ رحلة التحول مع فريق قرى AI'
                : 'Contact us today and start your transformation journey with Qoura AI team'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button variant="primary" size="lg">
                  {dict.cta.inquiry}
                  <Arrow className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                </Button>
              </Link>
              <Link href="/programs">
                <Button variant="outline" size="lg">
                  {lang === 'ar' ? 'استعرض البرامج' : 'Browse Programs'}
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
