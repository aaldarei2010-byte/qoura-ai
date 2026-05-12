/*
 * Qoura AI — Plant Assistant
 * Local knowledge base + intent-based responder (Arabic).
 * Pure client-side: no network calls, deterministic, offline-friendly.
 */

export type PlantId =
  | "pothos"
  | "snake"
  | "monstera"
  | "succulent"
  | "cactus"
  | "peace_lily"
  | "fiddle"
  | "aloe"
  | "basil"
  | "mint"
  | "rose"
  | "orchid";

export type Light = "منخفض" | "متوسط" | "ساطع غير مباشر" | "شمس مباشرة";

export interface PlantCard {
  id: PlantId;
  name: string;
  emoji: string;
  light: Light;
  wateringDays: [number, number]; // every X..Y days
  humidity: string;
  soil: string;
  fertilizer: string;
  temperature: string;
  toxicity: string;
  commonIssues: { symptom: string; cause: string; fix: string }[];
  tips: string[];
}

export const PLANTS: Record<PlantId, PlantCard> = {
  pothos: {
    id: "pothos",
    name: "البوتس (Pothos)",
    emoji: "🌿",
    light: "ساطع غير مباشر",
    wateringDays: [7, 10],
    humidity: "40–60%",
    soil: "تربة جيدة التصريف، خفيفة وغنية بالمادة العضوية",
    fertilizer: "سماد سائل متوازن مرة كل شهر في الربيع والصيف",
    temperature: "18–29°م",
    toxicity: "سامة عند الابتلاع للحيوانات الأليفة والأطفال",
    commonIssues: [
      {
        symptom: "أوراق صفراء",
        cause: "ري زائد أو تربة لا تجف بين الريّات",
        fix: "خفّف الري، تأكّد من وجود فتحات تصريف، اترك أعلى 2–3 سم تجف",
      },
      {
        symptom: "أطراف بنية جافة",
        cause: "هواء جاف أو رطوبة منخفضة",
        fix: "ارفع الرطوبة برذاذ خفيف أو ضع وعاء ماء قربها",
      },
      {
        symptom: "نمو بطيء وسيقان طويلة بأوراق متباعدة",
        cause: "إضاءة غير كافية",
        fix: "قرّبها من نافذة مضيئة بدون شمس مباشرة",
      },
    ],
    tips: [
      "تتحمل الإهمال جيدًا — مثالية للمبتدئين",
      "يمكن إكثارها بسهولة بقصّة من الساق في الماء",
      "تنقّي الهواء حسب دراسات NASA",
    ],
  },
  snake: {
    id: "snake",
    name: "نبتة الأفعى (Sansevieria)",
    emoji: "🪴",
    light: "منخفض",
    wateringDays: [14, 21],
    humidity: "تتحمل الجفاف",
    soil: "تربة صبّاريّة سريعة التصريف",
    fertilizer: "سماد مخفّف مرة كل شهرين خلال موسم النمو",
    temperature: "16–27°م",
    toxicity: "سامة بدرجة خفيفة للقطط والكلاب",
    commonIssues: [
      {
        symptom: "تعفن قاعدة الأوراق",
        cause: "ري مفرط أو تربة ثقيلة",
        fix: "أوقف الري فورًا، انقلها إلى تربة جافة وأزل الأجزاء المتعفنة",
      },
      {
        symptom: "أوراق متجعدة",
        cause: "عطش طويل",
        fix: "اسقها ببطء واتركها تمتص الماء جيدًا",
      },
    ],
    tips: [
      "تنتج أكسجين في الليل — مناسبة لغرفة النوم",
      "اتركها تجف تمامًا بين الريّات",
      "تتحمل الإضاءة المنخفضة بدون مشاكل",
    ],
  },
  monstera: {
    id: "monstera",
    name: "المونستيرا (Monstera deliciosa)",
    emoji: "🌱",
    light: "ساطع غير مباشر",
    wateringDays: [7, 10],
    humidity: "60% فأكثر",
    soil: "تربة غنية جيدة التصريف بإضافة بيرلايت",
    fertilizer: "سماد متوازن كل شهر في فصلَي النمو",
    temperature: "20–30°م",
    toxicity: "سامة عند الابتلاع",
    commonIssues: [
      {
        symptom: "أوراق بدون شقوق",
        cause: "نبتة صغيرة أو إضاءة ضعيفة",
        fix: "زدها إضاءة ساطعة غير مباشرة وامنحها وقتًا للنضج",
      },
      {
        symptom: "بقع بنية",
        cause: "ماء يحوي كلور أو ري غير منتظم",
        fix: "استخدم ماء متروكًا 24 ساعة وانتظم في الري",
      },
    ],
    tips: [
      "ضع لها دعامة طحلبية لتسلّق طبيعي",
      "امسح الأوراق من الغبار شهريًا لتنفّس أفضل",
    ],
  },
  succulent: {
    id: "succulent",
    name: "العصاريات (Succulents)",
    emoji: "🌵",
    light: "شمس مباشرة",
    wateringDays: [10, 14],
    humidity: "منخفضة",
    soil: "تربة صبّاريّة + رمل خشن",
    fertilizer: "سماد عصاريات مخفّف مرة كل شهرين",
    temperature: "18–30°م",
    toxicity: "غالبًا غير سامة (تحقق من النوع)",
    commonIssues: [
      {
        symptom: "ذبول وتساقط أوراق",
        cause: "ري زائد",
        fix: "أوقف الري لأسبوعين وتأكد من جفاف التربة كليًا",
      },
      {
        symptom: "استطالة بحثًا عن الضوء",
        cause: "إضاءة قليلة",
        fix: "انقلها لمكان مشمس 6 ساعات يوميًا",
      },
    ],
    tips: [
      "اسقِها بطريقة «نقع وجفاف» — ماء غزير ثم جفاف كامل",
      "تجنّب رشّ الأوراق بالماء",
    ],
  },
  cactus: {
    id: "cactus",
    name: "الصبّار (Cactus)",
    emoji: "🌵",
    light: "شمس مباشرة",
    wateringDays: [14, 28],
    humidity: "منخفضة جدًا",
    soil: "تربة صبّاريّة مع حصى ناعمة",
    fertilizer: "سماد صبّار مرة كل 2–3 أشهر",
    temperature: "21–32°م صيفًا، 10–15°م شتاءً",
    toxicity: "غير سام عادة، لكن الأشواك خطرة",
    commonIssues: [
      {
        symptom: "تعفّن من القاعدة",
        cause: "ماء راكد",
        fix: "اقطع الجزء السليم وأعد زراعته في تربة جافة",
      },
    ],
    tips: ["قلّل الري في الشتاء كثيرًا", "أعطه شمسًا قوية للإزهار"],
  },
  peace_lily: {
    id: "peace_lily",
    name: "زنبق السلام (Peace Lily)",
    emoji: "🌸",
    light: "متوسط",
    wateringDays: [5, 7],
    humidity: "50% فأكثر",
    soil: "تربة رطبة جيدة التصريف",
    fertilizer: "سماد متوازن مخفّف كل 6 أسابيع",
    temperature: "18–27°م",
    toxicity: "سامّة عند الابتلاع",
    commonIssues: [
      {
        symptom: "تدلّي الأوراق",
        cause: "عطش — وتعود بسرعة بعد الري",
        fix: "اسقها فورًا، وراقب جدول الري",
      },
      {
        symptom: "أطراف بنية",
        cause: "كلور في الماء أو رطوبة منخفضة",
        fix: "استخدم ماء مفلتر، وارفع الرطوبة",
      },
    ],
    tips: ["تزدهر بزهور بيضاء عند العناية الجيدة", "تنقّي الهواء بفعالية"],
  },
  fiddle: {
    id: "fiddle",
    name: "فيدل ليف (Fiddle Leaf Fig)",
    emoji: "🌳",
    light: "ساطع غير مباشر",
    wateringDays: [7, 10],
    humidity: "50–60%",
    soil: "تربة غنية جيدة التصريف",
    fertilizer: "سماد سائل شهريًا في الربيع/الصيف",
    temperature: "18–24°م",
    toxicity: "سامّة عند الابتلاع",
    commonIssues: [
      {
        symptom: "بقع بنية على الأوراق",
        cause: "ري زائد أو فطريات",
        fix: "قلّل الري وأزل الأوراق المصابة",
      },
      {
        symptom: "تساقط الأوراق",
        cause: "تغيير مفاجئ في الموقع أو تيار هوائي",
        fix: "ثبّتها في مكان واحد بعيدًا عن المكيف",
      },
    ],
    tips: ["لا تحرّكها كثيرًا — تحب الاستقرار", "امسح أوراقها أسبوعيًا"],
  },
  aloe: {
    id: "aloe",
    name: "الصبّار الطبي (Aloe Vera)",
    emoji: "🌿",
    light: "شمس مباشرة",
    wateringDays: [14, 21],
    humidity: "منخفضة",
    soil: "تربة صبّاريّة سريعة التصريف",
    fertilizer: "سماد مخفّف مرة كل شهرين",
    temperature: "18–27°م",
    toxicity: "خفيفة السمّية عند الابتلاع",
    commonIssues: [
      {
        symptom: "أوراق رخوة وذابلة",
        cause: "ري زائد",
        fix: "خفّف الري وتأكد من جفاف التربة قبل السقاية القادمة",
      },
    ],
    tips: ["هلام الأوراق مفيد للحروق السطحية", "يحتاج شمسًا قوية"],
  },
  basil: {
    id: "basil",
    name: "الريحان (Basil)",
    emoji: "🌿",
    light: "شمس مباشرة",
    wateringDays: [2, 3],
    humidity: "متوسطة",
    soil: "تربة خصبة جيدة التصريف",
    fertilizer: "سماد عضوي خفيف كل أسبوعين",
    temperature: "20–30°م",
    toxicity: "غير سام — صالح للأكل",
    commonIssues: [
      {
        symptom: "اصفرار سريع",
        cause: "ري غير منتظم أو نقص نيتروجين",
        fix: "حافظ على تربة رطبة دون تشبّع وأضف سمادًا خفيفًا",
      },
    ],
    tips: [
      "اقرص الأطراف بانتظام لتشجيع التفرّع",
      "أزل الأزهار مبكّرًا للحفاظ على نكهة الأوراق",
    ],
  },
  mint: {
    id: "mint",
    name: "النعناع (Mint)",
    emoji: "🌱",
    light: "متوسط إلى ساطع",
    wateringDays: [2, 3],
    humidity: "متوسطة",
    soil: "تربة رطبة جيدة التصريف",
    fertilizer: "سماد عضوي خفيف شهريًا",
    temperature: "18–25°م",
    toxicity: "غير سام — صالح للأكل",
    commonIssues: [
      {
        symptom: "انتشار جذري عدواني",
        cause: "طبيعة النبتة",
        fix: "ازرعها في أصيص منفصل لمنع غزو باقي التربة",
      },
    ],
    tips: ["قصّه دوريًا للحصول على نمو كثيف", "تجنّب جفاف التربة الكامل"],
  },
  rose: {
    id: "rose",
    name: "الورد (Rose)",
    emoji: "🌹",
    light: "شمس مباشرة",
    wateringDays: [2, 4],
    humidity: "متوسطة",
    soil: "تربة عميقة جيدة التصريف وغنية بالمواد العضوية",
    fertilizer: "سماد ورد متخصص كل 4–6 أسابيع في موسم النمو",
    temperature: "15–28°م",
    toxicity: "غير سام",
    commonIssues: [
      {
        symptom: "بقع سوداء على الأوراق",
        cause: "فطر الـ Black Spot",
        fix: "أزل الأوراق المصابة وحسّن التهوية ورشّ مبيد فطري",
      },
      {
        symptom: "حشرات منّ على البراعم",
        cause: "إصابة بالمن الأخضر",
        fix: "اشطف بماء بصابون خفيف أو استخدم زيت النيم",
      },
    ],
    tips: ["تقليم منتظم يشجّع الإزهار", "تحتاج 6 ساعات شمس يوميًا"],
  },
  orchid: {
    id: "orchid",
    name: "الأوركيد (Orchid)",
    emoji: "🌸",
    light: "ساطع غير مباشر",
    wateringDays: [7, 10],
    humidity: "50–70%",
    soil: "لحاء خاص بالأوركيد (ليست تربة عادية)",
    fertilizer: "سماد أوركيد مخفّف كل أسبوعين خلال النمو",
    temperature: "18–27°م",
    toxicity: "غير سامة عمومًا",
    commonIssues: [
      {
        symptom: "تساقط البراعم",
        cause: "تغيّر مفاجئ في الحرارة أو الرطوبة",
        fix: "ثبّت ظروف البيئة وابتعد عن تيار التكييف",
      },
      {
        symptom: "جذور هوائية فضّية",
        cause: "طبيعية تمامًا — لا تقصّها",
        fix: "اتركها كما هي ورشّ خفيف من حين لآخر",
      },
    ],
    tips: [
      "اسقها بالغمر لمدة 10 دقائق ثم اترك الماء يصرف تمامًا",
      "تزهر مجدّدًا عند توفّر دورة ليلية أبرد قليلًا",
    ],
  },
};

export const PLANT_LIST: PlantCard[] = Object.values(PLANTS);

// ─── Intent detection ─────────────────────────────────────────────
type Intent =
  | "watering"
  | "light"
  | "soil"
  | "fertilizer"
  | "humidity"
  | "temperature"
  | "toxicity"
  | "issues"
  | "propagation"
  | "general";

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  watering: ["ري", "سقي", "ماء", "اسقي", "أسقي", "اروي", "كم مرة", "كم مرّة", "متى أسقي", "متى اسقي"],
  light: ["ضوء", "شمس", "إضاءة", "اضاءة", "نافذة", "شروق", "غروب"],
  soil: ["تربة", "تربه", "ترابة", "بيتموس", "بيرلايت"],
  fertilizer: ["سماد", "تسميد", "غذاء", "تغذية"],
  humidity: ["رطوبة", "جو جاف", "بخّاخ", "بخاخ"],
  temperature: ["حرارة", "برد", "حرّ", "حر", "شتاء", "صيف", "مكيف"],
  toxicity: ["سامة", "سام", "ابتلاع", "قطة", "كلب", "أطفال", "اطفال"],
  issues: [
    "أوراق صفراء", "اوراق صفراء", "اصفرار", "بقع", "تعفن", "ذبول", "يموت",
    "مشكلة", "مشكله", "تساقط", "بنية", "بنيه", "حشرات", "آفات", "افات"
  ],
  propagation: ["إكثار", "اكثار", "عقل", "عقلة", "أزرع", "تكاثر", "غرس"],
  general: [],
};

function detectPlant(text: string): PlantCard | null {
  const t = text.toLowerCase();
  for (const p of PLANT_LIST) {
    const aliases = [p.name, ...p.name.split(/[\s()]+/)].map((x) => x.toLowerCase());
    if (aliases.some((a) => a.length > 2 && t.includes(a))) return p;
  }
  const map: Record<string, PlantId> = {
    "بوتس": "pothos",
    "pothos": "pothos",
    "أفعى": "snake",
    "افعى": "snake",
    "سنسفيريا": "snake",
    "sansevieria": "snake",
    "snake": "snake",
    "مونستيرا": "monstera",
    "monstera": "monstera",
    "عصارية": "succulent",
    "عصاريات": "succulent",
    "صبار": "cactus",
    "صبّار": "cactus",
    "cactus": "cactus",
    "زنبق": "peace_lily",
    "بيس ليلي": "peace_lily",
    "فيدل": "fiddle",
    "fiddle": "fiddle",
    "ألوفيرا": "aloe",
    "الوفيرا": "aloe",
    "aloe": "aloe",
    "ريحان": "basil",
    "basil": "basil",
    "نعناع": "mint",
    "mint": "mint",
    "ورد": "rose",
    "وردة": "rose",
    "rose": "rose",
    "أوركيد": "orchid",
    "اوركيد": "orchid",
    "orchid": "orchid",
  };
  for (const [kw, id] of Object.entries(map)) {
    if (t.includes(kw)) return PLANTS[id];
  }
  return null;
}

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  for (const [intent, kws] of Object.entries(INTENT_KEYWORDS) as [Intent, string[]][]) {
    if (kws.some((k) => t.includes(k))) return intent;
  }
  return "general";
}

function formatWatering(p: PlantCard): string {
  const [a, b] = p.wateringDays;
  return `${p.emoji} **${p.name}** — الري:\n• كل ${a}–${b} يومًا تقريبًا.\n• تحقق دائمًا: أدخل إصبعك 2–3 سم في التربة، إن كانت جافة فاسقِها.\n• استخدم ماءً بدرجة حرارة الغرفة، ويفضّل متروكًا 24 ساعة لتطاير الكلور.\n• تأكد من فتحات تصريف في الأصيص لتجنّب التعفن.`;
}

function formatLight(p: PlantCard): string {
  return `${p.emoji} **${p.name}** — الإضاءة:\n• المستوى المثالي: ${p.light}.\n• ${
    p.light === "شمس مباشرة"
      ? "ضعها قرب نافذة جنوبية مع 4–6 ساعات شمس يوميًا."
      : p.light === "منخفض"
      ? "تعمل جيدًا حتى في أركان الغرفة البعيدة عن النوافذ."
      : "نافذة شرقية أو ستارة شفافة على نافذة جنوبية مثالية."
  }`;
}

function formatSoil(p: PlantCard): string {
  return `${p.emoji} **${p.name}** — التربة:\n• ${p.soil}.\n• استخدم أصيصًا بفتحات تصريف، وغيّر التربة سنويًا أو سنتين.`;
}

function formatFertilizer(p: PlantCard): string {
  return `${p.emoji} **${p.name}** — التسميد:\n• ${p.fertilizer}.\n• أوقف التسميد في الشتاء أو فترات الراحة.`;
}

function formatHumidity(p: PlantCard): string {
  return `${p.emoji} **${p.name}** — الرطوبة:\n• المستوى الموصى به: ${p.humidity}.\n• ارفع الرطوبة بمجموعة نباتات قريبة، أو صينية حصى رطبة، أو جهاز ترطيب.`;
}

function formatTemperature(p: PlantCard): string {
  return `${p.emoji} **${p.name}** — الحرارة:\n• المدى المريح: ${p.temperature}.\n• تجنّب وضعها أمام مخرج تكييف أو نافذة باردة في الشتاء.`;
}

function formatToxicity(p: PlantCard): string {
  return `${p.emoji} **${p.name}** — السمّية:\n• ${p.toxicity}.\n• ضعها بعيدًا عن متناول الأطفال والحيوانات إن لزم.`;
}

function formatIssues(p: PlantCard): string {
  const lines = p.commonIssues
    .map((i) => `• **${i.symptom}** — السبب: ${i.cause}. الحل: ${i.fix}.`)
    .join("\n");
  return `${p.emoji} **${p.name}** — المشاكل الشائعة:\n${lines}`;
}

function formatPropagation(p: PlantCard): string {
  const tips: Partial<Record<PlantId, string>> = {
    pothos: "اقطع ساقًا تحت عقدة، ضعها في ماء حتى تظهر جذور (1–2 أسبوع) ثم انقلها للتربة.",
    snake: "قسّم الكتلة الجذرية أو ازرع قطعة ورقة 5 سم في تربة جافة.",
    monstera: "قصّ ساقًا فوق عقدة وجذر هوائي، ضعها في الماء حتى تجذّر.",
    succulent: "اقطع ورقة، اتركها تجف يومين، ثم ضعها على تربة رطبة قليلًا.",
    aloe: "افصل البراعم الصغيرة من قاعدة الأم وازرعها في أصص جديدة.",
    basil: "ضع عقلة 10 سم في كوب ماء حتى تجذّر، ثم انقلها للتربة.",
    mint: "ابسط ساقًا على التربة، سيُجذّر سريعًا.",
    rose: "عُقل خشبية في الخريف، أو نصف خشبية في الصيف.",
  };
  const t = tips[p.id];
  return `${p.emoji} **${p.name}** — الإكثار:\n• ${
    t ?? "أفضل طريقة عمومية: العقلة الساقية في الماء أو التربة الرطبة."
  }`;
}

function formatGeneral(p: PlantCard): string {
  const [a, b] = p.wateringDays;
  const tips = p.tips.map((t) => `• ${t}`).join("\n");
  return [
    `${p.emoji} **${p.name}** — بطاقة العناية:`,
    `• 💡 الإضاءة: ${p.light}`,
    `• 💧 الري: كل ${a}–${b} يومًا`,
    `• 🌡️ الحرارة: ${p.temperature}`,
    `• 💨 الرطوبة: ${p.humidity}`,
    `• 🪴 التربة: ${p.soil}`,
    `• 🌱 التسميد: ${p.fertilizer}`,
    `• ⚠️ السمّية: ${p.toxicity}`,
    "",
    "**نصائح مختارة:**",
    tips,
  ].join("\n");
}

const FORMATTERS: Record<Intent, (p: PlantCard) => string> = {
  watering: formatWatering,
  light: formatLight,
  soil: formatSoil,
  fertilizer: formatFertilizer,
  humidity: formatHumidity,
  temperature: formatTemperature,
  toxicity: formatToxicity,
  issues: formatIssues,
  propagation: formatPropagation,
  general: formatGeneral,
};

export interface AssistantContext {
  selectedPlant: PlantId | null;
}

export function answer(question: string, ctx: AssistantContext): string {
  const trimmed = question.trim();
  if (!trimmed) {
    return "اكتب لي اسم النبتة أو سؤالك. مثلاً: «كم مرة أسقي البوتس؟»";
  }

  // Greetings
  if (/^(مرحبا|السلام|اهلا|أهلا|hi|hello|hey)/i.test(trimmed)) {
    return "أهلًا بك 🌿\nأنا مساعد قرى للنباتات. اختر نبتتك من القائمة أو اذكر اسمها في سؤالك، وسأرشدك للعناية المثلى.";
  }

  const detected = detectPlant(trimmed);
  const plant = detected ?? (ctx.selectedPlant ? PLANTS[ctx.selectedPlant] : null);

  if (!plant) {
    return [
      "لم أتعرّف على النبتة في سؤالك 🌱",
      "اختر نبتة من القائمة على اليمين، أو اذكر اسمها مثل:",
      "• «المونستيرا تذبل، شو السبب؟»",
      "• «كم مرة أسقي البوتس؟»",
      "• «كيف أُكثّر العصاريات؟»",
    ].join("\n");
  }

  const intent = detectIntent(trimmed);
  return FORMATTERS[intent](plant);
}

export const QUICK_PROMPTS = [
  "كم مرة أسقيها؟",
  "ما الإضاءة المناسبة؟",
  "أوراقها صفراء، ما السبب؟",
  "كيف أُكثّرها؟",
  "ما التربة المثالية؟",
  "هل هي سامّة؟",
];
