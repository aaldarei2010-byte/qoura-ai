/*
 * Qoura AI - Landing Page
 * Design: "Quiet Intelligence" - Minimalist Editorial
 * Colors: Black #000000, Orange #FF7A00, White #FFFFFF, Grays
 * Fonts: Noto Kufi Arabic (AR) + Inter (EN)
 * Enhanced Design v2 - Improved animations, typography, spacing & interactions
 */

import {
  LOGO_URL,
  HERO_BG_URL,
  SERVICES_BG_URL,
  IMPACT_BG_URL,
  ABOUT_BG_URL,
} from "@/lib/constants";
import { Mail, Phone, MapPin, Globe, GraduationCap, Brain, Cpu, BarChart3, Users, Building2, Lightbulb, Shield, Heart, Target, ChevronLeft, ArrowUp, Sparkles, Award, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";

// ─── Animated Counter with easeOut ───
function AnimatedCounter({ target, suffix = "+" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2500;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo for smoother counting
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(eased * target);
      setCount(current);
      if (progress >= 1) {
        setCount(target);
        clearInterval(timer);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-5xl md:text-6xl font-extrabold text-[#FF7A00] tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
      {count.toLocaleString()}{suffix}
    </div>
  );
}

// ─── Enhanced Fade-in wrapper with direction support ───
function FadeIn({ children, delay = 0, className = "", direction = "up" }: { children: React.ReactNode; delay?: number; className?: string; direction?: "up" | "down" | "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const transforms: Record<string, string> = {
    up: "translateY(40px)",
    down: "translateY(-40px)",
    left: "translateX(40px)",
    right: "translateX(-40px)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translate(0)" : transforms[direction],
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Floating particles background decoration ───
function FloatingOrb({ className }: { className: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
  );
}

// ─── Main Page ───
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeNav, setActiveNav] = useState("hero");

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
      setShowScrollTop(window.scrollY > 600);

      // Active nav tracking
      const sections = ["contact", "why-us", "impact", "services", "about", "hero"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveNav(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: "about", label: "من نحن" },
    { id: "services", label: "خدماتنا" },
    { id: "impact", label: "الأثر" },
    { id: "why-us", label: "لماذا قرى" },
    { id: "contact", label: "تواصل معنا" },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_20px_rgba(0,0,0,0.06)]" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
          <button onClick={() => scrollTo("hero")} className="flex-shrink-0 group">
            <img src={LOGO_URL} alt="Qoura AI - قرى" className="h-8 md:h-10 transition-transform duration-300 group-hover:scale-105" />
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-sm px-4 py-2 rounded-full transition-all duration-300 relative ${
                  activeNav === item.id
                    ? "text-[#FF7A00] font-semibold bg-[#FF7A00]/5"
                    : "text-[#545454] hover:text-black hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="القائمة"
          >
            <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/98 backdrop-blur-xl border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => scrollTo(item.id)}
                    className={`block w-full text-right text-sm py-3 px-4 rounded-lg transition-all ${
                      activeNav === item.id
                        ? "text-[#FF7A00] font-semibold bg-[#FF7A00]/5"
                        : "text-[#545454] hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <motion.img
            src={HERO_BG_URL}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.15, scale: heroScale }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-white via-white/90 to-white/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/50" />
        </div>

        {/* Decorative orbs */}
        <FloatingOrb className="w-[500px] h-[500px] bg-[#FF7A00]/[0.04] top-20 -right-40 animate-pulse" />
        <FloatingOrb className="w-[300px] h-[300px] bg-[#FF7A00]/[0.06] bottom-40 left-20" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-32 md:py-0 grid md:grid-cols-2 gap-12 md:gap-16 items-center w-full">
          <div>
            <FadeIn>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-0.5 bg-[#FF7A00]" />
                <span className="text-xs text-[#FF7A00] font-semibold tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>Empowering with AI</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] lg:text-7xl font-extrabold text-black leading-[1.15] mb-6">
                نُمكّن المجتمع
                <br />
                <span className="text-[#FF7A00] relative">
                  بالذكاء الاصطناعي
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="#FF7A00" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
                  </svg>
                </span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-base sm:text-lg md:text-xl text-[#545454] leading-relaxed mb-10 max-w-lg">
                شركة إماراتية متخصصة في تمكين المجتمع والمؤسسات عبر برامج تدريب تطبيقية، واستشارات مؤسسية، وحلول تقنية متقدمة في الذكاء الاصطناعي.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollTo("services")}
                  className="bg-black text-white px-8 py-4 rounded-lg text-sm font-semibold hover:bg-[#FF7A00] transition-all duration-300 flex items-center gap-2 shadow-lg shadow-black/10 hover:shadow-[#FF7A00]/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  استكشف خدماتنا
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollTo("contact")}
                  className="border-2 border-black/80 text-black px-8 py-4 rounded-lg text-sm font-semibold hover:bg-black hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  تواصل معنا
                </button>
              </div>
            </FadeIn>

            {/* Trust badges */}
            <FadeIn delay={0.45}>
              <div className="flex items-center gap-6 mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-[#545454]">
                  <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center">
                    <Award size={14} className="text-[#FF7A00]" />
                  </div>
                  <span>شريك موثوق</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#545454]">
                  <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center">
                    <Zap size={14} className="text-[#FF7A00]" />
                  </div>
                  <span>+15 جهة</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#545454]">
                  <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center">
                    <Sparkles size={14} className="text-[#FF7A00]" />
                  </div>
                  <span>حلول مبتكرة</span>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4} className="hidden md:block">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-80 h-80 bg-gradient-to-br from-[#FF7A00]/10 to-transparent rounded-full blur-3xl animate-pulse" />
              <div className="absolute w-60 h-60 border border-[#FF7A00]/10 rounded-full" />
              <div className="absolute w-96 h-96 border border-[#FF7A00]/5 rounded-full" />
              <img src={LOGO_URL} alt="Qoura AI" className="w-56 lg:w-64 relative z-10 drop-shadow-2xl" />
            </div>
          </FadeIn>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-[#CCCCCC] flex items-start justify-center pt-2"
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], height: [6, 10, 6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 bg-[#FF7A00] rounded-full"
            />
          </motion.div>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      <section id="about" className="py-24 md:py-36 bg-white relative">
        <FloatingOrb className="w-[400px] h-[400px] bg-[#FF7A00]/[0.02] -top-20 -right-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <FadeIn>
                <p className="text-xs text-[#FF7A00] font-bold mb-3 tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>WHO WE ARE</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-4 leading-tight">من نحن</h2>
                <div className="w-16 h-1 bg-[#FF7A00] rounded-full mb-8" />
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="text-[#545454] leading-[1.9] mb-6 text-base">
                  <strong className="text-black">قرى AI (Qoura AI)</strong> شركة إماراتية متخصصة في تمكين المجتمع والمؤسسات بالذكاء الاصطناعي عبر برامج تدريب تطبيقية، واستشارات مؤسسية، وحلول تقنية متقدمة مثل AI Agents والأتمتة وتحليل البيانات.
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <p className="text-[#545454] leading-[1.9] mb-8 text-base">
                  تنطلق قرى AI من قناعة أساسية: <strong className="text-black">الموهبة موجودة في كل مكان، وما ينقصها هو المسار الصحيح والتدريب العملي والبيئة الداعمة.</strong> اسم "قرى" يشير إلى القرى والمجتمعات المحلية التي تسعى الشركة لتمكينها رقميًا.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="bg-gradient-to-l from-[#FAFAFA] to-white rounded-xl p-6 border-r-4 border-[#FF7A00] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF7A00]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <p className="text-sm text-[#545454] leading-[1.9] italic relative z-10">
                    "نعمل بأسلوب مبسط وعملي باللغة العربية وبفهم عميق للثقافة المحلية الإماراتية، مع تركيز خاص على تمكين الأطفال والشباب والمناطق البعيدة."
                  </p>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.2} direction="left">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#FF7A00]/10 rounded-2xl rotate-3 transition-transform duration-500 group-hover:rotate-2" />
                <img src={ABOUT_BG_URL} alt="Qoura AI Innovation" className="w-full rounded-2xl shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.01]" />
                <div className="absolute -bottom-6 -left-4 md:-left-8 bg-black text-white p-5 md:p-6 rounded-xl shadow-2xl z-20 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF7A00]/20 flex items-center justify-center">
                      <MapPin size={14} className="text-[#FF7A00]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#FF7A00] mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Abu Dhabi, UAE</p>
                      <p className="text-sm font-semibold">أبوظبي — الإمارات</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mt-24">
            <FadeIn>
              <div className="bg-black text-white p-8 md:p-10 rounded-2xl relative overflow-hidden group hover:shadow-2xl hover:shadow-black/20 transition-all duration-500">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF7A00]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FF7A00]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/20 flex items-center justify-center">
                    <Target size={20} className="text-[#FF7A00]" />
                  </div>
                  <h3 className="text-xl font-bold">الرؤية</h3>
                </div>
                <p className="text-gray-300 leading-[1.9] text-sm relative z-10">
                  أن تصبح قرى AI منصة رائدة في المنطقة لبناء جيل قادر على فهم الذكاء الاصطناعي واستخدامه وصناعته، مع ضمان شمول المناطق البعيدة والقرى والمجتمعات الأقل وصولًا للفرص الرقمية.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l from-[#FF7A00] to-[#FF7A00]/30" />
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-[#FAFAFA] p-8 md:p-10 rounded-2xl border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all duration-500">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF7A00]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center">
                    <Sparkles size={20} className="text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-black">الرسالة</h3>
                </div>
                <p className="text-[#545454] leading-[1.9] text-sm relative z-10">
                  تمكين الأفراد والمؤسسات من استخدام الذكاء الاصطناعي بشكل عملي، مسؤول، وقابل للقياس عبر التدريب التطبيقي، وتطوير الحلول، ودعم التحول المؤسسي.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-l from-black to-black/30" />
              </div>
            </FadeIn>
          </div>

          {/* Values */}
          <div className="mt-24">
            <FadeIn>
              <div className="text-center mb-12">
                <p className="text-xs text-[#FF7A00] font-bold mb-3 tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>OUR VALUES</p>
                <h3 className="text-2xl md:text-3xl font-extrabold text-black">قيمنا الأساسية</h3>
              </div>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
              {[
                { icon: <Lightbulb size={22} />, title: "الوضوح والبساطة", desc: "تبسيط المعرفة دون تقليل قيمتها" },
                { icon: <Target size={22} />, title: "الأثر والنتائج", desc: "التدريب يُقاس بمخرجات واضحة" },
                { icon: <Heart size={22} />, title: "الهوية والثقافة", desc: "توطين المحتوى بما يناسب الثقافة" },
                { icon: <Shield size={22} />, title: "الابتكار المسؤول", desc: "مراعاة الخصوصية والأخلاقيات" },
                { icon: <Users size={22} />, title: "الشمول", desc: "فرص متساوية للجميع" },
              ].map((v, i) => (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="text-center p-5 md:p-6 bg-white rounded-xl border border-gray-100 hover:border-[#FF7A00]/30 hover:shadow-xl hover:shadow-[#FF7A00]/5 transition-all duration-500 group hover:-translate-y-1">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      {v.icon}
                    </div>
                    <h4 className="text-sm font-bold text-black mb-2">{v.title}</h4>
                    <p className="text-xs text-[#545454] leading-relaxed">{v.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES ═══════════ */}
      <section id="services" className="py-24 md:py-36 bg-[#FAFAFA] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] opacity-[0.07]">
          <img src={SERVICES_BG_URL} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FAFAFA]" />
        </div>
        <FloatingOrb className="w-[400px] h-[400px] bg-[#FF7A00]/[0.03] top-40 -left-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <FadeIn>
            <p className="text-xs text-[#FF7A00] font-bold mb-3 tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>OUR SERVICES</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-4 leading-tight">خدماتنا</h2>
            <div className="w-16 h-1 bg-[#FF7A00] rounded-full mb-6" />
            <p className="text-[#545454] max-w-2xl mb-16 text-base leading-relaxed">
              نقدم ثلاثة محاور رئيسية من الخدمات، مصممة لتلبية احتياجات كل فئة وكل جهة بأسلوب عملي وقابل للقياس.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Service 1 */}
            <FadeIn delay={0}>
              <div className="bg-white rounded-2xl p-7 md:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col group">
                <div className="w-14 h-14 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <GraduationCap size={28} className="text-[#FF7A00]" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">برامج التدريب وبناء القدرات</h3>
                <p className="text-xs text-[#FF7A00] mb-4 font-semibold tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>AI Capability Building</p>
                <p className="text-sm text-[#545454] leading-[1.8] mb-6 flex-1">
                  برامج تدريبية تطبيقية موجهة للجهات الحكومية وشبه الحكومية لرفع الجاهزية والإنتاجية، وللقطاع الخاص لتحسين العمليات، وللأطفال والناشئة عبر تعليم عملي قائم على المشاريع.
                </p>
                <div className="space-y-2.5 border-t border-gray-100 pt-5">
                  {["أساسيات الذكاء الاصطناعي التوليدي", "بناء AI Agents", "الأتمتة وربط الأدوات", "تحليل البيانات", "مسارات الأطفال والناشئة"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-[#545454]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Service 2 - Featured */}
            <FadeIn delay={0.1}>
              <div className="bg-black text-white rounded-2xl p-7 md:p-8 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF7A00]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute bottom-20 left-0 w-32 h-32 bg-[#FF7A00]/5 rounded-full -translate-x-1/2" />
                <div className="w-14 h-14 rounded-xl bg-[#FF7A00]/20 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <Brain size={28} className="text-[#FF7A00]" />
                </div>
                <h3 className="text-lg font-bold mb-2 relative z-10">الاستشارات المؤسسية</h3>
                <p className="text-xs text-[#FF7A00] mb-4 relative z-10 font-semibold tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>AI Advisory</p>
                <p className="text-sm text-gray-300 leading-[1.8] mb-6 flex-1 relative z-10">
                  نساعد الجهات على تحديد أفضل حالات الاستخدام حسب أولوياتها، وتصميم خارطة طريق للتبني، وبناء سياسات الاستخدام المسؤول، وتطوير جاهزية الفرق.
                </p>
                <div className="space-y-2.5 border-t border-white/10 pt-5 relative z-10">
                  {["تحديد Use Cases", "خارطة طريق AI Roadmap", "سياسات Responsible AI", "مؤشرات أداء KPIs"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-l from-[#FF7A00] to-[#FF7A00]/50" />
              </div>
            </FadeIn>

            {/* Service 3 */}
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-2xl p-7 md:p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col group">
                <div className="w-14 h-14 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Cpu size={28} className="text-[#FF7A00]" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">الحلول التقنية</h3>
                <p className="text-xs text-[#FF7A00] mb-4 font-semibold tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>AI Solutions</p>
                <p className="text-sm text-[#545454] leading-[1.8] mb-6 flex-1">
                  نطوّر حلولًا مخصصة حسب احتياج كل جهة، تشمل وكلاء ذكاء اصطناعي داخلية، وأتمتة إجراءات متكررة، وتحليل بيانات واستخراج مؤشرات وتقارير ذكية.
                </p>
                <div className="space-y-2.5 border-t border-gray-100 pt-5">
                  {["AI Agents داخلية", "أتمتة الإجراءات", "تحليل البيانات الذكي", "حلول مخصصة متكاملة"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-[#545454]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Target Audiences */}
          <div className="mt-20 md:mt-24">
            <FadeIn>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-0.5 bg-[#FF7A00]" />
                <h3 className="text-xl md:text-2xl font-bold text-black">الفئات المستهدفة</h3>
              </div>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5">
              {[
                { icon: <Building2 size={20} />, title: "الجهات الحكومية", desc: "تدريب + استشارات + حلول" },
                { icon: <BarChart3 size={20} />, title: "القطاع الخاص", desc: "تدريب + أتمتة + تحليل" },
                { icon: <GraduationCap size={20} />, title: "المؤسسات التعليمية", desc: "برامج تعليمية تطبيقية" },
                { icon: <Users size={20} />, title: "الأطفال والشباب", desc: "مسارات تفاعلية" },
                { icon: <Globe size={20} />, title: "المناطق البعيدة", desc: "تمكين رقمي مستدام" },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="bg-white rounded-xl p-4 md:p-5 text-center border border-gray-100 hover:border-[#FF7A00]/30 hover:shadow-lg hover:shadow-[#FF7A00]/5 transition-all duration-500 group hover:-translate-y-1">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-black flex items-center justify-center text-white group-hover:bg-[#FF7A00] transition-colors duration-300">
                      {item.icon}
                    </div>
                    <h4 className="text-xs font-bold text-black mb-1">{item.title}</h4>
                    <p className="text-[10px] text-[#545454]">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ IMPACT ═══════════ */}
      <section id="impact" className="py-24 md:py-36 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={IMPACT_BG_URL} alt="" className="w-full h-full object-cover" />
        </div>
        <FloatingOrb className="w-[500px] h-[500px] bg-[#FF7A00]/[0.06] top-0 -right-40" />
        <FloatingOrb className="w-[300px] h-[300px] bg-[#FF7A00]/[0.04] bottom-20 left-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <FadeIn>
            <p className="text-xs text-[#FF7A00] font-bold mb-3 tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>OUR IMPACT</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">الإنجازات والأثر</h2>
            <div className="w-16 h-1 bg-[#FF7A00] rounded-full mb-16" />
          </FadeIn>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mb-20">
            {[
              { number: 500, label: "طفل تم تمكينهم وتدريبهم", sublabel: "في مسارات الذكاء الاصطناعي" },
              { number: 10, label: "وكيل ذكاء اصطناعي", sublabel: "AI Agents تم تطويرها" },
              { number: 5000, label: "مستفيد من البرامج", sublabel: "موظفون، رواد أعمال، طلبة" },
              { number: 15, label: "جهة تم خدمتها", sublabel: "حكومية وخاصة" },
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="text-center md:text-right p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-500">
                  <AnimatedCounter target={stat.number} />
                  <p className="text-sm font-semibold text-white mt-3">{stat.label}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{stat.sublabel}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Key clients */}
          <FadeIn>
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/[0.08]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-0.5 bg-[#FF7A00]" />
                <h3 className="text-lg font-bold">من أبرز الجهات التي خدمناها</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {[
                  { name: "ديوان ولي العهد", type: "تدريب واستشارات" },
                  { name: "هيئة تنمية الأسرة", type: "برامج تمكين" },
                  { name: "صندوق خليفة", type: "تدريب وحلول تقنية" },
                ].map((client, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 md:p-5 bg-white/[0.04] rounded-xl border border-white/[0.06] hover:bg-white/[0.08] hover:border-[#FF7A00]/20 transition-all duration-300 group">
                    <div className="w-11 h-11 rounded-xl bg-[#FF7A00]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF7A00]/30 transition-colors">
                      <Building2 size={18} className="text-[#FF7A00]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{client.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{client.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Events */}
          <div className="mt-8 md:mt-12 grid md:grid-cols-2 gap-6 md:gap-8">
            <FadeIn delay={0.1}>
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/[0.08] hover:bg-white/[0.06] hover:border-[#FF7A00]/10 transition-all duration-500 group">
                <h4 className="text-base font-bold mb-4 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#FF7A00] group-hover:scale-125 transition-transform" />
                  معرض أديبك (ADIPEC)
                </h4>
                <p className="text-sm text-gray-300 leading-[1.8]">
                  مشاركة مخرجات الأطفال المتدربين في أحد أكبر معارض الطاقة عالميًا، مع توثيق رسمي يشمل صور الأطفال مع معالي د. سلطان أحمد الجابر.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/[0.08] hover:bg-white/[0.06] hover:border-[#FF7A00]/10 transition-all duration-500 group">
                <h4 className="text-base font-bold mb-4 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#FF7A00] group-hover:scale-125 transition-transform" />
                  مؤتمر الشرق الأوسط للشباب
                </h4>
                <p className="text-sm text-gray-300 leading-[1.8]">
                  مشاركة فعّالة في تقديم رؤية قرى AI لتمكين الشباب والناشئة بمهارات الذكاء الاصطناعي وبناء قدراتهم المستقبلية.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════ WHY US ═══════════ */}
      <section id="why-us" className="py-24 md:py-36 bg-white relative">
        <FloatingOrb className="w-[300px] h-[300px] bg-[#FF7A00]/[0.02] top-20 left-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <FadeIn>
            <p className="text-xs text-[#FF7A00] font-bold mb-3 tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>WHY QOURA AI</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-4 leading-tight">لماذا قرى AI</h2>
            <div className="w-16 h-1 bg-[#FF7A00] rounded-full mb-16" />
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                num: "01",
                title: "توطين الذكاء الاصطناعي",
                desc: "محتوى عربي مبسّط بوعي ثقافي إماراتي. نقدم التدريب والحلول بلغة يفهمها الجميع.",
              },
              {
                num: "02",
                title: "خبرة مؤسسية وحكومية",
                desc: "فهم عميق لاحتياجات الجهات الحكومية وشبه الحكومية وآليات عملها وتحدياتها.",
              },
              {
                num: "03",
                title: "تطبيق عملي لا نظري",
                desc: "كل برنامج ينتهي بمخرجات قابلة للاستخدام: نماذج عملية، وكلاء ذكاء اصطناعي، ومشاريع.",
              },
              {
                num: "04",
                title: "تمكين المناطق البعيدة",
                desc: "بناء فرص رقمية محلية مستدامة في المجتمعات الريفية والمناطق الأقل وصولًا.",
              },
              {
                num: "05",
                title: "فريق بخبرة دولية",
                desc: "خبرات تنفيذية وتقنية من مؤسسات عالمية رائدة في مجال التقنية والاستشارات.",
              },
              {
                num: "06",
                title: "جاهزية للشراكات",
                desc: "نماذج تنفيذ مرنة تناسب كل جهة: حضوري، عن بعد، أو هجين.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="group p-7 md:p-8 rounded-2xl border border-gray-100 hover:border-[#FF7A00]/20 hover:shadow-xl hover:shadow-[#FF7A00]/5 transition-all duration-500 relative overflow-hidden hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-1 h-0 bg-[#FF7A00] group-hover:h-full transition-all duration-700" />
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#FF7A00] group-hover:w-full transition-all duration-700" />
                  <span className="text-4xl font-extrabold text-[#F2F2F2] group-hover:text-[#FF7A00]/15 transition-colors duration-500" style={{ fontFamily: "'Inter', sans-serif" }}>{item.num}</span>
                  <h4 className="text-base font-bold text-black mt-4 mb-3 group-hover:text-[#FF7A00] transition-colors duration-300">{item.title}</h4>
                  <p className="text-sm text-[#545454] leading-[1.8]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Methodology */}
          <div className="mt-24 md:mt-32">
            <FadeIn>
              <div className="text-center mb-12">
                <p className="text-xs text-[#FF7A00] font-bold mb-3 tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>OUR METHODOLOGY</p>
                <h3 className="text-2xl md:text-3xl font-extrabold text-black">منهجيتنا في التنفيذ</h3>
              </div>
            </FadeIn>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch">
              {[
                { step: "01", title: "فهم الاحتياج", desc: "تحليل دقيق لاحتياجات الجهة" },
                { step: "02", title: "التصميم", desc: "بناء المسار حسب الواقع الفعلي" },
                { step: "03", title: "التنفيذ التفاعلي", desc: "تطبيق عملي بالمخرجات" },
                { step: "04", title: "قياس الأثر", desc: "تقييم المهارات والتحسن" },
                { step: "05", title: "الاستدامة", desc: "دعم ما بعد التنفيذ" },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.08} className="flex-1">
                  <div className="bg-[#FAFAFA] rounded-xl p-5 md:p-6 text-center h-full border border-gray-100 relative group hover:bg-white hover:shadow-lg hover:border-[#FF7A00]/20 transition-all duration-500 hover:-translate-y-1">
                    <div className="w-11 h-11 mx-auto mb-4 rounded-xl bg-[#FF7A00] text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-[#FF7A00]/20 group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {item.step}
                    </div>
                    <h4 className="text-sm font-bold text-black mb-2">{item.title}</h4>
                    <p className="text-xs text-[#545454] leading-relaxed">{item.desc}</p>
                    {i < 4 && (
                      <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 text-[#CCCCCC] group-hover:text-[#FF7A00] transition-colors">
                        <ChevronLeft size={20} />
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTACT ═══════════ */}
      <section id="contact" className="py-24 md:py-36 bg-black text-white relative overflow-hidden">
        <FloatingOrb className="w-[500px] h-[500px] bg-[#FF7A00]/[0.05] top-0 right-0" />
        <FloatingOrb className="w-[300px] h-[300px] bg-[#FF7A00]/[0.03] bottom-0 left-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <FadeIn>
                <img src={LOGO_URL} alt="Qoura AI" className="h-12 md:h-14 invert mb-8 opacity-80" />
                <p className="text-xs text-[#FF7A00] font-bold mb-3 tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>GET IN TOUCH</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight">تواصل معنا</h2>
                <div className="w-16 h-1 bg-[#FF7A00] rounded-full mb-8" />
                <p className="text-gray-400 leading-[1.8] mb-10 max-w-md text-base">
                  نسعد بالتواصل معكم لمناقشة احتياجاتكم وتصميم الحلول المناسبة. فريقنا جاهز لخدمتكم.
                </p>
              </FadeIn>

              <div className="space-y-5">
                <FadeIn delay={0.1}>
                  <a href="mailto:info@qoura.ai" className="flex items-center gap-4 group p-3 -m-3 rounded-xl hover:bg-white/[0.03] transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center group-hover:bg-[#FF7A00] group-hover:scale-110 transition-all duration-300">
                      <Mail size={20} className="text-[#FF7A00] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">البريد الإلكتروني</p>
                      <p className="text-base font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>info@qoura.ai</p>
                    </div>
                  </a>
                </FadeIn>

                <FadeIn delay={0.15}>
                  <a href="tel:+971507300052" className="flex items-center gap-4 group p-3 -m-3 rounded-xl hover:bg-white/[0.03] transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center group-hover:bg-[#FF7A00] group-hover:scale-110 transition-all duration-300">
                      <Phone size={20} className="text-[#FF7A00] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">الهاتف</p>
                      <p className="text-base font-semibold" style={{ fontFamily: "'Inter', sans-serif" }} dir="ltr">+971 50 730 0052</p>
                    </div>
                  </a>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <div className="flex items-center gap-4 p-3 -m-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center">
                      <MapPin size={20} className="text-[#FF7A00]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">المقر</p>
                      <p className="text-base font-semibold">أبوظبي — دولة الإمارات العربية المتحدة</p>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.25}>
                  <a href="https://www.qoura.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group p-3 -m-3 rounded-xl hover:bg-white/[0.03] transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center group-hover:bg-[#FF7A00] group-hover:scale-110 transition-all duration-300">
                      <Globe size={20} className="text-[#FF7A00] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">الموقع الإلكتروني</p>
                      <p className="text-base font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>www.qoura.ai</p>
                    </div>
                  </a>
                </FadeIn>
              </div>
            </div>

            {/* CTA Card */}
            <FadeIn delay={0.2}>
              <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-8 md:p-10 border border-white/[0.08] relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-500">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF7A00]/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 leading-tight">هل تبحث عن شريك في التحول الرقمي؟</h3>
                  <p className="text-sm text-gray-400 leading-[1.8] mb-8">
                    سواء كنت جهة حكومية تسعى لرفع جاهزية فريقها، أو شركة خاصة تريد أتمتة عملياتها، أو مؤسسة تعليمية تبحث عن برامج مبتكرة — نحن هنا لمساعدتك.
                  </p>
                  <a
                    href="mailto:info@qoura.ai"
                    className="inline-flex items-center gap-2 bg-[#FF7A00] text-white px-8 py-4 rounded-xl text-sm font-semibold hover:bg-[#FF7A00]/90 transition-all duration-300 shadow-lg shadow-[#FF7A00]/20 hover:shadow-[#FF7A00]/30 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    أرسل لنا رسالة
                    <Mail size={16} />
                  </a>
                  <div className="mt-8 pt-6 border-t border-white/[0.08]">
                    <p className="text-xs text-gray-500">أو اتصل مباشرة:</p>
                    <p className="text-sm font-semibold mt-1" style={{ fontFamily: "'Inter', sans-serif" }} dir="ltr">+971 50 730 0052</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-20 pt-8 border-t border-white/[0.06] relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              جميع الحقوق محفوظة لشركة قرى للذكاء الاصطناعي © {new Date().getFullYear()}
            </p>
            <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
              Qoura AI — Abu Dhabi, United Arab Emirates
            </p>
          </div>
        </div>
      </section>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-[#FF7A00] text-white rounded-xl shadow-lg shadow-[#FF7A00]/30 flex items-center justify-center hover:bg-black hover:shadow-black/30 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="العودة للأعلى"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
