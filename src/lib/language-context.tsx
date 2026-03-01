'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Dictionary } from '@/types';
import { getDictionary, getDirection } from './dictionary';

interface LanguageContextType {
  lang: Language;
  dir: 'rtl' | 'ltr';
  dict: Dictionary;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');
  const [dict, setDict] = useState<Dictionary>(getDictionary('ar'));
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');

  useEffect(() => {
    // Check for saved language preference
    const savedLang = localStorage.getItem('qoura-lang') as Language | null;
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLangState(savedLang);
      setDict(getDictionary(savedLang));
      setDir(getDirection(savedLang));
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    setDict(getDictionary(newLang));
    setDir(getDirection(newLang));
    localStorage.setItem('qoura-lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = getDirection(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, dict, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
