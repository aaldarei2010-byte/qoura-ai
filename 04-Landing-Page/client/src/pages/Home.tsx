/*
 * Qoura AI - Landing Page
 * Design: "Quiet Intelligence" - Minimalist Editorial
 * Colors: Black #000000, Orange #FF7A00, White #FFFFFF, Grays
 * Fonts: Noto Kufi Arabic (AR) + Inter (EN)
 */

import {
  LOGO_URL,
  HERO_BG_URL,
  SERVICES_BG_URL,
  IMPACT_BG_URL,
  ABOUT_BG_URL,
} from "@/lib/constants";
import { Mail, Phone, MapPin, Globe, GraduationCap, Brain, Cpu, BarChart3, Users, Building2, Lightbulb, Shield, Heart, Target, ChevronLeft, ArrowUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─── Animated Counter ───
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-[#FF7A00]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {count.toLocaleString()}+{suffix}
    </div>
  );
}

// ─── Fade-in wrapper ───
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main Page ───
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
      setShowScrollTop(window.scrollY > 600);
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
          <button onClick={() => scrollTo("hero")} className="flex-shrink-0">
            <img src={LOGO_URL} alt="Qoura AI - قرى" className="h-8 md:h-10" />
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-sm text-[#545454] hover:text-black transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-[#FF7A00] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="القائمة"
          >
            <span className={`w-6 h-0.5 bg-black transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`w-6 h-0.5 bg-black transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`w-6 h-0.5 bg-black transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-right text-sm text-[#545454] hover:text-black py-2"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG_URL} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-l from-white via-white/80 to-white/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32 md:py-0 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <FadeIn>
              <div className="w-12 h-0.5 bg-[#FF7A00] mb-8" />
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight mb-6">
                نُمكّن المجتمع
                <br />
                <span className="text-[#FF7A00]">بالذكاء الاصطناعي</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-[#545454] leading-relaxed mb-8 max-w-lg">
                شركة إماراتية متخصصة في تمكين المجتمع والمؤسسات عبر برامج تدريب تطبيقية، واستشارات مؤسسية، وحلول تقنية متقدمة في الذكاء الاصطناعي.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollTo("services")}
                  className="bg-black text-white px-8 py-3.5 rounded-sm text-sm font-semibold hover:bg-[#FF7A00] transition-colors duration-300 flex items-center gap-2"
                >
                  استكشف خدماتنا
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollTo("contact")}
                  className="border-2 border-black text-black px-8 py-3.5 rounded-sm text-sm font-semibold hover:bg-black hover:text-white transition-colors duration-300"
                >
                  تواصل معنا
                </button>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4} className="hidden md:block">
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-[#FF7A00]/5 rounded-full blur-3xl" />
              <img src={LOGO_URL} alt="Qoura AI" className="w-64 mx-auto relative z-10 drop-shadow-2xl" />
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 rounded-full border-2 border-[#CCCCCC] flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-[#FF7A00] rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      <section id="about" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <p className="text-sm text-[#FF7A00] font-semibold mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>WHO WE ARE</p>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">من نحن</h2>
                <div className="w-12 h-0.5 bg-[#FF7A00] mb-8" />
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="text-[#545454] leading-relaxed mb-6">
                  <strong className="text-black">قرى AI (Qoura AI)</strong> شركة إماراتية متخصصة في تمكين المجتمع والمؤسسات بالذكاء الاصطناعي عبر برامج تدريب تطبيقية، واستشارات مؤسسية، وحلول تقنية متقدمة مثل AI Agents والأتمتة وتحليل البيانات.
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <p className="text-[#545454] leading-relaxed mb-6">
                  تنطلق قرى AI من قناعة أساسية: <strong className="text-black">الموهبة موجودة في كل مكان، وما ينقصها هو المسار الصحيح والتدريب العملي والبيئة الداعمة.</strong> اسم "قرى" يشير إلى القرى والمجتمعات المحلية التي تسعى الشركة لتمكينها رقميًا.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="bg-[#FAFAFA] rounded-lg p-6 border-r-2 border-[#FF7A00]">
                  <p className="text-sm text-[#545454] leading-relaxed italic">
                    "نعمل بأسلوب مبسط وعملي باللغة العربية وبفهم عميق للثقافة المحلية الإماراتية، مع تركيز خاص على تمكين الأطفال والشباب والمناطق البعيدة."
                  </p>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.2}>
              <div className="relative">
                <img src={ABOUT_BG_URL} alt="Qoura AI Innovation" className="w-full rounded-lg shadow-xl" />
                <div className="absolute -bottom-6 -left-6 bg-black text-white p-6 rounded-lg shadow-xl">
                  <p className="text-xs text-[#FF7A00] mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Abu Dhabi, UAE</p>
                  <p className="text-sm font-semibold">أبوظبي — الإمارات</p>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8 mt-20">
            <FadeIn>
              <div className="bg-black text-white p-10 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-xl font-bold mb-4 relative z-10">الرؤية</h3>
                <p className="text-gray-300 leading-relaxed text-sm relative z-10">
                  أن تصبح قرى AI منصة رائدة في المنطقة لبناء جيل قادر على فهم الذكاء الاصطناعي واستخدامه وصناعته، مع ضمان شمول المناطق البعيدة والقرى والمجتمعات الأقل وصولًا للفرص الرقمية.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF7A00]" />
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-[#FAFAFA] p-10 rounded-lg border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h3 className="text-xl font-bold text-black mb-4 relative z-10">الرسالة</h3>
                <p className="text-[#545454] leading-relaxed text-sm relative z-10">
                  تمكين الأفراد والمؤسسات من استخدام الذكاء الاصطناعي بشكل عملي، مسؤول، وقابل للقياس عبر التدريب التطبيقي، وتطوير الحلول، ودعم التحول المؤسسي.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black" />
              </div>
            </FadeIn>
          </div>

          {/* Values */}
          <div className="mt-20">
            <FadeIn>
              <h3 className="text-2xl font-bold text-black mb-10 text-center">قيمنا الأساسية</h3>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { icon: <Lightbulb size={24} />, title: "الوضوح والبساطة", desc: "تبسيط المعرفة دون تقليل قيمتها" },
                { icon: <Target size={24} />, title: "الأثر والنتائج", desc: "التدريب يُقاس بمخرجات واضحة" },
                { icon: <Heart size={24} />, title: "الهوية والثقافة", desc: "توطين المحتوى بما يناسب الثقافة" },
                { icon: <Shield size={24} />, title: "الابتكار المسؤول", desc: "مراعاة الخصوصية والأخلاقيات" },
                { icon: <Users size={24} />, title: "الشمول", desc: "فرص متساوية للجميع" },
              ].map((v, i) => (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="text-center p-6 bg-white rounded-lg border border-gray-100 hover:border-[#FF7A00]/30 hover:shadow-md transition-all duration-300 group">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-white transition-all duration-300">
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
      <section id="services" className="py-24 md:py-32 bg-[#FAFAFA] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 opacity-10">
          <img src={SERVICES_BG_URL} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <FadeIn>
            <p className="text-sm text-[#FF7A00] font-semibold mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>OUR SERVICES</p>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">خدماتنا</h2>
            <div className="w-12 h-0.5 bg-[#FF7A00] mb-6" />
            <p className="text-[#545454] max-w-2xl mb-16">
              نقدم ثلاثة محاور رئيسية من الخدمات، مصممة لتلبية احتياجات كل فئة وكل جهة بأسلوب عملي وقابل للقياس.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <FadeIn delay={0}>
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 rounded-lg bg-[#FF7A00]/10 flex items-center justify-center mb-6">
                  <GraduationCap size={28} className="text-[#FF7A00]" />
                </div>
                <h3 className="text-lg font-bold text-black mb-3">برامج التدريب وبناء القدرات</h3>
                <p className="text-xs text-[#FF7A00] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>AI Capability Building</p>
                <p className="text-sm text-[#545454] leading-relaxed mb-6 flex-1">
                  برامج تدريبية تطبيقية موجهة للجهات الحكومية وشبه الحكومية لرفع الجاهزية والإنتاجية، وللقطاع الخاص لتحسين العمليات، وللأطفال والناشئة عبر تعليم عملي قائم على المشاريع.
                </p>
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  {["أساسيات الذكاء الاصطناعي التوليدي", "بناء AI Agents", "الأتمتة وربط الأدوات", "تحليل البيانات", "مسارات الأطفال والناشئة"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#545454]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Service 2 */}
            <FadeIn delay={0.1}>
              <div className="bg-black text-white rounded-lg p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF7A00]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="w-14 h-14 rounded-lg bg-[#FF7A00]/20 flex items-center justify-center mb-6 relative z-10">
                  <Brain size={28} className="text-[#FF7A00]" />
                </div>
                <h3 className="text-lg font-bold mb-3 relative z-10">الاستشارات المؤسسية</h3>
                <p className="text-xs text-[#FF7A00] mb-4 relative z-10" style={{ fontFamily: "'Inter', sans-serif" }}>AI Advisory</p>
                <p className="text-sm text-gray-300 leading-relaxed mb-6 flex-1 relative z-10">
                  نساعد الجهات على تحديد أفضل حالات الاستخدام حسب أولوياتها، وتصميم خارطة طريق للتبني، وبناء سياسات الاستخدام المسؤول، وتطوير جاهزية الفرق.
                </p>
                <div className="space-y-2 border-t border-white/10 pt-4 relative z-10">
                  {["تحديد Use Cases", "خارطة طريق AI Roadmap", "سياسات Responsible AI", "مؤشرات أداء KPIs"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF7A00]" />
              </div>
            </FadeIn>

            {/* Service 3 */}
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 rounded-lg bg-[#FF7A00]/10 flex items-center justify-center mb-6">
                  <Cpu size={28} className="text-[#FF7A00]" />
                </div>
                <h3 className="text-lg font-bold text-black mb-3">الحلول التقنية</h3>
                <p className="text-xs text-[#FF7A00] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>AI Solutions</p>
                <p className="text-sm text-[#545454] leading-relaxed mb-6 flex-1">
                  نطوّر حلولًا مخصصة حسب احتياج كل جهة، تشمل وكلاء ذكاء اصطناعي داخلية، وأتمتة إجراءات متكررة، وتحليل بيانات واستخراج مؤشرات وتقارير ذكية.
                </p>
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  {["AI Agents داخلية", "أتمتة الإجراءات", "تحليل البيانات الذكي", "حلول مخصصة متكاملة"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#545454]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Target Audiences */}
          <div className="mt-20">
            <FadeIn>
              <h3 className="text-2xl font-bold text-black mb-10">الفئات المستهدفة</h3>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: <Building2 size={20} />, title: "الجهات الحكومية", desc: "تدريب + استشارات + حلول" },
                { icon: <BarChart3 size={20} />, title: "القطاع الخاص", desc: "تدريب + أتمتة + تحليل" },
                { icon: <GraduationCap size={20} />, title: "المؤسسات التعليمية", desc: "برامج تعليمية تطبيقية" },
                { icon: <Users size={20} />, title: "الأطفال والشباب", desc: "مسارات تفاعلية" },
                { icon: <Globe size={20} />, title: "المناطق البعيدة", desc: "تمكين رقمي مستدام" },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="bg-white rounded-lg p-5 text-center border border-gray-100 hover:border-[#FF7A00]/30 transition-all duration-300">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-black flex items-center justify-center text-white">
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
      <section id="impact" className="py-24 md:py-32 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src={IMPACT_BG_URL} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <FadeIn>
            <p className="text-sm text-[#FF7A00] font-semibold mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>OUR IMPACT</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">الإنجازات والأثر</h2>
            <div className="w-12 h-0.5 bg-[#FF7A00] mb-16" />
          </FadeIn>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {[
              { number: 500, label: "طفل تم تمكينهم وتدريبهم", sublabel: "في مسارات الذكاء الاصطناعي" },
              { number: 10, label: "وكيل ذكاء اصطناعي", sublabel: "AI Agents تم تطويرها" },
              { number: 5000, label: "مستفيد من البرامج", sublabel: "موظفون، رواد أعمال، طلبة" },
              { number: 15, label: "جهة تم خدمتها", sublabel: "حكومية وخاصة" },
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="text-center md:text-right">
                  <AnimatedCounter target={stat.number} />
                  <p className="text-sm font-semibold text-white mt-2">{stat.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sublabel}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Key clients */}
          <FadeIn>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
              <h3 className="text-lg font-bold mb-6">من أبرز الجهات التي خدمناها</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "ديوان ولي العهد", type: "تدريب واستشارات" },
                  { name: "هيئة تنمية الأسرة", type: "برامج تمكين" },
                  { name: "صندوق خليفة", type: "تدريب وحلول تقنية" },
                ].map((client, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#FF7A00]/20 flex items-center justify-center flex-shrink-0">
                      <Building2 size={18} className="text-[#FF7A00]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Events */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <FadeIn delay={0.1}>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
                <h4 className="text-base font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF7A00]" />
                  معرض أديبك (ADIPEC)
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  مشاركة مخرجات الأطفال المتدربين في أحد أكبر معارض الطاقة عالميًا، مع توثيق رسمي يشمل صور الأطفال مع معالي د. سلطان أحمد الجابر.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
                <h4 className="text-base font-bold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF7A00]" />
                  مؤتمر الشرق الأوسط للشباب
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  مشاركة فعّالة في تقديم رؤية قرى AI لتمكين الشباب والناشئة بمهارات الذكاء الاصطناعي وبناء قدراتهم المستقبلية.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════ WHY US ═══════════ */}
      <section id="why-us" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <FadeIn>
            <p className="text-sm text-[#FF7A00] font-semibold mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>WHY QOURA AI</p>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">لماذا قرى AI</h2>
            <div className="w-12 h-0.5 bg-[#FF7A00] mb-16" />
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
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
                <div className="group p-8 rounded-lg border border-gray-100 hover:border-[#FF7A00]/30 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-0 bg-[#FF7A00] group-hover:h-full transition-all duration-500" />
                  <span className="text-3xl font-bold text-[#F2F2F2] group-hover:text-[#FF7A00]/20 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>{item.num}</span>
                  <h4 className="text-base font-bold text-black mt-4 mb-3">{item.title}</h4>
                  <p className="text-sm text-[#545454] leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Methodology */}
          <div className="mt-24">
            <FadeIn>
              <h3 className="text-2xl font-bold text-black mb-10 text-center">منهجيتنا في التنفيذ</h3>
            </FadeIn>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {[
                { step: "01", title: "فهم الاحتياج", desc: "تحليل دقيق لاحتياجات الجهة" },
                { step: "02", title: "التصميم", desc: "بناء المسار حسب الواقع الفعلي" },
                { step: "03", title: "التنفيذ التفاعلي", desc: "تطبيق عملي بالمخرجات" },
                { step: "04", title: "قياس الأثر", desc: "تقييم المهارات والتحسن" },
                { step: "05", title: "الاستدامة", desc: "دعم ما بعد التنفيذ" },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.08} className="flex-1">
                  <div className="bg-[#FAFAFA] rounded-lg p-6 text-center h-full border border-gray-100 relative">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#FF7A00] text-white flex items-center justify-center text-sm font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {item.step}
                    </div>
                    <h4 className="text-sm font-bold text-black mb-2">{item.title}</h4>
                    <p className="text-xs text-[#545454]">{item.desc}</p>
                    {i < 4 && (
                      <div className="hidden md:block absolute top-1/2 -left-3 -translate-y-1/2 text-[#CCCCCC]">
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
      <section id="contact" className="py-24 md:py-32 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF7A00]/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <img src={LOGO_URL} alt="Qoura AI" className="h-14 invert mb-8" />
                <h2 className="text-3xl md:text-4xl font-bold mb-6">تواصل معنا</h2>
                <div className="w-12 h-0.5 bg-[#FF7A00] mb-8" />
                <p className="text-gray-400 leading-relaxed mb-10 max-w-md">
                  نسعد بالتواصل معكم لمناقشة احتياجاتكم وتصميم الحلول المناسبة. فريقنا جاهز لخدمتكم.
                </p>
              </FadeIn>

              <div className="space-y-6">
                <FadeIn delay={0.1}>
                  <a href="mailto:info@qoura.ai" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-[#FF7A00]/10 flex items-center justify-center group-hover:bg-[#FF7A00] transition-colors duration-300">
                      <Mail size={20} className="text-[#FF7A00] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">البريد الإلكتروني</p>
                      <p className="text-base font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>info@qoura.ai</p>
                    </div>
                  </a>
                </FadeIn>

                <FadeIn delay={0.15}>
                  <a href="tel:+971507300052" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-[#FF7A00]/10 flex items-center justify-center group-hover:bg-[#FF7A00] transition-colors duration-300">
                      <Phone size={20} className="text-[#FF7A00] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">الهاتف</p>
                      <p className="text-base font-semibold" style={{ fontFamily: "'Inter', sans-serif" }} dir="ltr">+971 50 730 0052</p>
                    </div>
                  </a>
                </FadeIn>

                <FadeIn delay={0.2}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF7A00]/10 flex items-center justify-center">
                      <MapPin size={20} className="text-[#FF7A00]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">المقر</p>
                      <p className="text-base font-semibold">أبوظبي — دولة الإمارات العربية المتحدة</p>
                    </div>
                  </div>
                </FadeIn>

                <FadeIn delay={0.25}>
                  <a href="https://www.qoura.ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-[#FF7A00]/10 flex items-center justify-center group-hover:bg-[#FF7A00] transition-colors duration-300">
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
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-10 border border-white/10">
                <h3 className="text-xl font-bold mb-4">هل تبحث عن شريك في التحول الرقمي؟</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-8">
                  سواء كنت جهة حكومية تسعى لرفع جاهزية فريقها، أو شركة خاصة تريد أتمتة عملياتها، أو مؤسسة تعليمية تبحث عن برامج مبتكرة — نحن هنا لمساعدتك.
                </p>
                <a
                  href="mailto:info@qoura.ai"
                  className="inline-flex items-center gap-2 bg-[#FF7A00] text-white px-8 py-3.5 rounded-sm text-sm font-semibold hover:bg-[#FF7A00]/90 transition-colors"
                >
                  أرسل لنا رسالة
                  <Mail size={16} />
                </a>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-xs text-gray-500">أو اتصل مباشرة:</p>
                  <p className="text-sm font-semibold mt-1" style={{ fontFamily: "'Inter', sans-serif" }} dir="ltr">+971 50 730 0052</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-20 pt-8 border-t border-white/10 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              جميع الحقوق محفوظة لشركة قرى للذكاء الاصطناعي © 2026
            </p>
            <p className="text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
              Qoura AI — Abu Dhabi, United Arab Emirates
            </p>
          </div>
        </div>
      </section>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-[#FF7A00] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-black transition-colors duration-300"
          aria-label="العودة للأعلى"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
