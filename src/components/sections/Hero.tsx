'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

import { ArrowLeft, ArrowRight, Sparkles, Brain, Cpu, Zap } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animationId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 122, 0, ${p.opacity})`;
        ctx.fill();

        particles.forEach((p2, j) => {
          if (j <= i) return;
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 122, 0, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}

function RotatingCube() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80" style={{ perspective: '800px' }}>
      <div
        className="w-full h-full relative animate-rotate"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {[
          { transform: 'translateZ(120px)', icon: <Brain className="w-12 h-12" /> },
          { transform: 'rotateY(90deg) translateZ(120px)', icon: <Cpu className="w-12 h-12" /> },
          { transform: 'rotateY(180deg) translateZ(120px)', icon: <Zap className="w-12 h-12" /> },
          { transform: 'rotateY(270deg) translateZ(120px)', icon: <Sparkles className="w-12 h-12" /> },
        ].map((face, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center rounded-2xl
                       bg-gradient-to-br from-primary-500/20 to-primary-500/5
                       border border-primary-500/30 backdrop-blur-sm text-primary-500"
            style={{ transform: face.transform, backfaceVisibility: 'hidden' }}
          >
            {face.icon}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-primary-500/20 animate-pulse-glow" />
      <div className="absolute -inset-8 rounded-full bg-primary-500/5 blur-3xl animate-pulse" />
    </div>
  );
}

function GlowingCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/50 to-primary-500/0 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
      <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-center
                      hover:border-primary-500/50 transition-all duration-300 hover:scale-105">
        <div className="text-primary-500 mb-2 flex justify-center">{icon}</div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-white/60 text-xs">{title}</div>
      </div>
    </div>
  );
}

export function Hero() {
  const { dict, lang, dir } = useLanguage();
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,122,0,0.15)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,122,0,0.1)_0%,_transparent_50%)]" />

      <FloatingParticles />

      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,122,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,0,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-start">
            <AnimatedSection animation="fade-down" delay={0}>
              <div className="flex justify-center lg:justify-start mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-white.png" alt="Qoura AI" className="h-20 w-auto" />
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-down" delay={100}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                </span>
                <span className="text-sm text-primary-500 font-medium">
                  {lang === 'ar' ? 'الرائدون في حلول الذكاء الاصطناعي في الإمارات' : 'Leading AI Solutions in UAE'}
                </span>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {dict.hero.title}
              </h1>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
                {dict.hero.subtitle}
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={400}>
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                <Link href="/contact">
                  <Button variant="secondary" size="lg" className="group">
                    {dict.hero.cta1}
                    <Arrow className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                    {dict.hero.cta2}
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={500}>
              <div className="grid grid-cols-3 gap-4 mt-12 max-w-md mx-auto lg:mx-0">
                <GlowingCard icon={<Brain className="w-5 h-5" />} value="5000+" title={lang === 'ar' ? 'متدرب' : 'Trainees'} />
                <GlowingCard icon={<Cpu className="w-5 h-5" />} value="50+" title={lang === 'ar' ? 'شريك' : 'Partners'} />
                <GlowingCard icon={<Zap className="w-5 h-5" />} value="150+" title={lang === 'ar' ? 'ورشة' : 'Workshops'} />
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection animation="fade-left" delay={300}>
            <div className="hidden lg:flex items-center justify-center">
              <RotatingCube />
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection animation="fade-up" delay={600}>
          <div className="mt-20 pt-8 border-t border-white/10 text-center">
            <p className="text-white/40 text-sm mb-6">
              {lang === 'ar' ? 'موثوقون من قبل' : 'Trusted by'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { ar: 'ديوان ولي العهد', en: 'Crown Prince Court' },
                { ar: 'أدنوك', en: 'ADNOC' },
                { ar: 'صندوق خليفة', en: 'Khalifa Fund' },
              ].map((client, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl
                            text-white/80 text-sm font-semibold hover:bg-white/10 hover:border-primary-500/30
                            transition-all duration-300 hover:scale-105"
                >
                  {lang === 'ar' ? client.ar : client.en}
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle z-10">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary-500/70 rounded-full animate-slide-up" />
        </div>
      </div>
    </section>
  );
}
