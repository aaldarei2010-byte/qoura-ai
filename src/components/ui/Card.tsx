'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  delay?: number;
}

export function Card({ className, children, hover = true, delay = 0 }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-lg p-6',
        'transition-all duration-500 ease-out',
        hover && 'hover:shadow-2xl hover:-translate-y-2',
        'animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn('text-xl font-bold text-black', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn('text-gray-600 mt-2', className)}>
      {children}
    </p>
  );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-100', className)}>
      {children}
    </div>
  );
}
