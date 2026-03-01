'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { lang, dir, dict, setLang } = useLanguage();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: dict.nav.home },
    { href: '/programs', label: dict.nav.programs },
    { href: '/consulting', label: dict.nav.consulting },
    { href: '/success', label: dict.nav.success },
    { href: '/contact', label: dict.nav.contact },
  ];

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'en' : 'ar');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isScrolled ? '/logo.png' : '/logo-white.png'}
              alt="Qoura AI - قرى"
              className="h-12 w-auto transition-all duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative font-medium transition-colors duration-300 py-2',
                  pathname === link.href
                    ? isScrolled ? 'text-black' : 'text-white'
                    : isScrolled ? 'text-brand-darkGray hover:text-black' : 'text-white/80 hover:text-white'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-0.5 bg-primary-500 transition-all duration-300',
                    pathname === link.href ? 'w-full' : 'w-0'
                  )}
                />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300',
                isScrolled
                  ? 'text-black hover:bg-black/10'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">
                {lang === 'ar' ? 'EN' : 'عربي'}
              </span>
            </button>
            <Link href="/contact">
              <Button variant={isScrolled ? 'primary' : 'outline'} size="sm">
                {dict.cta.inquiry}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors duration-300',
              isScrolled ? 'text-black' : 'text-white'
            )}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-500 ease-out',
            isMenuOpen ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          )}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block py-2 px-4 rounded-lg transition-all duration-300',
                  'transform',
                  isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
                  pathname === link.href
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
              </button>
              <Link href="/contact" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  {dict.cta.inquiry}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
