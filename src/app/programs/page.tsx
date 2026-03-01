'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Briefcase,
  Crown,
  Clock,
  Users,
  Target,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Button } from '@/components/ui/Button';

export default function ProgramsPage() {
  const { dict, lang, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const programs = [
    {
      category: dict.programs.categories.students,
      icon: GraduationCap,
      color: 'from-blue-600 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      programs: [
        {
          title: lang === 'ar' ? 'مقدمة في الذكاء الاصطناعي' : 'Introduction to AI',
          duration: lang === 'ar' ? '4 ساعات' : '4 hours',
          audience: lang === 'ar' ? '15-20 طالب' : '15-20 students',
          description: lang === 'ar'
            ? 'برنامج تعريفي شامل يغطي أساسيات الذكاء الاصطناعي وتطبيقاته العملية للطلاب'
            : 'Comprehensive introductory program covering AI fundamentals and practical applications for students',
          topics: lang === 'ar'
            ? ['ما هو الذكاء الاصطناعي؟', 'أدوات AI المفيدة للدراسة', 'الاستخدام المسؤول', 'تطبيقات عملية']
            : ['What is AI?', 'Useful AI tools for studying', 'Responsible usage', 'Practical applications'],
        },
        {
          title: lang === 'ar' ? 'الكتابة الإبداعية مع AI' : 'Creative Writing with AI',
          duration: lang === 'ar' ? '6 ساعات' : '6 hours',
          audience: lang === 'ar' ? '10-15 طالب' : '10-15 students',
          description: lang === 'ar'
            ? 'تعلم كيفية استخدام أدوات الذكاء الاصطناعي لتحسين مهارات الكتابة والإبداع'
            : 'Learn how to use AI tools to improve writing and creative skills',
          topics: lang === 'ar'
            ? ['Prompt Engineering', 'كتابة المقالات', 'التحرير الذكي', 'مشاريع تطبيقية']
            : ['Prompt Engineering', 'Essay writing', 'Smart editing', 'Applied projects'],
        },
      ],
    },
    {
      category: dict.programs.categories.employees,
      icon: Briefcase,
      color: 'from-purple-600 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      programs: [
        {
          title: lang === 'ar' ? 'AI للإنتاجية المكتبية' : 'AI for Office Productivity',
          duration: lang === 'ar' ? '8 ساعات' : '8 hours',
          audience: lang === 'ar' ? '20-25 موظف' : '20-25 employees',
          description: lang === 'ar'
            ? 'برنامج شامل لتحويل الموظفين من مستخدمين عاديين إلى خبراء في أدوات الذكاء الاصطناعي'
            : 'Comprehensive program to transform employees from regular users to AI tools experts',
          topics: lang === 'ar'
            ? ['ChatGPT المتقدم', 'أتمتة المهام', 'تحليل البيانات', 'إنشاء المحتوى']
            : ['Advanced ChatGPT', 'Task automation', 'Data analysis', 'Content creation'],
        },
        {
          title: lang === 'ar' ? 'بناء حلول AI داخلية' : 'Building Internal AI Solutions',
          duration: lang === 'ar' ? '16 ساعة' : '16 hours',
          audience: lang === 'ar' ? '10-15 موظف' : '10-15 employees',
          description: lang === 'ar'
            ? 'تعلم كيفية تصميم وبناء حلول ذكاء اصطناعي مخصصة لمؤسستك'
            : 'Learn how to design and build custom AI solutions for your organization',
          topics: lang === 'ar'
            ? ['تحديد الفرص', 'اختيار الأدوات', 'التكامل مع الأنظمة', 'قياس الأثر']
            : ['Identifying opportunities', 'Tool selection', 'System integration', 'Impact measurement'],
        },
      ],
    },
    {
      category: dict.programs.categories.leaders,
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-50 to-orange-50',
      programs: [
        {
          title: lang === 'ar' ? 'استراتيجية الذكاء الاصطناعي للقيادات' : 'AI Strategy for Leaders',
          duration: lang === 'ar' ? '4 ساعات' : '4 hours',
          audience: lang === 'ar' ? '10-12 قيادي' : '10-12 leaders',
          description: lang === 'ar'
            ? 'جلسة تنفيذية للقيادات لفهم الفرص والتحديات الاستراتيجية للذكاء الاصطناعي'
            : 'Executive session for leaders to understand AI strategic opportunities and challenges',
          topics: lang === 'ar'
            ? ['المشهد الحالي للـ AI', 'فرص التحول', 'إدارة المخاطر', 'خارطة الطريق']
            : ['Current AI landscape', 'Transformation opportunities', 'Risk management', 'Roadmap'],
        },
        {
          title: lang === 'ar' ? 'قيادة التحول الرقمي بالـ AI' : 'Leading Digital Transformation with AI',
          duration: lang === 'ar' ? '8 ساعات' : '8 hours',
          audience: lang === 'ar' ? '8-10 قيادي' : '8-10 leaders',
          description: lang === 'ar'
            ? 'برنامج متعمق لقيادة مبادرات التحول الرقمي المدعومة بالذكاء الاصطناعي'
            : 'In-depth program for leading AI-powered digital transformation initiatives',
          topics: lang === 'ar'
            ? ['بناء الفريق', 'الثقافة التنظيمية', 'قياس العائد', 'دراسات حالة']
            : ['Team building', 'Organizational culture', 'ROI measurement', 'Case studies'],
        },
      ],
    },
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
                {lang === 'ar' ? 'برامج مصممة لكل فئة' : 'Programs designed for every segment'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {dict.programs.title}
            </h1>
            <p className="text-lg text-white/80">
              {dict.programs.subtitle}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Programs List */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          {programs.map((category, categoryIndex) => (
            <div key={category.category} className="mb-20 last:mb-0">
              {/* Category Header */}
              <AnimatedSection animation="fade-up" className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color}
                               flex items-center justify-center shadow-lg`}
                  >
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-black">
                    {category.category}
                  </h2>
                </div>
                <div className={`w-20 h-1 bg-gradient-to-r ${category.color} rounded-full`} />
              </AnimatedSection>

              {/* Programs Grid */}
              <div className="grid lg:grid-cols-2 gap-8">
                {category.programs.map((program, programIndex) => (
                  <AnimatedSection
                    key={program.title}
                    animation="fade-up"
                    delay={programIndex * 100}
                  >
                    <div
                      className={`bg-gradient-to-br ${category.bgColor} rounded-3xl p-8
                                 border border-gray-100 hover:shadow-2xl hover:-translate-y-1
                                 transition-all duration-500 h-full`}
                    >
                      {/* Program Header */}
                      <h3 className="text-xl font-bold text-black mb-3">
                        {program.title}
                      </h3>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{program.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{program.audience}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {program.description}
                      </p>

                      {/* Topics */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          {lang === 'ar' ? 'المحاور الرئيسية' : 'Key Topics'}
                        </h4>
                        <ul className="grid grid-cols-2 gap-2">
                          {program.topics.map((topic, topicIndex) => (
                            <li key={topicIndex} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <Link href="/contact">
                        <Button variant="primary" size="sm" className="w-full sm:w-auto">
                          {dict.cta.workshop}
                          <Arrow className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              {lang === 'ar' ? 'لم تجد البرنامج المناسب؟' : "Didn't find the right program?"}
            </h2>
            <p className="text-white/80 mb-8">
              {lang === 'ar'
                ? 'نصمم برامج مخصصة تناسب احتياجات مؤسستكم. تواصل معنا لمناقشة متطلباتكم.'
                : 'We design custom programs tailored to your organization\'s needs. Contact us to discuss your requirements.'}
            </p>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                {dict.cta.inquiry}
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
