'use client';

import React from 'react';
import Link from 'next/link';

import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export function Footer() {
  const { dict, lang } = useLanguage();

  const quickLinks = [
    { href: '/', label: dict.nav.home },
    { href: '/programs', label: dict.nav.programs },
    { href: '/consulting', label: dict.nav.consulting },
    { href: '/success', label: dict.nav.success },
    { href: '/contact', label: dict.nav.contact },
  ];

  const socialLinks = [
    { href: '#', icon: Linkedin, label: 'LinkedIn' },
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: '#', icon: Instagram, label: 'Instagram' },
  ];

  return (
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <AnimatedSection animation="fade-up" delay={0}>
            <div className="space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-white.png"
                alt="Qoura AI - قرى"
                className="h-16 w-auto"
              />
              <p className="text-gray-300 leading-relaxed">
                {dict.footer.description}
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-4 pt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                              hover:bg-primary-500 transition-all duration-300 hover:scale-110"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Quick Links */}
          <AnimatedSection animation="fade-up" delay={100}>
            <div className="space-y-4">
              <h3 className="text-lg font-bold">{dict.footer.quickLinks}</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-primary-500 transition-colors duration-300
                                inline-block relative group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary-500
                                      transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Contact Info */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="space-y-4">
              <h3 className="text-lg font-bold">{dict.footer.contactUs}</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                  <a
                    href="mailto:info@qoura.ai"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    info@qoura.ai
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                  <a
                    href="tel:+971507300052"
                    className="text-gray-300 hover:text-white transition-colors"
                    dir="ltr"
                  >
                    +971 50 730 0052
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">
                    {lang === 'ar' ? 'أبوظبي، الإمارات العربية المتحدة' : 'Abu Dhabi, UAE'}
                  </span>
                </li>
              </ul>
            </div>
          </AnimatedSection>

          {/* Newsletter / CTA */}
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="space-y-4">
              <h3 className="text-lg font-bold">{dict.footer.followUs}</h3>
              <p className="text-gray-300">
                {lang === 'ar'
                  ? 'ابقَ على اطلاع بأحدث أخبار الذكاء الاصطناعي'
                  : 'Stay updated with the latest AI news'}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={lang === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20
                            text-white placeholder:text-gray-400
                            focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg
                            hover:bg-primary-600 transition-colors duration-300"
                >
                  {lang === 'ar' ? 'اشترك' : 'Subscribe'}
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Qoura AI. {dict.footer.rights}.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white transition-colors">
                {lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                {lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
