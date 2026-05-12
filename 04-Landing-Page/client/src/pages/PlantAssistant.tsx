/*
 * Qoura AI — Plant Assistant Page
 * Local Arabic AI plant care assistant with chat + plant cards.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Send, Sparkles, Leaf, Droplets, Sun, Thermometer, Wind, FlaskConical, AlertTriangle, RotateCcw } from "lucide-react";
import {
  PLANT_LIST,
  PLANTS,
  QUICK_PROMPTS,
  answer,
  type PlantId,
} from "@/lib/plantKnowledge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "أهلًا بك في **مساعد قرى للنباتات** 🌿\nاختر نبتتك من القائمة، أو اكتب اسمها في سؤالك. أستطيع مساعدتك في الري، الإضاءة، التربة، التسميد، المشاكل الشائعة، والإكثار.",
  ts: Date.now(),
};

function renderMarkdown(text: string) {
  // tiny inline markdown: **bold** and line breaks
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#1a1a1a]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex w-full", isUser ? "justify-start" : "justify-end")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line",
          isUser
            ? "bg-[#FF7A00] text-white rounded-tl-sm"
            : "bg-white border border-neutral-200 text-neutral-800 rounded-tr-sm shadow-sm"
        )}
        style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
      >
        {msg.content.split("\n").map((line, i) => (
          <div key={i}>{renderMarkdown(line)}</div>
        ))}
      </div>
    </motion.div>
  );
}

function PlantPill({
  plantId,
  selected,
  onClick,
}: {
  plantId: PlantId;
  selected: boolean;
  onClick: () => void;
}) {
  const p = PLANTS[plantId];
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all",
        selected
          ? "border-[#FF7A00] bg-[#FF7A00]/10 text-[#FF7A00] font-semibold"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-[#FF7A00]/40 hover:bg-[#FF7A00]/5"
      )}
    >
      <span className="text-lg">{p.emoji}</span>
      <span>{p.name.split("(")[0].trim()}</span>
    </button>
  );
}

function PlantCard({ plantId }: { plantId: PlantId }) {
  const p = PLANTS[plantId];
  const [a, b] = p.wateringDays;
  const items = [
    { icon: Sun, label: "الإضاءة", value: p.light },
    { icon: Droplets, label: "الري", value: `كل ${a}–${b} يوم` },
    { icon: Thermometer, label: "الحرارة", value: p.temperature },
    { icon: Wind, label: "الرطوبة", value: p.humidity },
    { icon: Leaf, label: "التربة", value: p.soil },
    { icon: FlaskConical, label: "التسميد", value: p.fertilizer },
    { icon: AlertTriangle, label: "السمّية", value: p.toxicity },
  ];
  return (
    <motion.div
      key={p.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-2xl">
          {p.emoji}
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">{p.name}</h3>
          <p className="text-xs text-neutral-500">بطاقة العناية السريعة</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-start gap-3">
            <it.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#FF7A00]" />
            <div className="flex-1 text-sm">
              <div className="text-neutral-500">{it.label}</div>
              <div className="font-medium text-neutral-800">{it.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-neutral-100 pt-4">
        <div className="mb-2 text-xs font-semibold uppercase text-neutral-400 tracking-wide">
          نصائح
        </div>
        <ul className="space-y-1.5">
          {p.tips.map((t) => (
            <li key={t} className="flex gap-2 text-sm text-neutral-700">
              <span className="text-[#FF7A00]">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default function PlantAssistant() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<PlantId | null>(null);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: value,
      ts: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    // Simulate a brief "thinking" delay for UX
    const delay = 350 + Math.random() * 350;
    setTimeout(() => {
      const reply = answer(value, { selectedPlant: selected });
      const botMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
        ts: Date.now(),
      };
      setMessages((m) => [...m, botMsg]);
      setThinking(false);
    }, delay);
  };

  const onSelect = (id: PlantId) => {
    setSelected(id);
    const p = PLANTS[id];
    setMessages((m) => [
      ...m,
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: `تم اختيار **${p.name}** ${p.emoji}\nاسألني عن أي شيء يخصها، أو استخدم الاقتراحات أدناه.`,
        ts: Date.now(),
      },
    ]);
  };

  const reset = () => {
    setMessages([WELCOME]);
    setSelected(null);
  };

  const quickPrompts = useMemo(() => QUICK_PROMPTS, []);

  return (
    <div dir="rtl" className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="container mx-auto flex max-w-6xl items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#ff9a3d] text-white shadow-sm">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-900 md:text-lg">
                مساعد قرى للنباتات
              </h1>
              <p className="text-xs text-neutral-500">
                ذكاء اصطناعي للعناية بنباتاتك المنزلية
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              title="بدء محادثة جديدة"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 transition hover:border-[#FF7A00]/40 hover:text-[#FF7A00]"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">محادثة جديدة</span>
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white transition hover:bg-neutral-800"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="hidden sm:inline">الرئيسية</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <main className="container mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Chat column */}
          <section className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {/* Plant picker row */}
            <div className="border-b border-neutral-100 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <Sparkles className="h-3.5 w-3.5 text-[#FF7A00]" />
                <span>اختر نبتتك</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PLANT_LIST.map((p) => (
                  <PlantPill
                    key={p.id}
                    plantId={p.id}
                    selected={selected === p.id}
                    onClick={() => onSelect(p.id)}
                  />
                ))}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto p-4"
              style={{ minHeight: "55vh", maxHeight: "65vh" }}
            >
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} />
                ))}
              </AnimatePresence>

              {thinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <div className="flex items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#FF7A00] [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#FF7A00] [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#FF7A00]" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick prompts */}
            <div className="border-t border-neutral-100 px-4 pt-3">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-700 transition hover:border-[#FF7A00]/40 hover:bg-[#FF7A00]/5 hover:text-[#FF7A00]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 p-4"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  selected
                    ? `اسأل عن ${PLANTS[selected].name}...`
                    : "اكتب سؤالك عن نباتك..."
                }
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-[#FF7A00] focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/20"
                style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF7A00] text-white shadow-sm transition hover:bg-[#e66e00] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="إرسال"
              >
                <Send className="h-4 w-4 -scale-x-100" />
              </button>
            </form>
          </section>

          {/* Side panel: plant card or intro */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {selected ? (
              <PlantCard plantId={selected} />
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF7A00]/10 text-3xl">
                  🌿
                </div>
                <h3 className="mb-1 text-base font-bold text-neutral-900">
                  ابدأ باختيار نبتة
                </h3>
                <p className="text-sm text-neutral-600">
                  اختر من القائمة لرؤية بطاقة العناية الكاملة، أو اكتب سؤالًا
                  مباشرًا واذكر اسم النبتة فيه.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {PLANT_LIST.slice(0, 6).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onSelect(p.id)}
                      className="rounded-xl border border-neutral-200 bg-white p-3 text-2xl transition hover:border-[#FF7A00]/40 hover:bg-[#FF7A00]/5"
                      title={p.name}
                    >
                      {p.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-neutral-900 p-5 text-white">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-[#FF7A00]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>قرى AI</span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-200">
                هذا المساعد مبني محليًا بمعرفة منسّقة باللغة العربية، يعمل بدون
                إنترنت ويحافظ على خصوصية بياناتك.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
