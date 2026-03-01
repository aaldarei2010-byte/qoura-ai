import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, lang: 'ar' | 'en' = 'ar'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // UAE phone format: +971 XX XXX XXXX or 05X XXX XXXX
  const phoneRegex = /^(\+971|00971|0)?[5][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}
