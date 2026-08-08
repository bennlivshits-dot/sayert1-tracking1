import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import logoImg from "./assets/logo.png";
import {
  Home, MessageSquare, BookOpen, User, Shield, Users, ClipboardCheck, Camera, Image as ImageIcon,
  TrendingUp, Check, X, Plus, Trash2, Send, Clock, Target, Dumbbell, Award,
  MapPin, ChevronDown, Gauge as GaugeIcon, Zap, BarChart3, Newspaper, Flame, Compass, Eye, EyeOff,
  HeartPulse, Timer, Loader2, ShieldAlert, Siren, CalendarDays, ChevronRight,
  ChevronLeft, CheckCircle2, Lock, LogOut, Heart, Bot, Sparkles, Star, Sun, Moon,
} from "lucide-react";
import {
  SUPABASE_URL as CFG_SUPABASE_URL,
  SUPABASE_ANON_KEY as CFG_SUPABASE_ANON_KEY,
  GEMINI_API_KEY as CFG_GEMINI_API_KEY,
  NETWORK_CODE as CFG_NETWORK_CODE,
} from "./config.js";

// Reads a Vite env var if present (Netlify-style deployment). Returns "" if unset
// or unavailable, so the app degrades to local-storage demo mode instead of
// crashing rather than a blank white screen.
function envVar(name) {
  try {
    return (import.meta.env && import.meta.env[name]) || "";
  } catch (e) {
    return "";
  }
}

// A config.js value counts as "set" only once the placeholder text has actually
// been replaced - this is what makes the app cleanly fall back to local mode
// automatically until real keys are pasted in, instead of trying (and failing)
// to fetch from a URL that's literally the Hebrew placeholder string.
function resolveConfig(envValue, hardcodedValue) {
  if (envValue) return envValue;
  if (hardcodedValue && !hardcodedValue.includes("הדבק_כאן")) return hardcodedValue;
  return "";
}

/**
 * ⚙️ CONFIG — reads from src/config.js (paste your real keys there - the intended
 * setup for GitHub Pages, since Pages serves static files with no env var system).
 * Real environment variables (VITE_*, e.g. on Netlify) take priority if present,
 * so the same code works on either host without edits.
 *
 * ADMIN_INVITE_CODE is intentionally NOT here anymore — see README.md: admin
 * self-signup via a client-side code was a real security gap (anyone reading the
 * bundle could find the code and self-promote). The first admin is now set once,
 * directly in Supabase's SQL editor; every other admin is promoted from inside
 * the app by an existing admin, enforced by RLS — not by a string in the JS bundle.
 */
const CONFIG = {
  GEMINI_API_KEY: resolveConfig(envVar("VITE_GEMINI_API_KEY"), CFG_GEMINI_API_KEY),
  NETWORK_CODE: resolveConfig(envVar("VITE_NETWORK_CODE"), CFG_NETWORK_CODE),
  SUPABASE_URL: resolveConfig(envVar("VITE_SUPABASE_URL"), CFG_SUPABASE_URL),
  SUPABASE_ANON_KEY: resolveConfig(envVar("VITE_SUPABASE_ANON_KEY"), CFG_SUPABASE_ANON_KEY),
};

/* ============================== MOCK / STATIC DATA ============================== */

const UNITS = [
  { id: "sayeret", name: "סיירת מטכ״ל", tagline: "מצוינות וחשיבה מחוץ לקופסה", text: "text-yellow-500", border: "border-yellow-600", hex: "#eab308", req: "ריצת 2 ק״מ מתחת ל-9 דק׳, מבחני מיון פיזיים ומנטליים קשוחים" },
  { id: "duvdevan", name: "חטיבת הקומנדו", tagline: "אגוז, מגלן ודובדבן", text: "text-red-400", border: "border-red-800", hex: "#f87171", req: "לוחמה בשטח בנוי, שליטה עצמית תחת לחץ" },
  { id: "shayetet", name: "שייטת 13", tagline: "עבודה תחת קור קיצוני וסוסיות", text: "text-cyan-400", border: "border-cyan-500", hex: "#22d3ee", req: "שחייה ארוכה, צלילה חופשית, עומס נפשי גבוה" },
  { id: "shaldag", name: "שלדג", tagline: "קשיחות ושאיפה לטוב ביותר", text: "text-blue-400", border: "border-blue-500", hex: "#60a5fa", req: "ניווט שטח, קפיצות צניחה, כושר גופני עילי" },
  { id: "669", name: "יחידה 669", tagline: "עבודה תחת לחץ", text: "text-emerald-400", border: "border-orange-500", hex: "#fb923c", req: "חילוץ הרים, עזרה ראשונה קרבית, סיבולת גבוהה" },
  { id: "hir", name: "חי״ר", tagline: "דור הניצחון ואחוות לוחמים", text: "text-lime-500", border: "border-lime-600", hex: "#a3e635", req: "מסעות רגליים, נשיאת ציוד, עבודת צוות" },
  { id: "chovlim", name: "חובלים", tagline: "אתגר אינטלקטואלי ופיזי", text: "text-slate-100", border: "border-slate-300", hex: "#e2e8f0", req: "לימודי פיקוד, ניווט ימי, משמעת גבוהה" },
  { id: "tayas", name: "טייס", tagline: "אחריות וזיכרון למופת", text: "text-sky-300", border: "border-sky-400", hex: "#38bdf8", req: "מבדקים פסיכוטכניים, ריכוז גבוה, כושר גופני מלא" },
  { id: "okatz", name: "עוקץ", tagline: "זיקה לבעלי חיים ועצמאות מוחלטת", text: "text-pink-400", border: "border-pink-600", hex: "#db2777", req: "מיון עוקץ, יכולת עבודה עם כלבים, כושר גופני גבוה" },
  { id: "yahalom", name: "יהל״ם", tagline: "דיוק כירורגי וקור רוח", text: "text-stone-300", border: "border-stone-500", hex: "#78716c", req: "גיבוש יהל״ם, כוח שריר, עבודה בחללים סגורים" },
  { id: "tzanhanim", name: "צנחנים", tagline: "רוח התנדבות וגאוות יחידה", text: "text-red-500", border: "border-red-900", hex: "#991b1b", req: "גיבוש צנחנים, סיבולת ריצה, מסעות ואלונקות" },
  { id: "submarines", name: "צוללות - שייטת 7", tagline: "חוסן נפשי ועבודת צוות סגורה", text: "text-indigo-400", border: "border-indigo-700", hex: "#1e3a8a", req: "גיבוש חובלים/צוללות, עמידות נפשית למרחב סגור" },
  { id: "unit504", name: "יחידה 504", tagline: "אינטליגנציה רגשית ובגרות נפשית", text: "text-violet-400", border: "border-violet-600", hex: "#7c3aed", req: "כושר שטח, שפות זרות, מיונים פסיכולוגיים" },
  { id: "coral", name: "יחידת קורל", tagline: "סיווג עמוק ומשמעת ברזל", text: "text-teal-400", border: "border-teal-600", hex: "#14b8a6", req: "כושר חי״ר עילי, עמידה בסיווג ביטחוני גבוה" },
  { id: "lotar", name: "יחידת הלוט״ר", tagline: "הדרכה ודיוק כירורגי", text: "text-zinc-400", border: "border-zinc-600", hex: "#52525b", req: "גיבוש לוט״ר, כוח מתפרץ, זריזות בשטח בנוי" },
  { id: "unit5515", name: "מלך האריות - 5515", tagline: "ניוד טקטי ונהיגת שטח", text: "text-amber-700", border: "border-amber-800", hex: "#92400e", req: "חוסן ליבה וגב, תפיסה מרחבית גבוהה" },
  { id: "yamas", name: "ימ״ס (מג״ב)", tagline: "היטמעות והסתערבות חשאית", text: "text-green-600", border: "border-green-800", hex: "#15803d", req: "גיבוש ימ״ס, כוח מתפרץ, זחילה וריצה מהירה" },
  { id: "golani", name: "סיירת גולני", tagline: "רוח לחימה ואחוות לוחמים", text: "text-yellow-700", border: "border-yellow-800", hex: "#a16207", req: "גיבוש היחטיות, מסעות ואלונקות בשטח הררי" },
  { id: "givati", name: "סיירת גבעתי", tagline: "זריזות וכוח מתפרץ", text: "text-purple-500", border: "border-purple-700", hex: "#9333ea", req: "גיבוש היחטיות, ריצה בדיונות" },
  { id: "nachal", name: "סיירת נח״ל", tagline: "אינטליגנציה ועבודת צוות", text: "text-green-400", border: "border-green-500", hex: "#4ade80", req: "גיבוש היחטיות, סיבולת שריר וחוסן מנטלי" },
  { id: "kharuv", name: "סיירת חרוב", tagline: "חדות תגובה ולחימה עירונית", text: "text-lime-800", border: "border-lime-900", hex: "#365314", req: "גיבוש היחטיות, כוח מתפרץ בסמטאות" },
  { id: "unit5353", name: "רוכב שמיים - 5353", tagline: "טכנולוגיה ואיסוף מודיעיני", text: "text-red-600", border: "border-red-800", hex: "#b91c1c", req: "גיבוש רוכב שמיים, חוסן גב וליבה" },
  { id: "unit888", name: "היחידה הרב-ממדית - רפאים", tagline: "טכנולוגיה עתידנית וחי״ר", text: "text-indigo-400", border: "border-indigo-500", hex: "#6366f1", req: "כושר סיירת, קליטה טכנולוגית מהירה" },
  { id: "yaltam", name: "יחידת ילת״ם", tagline: "הנדסה וצלילה תת-ימית", text: "text-cyan-600", border: "border-cyan-800", hex: "#0e7490", req: "גיבוש חובלים/צוללות, קור רוח במים" },
  { id: "sanfir", name: "יחידת סנפיר", tagline: "הגנת נמלים ואקשן ימי", text: "text-sky-500", border: "border-sky-700", hex: "#0284c7", req: "גיבוש סנפיר, שחייה וכושר ימי" },
];

const TIERS = ["מתחילים", "מתקדם", "לפני גיבוש", "לפני גיוס"];

const GIBUSH_TYPES = [
  "גיבוש מטכ\"ל", "גיבוש שייטת", "גיבוש חובלים", "גיבוש טיס",
  "גיבוש יחטיות", "גיבוש ימ\"ס", "יום סיירות", "גיבושון 669",
];

// Per-type color: hex is the primary accent, hex2 (when present) is the secondary
// tone for a two-color glow, matching the exact pairs given.
const GIBUSH_TYPE_COLORS = {
  "גיבוש מטכ\"ל": { hex: "#eab308" },                    // זהב
  "גיבוש שייטת": { hex: "#38bdf8", hex2: "#ffffff" },     // כחול לבן
  "גיבוש חובלים": { hex: "#22d3ee" },                     // תכלת
  "גיבוש טיס": { hex: "#e2e8f0", hex2: "#94a3b8" },       // לבן כסף
  "גיבוש יחטיות": { hex: "#92400e", hex2: "#eab308" },    // חום כהה זהב
  "גיבוש ימ\"ס": { hex: "#c0c8d1" },                       // כסף
  "יום סיירות": { hex: "#9ca3af" },                        // אפור
  "גיבושון 669": { hex: "#fb923c", hex2: "#34d399" },     // כתום ירוק
};

const HEALTH_OPTIONS = ["ברכיים", "גב תחתון", "קרסוליים", "אסטמה / נשימה", "בעיות לב", "אחר"];

// Starts empty on purpose — real articles/training content will be managed via Supabase later.
const INITIAL_ARTICLES = [];

const TRAINING_BANK = [
  { id: "טייס", title: "טייס", icon: Award, color: "text-sky-400", bg: "bg-sky-500/15", items: [] },
  { id: "מטכ\"ל", title: "מטכ״ל", icon: Shield, color: "text-yellow-400", bg: "bg-yellow-500/15", items: [] },
  { id: "שייטת", title: "שייטת", icon: Award, color: "text-cyan-400", bg: "bg-cyan-500/15", items: [] },
  { id: "חובלים", title: "חובלים", icon: Award, color: "text-blue-400", bg: "bg-blue-500/15", items: [] },
  { id: "יום סיירות", title: "יום סיירות", icon: Target, color: "text-orange-400", bg: "bg-orange-500/15", items: [] },
  { id: "כושר קרבי - גרסאות מוקדמות ועצמיות", title: "כושר קרבי - גרסאות מוקדמות", icon: Timer, color: "text-lime-400", bg: "bg-lime-500/15", items: [] },
  { id: "כושר קרבי כללי", title: "כושר קרבי כללי", icon: Timer, color: "text-lime-500", bg: "bg-lime-500/15", items: [] },
  { id: "אימונים ללא ציוד", title: "אימונים ללא ציוד", icon: Zap, color: "text-purple-400", bg: "bg-purple-500/15", items: [] },
  { id: "כוח פלג גוף עליון", title: "כוח - פלג גוף עליון", icon: Dumbbell, color: "text-emerald-500", bg: "bg-emerald-500/15", items: [] },
  { id: "כוח פלג גוף תחתון", title: "כוח - פלג גוף תחתון", icon: Dumbbell, color: "text-amber-500", bg: "bg-amber-500/15", items: [] },
  { id: "פלג גוף עליון חדר כושר", title: "פלג גוף עליון - חדר כושר", icon: Dumbbell, color: "text-emerald-400", bg: "bg-emerald-500/15", items: [] },
  { id: "פלג גוף עליון קליסטניקס", title: "פלג גוף עליון - קליסטניקס", icon: Zap, color: "text-sky-400", bg: "bg-sky-500/15", items: [] },
  { id: "רגליים", title: "רגליים", icon: GaugeIcon, color: "text-amber-400", bg: "bg-amber-500/15", items: [] },
];

const GIBUSHIM_LIST = [
  "יום סיירות", "גיבוש מטכ\"ל", "גיבוש שייטת", "גיבוש חובלים", "גיבוש טיס",
  "גיבוש ימ\"ס", "גיבושון 669", "יחטיות צנחנים", "גיבוש צנחנים", "גיבוש צוללות",
];

// Yerpa (Air Force fitness board) sub-sections - shown only to trainees whose
// target unit is 'tayas' (pilot course).
const YERPA_LIST = ["ירפ\"א א", "ירפ\"א ב", "פסיכולוג"];

// Filter/classification tags for tips-newspaper articles - a coach tags an article
// with one of these when publishing, and readers can filter the feed by the same list.
const ARTICLE_UNIT_TAGS = [
  "שלדג", "סיירת מטכ\"ל", "שייטת 13", "קורס טיס", "קורס חובלים", "ימ\"ס",
  "669", "קומנדו", "סיירת חי\"ר", "קורס צוללות", "עוקץ", "יהלם", "לוטר",
];

const TEAM_LIST = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  label: `צוות ${i + 1}`,
}));

// Each team's verification code — a trainee must enter the correct code to lock in that team at signup.
const TEAM_CODES_MAP = {
  "1": "12121212",
  "2": "23412345",
  "3": "12351235",
  "4": "99899989",
  "5": "05405454",
  "6": "67676767",
  "7": "57473727",
  "8": "11188818",
  "9": "45945945",
  "10": "34873487",
  "11": "52135213",
  "12": "12131412",
};

// Placeholder values for the "מילה טובה" peer-recognition tag — rename these to match
// the organization's real stated values whenever you're ready.
const CORE_VALUES = ["נחישות", "עבודת צוות", "מנהיגות", "משמעת", "חוסן מנטלי", "עזרה לזולת"];

const WAR_WEEKS = [
  {
    title: "עקרונות ומטרות", intro: true,
    body: [
      "10 שבועות | 3 אימונים בשבוע | ללא ציוד (מלבד כיסא/שולחן/מגבת)",
      "45-70 דקות לאימון. ציוד: רצפה, כיסא יציב, שולחן חזק, מגבת",
      "כל אימון כולל: חימום, כוח, סבולת, ליבה, פינישר",
      "מטרות: לשמור כמה שיותר על כוח פלג גוף עליון · לשמור על יכולת שכיבות סמיכה, מתח (באמצעות תחליפים), זחילות ויציבות · לשמור על סבולת לקראת גיבושים · למנוע ירידה במסת שריר",
    ],
  },
  {
    title: "שבועות 1-2",
    workouts: [
      {
        name: "אימון A - Push + Legs",
        highlights: ["חימום: 30 סמוך-קום קל, 20 סקוואטים, 15 לאנג׳ים לכל רגל, 15 שכיבות סמיכה, 30 שניות פלאנק"],
        blocks: [
          { label: "כוח - 5 סבבים (מנוחה: דקה)", rows: [
            ["שכיבות סמיכה", "5", "15-20", "דקה"],
            ["Bulgarian Split Squat לכל רגל", "5", "20", "דקה"],
            ["Pike Push Ups", "5", "15", "דקה"],
            ["Wall Sit", "5", "30 שניות", "דקה"],
          ]},
          { label: "סבולת - 10 דקות AMRAP", rows: [
            ["Burpees", "-", "10", "-"],
            ["Mountain Climbers", "-", "20", "-"],
            ["Jump Squats", "-", "15", "-"],
          ]},
          { label: "Core - 4 סבבים", rows: [
            ["פלאנק", "4", "דקה", "-"],
            ["Side Plank לכל צד", "4", "40 שניות", "-"],
            ["Hollow Rocks", "4", "20", "-"],
          ]},
          { label: "פינישר", note: "100 שכיבות סמיכה - כמה שפחות עצירות" },
        ],
      },
      {
        name: "אימון B - Pull Simulation",
        highlights: ["אין מתח? מחליפים במשיכות איזומטריות"],
        blocks: [
          { label: "כוח - 6 סבבים של 30 שניות", note: "מגבת כרוכה סביב רגל, מנסים \"לקרוע\" אותה במשיכה מקסימלית - ומיד אחר כך:" },
          { rows: [
            ["הרמות גב", "6", "20", "-"],
            ["Superman", "6", "20", "-"],
            ["חתירות מתחת לשולחן (אם בטוח)", "6", "10-15", "-"],
          ]},
          { label: "יד אחורית", rows: [["Diamond Push Ups", "5", "12", "-"]] },
          { label: "גב - 5 סבבים", rows: [["Y", "5", "10", "-"], ["T", "5", "10", "-"], ["W", "5", "10", "-"]] },
          { label: "Core - 4 סבבים", rows: [["V Ups", "4", "20", "-"], ["Russian Twist", "4", "40", "-"], ["Dead Bug", "4", "20", "-"]] },
          { label: "פינישר - 10 דקות", note: "כל דקה: 10 Burpees" },
        ],
      },
      {
        name: "אימון C - גיבוש",
        highlights: ["45 דקות רצוף - חוזר 9 פעמים"],
        blocks: [
          { label: "כל 5 דקות", rows: [
            ["Burpees", "9", "20", "-"],
            ["Push Ups", "9", "20", "-"],
            ["Air Squats", "9", "30", "-"],
            ["Walking Lunges", "9", "20", "-"],
            ["Bear Crawl", "9", "דקה", "-"],
          ]},
        ],
      },
    ],
  },
  {
    title: "שבועות 3-4",
    workouts: [
      {
        name: "אימון A - Push + Legs",
        highlights: ["מעלים נפח מהבסיס: שכיבות סמיכה 20→25, Pike 15→20, Bulgarian 20→25, Burpees 10→15, Wall Sit 30→60 שניות, פלאנק 60→90 שניות", "חימום: 30 סמוך-קום קל, 20 סקוואטים, 15 לאנג׳ים לכל רגל, 15 שכיבות סמיכה, 30 שניות פלאנק"],
        blocks: [
          { label: "כוח - 5 סבבים (מנוחה: דקה)", rows: [
            ["שכיבות סמיכה", "5", "20-25", "דקה"],
            ["Bulgarian Split Squat לכל רגל", "5", "25", "דקה"],
            ["Pike Push Ups", "5", "20", "דקה"],
            ["Wall Sit", "5", "60 שניות", "דקה"],
          ]},
          { label: "סבולת - 10 דקות AMRAP", rows: [
            ["Burpees", "-", "15", "-"],
            ["Mountain Climbers", "-", "20", "-"],
            ["Jump Squats", "-", "15", "-"],
          ]},
          { label: "Core - 4 סבבים", rows: [
            ["פלאנק", "4", "90 שניות", "-"],
            ["Side Plank לכל צד", "4", "40 שניות", "-"],
            ["Hollow Rocks", "4", "20", "-"],
          ]},
          { label: "פינישר", note: "100 שכיבות סמיכה - כמה שפחות עצירות" },
        ],
      },
      { name: "אימון B - Pull Simulation", highlights: ["ללא שינוי מבסיס שבועות 1-2 - ראה שם את הפירוט המלא"], blocks: [] },
      { name: "אימון C - גיבוש", highlights: ["ללא שינוי מבסיס שבועות 1-2 - ראה שם את הפירוט המלא"], blocks: [] },
    ],
  },
  {
    title: "שבועות 5-6",
    workouts: [
      {
        name: "אימון A - Push + Legs",
        highlights: ["Tempo בכל תרגילי הכוח: 4 שניות ירידה, שנייה עצירה למטה, עלייה מהירה", "בנוסף: 100 סמוך-קום בסוף האימון (מעבר לפינישר)"],
        blocks: [
          { label: "כוח - 5 סבבים, בטמפו (מנוחה: דקה)", rows: [
            ["שכיבות סמיכה", "5", "20-25", "דקה"],
            ["Bulgarian Split Squat לכל רגל", "5", "25", "דקה"],
            ["Pike Push Ups", "5", "20", "דקה"],
            ["Wall Sit", "5", "60 שניות", "דקה"],
          ]},
          { label: "פינישר", note: "100 שכיבות סמיכה + 100 סמוך-קום נוספים" },
        ],
      },
      { name: "אימון B - Pull Simulation", highlights: ["Tempo בכל תרגילי הכוח: 4 שניות ירידה, שנייה עצירה למטה, עלייה מהירה", "שאר הפירוט ללא שינוי - ראה שבועות 1-2"], blocks: [] },
      { name: "אימון C - גיבוש", highlights: ["ללא שינוי מבסיס שבועות 1-2"], blocks: [] },
    ],
  },
  {
    title: "שבועות 7-8",
    workouts: [
      {
        name: "אימון A - Push + Legs",
        highlights: ["Density: אותו נפח, מנוחה מקוצרת ל-45 שניות בין הסבבים (במקום דקה)"],
        blocks: [
          { label: "כוח - 5 סבבים (מנוחה: 45 שניות)", rows: [
            ["שכיבות סמיכה", "5", "20-25", "45 שניות"],
            ["Bulgarian Split Squat לכל רגל", "5", "25", "45 שניות"],
            ["Pike Push Ups", "5", "20", "45 שניות"],
            ["Wall Sit", "5", "60 שניות", "45 שניות"],
          ]},
          { label: "פינישר חדש - 15 דקות EMOM", rows: [
            ["Burpees", "-", "12", "-"],
            ["Push Ups", "-", "15", "-"],
            ["Squats", "-", "20", "-"],
          ]},
        ],
      },
      { name: "אימון B - Pull Simulation", highlights: ["Density: מנוחה מקוצרת ל-45 שניות בין הסבבים", "שאר הפירוט ללא שינוי - ראה שבועות 1-2"], blocks: [] },
      { name: "אימון C - גיבוש", highlights: ["ללא שינוי מבסיס שבועות 1-2"], blocks: [] },
    ],
  },
  {
    title: "שבועות 9-10",
    workouts: [
      {
        name: "אימון A",
        highlights: [],
        blocks: [
          { label: "300 שכיבות סמיכה", rows: [
            ["שכיבות סמיכה רגילות", "-", "100", "-"],
            ["שכיבות סמיכה יהלום", "-", "100", "-"],
            ["שכיבות סמיכה רחבות", "-", "100", "-"],
          ]},
        ],
      },
      {
        name: "אימון B",
        highlights: [],
        blocks: [
          { label: "1000 חזרות גב - משולב", rows: [
            ["הרמות גב", "-", "-", "-"],
            ["Superman", "-", "-", "-"],
            ["Isometric Pull", "-", "-", "-"],
            ["Y-T-W", "-", "-", "-"],
          ]},
        ],
      },
      {
        name: "אימון C - שעת גיבוש",
        highlights: ["60 דקות ללא עצירה - כמה שיותר סיבובים"],
        blocks: [
          { label: "כל סיבוב", rows: [
            ["Burpees", "-", "15", "-"],
            ["Push Ups", "-", "20", "-"],
            ["Squats", "-", "30", "-"],
            ["Lunges", "-", "20", "-"],
            ["Bear Crawl", "-", "דקה", "-"],
            ["Crab Walk", "-", "דקה", "-"],
            ["פלאנק", "-", "דקה", "-"],
          ]},
        ],
      },
    ],
  },
  {
    title: "מבחן כל שבועיים",
    body: [
      "בצע ברצף ורשום תוצאות להשוואה למבחן הקודם:",
      "מקסימום שכיבות סמיכה",
      "פלאנק מקסימלי",
      "100 Burpees לזמן",
      "300 Air Squats לזמן",
      "50 Pike Push Ups לזמן",
    ],
  },
];


const WEEKDAYS_HE = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

/* ============================== HELPERS ============================== */

function toKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatCountdown(ms) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  return { d, h, m, s };
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const ROW_HEIGHT = 56; // px per hour row in the calendar grid

function getWeekStart(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}
const MOTIVATION_QUOTES = [
  "הגוף מגיע עד לאן שהראש לוקח אותו.",
  "מי שמתאמן לבד היום, מוביל מחר.",
  "כאב הוא זמני. לוותר הוא לתמיד.",
  "כל אימון שאתה עושה עכשיו, מישהו אחר לא עושה.",
  "לא צריך להיות מושלם. צריך להיות עקבי.",
  "היום הקשה שלך הוא בדיוק מה שיבנה אותך.",
  "מי שרוצה - מוצא דרך. מי שלא - מוצא תירוץ.",
  "העילית לא נולדת ככה. היא בונה את עצמה, אימון אחרי אימון.",
];
function quoteOfDay() {
  const day = Math.floor(Date.now() / 86400000);
  return MOTIVATION_QUOTES[day % MOTIVATION_QUOTES.length];
}

// ---- Fitness test scoring tables (0-100 scale, per exact spec given) ----
const SCORE_TABLE_PULLUPS = [[0,0],[1,5],[2,10],[3,15],[4,20],[5,25],[6,35],[7,45],[8,50],[9,60],[10,65],[11,68],[12,72],[13,75],[14,80],[15,85],[16,85],[17,88],[18,92],[19,95],[20,100]];
const SCORE_TABLE_PULLUPS_WEIGHTED = [[0,0],[1,10],[2,20],[3,35],[4,50],[5,65],[6,75],[7,82],[8,87],[9,94],[10,98],[11,100]];
const SCORE_TABLE_DIPS = [[0,0],[1,6],[2,12],[3,20],[4,27],[5,35],[6,40],[7,50],[8,60],[9,65],[10,70],[11,74],[12,80],[13,85],[14,90],[15,93],[16,95],[17,97],[18,100]];
const SCORE_TABLE_RUN_1000 = [[185,100],[190,95],[195,90],[200,86],[205,82],[210,78],[215,74],[220,70],[225,65],[230,60],[235,55],[240,50],[248,42],[256,34],[264,25],[272,15],[280,5]];
const SCORE_TABLE_RUN_2000 = [[420,100],[430,95],[440,90],[450,86],[460,82],[470,78],[480,74],[490,70],[500,65],[510,60],[520,55],[530,50],[545,42],[560,34],[575,25],[590,15],[605,5]];
const SCORE_TABLE_RUN_3000 = SCORE_TABLE_RUN_2000;
const SCORE_TABLE_RUN_5000 = [[1100,100],[1120,96],[1140,92],[1160,88],[1180,84],[1200,80],[1220,76],[1240,72],[1260,68],[1280,64],[1300,60],[1320,56],[1350,50],[1380,44],[1410,38],[1440,32],[1470,24],[1500,16],[1530,8],[1560,3]];

function scoreFromTimeTable(table, seconds) {
  if (seconds <= table[0][0]) return table[0][1];
  if (seconds >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [t1, s1] = table[i], [t2, s2] = table[i + 1];
    if (seconds >= t1 && seconds <= t2) {
      const frac = (seconds - t1) / (t2 - t1);
      return Math.round(s1 + frac * (s2 - s1));
    }
  }
  return table[table.length - 1][1];
}
function scoreFromRepsTable(table, reps) {
  if (reps <= 0) return 0;
  const maxEntry = table[table.length - 1];
  if (reps >= maxEntry[0]) return 100;
  const exact = table.find(([r]) => r === reps);
  if (exact) return exact[1];
  for (let i = 0; i < table.length - 1; i++) {
    const [r1, s1] = table[i], [r2, s2] = table[i + 1];
    if (reps >= r1 && reps <= r2) {
      const frac = (reps - r1) / (r2 - r1);
      return Math.round(s1 + frac * (s2 - s1));
    }
  }
  return 0;
}
function scoreForTest(testId, value) {
  switch (testId) {
    case "run_1000": return scoreFromTimeTable(SCORE_TABLE_RUN_1000, value);
    case "run_2000": return scoreFromTimeTable(SCORE_TABLE_RUN_2000, value);
    case "run_3000": return scoreFromTimeTable(SCORE_TABLE_RUN_3000, value);
    case "run_5000": return scoreFromTimeTable(SCORE_TABLE_RUN_5000, value);
    case "pullups": return scoreFromRepsTable(SCORE_TABLE_PULLUPS, value);
    case "pullups_weighted": return scoreFromRepsTable(SCORE_TABLE_PULLUPS_WEIGHTED, value);
    case "dips": return scoreFromRepsTable(SCORE_TABLE_DIPS, value);
    case "pushups": return Math.min(Math.round(value), 100);
    default: return 0;
  }
}
const DIFFICULTY_STYLE = {
  "מתחיל": { hex: "#10b981", bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/40" },
  "בסיסי": { hex: "#38bdf8", bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/40" },
  "מתקדם": { hex: "#f59e0b", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/40" },
  "מתקדם מאוד": { hex: "#ef4444", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/40" },
};

function scoreColor(score) {
  if (score >= 90) return "#dc2626";
  if (score >= 75) return "#ef4444";
  if (score >= 60) return "#f97316";
  if (score >= 40) return "#fb923c";
  if (score >= 20) return "#facc15";
  return "#fde047";
}

const FITNESS_TESTS = [
  { id: "run_1000", label: "ריצת 1000 מטר", unit: "time", icon: Timer, hex: "#10b981" },
  { id: "run_2000", label: "ריצת 2000 מטר", unit: "time", icon: Timer, hex: "#10b981" },
  { id: "run_3000", label: "ריצת 3000 מטר", unit: "time", icon: Timer, hex: "#10b981" },
  { id: "run_5000", label: "ריצת 5000 מטר", unit: "time", icon: Timer, hex: "#10b981" },
  { id: "pullups", label: "מתח", unit: "reps", icon: Dumbbell, hex: "#10b981" },
  { id: "pullups_weighted", label: "מתח עם 6 ק״ג", unit: "reps", icon: Dumbbell, hex: "#10b981" },
  { id: "pushups", label: "שכיבות סמיכה", unit: "reps", icon: Zap, hex: "#10b981" },
  { id: "dips", label: "מקבילים", unit: "reps", icon: Zap, hex: "#10b981" },
];
// Lower is better for time-based tests (running), higher is better for rep-based tests.
function isImprovement(unit, newVal, oldVal) {
  return unit === "time" ? newVal < oldVal : newVal > oldVal;
}
function formatTestValue(unit, val) {
  if (unit === "time") {
    const m = Math.floor(val / 60);
    const s = Math.round(val % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  return `${val}`;
}

function greetingByHour() {
  const h = new Date().getHours();
  if (h < 5) return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  if (h < 21) return "ערב טוב";
  return "לילה טוב";
}

function timeToMinutes(t) {
  if (!t) return 360;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function minutesToTime(mins) {
  const clamped = Math.max(0, Math.min(23 * 60 + 55, mins));
  const snapped = Math.round(clamped / 15) * 15;
  const h = Math.floor(snapped / 60);
  const m = snapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// A training's feedback form opens the moment it ends and stays open for 3 hours.
// If no explicit endTime was set by the admin, we assume a 2-hour session.
function getOpenFeedbackEvent(events) {
  const now = new Date();
  for (const e of events) {
    if (!e.date) continue;
    const start = new Date(`${e.date}T${e.time || "00:00"}:00`);
    const end = e.endTime ? new Date(`${e.date}T${e.endTime}:00`) : new Date(start.getTime() + 2 * 3600 * 1000);
    const windowEnd = new Date(end.getTime() + 3 * 3600 * 1000);
    if (now >= end && now <= windowEnd) return e;
  }
  return null;
}

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// A pulsing, clear-water-like colored glow that surrounds a solid black button —
// the button interior stays black; the light lives in the box-shadow halo around it.
// hex2, when given, tints the outer/soft ring for a two-tone glow.
function glowVars(hex, hex2) {
  return {
    "--glow-strong": hexToRgba(hex, 0.75),
    "--glow-soft": hexToRgba(hex2 || hex, 0.4),
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Real Supabase Auth (GoTrue) over plain REST — no SDK needed. Used only when
// CONFIG.SUPABASE_URL / SUPABASE_ANON_KEY are filled in. Supabase sends the actual
// confirmation email and refuses to log in an unconfirmed account — this is the real
// verification client-side code alone cannot do.
async function supabaseSignUp(email, password, meta) {
  let res;
  try {
    res = await fetch(`${CONFIG.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: CONFIG.SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, data: meta }),
    });
  } catch (e) {
    throw new Error(`לא ניתן להתחבר לשרת [${e?.name || "?"}: ${e?.message || "unknown"}] - בדקו כתובת/פרויקט מושהה`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.msg || data?.error_description || data?.error || "שגיאה בהרשמה");
  return data;
}

async function supabaseLogin(email, password) {
  let res;
  try {
    res = await fetch(`${CONFIG.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: CONFIG.SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (e) {
    throw new Error(`לא ניתן להתחבר לשרת [${e?.name || "?"}: ${e?.message || "unknown"}] - בדקו כתובת/פרויקט מושהה`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.msg || data?.error_description || "אימייל או סיסמה שגויים, או שהמייל טרם אומת");
  return data;
}

/* ============================== DATA LAYER ==============================
 * Every domain function below works against real Supabase tables when
 * CONFIG.SUPABASE_URL / SUPABASE_ANON_KEY are filled in, and transparently
 * falls back to Claude's local demo storage otherwise. Nothing else in the
 * app needs to know or care which mode is active.
 */

// Holds the real Supabase access token after login — required so Postgres'
// auth.uid() resolves correctly inside Row Level Security policies.
const session = { accessToken: null };

function useSupabase() {
  return Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
}

async function sbRequest(method, table, { query = "", body } = {}) {
  const res = await fetch(`${CONFIG.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: CONFIG.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.accessToken || CONFIG.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(method !== "GET" ? { Prefer: "return=representation" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "שגיאת שרת");
  }
  if (res.status === 204) return [];
  return res.json();
}

// Uploads a real image file to Supabase Storage (the 'unit-images' bucket) and
// returns a public URL pointing to that now-hosted copy - this is the coach's own
// file, uploaded to their own project, not a pasted link to someone else's image.
async function uploadUnitImage(file) {
  const base = CONFIG.SUPABASE_URL.replace(/\/$/, "");
  const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const res = await fetch(`${base}/storage/v1/object/unit-images/${path}`, {
    method: "POST",
    headers: {
      apikey: CONFIG.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.accessToken || CONFIG.SUPABASE_ANON_KEY}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "העלאת התמונה נכשלה");
  }
  return `${base}/storage/v1/object/public/unit-images/${path}`;
}

async function sbRpc(fn, args) {
  const res = await fetch(`${CONFIG.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: CONFIG.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.accessToken || CONFIG.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "שגיאת שרת");
  }
  return res.json();
}

// If you paste a key directly into CONFIG.GEMINI_API_KEY below, that's used straight
// away — simplest option, works immediately. If you leave it empty and later deploy
// the gemini-chat Edge Function, the app automatically switches to that instead (the
// key then never reaches the browser at all). Either way nothing else needs to change.
async function aiChat(systemPrompt, userText, history = []) {
  if (CONFIG.GEMINI_API_KEY) return callGemini(CONFIG.GEMINI_API_KEY, systemPrompt, userText, history);
  if (useSupabase()) {
    const res = await fetch(`${CONFIG.SUPABASE_URL.replace(/\/$/, "")}/functions/v1/gemini-chat`, {
      method: "POST",
      headers: {
        apikey: CONFIG.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.accessToken || CONFIG.SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ systemPrompt, userText, history }),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new Error(errBody?.error || `AI request failed (${res.status})`);
    }
    const data = await res.json();
    return data.text || "לא התקבלה תשובה מהמאמן.";
  }
  throw new Error("no AI configured");
}

// health_issues is stored as one text column, not an array — these convert between
// that and the chip-based multi-select UI. The round-trip is a best-effort parse
// based on matching known HEALTH_OPTIONS substrings, not a lossless format.
function healthIssuesToText(issues, otherNote) {
  const parts = (issues || []).filter((i) => i !== "אחר");
  if ((issues || []).includes("אחר")) parts.push(otherNote?.trim() ? `אחר: ${otherNote.trim()}` : "אחר");
  return parts.join(", ");
}
function healthIssuesFromText(text) {
  if (!text) return { issues: [], otherNote: "" };
  const issues = HEALTH_OPTIONS.filter((opt) => opt !== "אחר" && text.includes(opt));
  const otherMatch = text.match(/אחר:\s*(.*)$/);
  if (otherMatch || text.includes("אחר")) issues.push("אחר");
  return { issues, otherNote: otherMatch ? otherMatch[1].trim() : "" };
}

// Maps between the app's internal nested `profile` object (used throughout the UI)
// and the real flat columns on the `profiles` table.
// Note: needs these columns added once Supabase is reconnected (not in the original schema):
// alter table profiles add column if not exists gibush_date date;
// alter table profiles add column if not exists gibush_type text;
// alter table profiles add column if not exists war_mode boolean default false;
// alter table profiles add column if not exists light_mode boolean default false;
function profileToDb(user) {
  const p = user.profile || {};
  return {
    full_name: p.fullName || null,
    role: user.role,
    team_id: p.teamCode ? Number(p.teamCode) : null,
    age: p.age ?? null,
    height: p.height ?? null,
    weight: p.weight ?? null,
    is_healthy: p.healthy ?? true,
    health_issues: healthIssuesToText(p.healthIssues || [], p.healthOtherNote || ""),
    target_unit: p.targetUnit || null,
    fitness_level: p.level || null,
    onboarded: user.onboarded,
    network: user.network || null,
    gibush_date: p.gibushDate || null,
    gibush_type: p.gibushType || null,
    war_mode: Boolean(p.warMode),
    light_mode: Boolean(p.lightMode),
    streak_value: p.streakValue ?? 0,
    streak_last_date: p.streakLastDate || null,
    photo_url: p.photoUrl || null,
    custom_bg_url: p.customBgUrl || null,
    custom_bg_enabled: Boolean(p.customBgEnabled),
  };
}
function profileFromDb(r) {
  const unitObj = UNITS.find((u) => u.id === r.target_unit);
  const { issues, otherNote } = healthIssuesFromText(r.health_issues);
  const hasProfile = r.age != null || r.fitness_level || r.target_unit;
  const profile = hasProfile
    ? {
        fullName: r.full_name || "",
        age: r.age, height: r.height, weight: r.weight,
        healthy: r.is_healthy,
        healthIssues: issues, healthOtherNote: otherNote,
        level: r.fitness_level || "",
        targetUnit: r.target_unit || "",
        targetUnitName: unitObj ? unitObj.name : "",
        teamCode: r.team_id != null ? String(r.team_id) : "",
        gibushDate: r.gibush_date || "",
        gibushType: r.gibush_type || "",
        warMode: Boolean(r.war_mode),
        lightMode: Boolean(r.light_mode),
        streakValue: r.streak_value ?? 0,
        streakLastDate: r.streak_last_date || "",
        photoUrl: r.photo_url || "",
        customBgUrl: r.custom_bg_url || "",
        customBgEnabled: Boolean(r.custom_bg_enabled),
      }
    : null;
  return { id: r.id, email: r.email, role: r.role, network: r.network, onboarded: Boolean(r.onboarded), profile };
}

async function fetchOwnProfile(uid) {
  const rows = await sbRequest("GET", "profiles", { query: `?id=eq.${uid}&select=*` });
  const r = rows[0];
  if (!r) return null;
  return profileFromDb(r);
}

// Verifies a team's code without ever exposing the code list to the client
// (Supabase mode calls the verify_team_code RPC; local demo mode checks the
// hardcoded map so testing still works without a live project).
async function verifyTeamCode(teamId, code) {
  if (useSupabase()) return sbRpc("verify_team_code", { p_team_id: Number(teamId), p_code: code });
  return TEAM_CODES_MAP[teamId] === code;
}

// Network code is verified via Supabase only (see the verify_network_code RPC —
// the code itself is never sent to or checked in client-side code in real mode).
// Returns the network's id on success (stored on the profile instead of the code
// itself) or null on failure. CONFIG.NETWORK_CODE remains only as a local-demo-mode
// fallback for testing without a live project.
async function verifyNetworkCode(code) {
  if (useSupabase()) {
    const id = await sbRpc("verify_network_code", { p_code: code });
    return id || null;
  }
  return code === CONFIG.NETWORK_CODE ? "local-network" : null;
}

// ---- Users / profiles ----
async function loadUsers() {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "profiles", { query: "?select=*" });
    return rows.map(profileFromDb);
  }
  return storageGetList("app_users");
}

async function saveUserProfile(user) {
  if (useSupabase()) {
    await sbRequest("PATCH", "profiles", { query: `?id=eq.${user.id}`, body: profileToDb(user) });
    return;
  }
  const users = await storageGetList("app_users");
  await storageSetList("app_users", users.map((u) => (u.id === user.id ? user : u)));
}

// ---- Official events (training calendar) ----
function eventFromDb(r) {
  return { id: r.id, date: r.date, title: r.title, time: r.time, endTime: r.end_time, location: r.location, createdBy: r.created_by };
}
async function loadOfficialEvents() {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "official_events", { query: "?select=*&order=date.asc" });
    return rows.map(eventFromDb);
  }
  return storageGetList("official_events");
}
async function addOfficialEventRemote(entry) {
  if (useSupabase()) {
    const rows = await sbRequest("POST", "official_events", {
      body: { date: entry.date, title: entry.title, time: entry.time, end_time: entry.endTime, location: entry.location },
    });
    return eventFromDb(rows[0]);
  }
  const events = await storageGetList("official_events");
  await storageSetList("official_events", [entry, ...events]);
  return entry;
}
async function removeOfficialEventRemote(id) {
  if (useSupabase()) {
    await sbRequest("DELETE", "official_events", { query: `?id=eq.${id}` });
    return;
  }
  const events = await storageGetList("official_events");
  await storageSetList("official_events", events.filter((e) => e.id !== id));
}

// ---- Articles (עיתון טיפים) — stored in app_content as category='tip_article' ----
// Note: image_url needs `alter table app_content add column if not exists image_url text;`
// added to the schema for this to persist once Supabase is connected.
async function loadArticlesRemote() {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "app_content", { query: "?select=*&category=eq.tip_article&order=created_at.desc" });
    return rows.map((r) => ({ id: r.id, title: r.title, excerpt: r.body, unit: r.subcategory || "כללי", author: "", imageUrl: r.image_url || "" }));
  }
  return storageGetList("articles");
}
async function addArticleRemote(entry) {
  if (useSupabase()) {
    const rows = await sbRequest("POST", "app_content", { body: { category: "tip_article", title: entry.title, body: entry.excerpt, subcategory: entry.unit, image_url: entry.imageUrl || null } });
    const r = rows[0];
    return { id: r.id, title: r.title, excerpt: r.body, unit: r.subcategory || "כללי", author: "", imageUrl: r.image_url || "" };
  }
  const arts = await storageGetList("articles");
  await storageSetList("articles", [entry, ...arts]);
  return entry;
}

// ---- Training bank & Hub units/gibushim/unit-tips content — app_content in real
// Supabase mode, a local storage key in local mode. Starts empty either way,
// populated only by an admin (via Management tab) or, once reconnected, via
// Supabase directly.
// Convention: category='training_pool' with subcategory one of the 7 TRAINING_BANK ids;
// category='unit_info' with subcategory in ('יחידות','גיבושים','ערכים');
// category='unit_tips' with subcategory = one of the UNITS ids (e.g. 'shayetet') -
// shown only to trainees whose profile.targetUnit matches that same id.
// dateLabel is only meaningful for גיבושים content (the מועד shown on tap) - needs
// `alter table app_content add column if not exists date_label text;` in Supabase.
// ---- Fitness tests (running times, pull-ups, push-ups, dips - tracked over time) ----
function fitnessTestFromDb(r) {
  return { id: r.id, testType: r.test_type, value: Number(r.value), date: r.test_date };
}
async function loadFitnessTests(userId, testType) {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "fitness_tests", { query: `?select=*&user_id=eq.${userId}&test_type=eq.${testType}&order=test_date.asc` });
    return rows.map(fitnessTestFromDb);
  }
  const all = await storageGetList(`fitness:${userId}`);
  return all.filter((t) => t.testType === testType);
}
async function loadAllFitnessTests(userId) {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "fitness_tests", { query: `?select=*&user_id=eq.${userId}&order=test_date.asc` });
    return rows.map(fitnessTestFromDb);
  }
  return storageGetList(`fitness:${userId}`);
}
async function addFitnessTest(userId, entry) {
  if (useSupabase()) {
    const rows = await sbRequest("POST", "fitness_tests", { body: { user_id: userId, test_type: entry.testType, value: entry.value, test_date: entry.date } });
    return fitnessTestFromDb(rows[0]);
  }
  const all = await storageGetList(`fitness:${userId}`);
  const saved = { id: `local_${Date.now()}`, ...entry };
  await storageSetList(`fitness:${userId}`, [...all, saved]);
  return saved;
}
async function updateFitnessTest(id, value, date) {
  if (useSupabase()) {
    await sbRequest("PATCH", "fitness_tests", { query: `?id=eq.${id}`, body: { value, test_date: date } });
    return;
  }
}
async function deleteFitnessTest(userId, id) {
  if (useSupabase()) {
    await sbRequest("DELETE", "fitness_tests", { query: `?id=eq.${id}` });
    return;
  }
  const all = await storageGetList(`fitness:${userId}`);
  await storageSetList(`fitness:${userId}`, all.filter((t) => t.id !== id));
}

async function loadContentRemote(category, subcategory) {
  if (useSupabase()) {
    let query = `?select=*&category=eq.${category}&order=created_at.desc`;
    if (subcategory) query += `&subcategory=eq.${encodeURIComponent(subcategory)}`;
    const rows = await sbRequest("GET", "app_content", { query });
    return rows.map((r) => ({ id: r.id, title: r.title, body: r.body, subcategory: r.subcategory, dateLabel: r.date_label || "", imageUrl: r.image_url || "", difficulty: r.difficulty || "" }));
  }
  const all = await storageGetList("app_content_local");
  return all.filter((c) => c.category === category && (!subcategory || c.subcategory === subcategory));
}

async function addContentRemote(entry) {
  if (useSupabase()) {
    const rows = await sbRequest("POST", "app_content", { body: { category: entry.category, subcategory: entry.subcategory, title: entry.title, body: entry.body, date_label: entry.dateLabel || null, image_url: entry.imageUrl || null } });
    const r = rows[0];
    return { id: r.id, title: r.title, body: r.body, subcategory: r.subcategory, category: r.category, dateLabel: r.date_label || "", imageUrl: r.image_url || "" };
  }
  const all = await storageGetList("app_content_local");
  const saved = { id: `local_${Date.now()}`, ...entry };
  await storageSetList("app_content_local", [saved, ...all]);
  return saved;
}
async function removeContentRemote(id) {
  if (useSupabase()) {
    await sbRequest("DELETE", "app_content", { query: `?id=eq.${id}` });
    return;
  }
  const all = await storageGetList("app_content_local");
  await storageSetList("app_content_local", all.filter((c) => c.id !== id));
}

// ---- Personal training logs (per-user calendar entries) ----
function logFromDb(r) {
  return { id: r.id, date: r.date, time: r.time, endTime: r.end_time, title: r.title, detail: r.detail };
}
async function loadPersonalLogsRemote(userId) {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "personal_logs", { query: `?select=*&user_id=eq.${userId}&order=date.desc` });
    return rows.map(logFromDb);
  }
  return storageGetList(`logs:${userId}`);
}
async function addPersonalLogRemote(userId, entry) {
  if (useSupabase()) {
    const rows = await sbRequest("POST", "personal_logs", { body: { user_id: userId, date: entry.date, time: entry.time, end_time: entry.endTime || null, title: entry.title, detail: entry.detail } });
    return logFromDb(rows[0]);
  }
  const logs = await storageGetList(`logs:${userId}`);
  await storageSetList(`logs:${userId}`, [entry, ...logs]);
  return entry;
}
async function updatePersonalLogRemote(userId, id, patch) {
  if (useSupabase()) {
    await sbRequest("PATCH", "personal_logs", { query: `?id=eq.${id}`, body: patch });
    return;
  }
  const logs = await storageGetList(`logs:${userId}`);
  await storageSetList(`logs:${userId}`, logs.map((l) => (l.id === id ? { ...l, ...patch } : l)));
}
async function removePersonalLogRemote(userId, id) {
  if (useSupabase()) {
    await sbRequest("DELETE", "personal_logs", { query: `?id=eq.${id}` });
    return;
  }
  const logs = await storageGetList(`logs:${userId}`);
  await storageSetList(`logs:${userId}`, logs.filter((l) => l.id !== id));
}

// ---- Training reflections (permanent keep/improve history with AI feedback) ----
async function loadReflectionsRemote(userId) {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "training_reflections", { query: `?select=*&user_id=eq.${userId}&order=created_at.desc` });
    return rows.map((r) => ({
      id: r.id, trainingRefId: r.training_ref_id, title: r.training_title, date: r.training_date, group: r.is_group,
      keep1: r.keep1, keep2: r.keep2, improve1: r.improve1, improve2: r.improve2, aiTips: r.ai_tips,
    }));
  }
  return storageGetList(`reflections:${userId}`);
}
async function addReflectionRemote(userId, entry) {
  if (useSupabase()) {
    const rows = await sbRequest("POST", "training_reflections", {
      body: { user_id: userId, training_ref_id: entry.trainingRefId, training_title: entry.title, training_date: entry.date, is_group: entry.group, keep1: entry.keep1, keep2: entry.keep2, improve1: entry.improve1, improve2: entry.improve2, ai_tips: entry.aiTips },
    });
    const r = rows[0];
    return { id: r.id, trainingRefId: r.training_ref_id, title: r.training_title, date: r.training_date, group: r.is_group, keep1: r.keep1, keep2: r.keep2, improve1: r.improve1, improve2: r.improve2, aiTips: r.ai_tips };
  }
  const list = await storageGetList(`reflections:${userId}`);
  const saved = { id: `local_${Date.now()}`, ...entry };
  await storageSetList(`reflections:${userId}`, [saved, ...list]);
  return saved;
}

// ---- Attendance reports ----
// Note: entry.eventId ties the report to the specific training it was taken for.
// The Supabase schema built earlier doesn't have an event_id column on
// attendance_reports yet — add `alter table attendance_reports add column if not
// exists event_id uuid references official_events(id);` there to carry it through too.
async function loadAttendanceReportsRemote() {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "attendance_reports", { query: "?select=*&order=date.desc" });
    return rows.map((r) => ({ teamId: r.team_id != null ? String(r.team_id) : "", eventId: r.event_id, date: r.date, percentage: r.attendance_percentage }));
  }
  return storageGetList("attendance_reports");
}
async function submitAttendanceRemote(entry) {
  if (useSupabase()) {
    await sbRequest("POST", "attendance_reports", { body: { team_id: entry.teamId ? Number(entry.teamId) : null, date: entry.date, attendance_percentage: entry.percentage } });
    return;
  }
  const reports = await storageGetList("attendance_reports");
  await storageSetList("attendance_reports", [entry, ...reports]);
}

// ---- Individual per-trainee attendance (who specifically attended, not just the
// team percentage) - powers the coach's monthly "most attendances" leaderboard.
// Note: needs a new `individual_attendance` table if/when moved to Supabase:
// create table individual_attendance (id uuid default gen_random_uuid() primary key,
//   event_id text, date date, team_id int, user_id uuid references profiles(id),
//   present boolean, created_at timestamptz default now());
async function loadAllIndividualAttendance() {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "individual_attendance", { query: "?select=*" });
    return rows.map((r) => ({ id: r.id, eventId: r.event_id, date: r.date, teamId: String(r.team_id), userId: r.user_id, present: r.present }));
  }
  return storageGetList("individual_attendance");
}
async function submitIndividualAttendanceRemote(records) {
  if (useSupabase()) {
    await sbRequest("POST", "individual_attendance", { body: records.map((r) => ({ event_id: r.eventId, date: r.date, team_id: Number(r.teamId), user_id: r.userId, present: r.present })) });
    return;
  }
  const all = await storageGetList("individual_attendance");
  await storageSetList("individual_attendance", [...records, ...all]);
}

// ---- Per-event RSVP (trainee marks if they're coming to a specific official training;
// admin sees exactly who's coming and who isn't, by name) ----
async function loadAllEventAttendance() {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "event_attendance", { query: "?select=*" });
    return rows.map((r) => ({ id: r.id, eventId: r.event_id, userId: r.user_id, status: r.status }));
  }
  return storageGetList("event_attendance");
}
async function setEventAttendanceRemote(eventId, userId, status) {
  if (useSupabase()) {
    await sbRequest("DELETE", "event_attendance", { query: `?event_id=eq.${eventId}&user_id=eq.${userId}` }).catch(() => {});
    await sbRequest("POST", "event_attendance", { body: { event_id: eventId, user_id: userId, status } });
    return;
  }
  const all = await storageGetList("event_attendance");
  const filtered = all.filter((r) => !(r.eventId === eventId && r.userId === userId));
  await storageSetList("event_attendance", [...filtered, { id: `${eventId}_${userId}`, eventId, userId, status }]);
}

// ---- Training feedback ----
function feedbackFromDb(r) {
  return {
    id: r.id, userId: r.user_id, eventId: r.event_id, eventTitle: r.event_title,
    submittedAt: r.created_at, status: r.status, firstName: r.first_name,
    teamCode: r.team_id != null ? String(r.team_id) : "",
    coach: r.coach, valueRating: r.value_rating, recommendRating: r.recommend_rating,
    opinion: r.opinion,
    kindWord: r.kind_word_text ? { team: r.kind_word_team != null ? String(r.kind_word_team) : "", value: r.kind_word_value, text: r.kind_word_text } : null,
    howAreYou: r.how_are_you, messageToYuval: r.message_to_yuval,
  };
}
async function loadFeedbackRemote() {
  if (useSupabase()) {
    const rows = await sbRequest("GET", "training_feedback", { query: "?select=*&order=created_at.desc" });
    return rows.map(feedbackFromDb);
  }
  return storageGetList("training_feedback");
}
async function submitFeedbackRemote(entry) {
  if (useSupabase()) {
    await sbRequest("POST", "training_feedback", {
      body: {
        user_id: entry.userId, event_id: entry.eventId, event_title: entry.eventTitle,
        first_name: entry.firstName, team_id: entry.teamCode ? Number(entry.teamCode) : null, coach: entry.coach,
        value_rating: entry.valueRating, recommend_rating: entry.recommendRating,
        opinion: entry.opinion,
        kind_word_team: entry.kindWord?.team ? Number(entry.kindWord.team) : null,
        kind_word_value: entry.kindWord?.value || null,
        kind_word_text: entry.kindWord?.text || null,
        how_are_you: entry.howAreYou, message_to_yuval: entry.messageToYuval, status: "pending",
      },
    });
    return;
  }
  const list = await storageGetList("training_feedback");
  await storageSetList("training_feedback", [entry, ...list]);
}
async function approveFeedbackRemote(id) {
  if (useSupabase()) {
    await sbRequest("PATCH", "training_feedback", { query: `?id=eq.${id}`, body: { status: "approved" } });
    return;
  }
}
async function checkFeedbackSubmitted(userId, eventId) {
  const list = await loadFeedbackRemote();
  return list.some((f) => f.userId === userId && f.eventId === eventId);
}

async function hashPassword(pw) {
  const enc = new TextEncoder().encode(pw);
  const buf = await window.crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function storageGetList(key) {
  try {
    if (typeof window !== "undefined" && window.storage) {
      const res = await window.storage.get(key, true);
      return res && res.value ? JSON.parse(res.value) : [];
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function storageSetList(key, list) {
  try {
    if (typeof window !== "undefined" && window.storage) {
      await window.storage.set(key, JSON.stringify(list), true);
      return;
    }
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error("storage set failed", key, e);
  }
}

async function callGemini(apiKey, systemPrompt, userText, history = []) {
  const contents = [
    ...history.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: userText }] },
  ];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
      }),
    }
  );
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Gemini request failed (${res.status})`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה מהמאמן.";
}

function localCoachReply(text) {
  const t = text.toLowerCase();
  if (t.includes("שינה")) return "שאפו ל-7-9 שעות שינה בלילה. שינה היא חלק מהאימון עצמו - היא הזמן שבו הגוף בונה כוח ומתאושש.";
  if (t.includes("תזונה") || t.includes("אוכל")) return "לפני אימון קשה - פחמימות קלות לעיכול ומעט חלבון. אחרי אימון - חלבון + פחמימה תוך 60 דקות לשיקום מהיר.";
  if (t.includes("שין ספלינט") || t.includes("שוקיים")) return "כאב בשוקיים דורש הפחתת עומס ריצה מיידית ומעבר לאימון קרוס (שחייה/אופניים) לכמה ימים. אם הכאב נמשך, פנו לפיזיותרפיסט.";
  if (t.includes("פציעה") || t.includes("כואב")) return "אל תתאמנו דרך כאב חד. מנוחה יחסית, קרח ב-48 השעות הראשונות, ופנייה לאיש מקצוע אם אין שיפור תוך 3-4 ימים.";
  return "שאלה טובה. בגדול - התמידו, בנו עומס בהדרגה, ותנו לגוף להתאושש.";
}

function generateMockProgram(goal, unitName, level) {
  return WAR_WEEKS.slice(0, 4).map((w, i) => ({
    week: i + 1,
    title: `שבוע ${i + 1} - ${level || "כללי"}`,
    items: [
      `ריצה מותאמת ל${goal || "המטרה שלך"}`,
      i % 2 === 0 ? "אימון כוח משקל גוף מלא" : "אימון כוח מפוצל + ליבה",
      unitName ? `תרגול ספציפי לדרישות ${unitName}` : "עבודת סיבולת שטח",
    ],
  }));
}

/* ============================== SMALL UI ATOMS ============================== */

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-zinc-900/70 backdrop-blur-md border border-zinc-800/60 shadow-2xl shadow-black/50 ring-1 ring-white/[0.03] transition-all duration-300 ease-out hover:border-emerald-500/40 hover:shadow-emerald-500/10 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children, tone = "emerald" }) {
  const toneMap = {
    emerald: { text: "text-emerald-400", hex: "#10b981" },
    amber: { text: "text-amber-400", hex: "#f59e0b" },
    red: { text: "text-red-400", hex: "#ef4444" },
  };
  const t = toneMap[tone];
  return (
    <div className="flex items-center gap-2.5 mb-3">
      {Icon && (
        <div className="w-7 h-7 rounded-lg bg-black/40 border flex items-center justify-center shrink-0" style={{ borderColor: `${t.hex}40`, boxShadow: `0 0 10px ${t.hex}25` }}>
          <Icon size={14} className={t.text} />
        </div>
      )}
      <h3 className="text-base font-bold tracking-wide text-zinc-100">{children}</h3>
    </div>
  );
}

function BrandEmblem({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="emblemFill2" x1="50" y1="4" x2="50" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#10b981" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#065f46" stopOpacity="0.02" />
        </linearGradient>
        <filter id="emblemGlow2" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.2" result="soft" />
          <feMerge><feMergeNode in="soft" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* outer hex frame */}
      <path d="M50 3 L91 26 V74 L50 97 L9 74 V26 Z" fill="url(#emblemFill2)" stroke="#10b981" strokeWidth="1.4" opacity="0.9" />
      {/* inner rotated hex, offset for layered tech look */}
      <path d="M50 12 L82 30.5 V69.5 L50 88 L18 69.5 V30.5 Z" fill="none" stroke="#34d399" strokeWidth="0.8" opacity="0.55" strokeDasharray="3 3" />

      {/* circuit traces off the corners */}
      <g stroke="#34d399" strokeWidth="1" opacity="0.5" strokeLinecap="round">
        <path d="M9 26 H2 M9 26 V19" />
        <path d="M91 26 H98 M91 26 V19" />
        <path d="M9 74 H2 M9 74 V81" />
        <path d="M91 74 H98 M91 74 V81" />
      </g>
      <g fill="#34d399" opacity="0.7">
        <circle cx="2" cy="26" r="1.4" />
        <circle cx="98" cy="26" r="1.4" />
        <circle cx="2" cy="74" r="1.4" />
        <circle cx="98" cy="74" r="1.4" />
      </g>

      {/* targeting reticle */}
      <g filter="url(#emblemGlow2)">
        <circle cx="50" cy="50" r="17" stroke="#6ee7b7" strokeWidth="1" opacity="0.5" fill="none" />
        <circle cx="50" cy="50" r="1.6" fill="#d1fae5" />
        <path d="M50 30 V37 M50 63 V70 M30 50 H37 M63 50 H70" stroke="#6ee7b7" strokeWidth="1.2" opacity="0.6" />
      </g>

      {/* ascending chevron - elite / rising mark */}
      <g filter="url(#emblemGlow2)">
        <path d="M32 58 L50 42 L68 58" stroke="#34d399" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M38 66 L50 55 L62 66" stroke="#a7f3d0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </g>
    </svg>
  );
}

function Pill({ children, tone = "zinc" }) {
  const toneMap = {
    zinc: "bg-zinc-800 text-zinc-300 border-zinc-700",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    red: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[13px] font-semibold border ${toneMap[tone]}`}>{children}</span>;
}

function GlowButton({ children, onClick, tone = "emerald", icon: Icon, className = "", disabled }) {
  const toneMap = {
    emerald: "bg-gradient-to-l from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black font-black shadow-emerald-500/40 hover:shadow-emerald-400/60 hover:shadow-xl hover:scale-[1.02]",
    amber: "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30 hover:shadow-amber-400/50 hover:shadow-xl hover:scale-[1.02]",
    red: "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 hover:shadow-red-500/50 hover:shadow-xl hover:scale-[1.02]",
    ghost: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 shadow-none border border-zinc-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-base font-bold shadow-lg transition-all duration-300 ease-out active:scale-95 disabled:opacity-40 disabled:active:scale-100 disabled:hover:shadow-lg disabled:hover:scale-100 ${toneMap[tone]} ${className}`}
    >
      {Icon && <Icon size={16} className={Icon === Loader2 ? "animate-spin" : ""} />}
      {children}
    </button>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const toneMap = {
    success: "bg-emerald-500 text-black",
    error: "bg-red-600 text-white",
    info: "bg-zinc-800 text-zinc-100 border border-zinc-700",
  };
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-[85%] px-1 py-1 rounded-xl text-base font-bold">
      <div className={`px-4 py-2.5 rounded-xl shadow-2xl ${toneMap[toast.tone]}`}>{toast.msg}</div>
    </div>
  );
}

/* ============================== RATING BUTTONS (1-5) ============================== */

function RatingButtons({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`flex-1 rounded-lg py-2 text-base font-black border transition ${
            value === n ? "bg-emerald-500 border-emerald-500 text-black" : "bg-zinc-900 border-zinc-800 text-zinc-400"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

/* ============================== INTRO CAROUSEL ============================== */

function IntroCarousel({ onDone }) {
  function finish() {
    try { localStorage.setItem("sayert_intro_seen", "true"); } catch (e) {}
    onDone();
  }

  const FEATURES = [
    { icon: Bot, title: "מאמן AI אישי", desc: "צ׳אט חכם שעונה על כל שאלה, בכל שעה", hex: "#10b981" },
    { icon: CalendarDays, title: "יומן חכם", desc: "אימונים אישיים וקבוצתיים במקום אחד", hex: "#38bdf8" },
    { icon: Shield, title: "מאגר יחידות", desc: "כל מה שצריך לדעת על היעד הקרבי שלך", hex: "#f59e0b" },
    { icon: TrendingUp, title: "מעקב התקדמות", desc: "משוב אישי ומעקב אימונים לאורך זמן", hex: "#a78bfa" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8">
      <div className="w-full max-w-xs sm:max-w-lg md:max-w-2xl">
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <div className="w-48 h-48 sm:w-56 sm:h-56 mb-2">
            <img src={logoImg} alt="SayertTracking" className="w-full h-full object-contain" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-zinc-50 tracking-wide">SayertTracking</div>
          <div className="w-10 h-px bg-emerald-500/40 my-2" />
          <div className="text-base sm:text-base text-zinc-500">המעטפת לסיירת - הדרך שלך ליחידות העילית</div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
          {FEATURES.map((f, i) => (
            <div key={i} className="rounded-2xl bg-zinc-900/70 backdrop-blur-md border border-zinc-800/60 p-4 sm:p-5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-black border flex items-center justify-center mb-2.5" style={{ borderColor: `${f.hex}50`, boxShadow: `0 0 12px ${f.hex}25` }}>
                <f.icon size={18} style={{ color: f.hex }} />
              </div>
              <div className="text-base sm:text-base font-black text-zinc-100 mb-0.5">{f.title}</div>
              <div className="text-[13px] sm:text-sm text-zinc-500 leading-snug">{f.desc}</div>
            </div>
          ))}
        </div>

        <GlowButton tone="emerald" className="w-full" icon={ChevronLeft} onClick={finish}>
          בואו נתחיל
        </GlowButton>
      </div>
    </div>
  );
}

/* ============================== AUTH SCREEN ============================== */

function AuthScreen({ onAuthed, showToast }) {
  const [screen, setScreen] = useState("choice"); // 'choice' | 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [networkCode, setNetworkCode] = useState("");
  const [coachCode, setCoachCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const useRealAuth = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
  const mode = screen === "signup" ? "signup" : "login";

  async function submit() {
    setError("");
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) { setError("נא למלא אימייל וסיסמה"); return; }
    if (!EMAIL_RE.test(cleanEmail)) { setError("כתובת האימייל לא תקינה"); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password.length < 6) throw new Error("הסיסמה חייבת להכיל לפחות 6 תווים");
        if (password !== confirm) throw new Error("הסיסמאות אינן תואמות");
        const networkId = await verifyNetworkCode(networkCode.trim());
        if (!networkId) throw new Error("קוד רשת שגוי");
        const wantsCoach = coachCode.trim() === "12345123";

        if (useRealAuth) {
          // The server trigger checks coach_code itself and assigns the role -
          // the client's claim alone is never trusted, even here. Every new
          // signup is also auto-confirmed server-side now, so this logs
          // straight in for every user, no email step for anyone.
          const authData = await supabaseSignUp(cleanEmail, password, { role: "trainee", network: networkId, coach_code: coachCode.trim() });
          if (authData.access_token) {
            session.accessToken = authData.access_token;
            const appUser = await fetchOwnProfile(authData.user?.id);
            if (!appUser) throw new Error("נרשמת אך הפרופיל טרם נוצר, נסה/י להתחבר בעוד רגע");
            showToast("נרשמת בהצלחה!", "success");
            onAuthed(appUser);
          } else {
            showToast("נרשמת בהצלחה - כעת ניתן להתחבר", "success");
            setScreen("login"); setPassword(""); setConfirm("");
          }
        } else {
          const users = await storageGetList("app_users");
          if (users.some((u) => u.email.toLowerCase() === cleanEmail.toLowerCase())) throw new Error("כבר קיים משתמש עם אימייל זה");
          const passwordHash = await hashPassword(password);
          const newUser = {
            id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            email: cleanEmail, passwordHash, network: networkId,
            role: wantsCoach ? "admin" : "trainee",
            createdAt: new Date().toISOString(),
            onboarded: wantsCoach, profile: null,
          };
          await storageSetList("app_users", [...users, newUser]);
          showToast("נרשמת בהצלחה!", "success");
          onAuthed(newUser);
        }
      } else {
        if (useRealAuth) {
          const authData = await supabaseLogin(cleanEmail, password);
          session.accessToken = authData.access_token;
          const appUser = await fetchOwnProfile(authData.user?.id);
          if (!appUser) throw new Error("משתמש לא נמצא במערכת");
          showToast(`ברוך שובך, ${appUser.email.split("@")[0]}`, "success");
          onAuthed(appUser);
        } else {
          const users = await storageGetList("app_users");
          const user = users.find((u) => u.email.toLowerCase() === cleanEmail.toLowerCase());
          if (!user) throw new Error("משתמש לא נמצא");
          const hash = await hashPassword(password);
          if (hash !== user.passwordHash) throw new Error("סיסמה שגויה");
          showToast(`ברוך שובך, ${user.email.split("@")[0]}`, "success");
          onAuthed(user);
        }
      }
    } catch (e) {
      setError(e.message || "שגיאה, נסה שוב");
    } finally {
      setLoading(false);
    }
  }

  const logo = (
    <div className="flex flex-col items-center mb-4">
      <div className="mb-1" style={{ width: 136, height: 136 }}>
        <img src={logoImg} alt="SayertTracking" className="w-full h-full object-contain" />
      </div>
      <div className="text-2xl font-black text-zinc-50 tracking-wide">SayertTracking</div>
      <div className="w-8 h-px bg-emerald-500/40 my-1.5" />
      <div className="text-sm text-zinc-500 tracking-wide">המעטפת לסיירת</div>
    </div>
  );

  // Screen 1: choice - just two big buttons, no fields at all yet
  if (screen === "choice") {
    return (
      <div className="flex-1 flex flex-col items-center p-5 relative overflow-y-auto" style={{ justifyContent: "safe center" }}>
        <div className="w-full max-w-xs">
          {logo}
          <Card className="p-5 space-y-3 tech-grid">
            <GlowButton tone="emerald" icon={ChevronLeft} className="w-full" onClick={() => setScreen("login")}>
              יש לי כבר חשבון - התחברות
            </GlowButton>
            <GlowButton tone="ghost" icon={User} className="w-full" onClick={() => setScreen("signup")}>
              משתמש/ת חדש/ה - הרשמה
            </GlowButton>
          </Card>
        </div>
      </div>
    );
  }

  // Screen 2: login - its own dedicated screen, just email + password
  if (screen === "login") {
    return (
      <div className="flex-1 flex flex-col items-center p-5 relative overflow-y-auto" style={{ justifyContent: "safe center" }}>
        <div className="w-full max-w-xs">
          {logo}
          <Card className="p-5">
            <button onClick={() => { setScreen("choice"); setError(""); }} className="flex items-center gap-1.5 text-zinc-500 hover:text-emerald-400 text-sm font-bold mb-4">
              <ChevronRight size={14} /> חזרה
            </button>
            <div className="space-y-3">
              <div>
                <label className="text-[13px] text-zinc-500 font-semibold">אימייל</label>
                <input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
              </div>
              <div>
                <label className="text-[13px] text-zinc-500 font-semibold">סיסמה</label>
                <div className="relative mt-1">
                  <input dir="ltr" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pr-3 pl-10 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}
              <GlowButton tone="emerald" icon={loading ? Loader2 : ChevronLeft} className="w-full" disabled={loading} onClick={submit}>
                {loading ? "רגע..." : "התחבר"}
              </GlowButton>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Screen 3: signup - its own dedicated screen, password entry separate from login entirely
  return (
    <div className="flex-1 flex flex-col items-center p-5 relative overflow-y-auto" style={{ justifyContent: "safe center" }}>
      <div className="w-full max-w-xs">
        {logo}
        <Card className="p-5">
          <button onClick={() => { setScreen("choice"); setError(""); }} className="flex items-center gap-1.5 text-zinc-500 hover:text-emerald-400 text-sm font-bold mb-4">
            <ChevronRight size={14} /> חזרה
          </button>
          <div className="space-y-3">
            <div>
              <label className="text-[13px] text-zinc-500 font-semibold">אימייל</label>
              <input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
            </div>
            <div>
              <label className="text-[13px] text-zinc-500 font-semibold">סיסמה</label>
              <div className="relative mt-1">
                <input dir="ltr" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pr-3 pl-10 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[13px] text-zinc-500 font-semibold">אימות סיסמה</label>
              <div className="relative mt-1">
                <input dir="ltr" type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pr-3 pl-10 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
                <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[13px] text-zinc-500 font-semibold">קוד רשת</label>
              <input dir="ltr" value={networkCode} onChange={(e) => setNetworkCode(e.target.value)} placeholder="קוד הרשת שקיבלת" className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
            </div>
            <div>
              <label className="text-[13px] text-zinc-500 font-semibold">קוד מאמן (רק למאמנים - השאירו ריק אם אתם חניכים)</label>
              <input dir="ltr" type="password" value={coachCode} onChange={(e) => setCoachCode(e.target.value)} placeholder="אופציונלי" className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all duration-300" />
            </div>
            {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}
            <GlowButton tone="emerald" icon={loading ? Loader2 : Check} className="w-full" disabled={loading} onClick={submit}>
              {loading ? "רגע..." : "הרשם"}
            </GlowButton>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================== ONBOARDING FLOW ============================== */

function OnboardingFlow({ user, onDone, showToast }) {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState(17);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(68);
  const [healthy, setHealthy] = useState(true);
  const [issues, setIssues] = useState([]);
  const [otherNote, setOtherNote] = useState("");
  const [level, setLevel] = useState("");
  const [unit, setUnit] = useState(null);
  const [teamCode, setTeamCode] = useState("");
  const [teamCodeInput, setTeamCodeInput] = useState("");
  const [teamCodeError, setTeamCodeError] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleIssue(opt) {
    setIssues((list) => (list.includes(opt) ? list.filter((x) => x !== opt) : [...list, opt]));
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function finish() {
    setCheckingCode(true);
    const valid = await verifyTeamCode(teamCode, teamCodeInput.trim());
    setCheckingCode(false);
    if (!valid) {
      setTeamCodeError("קוד האימות שגוי - בדוק/י את הקוד שקיבלת עבור הצוות");
      return;
    }
    setSaving(true);
    try {
      const profile = {
        fullName, age, height, weight, healthy,
        healthIssues: healthy ? [] : issues,
        healthOtherNote: healthy ? "" : otherNote,
        level, targetUnit: unit.id, targetUnitName: unit.name,
        teamCode,
      };
      const updatedUser = { ...user, onboarded: true, profile };
      await saveUserProfile(updatedUser);
      showToast("הפרופיל נשמר בהצלחה", "success");
      onDone(updatedUser);
    } catch (e) {
      showToast("שגיאה בשמירה, נסה שוב", "error");
    } finally {
      setSaving(false);
    }
  }

  const stepsMeta = ["פרטים אישיים", "רמת כושר", "יעד קרבי", "צוות"];

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="flex items-center gap-1.5 mb-1 mt-2">
        {stepsMeta.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-emerald-500" : "bg-zinc-800"}`} />
        ))}
      </div>
      <div className="text-[13px] text-zinc-600 font-semibold mb-4">שלב {step + 1} מתוך {stepsMeta.length} - {stepsMeta[step]}</div>

      <div className="flex-1">
        {step === 0 && (
          <div className="space-y-4">
            <SectionTitle icon={User}>ספר/י לנו קצת עליך</SectionTitle>
            <div>
              <label className="text-[13px] text-zinc-500 font-semibold">שם מלא</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[["גיל", age, setAge, 12, 25], ["גובה (ס״מ)", height, setHeight, 130, 210], ["משקל (ק״ג)", weight, setWeight, 30, 150]].map(([label, val, setter, min, max]) => (
                <div key={label}>
                  <label className="text-[12px] text-zinc-500 font-semibold">{label}</label>
                  <input type="number" min={min} max={max} value={val} onChange={(e) => setter(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-base text-zinc-100 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
                </div>
              ))}
            </div>

            <div>
              <label className="text-[13px] text-zinc-500 font-semibold mb-1.5 block">האם את/ה נוטה להיות בריא/ה?</label>
              <div className="flex gap-2">
                <button onClick={() => setHealthy(true)} className={`flex-1 rounded-xl py-2.5 text-base font-bold border ${healthy ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>כן</button>
                <button onClick={() => setHealthy(false)} className={`flex-1 rounded-xl py-2.5 text-base font-bold border ${!healthy ? "bg-red-500/15 border-red-500 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>לא</button>
              </div>
            </div>

            {!healthy && (
              <div>
                <label className="text-[13px] text-zinc-500 font-semibold mb-1.5 block">מה הבעיה? (ניתן לבחור כמה)</label>
                <div className="flex flex-wrap gap-1.5">
                  {HEALTH_OPTIONS.map((opt) => (
                    <button key={opt} onClick={() => toggleIssue(opt)} className={`rounded-full px-3 py-1.5 text-sm font-bold border ${issues.includes(opt) ? "bg-red-500/15 border-red-500 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
                {issues.includes("אחר") && (
                  <textarea value={otherNote} onChange={(e) => setOtherNote(e.target.value)} placeholder="פרט/י..." rows={2} className="w-full mt-2 bg-zinc-950 border border-red-500/30 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 resize-none" />
                )}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2">
            <SectionTitle icon={GaugeIcon} tone="amber">מה רמת הכושר הנוכחית שלך?</SectionTitle>
            {TIERS.map((t) => (
              <button key={t} onClick={() => setLevel(t)} className={`w-full text-right rounded-xl px-4 py-3.5 text-base font-bold border transition ${level === t ? "bg-amber-500/15 border-amber-500 text-amber-400" : "bg-zinc-900 border-zinc-800 text-zinc-300"}`}>
                {t}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <SectionTitle icon={Target}>לאיזו יחידה את/ה שואף/ת?</SectionTitle>
            <div className="text-[13px] text-zinc-600 mb-3">שימו לב - לאחר האישור לא ניתן יהיה לשנות את היעד</div>
            <div className="grid grid-cols-2 gap-2.5">
              {UNITS.map((u) => {
                const selected = unit?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setUnit(u)}
                    style={selected ? glowVars(u.hex) : undefined}
                    className={`rounded-2xl px-3 py-4 text-center transition active:scale-95 ${selected ? `glow-btn border-2 ${u.border}` : `bg-zinc-950 border-2 ${u.border}`}`}
                  >
                    <div className={`text-base font-black ${u.text}`}>{u.name}</div>
                    <div className="text-[12px] text-zinc-500 mt-0.5">{u.tagline}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <SectionTitle icon={Users}>לאיזה צוות את/ה משויך/ת?</SectionTitle>
            <div className="text-[13px] text-zinc-600 mb-3">בחר/י את מספר הצוות והזן/י את קוד האימות שקיבלת מהמדריך. לא ניתן לשנות לאחר האישור.</div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {TEAM_LIST.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTeamCode(t.id); setTeamCodeError(""); }}
                  className={`rounded-xl py-3 text-base font-black border transition ${teamCode === t.id ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-300"}`}
                >
                  {t.id}
                </button>
              ))}
            </div>
            {teamCode && (
              <div>
                <label className="text-[13px] text-zinc-500 font-semibold">קוד אימות לצוות {teamCode}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  dir="ltr"
                  value={teamCodeInput}
                  onChange={(e) => { setTeamCodeInput(e.target.value); setTeamCodeError(""); }}
                  placeholder="הזן/י קוד"
                  className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300"
                />
                {teamCodeError && <div className="text-sm text-red-400 mt-1.5">{teamCodeError}</div>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 pb-2">
        {step > 0 && (
          <GlowButton tone="ghost" className="flex-1" onClick={handleBack}>חזור</GlowButton>
        )}
        {step === 0 && (
          <GlowButton tone="emerald" className="flex-1" disabled={!fullName.trim()} onClick={() => setStep(1)}>המשך</GlowButton>
        )}
        {step === 1 && (
          <GlowButton tone="emerald" className="flex-1" disabled={!level} onClick={() => setStep(2)}>המשך</GlowButton>
        )}
        {step === 2 && unit && (
          <GlowButton tone="emerald" className="flex-1" onClick={() => setStep(3)}>אשר וכנס</GlowButton>
        )}
        {step === 3 && (
          <GlowButton tone="emerald" icon={saving || checkingCode ? Loader2 : Check} className="flex-1" disabled={saving || checkingCode || !teamCode || !teamCodeInput.trim()} onClick={finish}>
            {checkingCode ? "בודק קוד..." : saving ? "שומר..." : "סיום ההרשמה"}
          </GlowButton>
        )}
      </div>
    </div>
  );
}

/* ============================== HEADER ============================== */

function AppHeader({ user }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const greeting = hour >= 5 && hour < 12 ? "בוקר טוב" : hour >= 12 && hour < 17 ? "צהריים טובים" : hour >= 17 && hour < 21 ? "ערב טוב" : "לילה טוב";
  const displayName = user.profile?.fullName || user.email.split("@")[0];

  return (
    <div className="px-4 py-2.5 border-b border-zinc-800/80 bg-black/60 backdrop-blur">
      <div className="text-[11px] text-zinc-600 leading-none mb-1">
        {now.toLocaleDateString("he-IL", { day: "numeric", month: "long" })} · {now.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="text-base font-black text-zinc-50 leading-none truncate max-w-[220px]">{greeting}, {displayName}</div>
    </div>
  );
}

/* ============================== BOTTOM NAV ============================== */

function BottomNav({ tabs, active, setActive, onSameTabClick }) {
  const MILITARY_BROWN = "#8a7355";
  return (
    <div className="border-t border-zinc-800/80 bg-black/80 backdrop-blur-xl flex items-end">
      {tabs.map((t) => {
        const isActive = active === t.id;
        const isChat = t.id === "chat";
        if (isChat) {
          return (
            <button key={t.id} onClick={() => { if (isActive) onSameTabClick?.(t.id); else setActive(t.id); }} className="relative flex-1 flex flex-col items-center gap-0.5 pb-1.5 transition-transform duration-300 ease-out active:scale-90">
              <div
                className="w-14 h-14 -mt-5 rounded-full flex items-center justify-center border-4 border-black transition-transform duration-300"
                style={{ background: `linear-gradient(150deg, ${MILITARY_BROWN}, #5c4d33)`, boxShadow: isActive ? `0 4px 18px ${MILITARY_BROWN}80` : "0 4px 14px rgba(0,0,0,0.4)" }}
              >
                <t.icon size={24} className="text-white" />
              </div>
              <span className="text-[10px] font-bold mt-0.5" style={{ color: isActive ? MILITARY_BROWN : "#71717a" }}>{t.label}</span>
            </button>
          );
        }
        return (
          <button key={t.id} onClick={() => { if (isActive) onSameTabClick?.(t.id); else setActive(t.id); }} className="relative flex-1 flex flex-col items-center gap-0.5 py-1.5 transition-transform duration-300 ease-out active:scale-90">
            {isActive && <span className="absolute top-0 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(16,185,129,0.6)]" />}
            <t.icon size={15} className={`transition-all duration-300 ease-out ${isActive ? "text-emerald-400 scale-110" : "text-zinc-600"}`} />
            <span className={`text-[10px] font-bold transition-colors duration-300 ${isActive ? "text-emerald-400" : "text-zinc-600"}`}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================== HOME TAB ============================== */

function FitnessLineGraph({ points, unit, onPointClick }) {
  if (points.length === 0) return null;
  const W = 320, H = 170, PAD_X = 46, PAD_Y = 24, PAD_R = 14;
  const values = points.map((p) => p.value);
  let min = Math.min(...values), max = Math.max(...values);
  if (min === max) { min -= unit === "time" ? 5 : 1; max += unit === "time" ? 5 : 1; }
  const range = max - min;

  // For time-based tests, lower is better - invert the Y mapping so "up" always
  // visually means "improving," regardless of whether the metric is time or reps.
  const yFor = (v) => {
    const norm = (v - min) / range; // 0..1
    const visual = unit === "time" ? norm : 1 - norm;
    return PAD_Y + visual * (H - PAD_Y * 2);
  };
  const xFor = (i) => points.length === 1 ? (PAD_X + W - PAD_R) / 2 : PAD_X + (i / (points.length - 1)) * (W - PAD_R - PAD_X);

  const coords = points.map((p, i) => [xFor(i), yFor(p.value)]);
  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1][0]} ${H - PAD_Y} L ${coords[0][0]} ${H - PAD_Y} Z`;

  // Axis labels: top value, middle value, bottom value - actual numbers (time or reps), not abstract.
  const axisSteps = [0, 0.5, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 190 }}>
      <defs>
        <linearGradient id="fitGraphFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <filter id="fitGraphGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {axisSteps.map((f) => {
        const y = PAD_Y + f * (H - PAD_Y * 2);
        // Visual top (f=0) = better; for time that's min, for reps that's max.
        const val = unit === "time" ? min + f * range : max - f * range;
        return (
          <g key={f}>
            <line x1={PAD_X} x2={W - PAD_R} y1={y} y2={y} stroke="#27272a" strokeWidth="1" strokeDasharray="3 4" />
            <text x={PAD_X - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#71717a">{formatTestValue(unit, val)}</text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#fitGraphFill)" />
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" filter="url(#fitGraphGlow)" />
      {coords.map(([x, y], i) => {
        const isLast = i === coords.length - 1;
        return (
          <g key={i} onClick={() => onPointClick?.(points[i])} style={{ cursor: onPointClick ? "pointer" : "default" }}>
            <circle cx={x} cy={y} r="14" fill="transparent" />
            <circle cx={x} cy={y} r={isLast ? 5 : 3.5} fill={isLast ? "#10b981" : "#0a0a0a"} stroke="#10b981" strokeWidth="2" />
            {isLast && <circle cx={x} cy={y} r="9" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.5" />}
          </g>
        );
      })}
    </svg>
  );
}

function SpeedGauge({ value, label, hex }) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = -125 + (clamped / 100) * 250; // -125deg to +125deg sweep
  const r = 40;
  const circumference = 2 * Math.PI * r * (250 / 360);
  const dash = (clamped / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-[125deg]">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#27272a" strokeWidth="7" strokeDasharray={`${circumference} 999`} strokeLinecap="round" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={hex} strokeWidth="7" strokeDasharray={`${dash} 999`} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${hex})` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
            <span className="text-xl font-black text-white tabular-nums">{Math.round(clamped)}%</span>
          </div>
        </div>
      </div>
      <div className="text-[11px] font-bold text-zinc-400 mt-1.5 text-center tracking-wide">{label}</div>
    </div>
  );
}

function WarMiniTable({ rows }) {
  return (
    <div className="rounded-xl overflow-hidden border border-zinc-800 mb-2">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-red-500/10 border-b border-red-500/20">
            <th className="text-right font-bold text-red-400 py-1.5 px-2.5 text-[11px]">תרגיל</th>
            <th className="text-center font-bold text-red-400 py-1.5 px-1 text-[11px]">סטים</th>
            <th className="text-center font-bold text-red-400 py-1.5 px-1 text-[11px]">חזרות</th>
            <th className="text-center font-bold text-red-400 py-1.5 px-1 text-[11px]">מנוחה</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-zinc-950" : "bg-black"}>
              <td className="text-right py-2 px-2.5 font-bold text-zinc-200 text-[13px]">{r[0]}</td>
              <td className="text-center py-2 px-1 text-zinc-300 text-[13px] tabular-nums">{r[1]}</td>
              <td className="text-center py-2 px-1 text-zinc-300 text-[13px] tabular-nums">{r[2]}</td>
              <td className="text-center py-2 px-1 text-amber-400/90 text-[12px] tabular-nums">{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WarWorkoutBlock({ workout }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="text-base font-black text-red-400 mb-2 flex items-center gap-1.5">
        <Flame size={15} /> {workout.name}
      </div>
      {workout.highlights?.length > 0 && (
        <div className="bg-amber-500/[0.07] border border-amber-500/25 rounded-lg p-2.5 mb-2.5 space-y-1">
          {workout.highlights.map((h, i) => (
            <div key={i} className="text-[12px] text-amber-300 leading-relaxed">{h}</div>
          ))}
        </div>
      )}
      {workout.blocks.map((b, bi) => (
        <div key={bi} className="mb-2.5 last:mb-0">
          {b.label && <div className="text-[13px] font-bold text-zinc-400 mb-1">{b.label}</div>}
          {b.rows && <WarMiniTable rows={b.rows} />}
          {b.note && <div className="text-[13px] text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-lg p-2.5">{b.note}</div>}
        </div>
      ))}
    </div>
  );
}


function ReflectionHistoryRow({ r, isOpen, onToggle }) {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: isOpen ? "#0ea5e950" : "#27272a", background: isOpen ? "linear-gradient(160deg, #0ea5e915, transparent 60%), #0a0a0a" : "#111113" }}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${r.group ? "bg-sky-500/15" : "bg-zinc-800"}`}>
          {r.group ? <Users size={16} className="text-sky-400" /> : <User size={16} className="text-zinc-400" />}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <div className="text-[14px] font-bold text-zinc-100 truncate">{r.title}</div>
          <div className="text-[11px] text-zinc-500">{r.date}</div>
        </div>
        <ChevronDown size={16} className={`shrink-0 transition ${isOpen ? "rotate-180 text-sky-400" : "text-zinc-600"}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-emerald-500/[0.08] border border-emerald-500/25 rounded-xl p-3">
              <div className="text-[11px] text-emerald-400 font-bold mb-1.5 flex items-center gap-1"><Check size={12} /> שימור</div>
              <div className="text-[12px] text-zinc-300 space-y-1 leading-relaxed">
                <div>{r.keep1}</div>
                <div>{r.keep2}</div>
              </div>
            </div>
            <div className="bg-amber-500/[0.08] border border-amber-500/25 rounded-xl p-3">
              <div className="text-[11px] text-amber-400 font-bold mb-1.5 flex items-center gap-1"><TrendingUp size={12} /> שיפור</div>
              <div className="text-[12px] text-zinc-300 space-y-1 leading-relaxed">
                <div>{r.improve1}</div>
                <div>{r.improve2}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-[12px] text-sky-400 font-semibold mb-1.5 flex items-center gap-1"><Bot size={12} /> מה ה-AI המליץ</div>
            <div className="bg-sky-500/[0.06] border border-sky-500/20 rounded-xl p-3 text-[13px] text-zinc-300 leading-relaxed [&>*:last-child]:mb-0">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-1.5">{children}</p>,
                  strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc pr-3 space-y-0.5 mb-1.5">{children}</ul>,
                  li: ({ children }) => <li>{children}</li>,
                }}
              >
                {r.aiTips}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutTable({ body }) {
  const lines = (body || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const notes = lines.filter((l) => l.startsWith("META|")).map((l) => l.slice(5));
  const rows = lines.filter((l) => !l.startsWith("META|")).map((l) => l.split("|"));
  return (
    <div>
      {notes.map((n, i) => (
        <div key={i} className="text-sm text-amber-400 font-semibold mb-2 flex items-start gap-1.5">
          <Target size={13} className="text-amber-500 shrink-0 mt-0.5" />
          <span>{n}</span>
        </div>
      ))}
      {rows.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.06)]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-l from-emerald-500/15 to-emerald-500/5 border-b border-emerald-500/20">
                <th className="text-right font-black text-emerald-400 py-2.5 px-3 text-[12px] tracking-wide">תרגיל</th>
                <th className="text-center font-black text-emerald-400 py-2.5 px-1.5 text-[12px] tracking-wide">סטים</th>
                <th className="text-center font-black text-emerald-400 py-2.5 px-1.5 text-[12px] tracking-wide">חזרות</th>
                <th className="text-center font-black text-emerald-400 py-2.5 px-1.5 text-[12px] tracking-wide">מנוחה</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={`border-b border-zinc-800/60 last:border-0 ${i % 2 === 0 ? "bg-zinc-950" : "bg-black"}`}>
                  <td className="text-right py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                      <span className="font-bold text-zinc-100 text-[14px] leading-tight">{r[0]}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-1">
                    <span className="inline-block min-w-[28px] font-black text-base text-white tabular-nums">{r[1] || "-"}</span>
                  </td>
                  <td className="text-center py-3 px-1.5">
                    <span className="text-[13px] font-bold text-zinc-300 tabular-nums">{r[2] || "-"}</span>
                  </td>
                  <td className="text-center py-3 px-1.5">
                    <span className="text-[12px] font-semibold text-amber-400/90 tabular-nums">{r[3] || "-"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WorkoutCard({ it, isOpen, onToggle, index }) {
  const flavors = [
    { hex: "#f97316", label: "כוח" },
    { hex: "#ef4444", label: "עצימות" },
    { hex: "#eab308", label: "מתח" },
    { hex: "#10b981", label: "ביצוע" },
  ];
  const flavor = flavors[index % flavors.length];
  const diff = DIFFICULTY_STYLE[it.difficulty];
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: isOpen ? flavor.hex : "#27272a", background: isOpen ? `linear-gradient(160deg, ${flavor.hex}18, transparent 60%), #0a0a0a` : "#111113" }}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${flavor.hex}, ${flavor.hex}99)`, boxShadow: `0 4px 14px ${flavor.hex}45` }}>
          <Flame size={20} className="text-white" />
        </div>
        <div className="flex-1 text-right">
          <div className="text-lg font-black text-zinc-50 leading-tight">{it.title}</div>
          {diff && (
            <span className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${diff.bg} ${diff.text} ${diff.border}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: diff.hex }} /> {it.difficulty}
            </span>
          )}
        </div>
        <ChevronDown size={20} className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`} style={{ color: isOpen ? flavor.hex : "#71717a" }} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <WorkoutTable body={it.body} />
        </div>
      )}
    </div>
  );
}


function HomeTab({ warMode, goToWarChat, officialEvents, personalLogs, goToHub, goToFeedback, goToCalendar, goToFitness, goToProfile, role, trainingContent, profile, showToast, userId, removePersonalLog, updateProfile, resetSignal, scrollToTop }) {
  const gibushDate = profile?.gibushDate ? new Date(`${profile.gibushDate}T06:00:00`) : null;
  const [timeLeft, setTimeLeft] = useState(() => (gibushDate ? formatCountdown(gibushDate - new Date()) : null));
  useEffect(() => {
    if (!gibushDate) { setTimeLeft(null); return; }
    setTimeLeft(formatCountdown(gibushDate - new Date()));
    const id = setInterval(() => setTimeLeft(formatCountdown(gibushDate - new Date())), 1000);
    return () => clearInterval(id);
  }, [profile?.gibushDate]);
  const [openWeek, setOpenWeek] = useState(0);
  const [homeView, setHomeView] = useState("main");
  useEffect(() => { scrollToTop?.(); }, [homeView]);
  useEffect(() => { if (resetSignal) setHomeView("main"); }, [resetSignal]);
  const [activeBank, setActiveBank] = useState(null);
  const [bankSearch, setBankSearch] = useState("");
  const [openWorkoutId, setOpenWorkoutId] = useState(null);
  const [openReflectionId, setOpenReflectionId] = useState(null);
  const todayKey = toKey(new Date());
  const todayEvents = officialEvents.filter((e) => e.date === todayKey);
  const openFeedbackEvent = role !== "admin" ? getOpenFeedbackEvent(officialEvents) : null;

  const [reflections, setReflections] = useState([]);
  useEffect(() => {
    if (!userId) return;
    loadReflectionsRemote(userId).then(setReflections);
  }, [userId]);

  // ---- Streak gauge: +2/day if active on consecutive days, -2 per missed day ----
  useEffect(() => {
    if (!profile || !updateProfile) return;
    const last = profile.streakLastDate;
    if (last === todayKey) return; // already checked in today
    let next = profile.streakValue || 0;
    if (last) {
      const gapDays = Math.round((new Date(todayKey) - new Date(last)) / 86400000);
      if (gapDays === 1) next = Math.min(100, next + 2);
      else if (gapDays > 1) next = Math.max(0, next - 2 * (gapDays - 1));
    }
    updateProfile({ streakValue: next, streakLastDate: todayKey });
  }, [profile?.streakLastDate]);
  const streakValue = profile?.streakValue || 0;

  // ---- Load gauge: based on how many trainings (personal + official) happened this week ----
  function weekStart(d) {
    const dt = new Date(d);
    dt.setDate(dt.getDate() - dt.getDay()); // Sunday start
    dt.setHours(0, 0, 0, 0);
    return dt;
  }
  const thisWeekStartKey = toKey(weekStart(new Date()));
  const trainingsThisWeek = useMemo(() => {
    const official = (officialEvents || []).filter((e) => e.date >= thisWeekStartKey && e.date <= todayKey).length;
    const personal = (personalLogs || []).filter((e) => e.date >= thisWeekStartKey && e.date <= todayKey).length;
    return official + personal;
  }, [officialEvents, personalLogs, thisWeekStartKey, todayKey]);

  const track = profile?.gibushDate ? "gibush" : profile?.level === "מתחיל" ? "beginner" : profile?.level === "מתקדם" ? "advanced" : "draft";
  const LOAD_TABLE = {
    beginner: { 0: 0, 1: 25, 2: 60, 3: 80, 4: 95, 5: 100 },
    advanced: { 0: 0, 1: 25, 2: 40, 3: 65, 4: 80, 5: 92 },
    gibush: { 0: 0, 1: 25, 2: 35, 3: 60, 4: 77, 5: 90 },
    draft: { 0: 0, 1: 25, 2: 40, 3: 60, 4: 80, 5: 94 },
  };
  const loadTable = LOAD_TABLE[track];
  const loadValue = loadTable[Math.min(trainingsThisWeek, 5)];

  // ---- Attendance gauge: % of official trainings the trainee was marked present for ----
  const [attendanceValue, setAttendanceValue] = useState(0);
  useEffect(() => {
    if (!userId) return;
    loadAllIndividualAttendance().then((all) => {
      const mine = all.filter((r) => r.userId === userId);
      if (mine.length === 0) { setAttendanceValue(0); return; }
      const present = mine.filter((r) => r.present).length;
      setAttendanceValue(Math.round((present / mine.length) * 100));
    });
  }, [userId]);

  const gibushHex = (GIBUSH_TYPE_COLORS[profile?.gibushType] || {}).hex || "#10b981";

  // ---- Next-training logic: today, else next upcoming, else a suggestion ----
  const nextTrainingInfo = useMemo(() => {
    const allUpcoming = [
      ...(officialEvents || []).map((e) => ({ ...e, group: true })),
      ...(personalLogs || []).map((e) => ({ ...e, group: false })),
    ].filter((e) => e.date >= todayKey).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const hasEnded = (e) => {
      if (e.date !== todayKey) return false;
      const startMin = timeToMinutes(e.time || "00:00");
      const endMin = e.endTime ? timeToMinutes(e.endTime) : startMin + 60;
      return endMin <= nowMinutes;
    };

    const today = allUpcoming.filter((e) => e.date === todayKey && !hasEnded(e));
    const future = allUpcoming.filter((e) => e.date > todayKey);
    const next = future[0] || null;

    if (today.length === 0 && !next) {
      const dow = new Date().getDay(); // 0=Sun..6=Sat
      const isLateWeek = [3, 4, 5, 6].includes(dow);
      if (isLateWeek && trainingsThisWeek >= 3) {
        return { type: "suggestion", text: "לא קבוע אימון, אך עקב השבוע העמוס שהיה מומלץ לצאת לריצת נפח קלה או לנוח" };
      }
      const suggestions = [
        "לא קבוע שום אימון, בוא תקבע אימון פלג גוף עליון ותתן בראש!",
        "לא קבוע אימון, בוא תקבע אימון ריצה מהמאגר ותתן בראש!",
      ];
      return { type: "suggestion", text: suggestions[Math.floor(Math.random() * suggestions.length)] };
    }
    return { type: "events", today, next };
  }, [officialEvents, personalLogs, todayKey, trainingsThisWeek]);
  const [showNext, setShowNext] = useState(false);

  // Past trainings (both group/official and personal) for the reflection feature -
  // excludes anything that already has a saved reflection, so it doesn't ask twice.
  const reflectedIds = useMemo(() => new Set(reflections.map((r) => r.trainingRefId)), [reflections]);
  const pastTrainings = useMemo(() => {
    const official = (officialEvents || []).filter((e) => e.date <= todayKey).map((e) => ({ id: `off_${e.id}`, title: e.title, date: e.date, group: true }));
    const personal = (personalLogs || []).filter((e) => e.date <= todayKey).map((e) => ({ id: `pers_${e.id}`, title: e.title, date: e.date, group: false }));
    return [...official, ...personal].filter((t) => !reflectedIds.has(t.id)).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 20);
  }, [officialEvents, personalLogs, todayKey, reflectedIds]);

  const [reflectingOn, setReflectingOn] = useState(null);
  const [keep1, setKeep1] = useState(""); const [keep2, setKeep2] = useState("");
  const [improve1, setImprove1] = useState(""); const [improve2, setImprove2] = useState("");
  const [aiTips, setAiTips] = useState(null);
  const [reflectLoading, setReflectLoading] = useState(false);

  function openReflection(training) {
    setReflectingOn(training);
    setKeep1(""); setKeep2(""); setImprove1(""); setImprove2(""); setAiTips(null);
  }

  async function submitReflection() {
    if (!keep1.trim() || !keep2.trim() || !improve1.trim() || !improve2.trim()) {
      showToast("נא למלא את כל 4 השדות", "error");
      return;
    }
    setReflectLoading(true);
    try {
      const sys = "אתה מאמן כושר קרבי עילי לבני נוער 16-19, תומך ומעודד, מבוסס על מדעי ביצועי ספורט. חניך כתב לך שני דברים ששמר טוב מהאימון ושני דברים שהוא רוצה לשפר. תבנה שלב הבא: 1) משפט עידוד קצר וחם שמתייחס ספציפית למה שהוא שמר טוב (לא כללי). 2) ציין בפירוש את החוזקות שלו לפי מה שכתב, בשתי-שלוש מילים לכל אחת. 3) אחרי שורה ריקה, תן בדיוק 3-4 נקודות קצרות וקונקרטיות (לא יותר) של דרכים מעשיות לעבוד על השיפור עד האימון הבא. הכל בעברית, חם אך ישיר, בלי הקדמות מיותרות.";
      const userText = `שמרתי טוב: ${keep1} | ${keep2}\nרוצה לשפר: ${improve1} | ${improve2}`;
      const reply = await aiChat(sys, userText);
      setAiTips(reply);

      // Save permanently to reflection history, then remove the training from the
      // calendar if it's a personal entry (group/official trainings stay - they're
      // shared with the whole team, just no longer offered for reflection again).
      const saved = await addReflectionRemote(userId, {
        trainingRefId: reflectingOn.id, title: reflectingOn.title, date: reflectingOn.date, group: reflectingOn.group,
        keep1, keep2, improve1, improve2, aiTips: reply,
      });
      setReflections((prev) => [saved, ...prev]);
      if (!reflectingOn.group && reflectingOn.id.startsWith("pers_")) {
        removePersonalLog(reflectingOn.id.replace("pers_", ""));
      }
    } catch (e) {
      showToast(`שגיאת AI: ${e.message || "לא ידוע"}`, "error");
    } finally {
      setReflectLoading(false);
    }
  }

  if (homeView === "bank_detail" && activeBank) {
    const numOf = (title) => {
      const m1 = title.match(/^(\d+)\./);
      if (m1) return parseInt(m1[1], 10);
      const m2 = title.match(/(\d+)/);
      return m2 ? parseInt(m2[1], 10) : 9999;
    };
    const allItems = trainingContent
      .filter((t) => t.subcategory === activeBank.id)
      .sort((a, b) => {
        if (a.title === "עקרונות ומטרות") return -1;
        if (b.title === "עקרונות ומטרות") return 1;
        return numOf(a.title) - numOf(b.title);
      });
    const items = bankSearch.trim()
      ? allItems.filter((it) => it.title.toLowerCase().includes(bankSearch.trim().toLowerCase()) || it.title === "עקרונות ומטרות")
      : allItems;
    return (
      <div className="p-4">
        <button onClick={() => { setHomeView("main"); setBankSearch(""); setOpenWorkoutId(null); }} className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 text-base font-bold mb-4">
          <ChevronRight size={16} /> חזרה לבית
        </button>
        <SectionTitle icon={activeBank.icon}>{activeBank.title}</SectionTitle>
        {allItems.length > 6 && (
          <div className="relative mb-3">
            <input
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder={`חיפוש בתוך ${allItems.length} אימונים...`}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-9 pl-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300"
            />
            <Compass size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          </div>
        )}
        {items.length === 0 ? (
          <div className="text-center py-12 text-sm text-zinc-600 bg-zinc-950 border border-zinc-800 rounded-xl">
            {allItems.length === 0 ? "אין עדיין תוכן כאן - יתווסף בהמשך" : "אין תוצאות לחיפוש"}
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((it, idx) =>
              it.title === "עקרונות ומטרות" ? (
                <Card key={it.id} className="p-4 border-2 border-red-500/30 bg-red-500/[0.04]">
                  <div className="flex items-center gap-1.5 text-red-400 font-black text-lg mb-2">
                    <Flame size={18} /> {it.title}
                  </div>
                  <WorkoutTable body={it.body} />
                </Card>
              ) : (
                <WorkoutCard key={it.id} it={it} index={idx} isOpen={openWorkoutId === it.id} onToggle={() => setOpenWorkoutId(openWorkoutId === it.id ? null : it.id)} />
              )
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="text-2xl font-black text-zinc-50">{greetingByHour()}{profile?.fullName ? `, ${profile.fullName.split(" ")[0]} 💪` : ""}</div>
          <div className="text-[13px] text-zinc-500">{new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}</div>
        </div>
        <button onClick={goToProfile} className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-lg overflow-hidden active:scale-90 transition" style={{ background: `linear-gradient(135deg, ${gibushHex}, ${gibushHex}99)`, boxShadow: `0 4px 20px ${gibushHex}50` }}>
          {profile?.photoUrl ? (
            <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-black text-black">{(profile?.fullName || "?").trim().charAt(0) || "?"}</span>
          )}
        </button>
      </div>

      <div className="rounded-2xl px-4 py-3.5 flex items-center gap-3 relative overflow-hidden" style={{ background: "linear-gradient(100deg, #1c1917, #0a0a0a)", boxShadow: "0 0 0 1px rgba(245,158,11,0.15) inset" }}>
        <div className="absolute -left-4 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-amber-500" />
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 relative">
          <Flame size={17} className="text-amber-400" />
        </div>
        <span className="text-[13px] text-zinc-200 font-semibold leading-snug relative">{quoteOfDay()}</span>
      </div>

      <Card className="p-4 relative overflow-hidden border-none" style={{ background: `linear-gradient(145deg, ${gibushHex}22, transparent 65%), #0a0a0a`, boxShadow: `0 0 0 1px ${gibushHex}35 inset` }}>
        <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-40" style={{ backgroundColor: gibushHex }} />
        <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full blur-3xl opacity-20" style={{ backgroundColor: gibushHex }} />
        <div className="relative flex items-center gap-1.5 mb-3 text-sm font-bold" style={{ color: gibushHex }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: gibushHex, boxShadow: `0 0 8px 2px ${gibushHex}` }} /> איך אתה מתקדם
        </div>
        <div className="relative grid grid-cols-3 gap-2">
          <SpeedGauge value={streakValue} label="רצף" hex={gibushHex} />
          <SpeedGauge value={loadValue} label="עומס אימונים" hex={gibushHex} />
          <SpeedGauge value={attendanceValue} label="נוכחות" hex={gibushHex} />
        </div>
      </Card>

      <Card className={`p-4 relative overflow-hidden ${todayEvents.length > 0 ? "border-emerald-500/30" : ""}`}>
        <div className="absolute -left-8 -top-8 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl" />
        {nextTrainingInfo.type === "suggestion" ? (
          <div>
            <div className="text-sm text-zinc-500 font-semibold mb-1">האם יש אימון היום?</div>
            <div className="text-base font-black text-zinc-300 leading-snug">{nextTrainingInfo.text}</div>
            <button onClick={goToCalendar} className="mt-3 w-full rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold py-2 active:scale-95 transition">
              קבע/י ביומן
            </button>
          </div>
        ) : !showNext || nextTrainingInfo.today.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-500 font-semibold mb-1">האם יש אימון היום?</div>
                {nextTrainingInfo.today.length > 0 ? (
                  <div className="text-xl font-black text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={20} /> כן, יש אימון
                  </div>
                ) : (
                  <div className="text-lg font-black text-zinc-500">אין אימון רשמי מתוכנן היום</div>
                )}
              </div>
              {nextTrainingInfo.today[0]?.time && <Pill tone="emerald">{nextTrainingInfo.today[0].time}</Pill>}
            </div>
            {nextTrainingInfo.today.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-base text-zinc-300">
                <MapPin size={14} className="text-zinc-500" />
                {nextTrainingInfo.today[0].title}{nextTrainingInfo.today[0].location ? ` - ${nextTrainingInfo.today[0].location}` : ""}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <button onClick={goToCalendar} className="flex-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold py-2 active:scale-95 transition">
                פרטים ביומן
              </button>
              {nextTrainingInfo.next && (
                <button onClick={() => setShowNext(true)} className="rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-bold py-2 px-3 flex items-center gap-1 active:scale-95 transition">
                  אימון הבא <ChevronLeft size={13} />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setShowNext(false)} className="flex items-center gap-1 text-[13px] text-zinc-500 hover:text-zinc-300 mb-2">
              <ChevronRight size={13} /> חזרה
            </button>
            <div className="text-sm text-zinc-500 font-semibold mb-1">האימון הבא שלך</div>
            <div className="text-lg font-black text-sky-400 flex items-center gap-1.5">
              <CalendarDays size={18} /> {nextTrainingInfo.next.title}
            </div>
            <div className="mt-2 flex items-center gap-2 text-base text-zinc-300">
              <Clock size={14} className="text-zinc-500" />
              {nextTrainingInfo.next.date}{nextTrainingInfo.next.time ? ` בשעה ${nextTrainingInfo.next.time}` : ""}
            </div>
            <button onClick={goToCalendar} className="mt-3 w-full rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm font-bold py-2 active:scale-95 transition">
              פרטים ביומן
            </button>
          </>
        )}
      </Card>

      {openFeedbackEvent && (
        <button onClick={goToFeedback} className="w-full rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 p-4 flex items-center justify-between active:scale-[0.98] transition">
          <div className="text-right w-full">
            <div className="text-emerald-400 font-black text-base flex items-center gap-1.5 justify-end">
              מילוי משוב אימון <ClipboardCheck size={16} />
            </div>
            <div className="text-emerald-200/70 text-[13px] mt-0.5">האימון "{openFeedbackEvent.title}" הסתיים - נשמח לשמוע איך היה</div>
          </div>
        </button>
      )}

      <Card className="p-5 relative overflow-hidden border-none" style={{ background: `linear-gradient(160deg, ${gibushHex}15, transparent 50%), #0a0a0a` }}>
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: `${gibushHex}20` }} />
        <SectionTitle icon={Clock} tone="amber">{profile?.gibushType ? `ספירה לאחור ל${profile.gibushType}` : "ספירה לאחור לגיבוש הקרוב"}</SectionTitle>
        {timeLeft ? (
          <div className="grid grid-cols-4 gap-2.5 text-center relative">
            {[["ימים", timeLeft.d], ["שעות", timeLeft.h], ["דק׳", timeLeft.m], ["שנ׳", timeLeft.s]].map(([label, val]) => (
              <div key={label} className="rounded-2xl py-3.5 bg-black border-2" style={{ borderColor: gibushHex }}>
                <div className="text-2xl font-black tabular-nums" style={{ color: gibushHex }}>{String(val).padStart(2, "0")}</div>
                <div className="text-[11px] text-zinc-400 font-semibold mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <button onClick={goToCalendar} className="w-full text-center py-5 bg-black border-2 border-amber-500/50 rounded-xl text-amber-400 hover:border-amber-500 transition glow-pulse" style={glowVars("#f59e0b")}>
            <Target size={22} className="mx-auto mb-2" />
            <div className="text-base font-black mb-1">עדיין לא נקבע מועד גיבוש</div>
            <div className="text-[13px] text-amber-400/70">לחצו כאן כדי לקבוע ביומן</div>
          </button>
        )}
      </Card>

      <Card className="p-4">
        <SectionTitle icon={ClipboardCheck} tone="emerald">אימונים אחרונים - שימור ושיפור</SectionTitle>
        {pastTrainings.length === 0 ? (
          <div className="text-center py-4 text-sm text-zinc-600">אין כרגע אימונים חדשים למשוב</div>
        ) : (
          <div className="space-y-1.5">
            {pastTrainings.map((t) => (
              <button key={t.id} onClick={() => openReflection(t)} className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 hover:border-emerald-500/40 transition">
                <div className="flex items-center gap-2">
                  {t.group ? <Users size={13} className="text-sky-400 shrink-0" /> : <User size={13} className="text-zinc-500 shrink-0" />}
                  <span className="text-sm font-bold text-zinc-200">{t.title}</span>
                </div>
                <span className="text-[12px] text-zinc-600">{t.date}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {reflections.length > 0 && (
        <Card className="p-4">
          <SectionTitle icon={Bot} tone="amber">היסטוריית שימור ושיפור</SectionTitle>
          <div className="space-y-2">
            {reflections.map((r) => (
              <ReflectionHistoryRow key={r.id} r={r} isOpen={openReflectionId === r.id} onToggle={() => setOpenReflectionId(openReflectionId === r.id ? null : r.id)} />
            ))}
          </div>
        </Card>
      )}

      {reflectingOn && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setReflectingOn(null)}>
          <div className="w-full sm:max-w-sm bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-base font-black text-zinc-100">{reflectingOn.title} · {reflectingOn.date}</div>
              <button onClick={() => setReflectingOn(null)} className="text-zinc-500 hover:text-zinc-300"><X size={18} /></button>
            </div>

            {!aiTips ? (
              <div className="space-y-2.5">
                <label className="text-[13px] text-emerald-400 font-semibold">שני דברים לשימור מהאימון</label>
                <input value={keep1} onChange={(e) => setKeep1(e.target.value)} placeholder="דבר ראשון לשימור" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <input value={keep2} onChange={(e) => setKeep2(e.target.value)} placeholder="דבר שני לשימור" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <label className="text-[13px] text-amber-400 font-semibold block mt-3">שני דברים לשיפור מהאימון</label>
                <input value={improve1} onChange={(e) => setImprove1(e.target.value)} placeholder="דבר ראשון לשיפור" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                <input value={improve2} onChange={(e) => setImprove2(e.target.value)} placeholder="דבר שני לשיפור" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                <GlowButton tone="emerald" icon={reflectLoading ? Loader2 : Send} className="w-full mt-1" disabled={reflectLoading} onClick={submitReflection}>
                  {reflectLoading ? "שולח ל-AI..." : "שלח וקבל טיפים אישיים"}
                </GlowButton>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-[13px] text-emerald-400 font-semibold mb-1.5">מה שכתבת לשימור</div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-300 space-y-1">
                    <div>• {keep1}</div>
                    <div>• {keep2}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-amber-400 font-semibold mb-1.5">מה שכתבת לשיפור</div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-300 space-y-1">
                    <div>• {improve1}</div>
                    <div>• {improve2}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-sky-400 font-semibold mb-1.5 flex items-center gap-1"><Bot size={12} /> 5 דרכים לעבוד על זה אישית</div>
                  <div className="bg-sky-500/[0.06] border border-sky-500/30 rounded-lg p-3 text-base text-zinc-200 leading-relaxed [&>*:last-child]:mb-0">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                        strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pr-4 space-y-1 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pr-4 space-y-1 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      }}
                    >
                      {aiTips}
                    </ReactMarkdown>
                  </div>
                </div>
                <GlowButton tone="ghost" className="w-full" onClick={() => setReflectingOn(null)}>סגור</GlowButton>
              </div>
            )}
          </div>
        </div>
      )}

      {warMode && (
        <Card className="p-4 border-2 hover:border-red-500/60" style={{ borderColor: "#dc2626" }}>
          <div className="rounded-xl -m-4 mb-3 p-4 glow-pulse" style={glowVars("#dc2626", "#f59e0b")}>
            <div className="flex items-center gap-2">
              <Siren size={18} className="text-red-400 animate-pulse" />
              <span className="text-base font-black text-red-400">מצב מלחמה פעיל - תוכנית 10 שבועות</span>
            </div>
          </div>

          {WAR_WEEKS.filter((w) => w.intro).map((w) => (
            <div key={w.title} className="bg-red-500/[0.06] border border-red-500/25 rounded-xl p-3 mb-2.5">
              <div className="text-sm font-black text-red-400 mb-1.5">{w.title}</div>
              <div className="space-y-1">
                {w.body.map((line, idx) => (
                  <div key={idx} className="text-[13px] text-zinc-300 leading-relaxed">{line}</div>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            {WAR_WEEKS.filter((w) => !w.intro).map((w, i) => (
              <div key={w.title} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                <button onClick={() => setOpenWeek(openWeek === i ? -1 : i)} className="w-full flex items-center justify-between px-3 py-2.5">
                  <span className="text-base font-bold text-zinc-200">{w.title}</span>
                  <ChevronDown size={16} className={`text-zinc-500 transition ${openWeek === i ? "rotate-180" : ""}`} />
                </button>
                {openWeek === i && (
                  <div className="px-3.5 pb-3.5">
                    {w.workouts ? (
                      w.workouts.map((workout, wi) => <WarWorkoutBlock key={wi} workout={workout} />)
                    ) : (
                      <div className="space-y-1.5">
                        {w.body.map((line, idx) => (
                          <div key={idx} className="text-[13px] text-zinc-400 flex items-start gap-1.5 leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-red-500 shrink-0 mt-1.5" /> <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <GlowButton tone="red" icon={ShieldAlert} className="w-full mt-3" onClick={goToWarChat}>פתח צ׳אט AI חירום</GlowButton>
        </Card>
      )}

      <div>
        <SectionTitle icon={BarChart3}>מאגר אימונים</SectionTitle>
        <div className="grid grid-cols-2 gap-3.5">
          {TRAINING_BANK.map((b) => {
            const count = (trainingContent || []).filter((t) => t.subcategory === b.id).length;
            return (
              <button
                key={b.id}
                onClick={() => { setActiveBank(b); setHomeView("bank_detail"); }}
                className="rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 active:scale-[0.97] transition p-4 text-right flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${b.bg} flex items-center justify-center shrink-0`}>
                    <b.icon size={22} className={b.color} />
                  </div>
                  {count > 0 && <span className="text-[11px] text-zinc-400 font-bold bg-black rounded-full px-2.5 py-1">{count}</span>}
                </div>
                <span className="text-[14px] font-bold text-zinc-200 leading-tight">{b.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================== CALENDAR TAB ============================== */

function CalendarTab({ officialEvents, personalLogs, addPersonalLog, removePersonalLog, updatePersonalLog, profile, onSetGibushDate, userId, trainingContent, resetSignal, scrollToTop }) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [addPopup, setAddPopup] = useState(null); // { time }
  const [newTitle, setNewTitle] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [bankPickerCat, setBankPickerCat] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [gibushOpen, setGibushOpen] = useState(false);
  const [gibushInput, setGibushInput] = useState(profile?.gibushDate || "");
  const [gibushTypeInput, setGibushTypeInput] = useState(profile?.gibushType || "");
  const [drag, setDrag] = useState(null); // { id, startClientY, startMinutes, liveMinutes, moved }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [calView, setCalView] = useState("month"); // 'month' | 'day' - month is the landing view
  useEffect(() => { scrollToTop?.(); }, [calView]);
  useEffect(() => { if (resetSignal) setCalView("month"); }, [resetSignal]);
  const dayScrollRef = useRef(null);
  const [monthCursor, setMonthCursor] = useState(() => new Date());

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; }), [weekStart]);
  const todayKey = toKey(new Date());
  const selKey = toKey(selectedDay);

  useEffect(() => {
    if (calView === "day" && dayScrollRef.current) {
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      const targetTop = (nowMinutes / 60) * ROW_HEIGHT - 100; // center-ish, minus a little offset
      dayScrollRef.current.scrollTop = Math.max(0, targetTop);
    }
  }, [calView, selKey]);

  const eventsByDay = useMemo(() => {
    const map = {};
    officialEvents.forEach((e) => { (map[e.date] ||= []).push({ ...e, source: "official" }); });
    personalLogs.forEach((e) => { (map[e.date] ||= []).push({ ...e, source: "personal" }); });
    return map;
  }, [officialEvents, personalLogs]);
  const dayEvents = eventsByDay[selKey] || [];

  function openAdd(hour) {
    const start = `${String(hour).padStart(2, "0")}:00`;
    const end = `${String(Math.min(hour + 1, 23)).padStart(2, "0")}:00`;
    setAddPopup({ time: start });
    setNewTitle(""); setNewDetail(""); setNewEndTime(end);
  }
  function saveAdd() {
    if (!newTitle.trim() || !addPopup) return;
    addPersonalLog({ id: Date.now(), date: selKey, time: addPopup.time, endTime: newEndTime || null, title: newTitle.trim(), detail: newDetail.trim() });
    setAddPopup(null);
  }

  function onPointerDownEvent(e, ev) {
    if (ev.source !== "personal") return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id: ev.id, startClientY: e.clientY, startMinutes: timeToMinutes(ev.time), liveMinutes: timeToMinutes(ev.time), moved: false });
  }
  function onPointerMoveGrid(e) {
    if (!drag) return;
    const deltaY = e.clientY - drag.startClientY;
    const deltaMinutes = (deltaY / ROW_HEIGHT) * 60;
    setDrag((d) => ({ ...d, liveMinutes: d.startMinutes + deltaMinutes, moved: d.moved || Math.abs(deltaY) > 6 }));
  }
  async function onPointerUpGrid() {
    if (!drag) return;
    const newTime = minutesToTime(drag.liveMinutes);
    if (newTime !== minutesToTime(drag.startMinutes)) await updatePersonalLog(drag.id, { time: newTime });
    setDrag(null);
  }

  if (calView === "month") {
    return (
      <div className="flex flex-col h-full p-4 tech-grid">
        <div className="flex items-center justify-between mb-4 shrink-0 tech-corners border border-emerald-500/20 rounded-xl px-3 py-2.5 bg-black/60">
          <button onClick={() => setMonthCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() - 1); return d; })} className="text-zinc-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-zinc-900">
            <ChevronRight size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-lg font-black text-zinc-100 font-mono">{monthCursor.toLocaleDateString("he-IL", { month: "long", year: "numeric" })}</div>
          </div>
          <button onClick={() => setMonthCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() + 1); return d; })} className="text-zinc-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-zinc-900">
            <ChevronLeft size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1.5 shrink-0">
          {WEEKDAYS_HE.map((w) => (
            <div key={w} className="text-center text-[11px] font-bold text-emerald-500/70 py-1 font-mono">{w}</div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {(() => {
            const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
            const startOffset = first.getDay();
            const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
            const cells = [];
            for (let i = 0; i < startOffset; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d));
            return (
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((d, i) => {
                  if (!d) return <div key={`e${i}`} />;
                  const key = toKey(d);
                  const isSel = key === selKey;
                  const isToday = key === todayKey;
                  const dayEventList = eventsByDay[key] || [];
                  const hasOfficial = dayEventList.some((e) => e.source === "official");
                  const hasPersonal = dayEventList.some((e) => e.source === "personal");
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedDay(d);
                        setWeekStart(getWeekStart(d));
                        setCalView("day");
                      }}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition relative border ${
                        isSel ? "bg-emerald-500 text-black border-emerald-400" : isToday ? "bg-black border-emerald-500/60 text-emerald-400 glow-pulse tech-corners" : "bg-black/40 border-zinc-800/80 text-zinc-300 hover:border-zinc-600"
                      }`}
                      style={isToday && !isSel ? glowVars("#10b981") : undefined}
                    >
                      <span className="text-base font-bold font-mono tabular-nums">{d.getDate()}</span>
                      {(hasOfficial || hasPersonal) && (
                        <div className="flex gap-0.5">
                          {hasOfficial && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? "bg-black" : "bg-sky-400"}`} />}
                          {hasPersonal && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? "bg-black" : "bg-amber-400"}`} />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-zinc-800 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono"><span className="w-2 h-2 rounded-full bg-sky-400" /> אימון רשמי</div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono"><span className="w-2 h-2 rounded-full bg-amber-400" /> אימון אישי</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 flex items-center justify-between border-b border-emerald-500/20 shrink-0 bg-black/40">
        <button onClick={() => setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() - 7); return d; })} className="text-zinc-400 hover:text-emerald-400 p-1">
          <ChevronRight size={18} />
        </button>
        <button onClick={() => { setMonthCursor(selectedDay); setCalView("month"); }} className="flex items-center gap-1.5 text-sm font-bold text-zinc-300 hover:text-emerald-400 transition px-2 py-1 rounded-lg font-mono">
          <CalendarDays size={15} className="text-emerald-500" />
          {selectedDay.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
        </button>
        <button onClick={() => setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() + 7); return d; })} className="text-zinc-400 hover:text-emerald-400 p-1">
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="flex px-2 py-2 gap-1 border-b border-zinc-800 shrink-0 tech-grid">
        {days.map((d) => {
          const key = toKey(d);
          const isSel = key === selKey;
          const isToday = key === todayKey;
          const hasEvents = (eventsByDay[key] || []).length > 0;
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(d)}
              className={`flex-1 rounded-lg py-1.5 flex flex-col items-center gap-0.5 transition border ${isSel ? "bg-emerald-500 text-black border-emerald-400" : isToday ? "bg-black text-emerald-400 border-emerald-500/50" : "text-zinc-400 border-transparent hover:border-zinc-700"}`}
            >
              <span className="text-[10px] font-bold font-mono">{WEEKDAYS_HE[d.getDay()]}</span>
              <span className="text-sm font-black font-mono tabular-nums">{d.getDate()}</span>
              <span className={`w-1 h-1 rounded-full ${hasEvents ? (isSel ? "bg-black" : "bg-amber-400") : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>

      <div className="px-3 pt-2.5 pb-1.5 flex justify-center shrink-0">
        {profile?.gibushDate ? (
          <button
            onClick={() => { setGibushInput(profile.gibushDate); setGibushTypeInput(profile.gibushType); setGibushOpen(true); }}
            className="rounded-full border-2 px-3.5 py-1.5 text-[13px] font-bold flex items-center gap-1.5 glow-pulse bg-black active:scale-95 transition"
            style={{ ...glowVars((GIBUSH_TYPE_COLORS[profile.gibushType] || {}).hex || "#f59e0b", (GIBUSH_TYPE_COLORS[profile.gibushType] || {}).hex2), borderColor: (GIBUSH_TYPE_COLORS[profile.gibushType] || {}).hex || "#f59e0b", color: (GIBUSH_TYPE_COLORS[profile.gibushType] || {}).hex || "#f59e0b" }}
          >
            <Target size={11} />
            {profile.gibushType}: {new Date(`${profile.gibushDate}T00:00:00`).toLocaleDateString("he-IL")}
          </button>
        ) : (
          <button
            onClick={() => { setGibushInput(""); setGibushTypeInput(""); setGibushOpen(true); }}
            className="rounded-full bg-amber-500/10 border border-amber-500/40 px-3.5 py-1.5 text-[13px] font-bold text-amber-400 flex items-center gap-1.5 active:scale-95 transition glow-pulse"
            style={glowVars("#f59e0b")}
          >
            <Target size={12} /> קבע/י מועד גיבוש
          </button>
        )}
      </div>

      <div ref={dayScrollRef} className="flex-1 overflow-y-auto" onPointerMove={onPointerMoveGrid} onPointerUp={onPointerUpGrid} onPointerCancel={onPointerUpGrid}>
        <div className="relative mx-3" style={{ height: 24 * ROW_HEIGHT }}>
          {HOURS.map((h) => (
            <button key={h} onClick={() => openAdd(h)} className="absolute inset-x-0 border-t border-zinc-800/60 hover:bg-zinc-900/40 transition-colors" style={{ top: h * ROW_HEIGHT, height: ROW_HEIGHT }}>
              <span className="absolute left-1 top-0.5 text-[12px] text-zinc-600 w-9 text-center">{String(h).padStart(2, "0")}:00</span>
            </button>
          ))}
          {dayEvents.map((ev) => {
            const isDragging = drag && drag.id === ev.id;
            const minutes = isDragging ? drag.liveMinutes : timeToMinutes(ev.time);
            const top = (minutes / 60) * ROW_HEIGHT;
            const isOfficial = ev.source === "official";
            const durationMinutes = ev.endTime ? Math.max(15, timeToMinutes(ev.endTime) - timeToMinutes(ev.time)) : 60;
            const blockHeight = Math.max(44, (durationMinutes / 60) * ROW_HEIGHT);
            return (
              <div
                key={ev.id}
                onPointerDown={isOfficial ? undefined : (e) => onPointerDownEvent(e, ev)}
                onClick={isOfficial ? (e) => { e.stopPropagation(); setSelectedEvent(ev); } : undefined}
                className={`absolute right-0 left-12 rounded-lg px-3 py-1.5 overflow-hidden select-none transition-shadow ${
                  isOfficial ? "bg-sky-500/15 border border-sky-500/40 text-sky-100 cursor-pointer" : "bg-amber-500/15 border border-amber-500/40 text-amber-100 cursor-grab active:cursor-grabbing"
                } ${isDragging ? "z-20 shadow-lg shadow-black/50 scale-[1.02] opacity-90" : "z-10"}`}
                style={{ top, height: blockHeight }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{ev.title}</div>
                    <div className="text-[12px] opacity-70 flex items-center gap-1">
                      {ev.time}{ev.endTime ? `-${ev.endTime}` : ""}{ev.location ? ` · ${ev.location}` : ""}
                    </div>
                  </div>
                  {!isOfficial && (
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(ev); }}
                      className="shrink-0 w-5 h-5 rounded-full bg-black/30 hover:bg-red-500/40 flex items-center justify-center transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {addPopup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => { setAddPopup(null); setBankPickerOpen(false); setBankPickerCat(null); }}>
          <div className="w-full sm:max-w-xs bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-base font-bold text-zinc-200 mb-3">אירוע חדש</div>

            <button onClick={() => setBankPickerOpen((o) => !o)} className="w-full mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold py-2 flex items-center justify-center gap-1.5">
              <BarChart3 size={14} /> {bankPickerOpen ? "סגור בחירה מהמאגר" : "בחר אימון מהמאגר"}
            </button>

            {bankPickerOpen && (
              <div className="mb-3 bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 max-h-56 overflow-y-auto">
                {!bankPickerCat ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {TRAINING_BANK.map((b) => (
                      <button key={b.id} onClick={() => setBankPickerCat(b.id)} className="rounded-lg bg-zinc-950 border border-zinc-800 py-2 px-2 text-[12px] font-bold text-zinc-300 flex flex-col items-center gap-1 hover:border-emerald-500/40">
                        <b.icon size={14} className={b.color} /> {b.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setBankPickerCat(null)} className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 mb-2">
                      <ChevronRight size={12} /> חזרה לקטגוריות
                    </button>
                    {(() => {
                      const items = (trainingContent || []).filter((t) => t.subcategory === bankPickerCat);
                      return items.length === 0 ? (
                        <div className="text-[11px] text-zinc-600 text-center py-3">אין עדיין אימונים בקטגוריה זו</div>
                      ) : (
                        <div className="space-y-1">
                          {items.map((it) => (
                            <button
                              key={it.id}
                              onClick={() => {
                                setNewTitle(it.title);
                                setNewDetail(it.body || "");
                                setBankPickerOpen(false);
                                setBankPickerCat(null);
                              }}
                              className="w-full text-right rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-2 text-[12px] font-bold text-zinc-300 hover:border-emerald-500/40"
                            >
                              {it.title}
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <label className="text-[11px] text-zinc-500 font-semibold">משעה</label>
                <input type="time" value={addPopup.time} onChange={(e) => setAddPopup({ ...addPopup, time: e.target.value })} className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-base text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-zinc-500 font-semibold">עד שעה</label>
                <input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-base text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
              </div>
            </div>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="לדוגמה: ריצת 3 קילומטר לבד" className="w-full mb-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
            <input value={newDetail} onChange={(e) => setNewDetail(e.target.value)} placeholder="פירוט (אופציונלי)" className="w-full mb-3 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
            <div className="flex gap-2">
              <GlowButton tone="ghost" className="flex-1" onClick={() => setAddPopup(null)}>ביטול</GlowButton>
              <GlowButton tone="amber" icon={Plus} className="flex-1" disabled={!newTitle.trim()} onClick={saveAdd}>הוסף</GlowButton>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setSelectedEvent(null)}>
          <div className="w-full sm:max-w-xs bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-base font-black text-zinc-100 mb-1">{selectedEvent.title}</div>
            {selectedEvent.detail && <div className="text-sm text-zinc-500 mb-2">{selectedEvent.detail}</div>}
            {selectedEvent.location && <div className="text-sm text-zinc-500 mb-2 flex items-center gap-1"><MapPin size={11} />{selectedEvent.location}</div>}
            <div className="text-sm text-zinc-600 mb-1">{selectedEvent.time}{selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ""}</div>
            <div className="text-[12px] text-zinc-600 text-center py-1">אימון רשמי - נקבע ע״י המאמן</div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full sm:max-w-xs bg-zinc-950 border border-red-600/30 rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-4">
              <Trash2 size={28} className="text-red-400 mb-2" />
              <div className="text-base font-black text-zinc-100">למחוק את "{deleteConfirm.title}"?</div>
              <div className="text-sm text-zinc-500 mt-1.5">לא ניתן לשחזר לאחר המחיקה</div>
            </div>
            <div className="flex gap-2">
              <GlowButton tone="ghost" className="flex-1" onClick={() => setDeleteConfirm(null)}>לא</GlowButton>
              <GlowButton tone="red" icon={Trash2} className="flex-1" onClick={() => { removePersonalLog(deleteConfirm.id); setDeleteConfirm(null); }}>כן, מחק</GlowButton>
            </div>
          </div>
        </div>
      )}

      {gibushOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setGibushOpen(false)}>
          <div className="w-full sm:max-w-xs bg-zinc-950 border border-amber-500/30 rounded-t-3xl sm:rounded-3xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="text-base font-black text-amber-400 mb-3 flex items-center gap-1.5"><Target size={16} /> מועד הגיבוש שלי</div>
            <label className="text-[13px] text-zinc-500 font-semibold mb-1.5 block">לאיזה גיבוש?</label>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {GIBUSH_TYPES.map((t) => {
                const c = GIBUSH_TYPE_COLORS[t] || {};
                const sel = gibushTypeInput === t;
                return (
                  <button
                    key={t}
                    onClick={() => setGibushTypeInput(t)}
                    className={`rounded-lg py-2 text-[13px] font-bold border-2 transition ${sel ? "bg-black" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}
                    style={sel ? { borderColor: c.hex, color: c.hex } : undefined}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <label className="text-[13px] text-zinc-500 font-semibold mb-1.5 block">תאריך</label>
            <input type="date" value={gibushInput} onChange={(e) => setGibushInput(e.target.value)} className="w-full mb-3 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
            <div className="flex gap-2">
              <GlowButton tone="ghost" className="flex-1" onClick={() => setGibushOpen(false)}>ביטול</GlowButton>
              <GlowButton tone="amber" className="flex-1" disabled={!gibushInput || !gibushTypeInput} onClick={() => { onSetGibushDate(gibushInput, gibushTypeInput); setGibushOpen(false); }}>שמור</GlowButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ============================== CHAT TAB ============================== */

function CoachChat({ warMode, showToast }) {
  const STORAGE_KEY = "sayert_chat_history";
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [{ role: "assistant", text: warMode ? "כאן מאמן החירום. איך אני יכול לעזור לך בתוכנית ה-6 שבועות?" : "היי! אני המאמן הטקטי שלך. שאל אותי על תזונה, שינה, פציעות או כל דבר אחר." }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const aiConfigured = useSupabase() || Boolean(CONFIG.GEMINI_API_KEY);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch (e) {}
  }, [messages]);

  function clearChat() {
    const fresh = [{ role: "assistant", text: warMode ? "כאן מאמן החירום. איך אני יכול לעזור לך בתוכנית ה-6 שבועות?" : "היי! אני המאמן הטקטי שלך. שאל אותי על תזונה, שינה, פציעות או כל דבר אחר." }];
    setMessages(fresh);
    setConfirmClear(false);
    showToast("הצ׳אט נמחק", "success");
  }

  async function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const sys = warMode
        ? "אתה מאמן כושר קרבי עילי במצב חירום. בכל תשובה, התבסס במפורש על עקרונות מבוססי-מחקר מתחום מדעי הספורט האקדמיים (כמו עומס הדרגתי, פריודיזציה, אזורי דופק אירוביים, זמני התאוששות שריר) - ברמה הנלמדת במוסדות מובילים כמו Stanford ו-Harvard - אך תרגם אותם לשפה תומכת, פשוטה ותכליתית לבני נוער 16-19 בתוכנית אימון ביתית של 6 שבועות לקראת גיבוש. ענה בעברית קצרה מאוד וממוקדת - עד 4-5 משפטים לכל היותר, בלי הקדמות מיותרות, ברורה, מדעית אך נגישה, בלי ייעוץ רפואי מסוכן."
        : "אתה מאמן כושר קרבי עילי, מקצועי ותומך. בכל תשובה, ציין ויישם באופן מפורש עקרונות מבוססי-מחקר מתחום מדעי ביצועי הספורט (כמו עומס הדרגתי, התאוששות שרירית, אימון אינטרוולים, תזונת ספורט) - ברמה האקדמית הנלמדת במוסדות מובילים בעולם (Stanford, Harvard) - אך הסבר זאת תמיד בפשטות ובגובה העיניים לבני נוער 16-19 המתכוננים לגיבושים צבאיים. ענה בעברית קצרה מאוד וממוקדת - עד 4-5 משפטים לכל היותר, בלי הקדמות מיותרות, בלי ייעוץ רפואי מסוכן.";
      const reply = await aiChat(sys, text, messages);
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (e) {
      if (aiConfigured) showToast(`שגיאת AI: ${e.message || "לא ידוע"} - מוצגת תשובה מקומית`, "info");
      await new Promise((r) => setTimeout(r, 300));
      setMessages((m) => [...m, { role: "assistant", text: localCoachReply(text) }]);
    } finally {
      setLoading(false);
    }
  }

  const markdownComponents = {
    p: ({ children }) => <p className="mb-2">{children}</p>,
    strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
    ul: ({ children }) => <ul className="list-disc pr-4 space-y-1 mb-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pr-4 space-y-1 mb-2">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    h1: ({ children }) => <div className="font-black text-base text-white mb-1.5">{children}</div>,
    h2: ({ children }) => <div className="font-black text-base text-white mb-1.5">{children}</div>,
    h3: ({ children }) => <div className="font-bold text-white mb-1">{children}</div>,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b flex items-center justify-between shrink-0 bg-black/50 tech-grid" style={{ borderColor: warMode ? "#dc262640" : "#10b98130" }}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${warMode ? "border-red-500/40 bg-red-500/10" : "border-emerald-500/40 bg-emerald-500/10"}`}>
            <Bot size={15} className={warMode ? "text-red-400" : "text-emerald-400"} />
          </div>
          <div>
            <div className={`text-[13px] font-bold ${warMode ? "text-red-400" : "text-emerald-400"}`}>{warMode ? "מאמן חירום" : "מאמן טקטי"}</div>
            <div className="text-[11px] text-zinc-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> זמין עכשיו
            </div>
          </div>
        </div>
        {confirmClear ? (
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/40 rounded-lg px-2 py-1.5">
            <span className="text-[11px] text-red-300 font-semibold">למחוק הכל?</span>
            <button onClick={clearChat} className="text-[12px] font-black text-red-400 hover:text-red-300 px-1.5">כן</button>
            <button onClick={() => setConfirmClear(false)} className="text-[12px] font-bold text-zinc-500 hover:text-zinc-300 px-1.5">לא</button>
          </div>
        ) : (
          <button onClick={() => setConfirmClear(true)} className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition border border-zinc-700 rounded-lg px-2.5 py-1.5">
            <Trash2 size={13} /> מחק צ׳אט
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-end gap-2 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              {m.role !== "user" && (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mb-0.5 ${warMode ? "bg-red-500/15 border border-red-500/40" : "bg-emerald-500/15 border border-emerald-500/40"}`}>
                  <Bot size={12} className={warMode ? "text-red-400" : "text-emerald-400"} />
                </div>
              )}
              <div
                className={`px-3.5 py-2.5 rounded-2xl ${
                  m.role === "user"
                    ? "bg-emerald-500 text-black rounded-bl-sm"
                    : warMode
                    ? "bg-red-950/40 border border-red-500/30 text-zinc-200 rounded-br-sm"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-br-sm"
                }`}
              >
                {m.role === "user" ? (
                  <div className="text-base leading-relaxed break-words font-semibold">{m.text}</div>
                ) : (
                  <div className="text-base leading-relaxed break-words [&>*:last-child]:mb-0">
                    <ReactMarkdown components={markdownComponents}>{m.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${warMode ? "bg-red-500/15 border border-red-500/40" : "bg-emerald-500/15 border border-emerald-500/40"}`}>
                <Bot size={12} className={warMode ? "text-red-400" : "text-emerald-400"} />
              </div>
              <div className={`px-3.5 py-2.5 rounded-2xl rounded-br-sm flex items-center gap-1.5 text-zinc-500 text-sm ${warMode ? "bg-red-950/40 border border-red-500/30" : "bg-zinc-900 border border-zinc-800"}`}>
                <Loader2 size={13} className="animate-spin" /> מקליד...
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t flex items-center gap-2 bg-black/40" style={{ borderColor: warMode ? "#dc262630" : "#10b98125" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="הקלד הודעה..."
          className={`flex-1 bg-zinc-950 border rounded-xl px-4 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 transition-all duration-300 ${warMode ? "border-red-500/30 focus:ring-red-500/40 focus:border-red-500/60" : "border-emerald-500/30 focus:ring-emerald-500/40 focus:border-emerald-500/60"}`}
        />
        <button onClick={send} disabled={loading || !input.trim()} className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 border ${warMode ? "bg-red-600 border-red-400" : "bg-emerald-500 border-emerald-400"}`}>
          <Send size={16} className={warMode ? "text-white" : "text-black"} />
        </button>
      </div>
    </div>
  );
}

function ChatTab({ warMode, showToast, profile }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <CoachChat warMode={warMode} showToast={showToast} />
      </div>
    </div>
  );
}

/* ============================== HUB TAB ============================== */

function HubTab({ articles, profile, resetSignal, scrollToTop }) {
  const [view, setView] = useState("main"); // 'main' | 'יחידות' | 'unit_detail' | 'גיבושים' | 'gibush_detail' | 'ערכים'
  useEffect(() => { if (resetSignal) setView("main"); }, [resetSignal]);
  useEffect(() => { scrollToTop?.(); }, [view]);
  const [pageContent, setPageContent] = useState([]);
  const [loadingPage, setLoadingPage] = useState(false);
  const [openArticle, setOpenArticle] = useState(null);
  const [openUnit, setOpenUnit] = useState(null);
  const [openGibush, setOpenGibush] = useState(null);
  const [openYerpa, setOpenYerpa] = useState(null);
  const [articleFilter, setArticleFilter] = useState("הכל");
  const [unitSearch, setUnitSearch] = useState("");

  async function openView(v) {
    setView(v);
    setLoadingPage(true);
    const content = await loadContentRemote("unit_info", v);
    setPageContent(content);
    setLoadingPage(false);
  }

  if (view === "יחידות") {
    const filteredUnits = unitSearch.trim() ? UNITS.filter((u) => u.name.includes(unitSearch.trim())) : UNITS;
    return (
      <div className="p-4">
        <button onClick={() => { setView("main"); setUnitSearch(""); }} className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 text-base font-bold mb-4">
          <ChevronRight size={16} /> חזרה למאגר
        </button>
        <SectionTitle icon={Shield}>יחידות עילית</SectionTitle>
        <div className="relative mb-4">
          <input
            value={unitSearch}
            onChange={(e) => setUnitSearch(e.target.value)}
            placeholder={`חיפוש מתוך ${UNITS.length} יחידות...`}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pr-9 pl-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300"
          />
          <Compass size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        </div>
        {filteredUnits.length === 0 ? (
          <div className="text-center py-12 text-sm text-zinc-600 bg-zinc-950 border border-zinc-800 rounded-xl">אין תוצאות</div>
        ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredUnits.map((u) => {
            const published = pageContent.find((c) => c.title === u.id);
            return (
              <button key={u.id} onClick={() => { setOpenUnit(u); setView("unit_detail"); }} className="flex flex-col items-center gap-2 active:scale-95 transition">
                <div className="w-16 h-16 rounded-full bg-black border-2 flex items-center justify-center overflow-hidden glow-pulse" style={{ borderColor: u.hex, ...glowVars(u.hex) }}>
                  {published?.imageUrl ? (
                    <img src={published.imageUrl} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    <Shield size={24} style={{ color: u.hex }} />
                  )}
                </div>
                <span className="text-[13px] font-bold text-zinc-300 text-center leading-tight">{u.name}</span>
              </button>
            );
          })}
        </div>
        )}
      </div>
    );
  }

  if (view === "unit_detail" && openUnit) {
    const published = pageContent.find((c) => c.title === openUnit.id);
    return (
      <div className="p-4">
        <button onClick={() => setView("יחידות")} className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 text-base font-bold mb-4">
          <ChevronRight size={16} /> חזרה ליחידות
        </button>
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-24 h-24 rounded-full bg-black border-2 flex items-center justify-center overflow-hidden glow-pulse mb-3" style={{ borderColor: openUnit.hex, ...glowVars(openUnit.hex) }}>
            {published?.imageUrl ? (
              <img src={published.imageUrl} alt={openUnit.name} className="w-full h-full object-cover" />
            ) : (
              <Shield size={38} style={{ color: openUnit.hex }} />
            )}
          </div>
          <div className="text-xl font-black text-zinc-100">{openUnit.name}</div>
          <div className="text-base font-bold mt-1" style={{ color: openUnit.hex }}>{openUnit.tagline}</div>
        </div>
        <Card className="p-4 text-[17px] text-zinc-200 leading-9 [&>*:last-child]:mb-0">
          {published ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3">{children}</p>,
                strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc pr-4 space-y-1 mb-3">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pr-4 space-y-1 mb-3">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                h1: ({ children }) => <div className="font-black text-lg mb-2 pb-1.5 border-b" style={{ color: openUnit.hex, borderColor: `${openUnit.hex}40` }}>{children}</div>,
                h2: ({ children }) => <div className="font-black text-lg mb-2 pb-1.5 border-b" style={{ color: openUnit.hex, borderColor: `${openUnit.hex}40` }}>{children}</div>,
                h3: ({ children }) => <div className="font-bold text-base mb-1.5" style={{ color: openUnit.hex }}>{children}</div>,
              }}
            >
              {published.body}
            </ReactMarkdown>
          ) : (
            <p>{openUnit.req}</p>
          )}
        </Card>
      </div>
    );
  }

  if (view === "גיבושים") {
    return (
      <div className="p-4">
        <button onClick={() => setView("main")} className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 text-base font-bold mb-4">
          <ChevronRight size={16} /> חזרה למאגר
        </button>
        <SectionTitle icon={Target} tone="amber">פורטל גיבושים</SectionTitle>
        {loadingPage ? (
          <div className="text-center py-10 text-sm text-zinc-600">טוען...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {GIBUSHIM_LIST.map((name) => {
              const c = pageContent.find((x) => x.title === name);
              return (
                <button
                  key={name}
                  onClick={() => { if (c) { setOpenGibush(c); setView("gibush_detail"); } }}
                  className={`relative rounded-2xl p-4 text-right border-2 transition overflow-hidden ${c ? "bg-black border-amber-500/50 hover:border-amber-500 active:scale-[0.97] glow-pulse" : "bg-zinc-950 border-zinc-800 opacity-40"}`}
                  style={c ? glowVars("#f59e0b") : undefined}
                >
                  <Target size={18} className={c ? "text-amber-400 mb-2" : "text-zinc-700 mb-2"} />
                  <div className={`text-base font-black leading-tight ${c ? "text-zinc-100" : "text-zinc-600"}`}>{name}</div>
                  {c ? (
                    <div className="text-[12px] text-amber-400/70 font-bold mt-1.5">לצפייה ←</div>
                  ) : (
                    <div className="text-[12px] text-zinc-700 mt-1.5">אין עדיין מידע</div>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    );
  }

  if (view === "gibush_detail" && openGibush) {
    return (
      <div className="p-4">
        <button onClick={() => setView("גיבושים")} className="flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 text-base font-bold mb-4">
          <ChevronRight size={16} /> חזרה לגיבושים
        </button>
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-20 h-20 rounded-2xl bg-black border-2 border-amber-500/60 flex items-center justify-center mb-3 glow-pulse" style={glowVars("#f59e0b")}>
            <Target size={32} className="text-amber-400" />
          </div>
          <div className="text-xl font-black text-zinc-100">{openGibush.title}</div>
          {openGibush.dateLabel && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 px-3 py-1 text-sm font-bold text-amber-400 mt-2">
              <Clock size={12} /> מועד: {openGibush.dateLabel}
            </div>
          )}
        </div>
        <Card className="p-4 text-[17px] text-zinc-200 leading-9 [&>*:last-child]:mb-0">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-3">{children}</p>,
              strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc pr-4 space-y-1 mb-3">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pr-4 space-y-1 mb-3">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              h1: ({ children }) => <div className="font-black text-lg mb-2 pb-1.5 border-b border-amber-500/30 text-amber-400">{children}</div>,
              h2: ({ children }) => <div className="font-black text-lg mb-2 pb-1.5 border-b border-amber-500/30 text-amber-400">{children}</div>,
              h3: ({ children }) => <div className="font-bold text-base mb-1.5 text-amber-400">{children}</div>,
            }}
          >
            {openGibush.body}
          </ReactMarkdown>
        </Card>
      </div>
    );
  }

  if (view === "ערכים") {
    return (
      <div className="p-4">
        <button onClick={() => setView("main")} className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 text-base font-bold mb-4">
          <ChevronRight size={16} /> חזרה למאגר
        </button>
        <SectionTitle icon={Star}>תוכן ערכי לקראת השירות</SectionTitle>
        {loadingPage ? (
          <div className="text-center py-10 text-sm text-zinc-600">טוען...</div>
        ) : pageContent.length === 0 ? (
          <div className="text-center py-12 text-sm text-zinc-600 bg-zinc-950 border border-zinc-800 rounded-xl">
            אין עדיין תוכן כאן - יתווסף דרך Supabase
          </div>
        ) : (
          <div className="space-y-2.5">
            {pageContent.map((c) => (
              <Card key={c.id} className="p-3.5">
                <div className="text-base font-black text-zinc-100 mb-1.5">{c.title}</div>
                <div className="text-[17px] text-zinc-300 leading-9 whitespace-pre-line">{c.body}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "ירפא") {
    return (
      <div className="p-4">
        <button onClick={() => setView("main")} className="flex items-center gap-1.5 text-zinc-400 hover:text-sky-400 text-base font-bold mb-4">
          <ChevronRight size={16} /> חזרה למאגר
        </button>
        <SectionTitle icon={ClipboardCheck} tone="amber">איך תעבור את הירפ״א</SectionTitle>
        {loadingPage ? (
          <div className="text-center py-10 text-sm text-zinc-600">טוען...</div>
        ) : (
          <div className="space-y-2">
            {YERPA_LIST.map((name) => {
              const c = pageContent.find((x) => x.title === name);
              return (
                <button
                  key={name}
                  onClick={() => c && setOpenYerpa(c)}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3.5 border transition ${c ? "bg-zinc-900 border-sky-500/30 hover:border-sky-500/60 active:scale-[0.98]" : "bg-zinc-950 border-zinc-800 opacity-50"}`}
                >
                  <span className="text-base font-bold text-zinc-200">{name}</span>
                  {c ? <ChevronLeft size={16} className="text-sky-400" /> : <span className="text-[12px] text-zinc-600">אין עדיין מידע</span>}
                </button>
              );
            })}
          </div>
        )}

        {openYerpa && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setOpenYerpa(null)}>
            <div className="w-full sm:max-w-sm bg-zinc-950 border border-sky-500/30 rounded-t-3xl sm:rounded-3xl p-5 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="text-base font-black text-zinc-100 mb-3">{openYerpa.title}</div>
              <div className="text-[17px] text-zinc-300 leading-8 whitespace-pre-line">{openYerpa.body}</div>
              <button onClick={() => setOpenYerpa(null)} className="w-full mt-4 text-center text-sm text-zinc-500 hover:text-zinc-300">סגור</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="relative rounded-3xl overflow-hidden p-5 border border-emerald-500/25 tech-grid">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(16,185,129,0.12), transparent 70%)" }} />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-black border border-emerald-500/40 flex items-center justify-center shrink-0 tech-corners">
            <BookOpen size={22} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-black text-zinc-50">המאגר</div>
            <div className="text-[12px] text-zinc-500 font-mono">כל מה שצריך במקום אחד</div>
          </div>
        </div>
      </div>

      {(() => {
        const day = Math.floor(Date.now() / 86400000);
        const spotlight = UNITS[day % UNITS.length];
        return (
          <button onClick={() => { setOpenUnit(spotlight); setView("unit_detail"); }} className="w-full relative rounded-2xl overflow-hidden p-4 flex items-center gap-3.5 text-right" style={{ background: `linear-gradient(120deg, ${spotlight.hex}22, transparent 70%), #0a0a0a`, boxShadow: `0 0 0 1px ${spotlight.hex}35 inset` }}>
            <div className="w-14 h-14 rounded-full bg-black border-2 flex items-center justify-center shrink-0 glow-pulse" style={{ borderColor: spotlight.hex, ...glowVars(spotlight.hex) }}>
              <Shield size={24} style={{ color: spotlight.hex }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: spotlight.hex }}>יחידה מומלצת היום</div>
              <div className="text-base font-black text-zinc-50">{spotlight.name}</div>
              <div className="text-[12px] text-zinc-500 truncate">{spotlight.tagline}</div>
            </div>
            <ChevronLeft size={18} className="shrink-0" style={{ color: spotlight.hex }} />
          </button>
        );
      })()}

      <div>
        <SectionTitle icon={Newspaper} tone="amber">עיתון טיפים</SectionTitle>
        <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {["הכל", ...ARTICLE_UNIT_TAGS].map((tag) => (
            <button
              key={tag}
              onClick={() => setArticleFilter(tag)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-bold border whitespace-nowrap transition ${articleFilter === tag ? "bg-amber-500/15 border-amber-500 text-amber-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}
            >
              {tag}
            </button>
          ))}
        </div>
        {(() => {
          const filtered = articleFilter === "הכל" ? articles : articles.filter((a) => a.unit === articleFilter);
          return filtered.length === 0 ? (
            <div className="text-center py-6 text-sm text-zinc-600 bg-zinc-950 border border-zinc-800 rounded-xl">
              {articleFilter === "הכל" ? "אין עדיין כתבות" : `אין עדיין כתבות בסיווג ${articleFilter}`}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((a, i) => {
                const unitObj = UNITS.find((u) => u.name === a.unit || u.id === a.unit);
                const hex = unitObj?.hex || ["#10b981", "#f59e0b", "#38bdf8", "#f87171"][i % 4];
                return (
                  <button key={a.id} onClick={() => setOpenArticle(a)} className="text-right rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition active:scale-95 tech-corners" style={{ borderColor: `${hex}30` }}>
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt="" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center relative overflow-hidden tech-grid" style={{ background: `linear-gradient(135deg, ${hex}33, ${hex}0a)` }}>
                        <Newspaper size={36} style={{ color: hex }} />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="text-[15px] font-black text-zinc-100 line-clamp-2 leading-tight">{a.title}</div>
                      <div className="text-[12px] mt-1.5 font-mono" style={{ color: hex }}>{a.unit}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>

      <div>
        <SectionTitle icon={Compass} tone="emerald">ניווט מהיר</SectionTitle>
        <div className="space-y-1.5">
          {profile?.targetUnit === "tayas" && (
            <button onClick={() => openView("ירפא")} className="w-full flex items-center gap-3.5 rounded-2xl bg-black border border-sky-500/30 hover:border-sky-500/60 active:scale-[0.98] transition px-4 py-3.5 tech-corners">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                <ClipboardCheck size={20} className="text-sky-400" />
              </div>
              <span className="flex-1 text-right text-[15px] font-bold text-zinc-100">איך תעבור את הירפ״א</span>
              <ChevronLeft size={17} className="text-sky-500/60 shrink-0" />
            </button>
          )}
          <button onClick={() => openView("ערכים")} className="w-full flex items-center gap-3.5 rounded-2xl bg-black border border-zinc-800 hover:border-sky-500/40 active:scale-[0.98] transition px-4 py-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
              <Star size={20} className="text-sky-400" />
            </div>
            <span className="flex-1 text-right text-[15px] font-bold text-zinc-200">תוכן ערכי לקראת השירות</span>
            <ChevronLeft size={17} className="text-zinc-600 shrink-0" />
          </button>
          <button onClick={() => openView("יחידות")} className="w-full flex items-center gap-3.5 rounded-2xl bg-black border border-zinc-800 hover:border-emerald-500/40 active:scale-[0.98] transition px-4 py-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-emerald-400" />
            </div>
            <span className="flex-1 text-right text-[15px] font-bold text-zinc-200">יחידות עילית</span>
            <ChevronLeft size={17} className="text-zinc-600 shrink-0" />
          </button>
          <button onClick={() => openView("גיבושים")} className="w-full flex items-center gap-3.5 rounded-2xl bg-black border border-zinc-800 hover:border-amber-500/40 active:scale-[0.98] transition px-4 py-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Target size={20} className="text-amber-400" />
            </div>
            <span className="flex-1 text-right text-[15px] font-bold text-zinc-200">פורטל גיבושים</span>
            <ChevronLeft size={17} className="text-zinc-600 shrink-0" />
          </button>
        </div>
      </div>

      {openArticle && (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto" dir="rtl">
          <div className="relative w-full" style={{ height: openArticle.imageUrl ? "40vh" : "auto" }}>
            {openArticle.imageUrl ? (
              <>
                <img src={openArticle.imageUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 5%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)" }} />
              </>
            ) : (
              <div className="w-full h-48 flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${(UNITS.find((u) => u.name === openArticle.unit)?.hex || "#10b981")}30, #000)` }}>
                <Newspaper size={48} className="text-emerald-400/60" />
              </div>
            )}
            <button onClick={() => setOpenArticle(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center border border-white/10">
              <X size={18} className="text-white" />
            </button>
            <div className="absolute bottom-0 right-0 left-0 p-5">
              <Pill tone="amber">{openArticle.unit}</Pill>
              <div className="text-2xl font-black text-white leading-tight mt-2" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{openArticle.title}</div>
              {openArticle.author && <div className="text-[13px] text-zinc-300 font-semibold mt-1.5">מאת {openArticle.author}</div>}
            </div>
          </div>
          <div className="p-5 pb-10 max-w-lg mx-auto">
            <div className="text-[16px] text-zinc-200 leading-8 whitespace-pre-line font-medium">{openArticle.excerpt}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== PROFILE TAB ============================== */

/* ============================== FITNESS TAB (score table + per-test detail) ============================== */

function ScoreCircle({ score, size = 56 }) {
  const hex = scoreColor(score);
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={hex} strokeWidth="5" strokeDasharray={`${dash} 999`} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${hex})` }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-black text-white tabular-nums" style={{ fontSize: size * 0.32 }}>{score}</span>
      </div>
    </div>
  );
}

function ScoreBar({ score }) {
  const hex = scoreColor(score);
  return (
    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${score}%`, background: `linear-gradient(90deg, #fde047, ${hex})`, boxShadow: `0 0 8px ${hex}80` }} />
    </div>
  );
}

const FITNESS_GROUPS = [
  { label: "ריצות", tests: ["run_1000", "run_2000", "run_3000", "run_5000"] },
  { label: "מתח", tests: ["pullups", "pullups_weighted"] },
  { label: "כוח גוף עליון", tests: ["pushups", "dips"] },
];

function FitnessTab({ userId, showToast }) {
  const [view, setView] = useState("table"); // 'table' | 'detail'
  const [allResults, setAllResults] = useState({}); // testId -> [{value,date}]
  const [loadingTable, setLoadingTable] = useState(true);
  const [activeTest, setActiveTest] = useState(null);
  const [fitnessHistory, setFitnessHistory] = useState([]);
  const [loadingFitness, setLoadingFitness] = useState(false);
  const [addingResult, setAddingResult] = useState(false);
  const [newResultVal, setNewResultVal] = useState("");
  const [newResultMin, setNewResultMin] = useState("");
  const [newResultSec, setNewResultSec] = useState("");
  const [savingResult, setSavingResult] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [confirmDeletePoint, setConfirmDeletePoint] = useState(null);

  async function refreshTable() {
    setLoadingTable(true);
    const rows = await loadAllFitnessTests(userId);
    const grouped = {};
    for (const r of rows) { (grouped[r.testType] ||= []).push(r); }
    setAllResults(grouped);
    setLoadingTable(false);
  }
  useEffect(() => { refreshTable(); }, [userId]);

  function bestScoreFor(testId) {
    const hist = allResults[testId];
    if (!hist || hist.length === 0) return null;
    const t = FITNESS_TESTS.find((x) => x.id === testId);
    const best = t.unit === "time" ? Math.min(...hist.map((h) => h.value)) : Math.max(...hist.map((h) => h.value));
    return scoreForTest(testId, best);
  }
  function latestFor(testId) {
    const hist = allResults[testId];
    if (!hist || hist.length === 0) return null;
    return hist[hist.length - 1];
  }

  const allScores = FITNESS_TESTS.map((t) => bestScoreFor(t.id) ?? 0);
  const overallAvg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

  async function openTest(t) {
    setActiveTest(t);
    setView("detail");
    setAddingResult(false);
    setLoadingFitness(true);
    const rows = await loadFitnessTests(userId, t.id);
    setFitnessHistory(rows);
    setLoadingFitness(false);
  }

  if (view === "detail" && activeTest) {
    const t = activeTest;
    const latest = fitnessHistory[fitnessHistory.length - 1];
    const prev = fitnessHistory[fitnessHistory.length - 2];
    const improved = latest && prev ? isImprovement(t.unit, latest.value, prev.value) : null;
    const latestScore = latest ? scoreForTest(t.id, latest.value) : null;

    async function saveResult() {
      let val;
      if (t.unit === "time") {
        const m = parseInt(newResultMin, 10) || 0;
        const s = parseInt(newResultSec, 10) || 0;
        if (m === 0 && s === 0) { showToast("נא להזין זמן", "error"); return; }
        val = m * 60 + s;
      } else {
        val = parseInt(newResultVal, 10);
        if (!val || val <= 0) { showToast("נא להזין מספר חזרות", "error"); return; }
      }
      setSavingResult(true);
      try {
        if (editingPoint) {
          await updateFitnessTest(editingPoint.id, val, editingPoint.date);
          setFitnessHistory((prev) => prev.map((p) => p.id === editingPoint.id ? { ...p, value: val } : p));
          showToast("התוצאה עודכנה", "success");
        } else {
          const saved = await addFitnessTest(userId, { testType: t.id, value: val, date: toKey(new Date()) });
          setFitnessHistory((prev) => [...prev, saved]);
          showToast("התוצאה נשמרה", "success");
        }
        setAddingResult(false);
        setEditingPoint(null);
        setNewResultVal(""); setNewResultMin(""); setNewResultSec("");
        refreshTable();
      } catch (e) {
        showToast("שגיאה בשמירה", "error");
      } finally {
        setSavingResult(false);
      }
    }

    function openEdit(point) {
      setEditingPoint(point);
      setAddingResult(true);
      if (t.unit === "time") {
        setNewResultMin(String(Math.floor(point.value / 60)));
        setNewResultSec(String(Math.round(point.value % 60)));
      } else {
        setNewResultVal(String(point.value));
      }
    }

    async function deletePoint() {
      try {
        await deleteFitnessTest(userId, confirmDeletePoint.id);
        setFitnessHistory((prev) => prev.filter((p) => p.id !== confirmDeletePoint.id));
        showToast("התוצאה נמחקה", "success");
        refreshTable();
      } catch (e) {
        showToast("שגיאה במחיקה", "error");
      }
      setConfirmDeletePoint(null);
      setAddingResult(false);
      setEditingPoint(null);
    }

    return (
      <div className="p-4 max-w-lg mx-auto">
        <button onClick={() => setView("table")} className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 text-base font-bold mb-4">
          <ChevronRight size={16} /> חזרה לטבלה
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <t.icon size={22} className="text-emerald-400" />
          </div>
          <div className="text-xl font-black text-zinc-50">{t.label}</div>
        </div>

        {loadingFitness ? (
          <div className="text-center py-16 text-sm text-zinc-600">טוען...</div>
        ) : fitnessHistory.length === 0 ? (
          <div className="text-center py-10 text-sm text-zinc-600 bg-zinc-950 border border-zinc-800 rounded-2xl mb-4">עדיין אין תוצאות - תמלאו את הראשונה!</div>
        ) : (
          <div className="rounded-3xl overflow-hidden p-5 mb-4" style={{ background: "linear-gradient(160deg, #10b98118, transparent 55%), #0a0a0a", boxShadow: "0 0 0 1px #10b98130 inset" }}>
            <FitnessLineGraph points={fitnessHistory} unit={t.unit} onPointClick={openEdit} />
            <div className="text-[11px] text-zinc-600 text-center -mt-1 mb-1">הקישו על נקודה בגרף כדי לערוך אותה</div>
            <div className="flex items-end justify-between mt-2">
              <div>
                <div className="text-[11px] text-zinc-500 mb-1">התוצאה האחרונה</div>
                <div className="text-4xl font-black text-emerald-400 tabular-nums">{formatTestValue(t.unit, latest.value)}</div>
                <div className="text-[12px] text-zinc-500 mt-1">מולא בתאריך {latest.date} · ציון {latestScore}</div>
              </div>
              {improved !== null && (
                <div className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold ${improved ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-400"}`}>
                  <TrendingUp size={13} className={improved ? "" : "rotate-90"} /> {improved ? "שיפור!" : "המשך כך"}
                </div>
              )}
            </div>
          </div>
        )}

        {addingResult ? (
          <Card className="p-4">
            <div className="text-base font-black text-zinc-100 mb-3">{editingPoint ? "עריכת תוצאה" : "תוצאה חדשה"}</div>
            {t.unit === "time" ? (
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <label className="text-[11px] text-zinc-500 font-semibold block mb-1">דקות</label>
                  <input type="number" value={newResultMin} onChange={(e) => setNewResultMin(e.target.value)} placeholder="0" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-zinc-500 font-semibold block mb-1">שניות</label>
                  <input type="number" value={newResultSec} onChange={(e) => setNewResultSec(e.target.value)} placeholder="0" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <label className="text-[11px] text-zinc-500 font-semibold block mb-1">מספר חזרות</label>
                <input type="number" value={newResultVal} onChange={(e) => setNewResultVal(e.target.value)} placeholder="0" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
              </div>
            )}
            <div className="flex gap-2">
              <GlowButton tone="ghost" className="flex-1" onClick={() => { setAddingResult(false); setEditingPoint(null); setNewResultVal(""); setNewResultMin(""); setNewResultSec(""); }}>ביטול</GlowButton>
              {editingPoint && (
                <GlowButton tone="red" icon={Trash2} onClick={() => setConfirmDeletePoint(editingPoint)}>מחק</GlowButton>
              )}
              <GlowButton tone="emerald" icon={savingResult ? Loader2 : Check} className="flex-1" disabled={savingResult} onClick={saveResult}>שמור</GlowButton>
            </div>
          </Card>
        ) : (
          <GlowButton tone="emerald" icon={Plus} className="w-full" onClick={() => { setEditingPoint(null); setNewResultVal(""); setNewResultMin(""); setNewResultSec(""); setAddingResult(true); }}>מלא תוצאה חדשה</GlowButton>
        )}

        {confirmDeletePoint && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setConfirmDeletePoint(null)}>
            <div className="w-full sm:max-w-xs bg-zinc-950 border-2 border-red-500/40 rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 text-red-400 font-black text-base mb-2">
                <Trash2 size={18} /> מחיקת תוצאה
              </div>
              <div className="text-sm text-zinc-400 mb-4">למחוק את התוצאה {formatTestValue(t.unit, confirmDeletePoint.value)} מתאריך {confirmDeletePoint.date}?</div>
              <div className="flex gap-2">
                <GlowButton tone="ghost" className="flex-1" onClick={() => setConfirmDeletePoint(null)}>ביטול</GlowButton>
                <GlowButton tone="red" icon={Trash2} className="flex-1" onClick={deletePoint}>מחק</GlowButton>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="text-xl font-black text-zinc-50 mb-4">מד הכושר</div>

      {(
        <div className="relative rounded-3xl overflow-hidden p-6 mb-5 flex flex-col items-center" style={{ background: `linear-gradient(160deg, ${scoreColor(overallAvg)}20, transparent 60%), #0a0a0a`, boxShadow: `0 0 0 1.5px ${scoreColor(overallAvg)}45 inset` }}>
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-3xl opacity-25" style={{ backgroundColor: scoreColor(overallAvg) }} />
          <div className="relative text-[12px] font-bold text-zinc-400 mb-2">ציון כושר כללי</div>
          <div className="relative" style={{ width: 130, height: 130 }}>
            <svg viewBox="0 0 130 130" className="-rotate-90">
              <circle cx="65" cy="65" r="56" fill="none" stroke="#27272a" strokeWidth="9" />
              <circle cx="65" cy="65" r="56" fill="none" stroke={scoreColor(overallAvg)} strokeWidth="9" strokeDasharray={`${(overallAvg / 100) * 2 * Math.PI * 56} 999`} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${scoreColor(overallAvg)})` }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black text-white tabular-nums">{overallAvg}</span>
            </div>
          </div>
          <div className="relative text-[11px] text-zinc-500 mt-2">מבוסס על התוצאה הטובה ביותר בכל מדד</div>
        </div>
      )}

      {loadingTable ? (
        <div className="text-center py-16 text-sm text-zinc-600">טוען...</div>
      ) : (
        <div className="space-y-5">
          {FITNESS_GROUPS.map((group) => (
            <div key={group.label}>
              <SectionTitle icon={BarChart3}>{group.label}</SectionTitle>
              <div className="space-y-2">
                {group.tests.map((testId) => {
                  const t = FITNESS_TESTS.find((x) => x.id === testId);
                  const latest = latestFor(testId);
                  const score = bestScoreFor(testId);
                  return (
                    <button key={testId} onClick={() => openTest(t)} className="w-full flex items-center gap-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 active:scale-[0.98] transition p-3.5 text-right">
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
                        <t.icon size={18} className="text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-zinc-200">{t.label}</div>
                        {latest ? (
                          <>
                            <div className="text-[12px] text-zinc-500 mb-1">{formatTestValue(t.unit, latest.value)}</div>
                            <ScoreBar score={score} />
                          </>
                        ) : (
                          <div className="text-[12px] text-zinc-600">אין עדיין תוצאה - הקישו למילוי</div>
                        )}
                      </div>
                      {score !== null ? <ScoreCircle score={score} size={48} /> : <ChevronLeft size={17} className="text-zinc-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user, setCurrentUser, showToast, onLogout, goBack }) {
  const profile = user.profile || {};
  const targetUnitObj = UNITS.find((u) => u.id === profile.targetUnit);
  const [warConfirmOpen, setWarConfirmOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [gibushDraftType, setGibushDraftType] = useState("");
  const [gibushDraftDate, setGibushDraftDate] = useState("");
  const [editingGibush, setEditingGibush] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileView, setProfileView] = useState("profile"); // 'profile' | 'settings' | 'about'
  const [uploadingBg, setUploadingBg] = useState(false);

  async function updateProfile(patch) {
    const newProfile = { ...profile, ...patch };
    const newUser = { ...user, profile: newProfile };
    setCurrentUser(newUser);
    try {
      await saveUserProfile(newUser);
    } catch (e) {
      showToast("שגיאה בשמירה", "error");
    }
  }

  async function handlePhotoFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("נא לבחור קובץ תמונה", "error"); return; }
    setUploadingPhoto(true);
    try {
      const url = await uploadUnitImage(file);
      await updateProfile({ photoUrl: url });
      showToast("התמונה עודכנה", "success");
    } catch (e) {
      showToast(`שגיאת העלאה: ${e.message || "לא ידוע"}`, "error");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleBgFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("נא לבחור קובץ תמונה", "error"); return; }
    setUploadingBg(true);
    try {
      const url = await uploadUnitImage(file);
      await updateProfile({ customBgUrl: url, customBgEnabled: true });
      showToast("הרקע עודכן", "success");
    } catch (e) {
      showToast(`שגיאת העלאה: ${e.message || "לא ידוע"}`, "error");
    } finally {
      setUploadingBg(false);
    }
  }

  function toggleIssue(opt) {
    const list = profile.healthIssues || [];
    const next = list.includes(opt) ? list.filter((x) => x !== opt) : [...list, opt];
    updateProfile({ healthIssues: next });
  }

  return (
    <div className="p-4 space-y-4">
      <button onClick={goBack} className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 text-base font-bold">
        <ChevronRight size={16} /> חזרה לבית
      </button>
      <div className="relative rounded-3xl overflow-hidden p-6" style={{ background: `linear-gradient(160deg, ${targetUnitObj?.hex || "#10b981"}22, transparent 55%), #0a0a0a`, boxShadow: `0 0 0 1px ${targetUnitObj?.hex || "#10b981"}35 inset` }}>
        <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full blur-3xl opacity-40" style={{ backgroundColor: targetUnitObj?.hex || "#10b981" }} />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${targetUnitObj?.hex || "#10b981"}, ${targetUnitObj?.hex || "#10b981"}99)`, boxShadow: `0 8px 28px ${targetUnitObj?.hex || "#10b981"}55` }}>
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-black">{(profile.fullName || "?").trim().charAt(0) || "?"}</span>
              )}
            </div>
            <label className="absolute bottom-0 left-0 w-9 h-9 rounded-full bg-black border-2 border-zinc-800 flex items-center justify-center cursor-pointer active:scale-90 transition">
              {uploadingPhoto ? <Loader2 size={15} className="text-zinc-300 animate-spin" /> : <Camera size={15} className="text-zinc-300" />}
              <input type="file" accept="image/*" className="hidden" disabled={uploadingPhoto} onChange={(e) => handlePhotoFile(e.target.files?.[0])} />
            </label>
          </div>
          <div className="text-xl font-black text-zinc-50">{profile.fullName || "ללא שם"}</div>
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            {targetUnitObj && (
              <span className="rounded-full px-3 py-1.5 text-[12px] font-bold border" style={{ borderColor: `${targetUnitObj.hex}60`, color: targetUnitObj.hex, backgroundColor: `${targetUnitObj.hex}15` }}>
                {targetUnitObj.name}
              </span>
            )}
            {profile.teamCode && (
              <span className="rounded-full px-3 py-1.5 text-[12px] font-bold border border-zinc-700 text-zinc-300 bg-black/60">
                צוות {profile.teamCode}
              </span>
            )}
            {profile.level && (
              <span className="rounded-full px-3 py-1.5 text-[12px] font-bold border border-zinc-700 text-zinc-300 bg-black/60">
                {profile.level}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex bg-zinc-900 rounded-2xl p-1 gap-1">
        {[["profile", "פרופיל", User], ["settings", "הגדרות", GaugeIcon], ["about", "על המערכת", BookOpen]].map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setProfileView(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-bold transition ${profileView === id ? "bg-emerald-500 text-black" : "text-zinc-400"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {profileView === "profile" && (
      <>
      <Card className="p-4">
        <SectionTitle icon={User}>נתונים אישיים</SectionTitle>
        <div className="mb-3">
          <label className="text-[12px] text-zinc-500 font-semibold">שם מלא</label>
          <input value={profile.fullName || ""} onChange={(e) => updateProfile({ fullName: e.target.value })} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[["גיל", "age", ""], ["גובה", "height", "ס״מ"], ["משקל", "weight", 'ק"ג']].map(([label, key, unit]) => (
            <div key={key}>
              <label className="text-[12px] text-zinc-500 font-semibold">{label}</label>
              <input type="number" value={profile[key] || 0} onChange={(e) => updateProfile({ [key]: Number(e.target.value) })} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-base text-zinc-100 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
              {unit && <div className="text-[11px] text-zinc-600 mt-0.5">{unit}</div>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle icon={HeartPulse} tone="red">בדיקה רפואית</SectionTitle>
        <div className="flex gap-2">
          <button onClick={() => updateProfile({ healthy: true })} className={`flex-1 rounded-xl py-2.5 text-base font-bold border ${profile.healthy ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>בריא/ה</button>
          <button onClick={() => updateProfile({ healthy: false })} className={`flex-1 rounded-xl py-2.5 text-base font-bold border ${!profile.healthy ? "bg-red-500/15 border-red-500 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>לא בריא/ה</button>
        </div>
        {!profile.healthy && (
          <div className="mt-2.5">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {HEALTH_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => toggleIssue(opt)} className={`rounded-full px-3 py-1.5 text-sm font-bold border ${(profile.healthIssues || []).includes(opt) ? "bg-red-500/15 border-red-500 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>
                  {opt}
                </button>
              ))}
            </div>
            {(profile.healthIssues || []).includes("אחר") && (
              <textarea value={profile.healthOtherNote || ""} onChange={(e) => updateProfile({ healthOtherNote: e.target.value })} placeholder="פרט/י..." rows={2} className="w-full bg-zinc-950 border border-red-500/30 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 resize-none" />
            )}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <SectionTitle icon={Target} tone="amber">יעד קרבי</SectionTitle>
        {targetUnitObj && (
          <div className={`rounded-2xl px-4 py-4 bg-zinc-950 border-2 ${targetUnitObj.border} flex items-center justify-between`}>
            <div>
              <div className={`text-base font-black ${targetUnitObj.text}`}>{targetUnitObj.name}</div>
              <div className="text-[13px] text-zinc-500">{targetUnitObj.tagline}</div>
            </div>
            <Lock size={16} className="text-zinc-600" />
          </div>
        )}
        <div className="text-[12px] text-zinc-600 mt-2">היעד נקבע בהרשמה ואינו ניתן לשינוי עצמי</div>
      </Card>

      <Card className="p-4">
        <SectionTitle icon={GaugeIcon}>רמת כושר</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {TIERS.map((t) => (
            <button key={t} onClick={() => updateProfile({ level: t })} className={`rounded-full px-3 py-1.5 text-[13px] font-bold border transition-all duration-300 ${profile.level === t ? "bg-amber-500/15 border-amber-500 text-amber-400 scale-105" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>
              {t}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle icon={Users}>צוות</SectionTitle>
        <div className="rounded-2xl px-4 py-4 bg-zinc-950 border-2 border-zinc-700 flex items-center justify-between">
          <div className="text-base font-black text-zinc-100">צוות {profile.teamCode || "—"}</div>
          <Lock size={16} className="text-zinc-600" />
        </div>
        <div className="text-[12px] text-zinc-600 mt-2">הצוות אומת בהרשמה עם קוד ואינו ניתן לשינוי עצמי</div>
      </Card>

      <Card className="p-4">
        <SectionTitle icon={Clock} tone="amber">מועד גיבוש</SectionTitle>
        {profile.gibushDate && !editingGibush ? (
          <button
            onClick={() => { setGibushDraftDate(profile.gibushDate); setGibushDraftType(profile.gibushType); setEditingGibush(true); }}
            className="w-full rounded-2xl px-4 py-4 bg-black border-2 flex items-center justify-between active:scale-[0.98] transition"
            style={{ borderColor: (GIBUSH_TYPE_COLORS[profile.gibushType] || {}).hex || "#f59e0b" }}
          >
            <div className="text-right">
              <div className="text-base font-black" style={{ color: (GIBUSH_TYPE_COLORS[profile.gibushType] || {}).hex || "#f59e0b" }}>{profile.gibushType}</div>
              <div className="text-[13px] text-zinc-500">{new Date(`${profile.gibushDate}T00:00:00`).toLocaleDateString("he-IL")}</div>
            </div>
            <div className="text-[12px] text-zinc-600">לחץ/י לשינוי</div>
          </button>
        ) : (
          <>
            <label className="text-[12px] text-zinc-500 font-semibold mb-1.5 block">לאיזה גיבוש?</label>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {GIBUSH_TYPES.map((t) => {
                const c = GIBUSH_TYPE_COLORS[t] || {};
                const sel = gibushDraftType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setGibushDraftType(t)}
                    className={`rounded-lg py-2 text-[13px] font-bold border-2 transition ${sel ? "bg-black" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}
                    style={sel ? { borderColor: c.hex, color: c.hex } : undefined}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <label className="text-[12px] text-zinc-500 font-semibold mb-1.5 block">תאריך</label>
            <input type="date" value={gibushDraftDate} onChange={(e) => setGibushDraftDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
            <div className="flex gap-2 mt-3">
              {profile.gibushDate && (
                <GlowButton tone="ghost" className="flex-1" onClick={() => setEditingGibush(false)}>ביטול</GlowButton>
              )}
              <GlowButton tone="amber" className="flex-1" disabled={!gibushDraftDate || !gibushDraftType} onClick={() => { updateProfile({ gibushDate: gibushDraftDate, gibushType: gibushDraftType }); setEditingGibush(false); }}>
                שמור
              </GlowButton>
            </div>
          </>
        )}
      </Card>
      </>
      )}

      {profileView === "settings" && (
      <>
      <Card className="p-4">
        <SectionTitle icon={GaugeIcon}>הגדרות</SectionTitle>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-zinc-200 flex items-center gap-1.5"><Siren size={14} className={profile.warMode ? "text-red-400" : "text-zinc-500"} /> מצב מלחמה</div>
              <div className="text-[12px] text-zinc-600 mt-0.5">כשמופעל, דף הבית מוצג מלא בתוכנית החירום</div>
            </div>
            <button
              onClick={() => (profile.warMode ? updateProfile({ warMode: false }) : setWarConfirmOpen(true))}
              className={`w-12 h-7 rounded-full relative transition-colors ${profile.warMode ? "bg-red-600" : "bg-zinc-700"}`}
            >
              <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${profile.warMode ? "right-0.5" : "right-5.5"}`} style={{ right: profile.warMode ? 2 : 22 }} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <div>
              <div className="text-base font-bold text-zinc-200 flex items-center gap-1.5">
                {profile.lightMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-zinc-500" />} מצב תצוגה
              </div>
              <div className="text-[12px] text-zinc-600 mt-0.5">{profile.lightMode ? "בהיר" : "כהה"}</div>
            </div>
            <button
              onClick={() => updateProfile({ lightMode: !profile.lightMode })}
              className={`w-12 h-7 rounded-full relative transition-colors ${profile.lightMode ? "bg-amber-500" : "bg-zinc-700"}`}
            >
              <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all" style={{ right: profile.lightMode ? 2 : 22 }} />
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-base font-bold text-zinc-200 flex items-center gap-1.5"><ImageIcon size={14} className={profile.customBgEnabled ? "text-emerald-400" : "text-zinc-500"} /> רקע אישי</div>
                <div className="text-[12px] text-zinc-600 mt-0.5">תמונה משלכם כרקע לכל המסכים</div>
              </div>
              <button
                onClick={() => updateProfile({ customBgEnabled: !profile.customBgEnabled })}
                className={`w-12 h-7 rounded-full relative transition-colors shrink-0 ${profile.customBgEnabled ? "bg-emerald-500" : "bg-zinc-700"}`}
              >
                <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all" style={{ right: profile.customBgEnabled ? 2 : 22 }} />
              </button>
            </div>
            {profile.customBgEnabled && (
              <div>
                {profile.customBgUrl && (
                  <img src={profile.customBgUrl} alt="" className="w-full h-24 object-cover rounded-lg mb-2 border border-zinc-800" />
                )}
                <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg py-3 cursor-pointer transition ${uploadingBg ? "border-zinc-700 text-zinc-600" : "border-zinc-700 text-zinc-400 hover:border-emerald-500/50 hover:text-emerald-400"}`}>
                  {uploadingBg ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  <span className="text-sm font-bold">{uploadingBg ? "מעלה..." : profile.customBgUrl ? "החליפו תמונה" : "העלו או צלמו תמונה"}</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploadingBg} onChange={(e) => handleBgFile(e.target.files?.[0])} />
                </label>
              </div>
            )}
          </div>
        </div>
      </Card>
      </>
      )}

      {profileView === "about" && (
        <div className="relative rounded-3xl overflow-hidden p-6" style={{ background: "linear-gradient(160deg, #10b98122, transparent 55%), #0a0a0a", boxShadow: "0 0 0 1px #10b98135 inset" }}>
          <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full blur-3xl opacity-30 bg-emerald-500" />
          <div className="relative">
            <div className="text-2xl font-black text-zinc-50 mb-1">על המערכת</div>
            <div className="text-[13px] text-emerald-400 font-bold mb-5">מערכת חדשנית וטכנולוגית שנבנתה במטרה להעניק לכל מתאמן בכושר קרבי את הכלים המתקדמים ביותר</div>
            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4 space-y-3 text-[14px] text-zinc-300 leading-8">
              <p>מערכת חדשנית וטכנולוגית שנבנתה במטרה להעניק לכל מתאמן בכושר קרבי את הכלים המתקדמים ביותר כדי להגיע ליעדים שלו ולהוציא מעצמו את המקסימום. המערכת משלבת בין טכנולוגיות מתקדמות של בינה מלאכותית, ניתוח נתונים והתאמה אישית, ויוצרת עבור כל מתאמן מעטפת חכמה שמלווה אותו לאורך כל הדרך - לא רק בזמן האימון עצמו, אלא גם בכל השעות שמסביב.</p>
              <p>בעולם הכושר הקרבי, ההבדל בין מתאמן טוב לבין מתאמן שמגיע מוכן באמת נמצא בפרטים הקטנים: בתכנון נכון, בהתמדה, במעקב אחר ההתקדמות ובהתאמה מדויקת של האימונים ליכולות ולמטרות האישיות. לכן המערכת מאפשרת לכל משתמש לקבל את לוח הזמנים השבועי המדויק שנבנה עבורו על ידי המאמן, לצד האפשרות להוסיף ולבנות אימונים נוספים מתוך מאגר מקצועי ועצום של תכנים שנוצרו במיוחד עבור עולם הכושר הקרבי.</p>
              <p>בלב המערכת נמצא מנגנון AI מתקדם וייחודי, אשר מתמחה בעולם הכושר וההכנה הצבאית. הבינה המלאכותית מנתחת את הנתונים האישיים של המתאמן, את רמת הכושר שלו, את היעדים שאליהם הוא מכוון ואת הדרישות הפיזיות של המסלול הרצוי, ובאמצעות כך מתאימה לו את האימון הנכון ביותר עבורו מתוך מגוון רחב של תחומים - כוח, ריצה, סיבולת, כושר קרבי, הכנה לגיבושים ועוד.</p>
              <p>המערכת אינה מסתמכת רק על ידע כללי, אלא מבוססת על מאגר ידע רחב הכולל מחקרים, מאמרים מקצועיים ותובנות מעולם מדעי הספורט, הפיזיולוגיה והאימון ממוסדות מחקר ואוניברסיטאות מובילות בישראל ובעולם. כך מקבל המתאמן כלי חכם וזמין שמאפשר לו להתייעץ בכל רגע בנושאים הקשורים לכושר, לצבא, להכנה מנטלית ולדרך הנכונה ביותר להתקדם לעבר המטרה שלו.</p>
              <p>מעבר לכלים הטכנולוגיים, האפליקציה מעניקה למשתמשים עולם תוכן עשיר שנועד לחזק את הידע, המוטיבציה וההבנה שלהם בדרך להפוך למועמדים חזקים יותר ליחידות השונות בצה"ל. אחת לכמה ימים יעלו תכנים חדשים הכוללים טיפים, מאמרים ותובנות שנכתבו על ידי מלש"בים שעברו את הדרך, התקבלו ליחידות מיוחדות וצברו ניסיון אמיתי שאותו הם יכולים להעביר לדור הבא של המתאמנים.</p>
              <p>בנוסף, יעלו לאפליקציה תכנים מקצועיים וערכיים שיעזרו למשתמשים להבין טוב יותר את עולם היחידות המיוחדות, את דרישותיהן ואת הדרך הנכונה להתכונן אליהן. המשתמשים יוכלו להכיר לעומק את היחידות השונות, ללמוד על הגיבושים, להבין מה מצפה להם בתהליך ולהיחשף לחוויות אישיות של מתגבשים שעברו את אותם רגעים מאתגרים.</p>
              <p>המערכת מאפשרת לכל מתאמן לנהל את הדרך שלו בצורה מסודרת וברורה. כל האימונים שבוצעו, האימונים שנקבעו והמשימות המתוכננות נמצאים במקום אחד, כך שהמתאמן יכול להישאר ממוקד, לעקוב אחר התהליך שלו ולדעת בכל רגע מה הצעד הבא בדרך להשגת המטרה.</p>
              <p>בנוסף, קיים כלי מעקב מתקדם המאפשר למשתמש להזין את נתוני הביצועים האישיים שלו ולעקוב אחר השיפור לאורך זמן. מדידות כוח, תוצאות ריצה ומבחני יכולת שונים נשמרים במערכת ומוצגים בצורה ברורה באמצעות גרפים, המאפשרים לראות את ההתקדמות, לזהות נקודות לשיפור ולהבין כיצד הגוף והיכולות משתנים לאורך הדרך.</p>
              <p>אחד הכלים המרכזיים במערכת הוא מד העומס השבועי החכם, אשר מנתח את האימונים שביצע המתאמן ומציג את רמת העומס המצטברת שלו. כלי זה מאפשר להתאמן בצורה חכמה יותר, להבין את גבולות הגוף ולבנות תהליך שיפור נכון ומאוזן לאורך זמן.</p>
              <p>בנוסף קיים מד רצף ונוכחות, אשר עוקב אחר המחויבות וההתמדה של כל מתאמן - כמה אימונים ביצע, כמה הגיע, ועד כמה הוא שומר על עקביות לאורך הדרך. בעולם הכושר הקרבי, שבו התמדה היא אחד המרכיבים החשובים ביותר להצלחה, המערכת מדגישה לא רק את התוצאה הסופית אלא גם את הדרך ואת ההשקעה היומיומית.</p>
              <p>אנו מאמינים שהצלחה בגיבושים ובמסלולים המאתגרים ביותר אינה נבנית ביום אחד, אלא מהרגלים קטנים, משמעת והתמדה לאורך זמן. לכן בסוף כל חודש המאמן יוכל לראות את רמת ההשקעה של כל מתאמן, את אחוזי הנוכחות ואת המחויבות שהפגין לאורך הדרך - ולהכיר באלו שבחרו לתת את המקסימום ולא לוותר לעצמם.</p>
              <p>המטרה שלנו היא לא רק להכין מתאמנים חזקים יותר פיזית, אלא לבנות אנשים מוכנים יותר - עם ידע, משמעת, חוסן מנטלי וכלים מתקדמים שיעזרו להם להתמודד עם האתגרים הגדולים ביותר בדרך שלהם.</p>
            </div>
          </div>
        </div>
      )}

      <GlowButton tone="ghost" icon={LogOut} className="w-full" onClick={() => setLogoutConfirmOpen(true)}>
        התנתקות
      </GlowButton>

      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setLogoutConfirmOpen(false)}>
          <div className="w-full sm:max-w-xs bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-4">
              <LogOut size={28} className="text-zinc-400 mb-2" />
              <div className="text-base font-black text-zinc-100">האם אתה בטוח שאתה רוצה לצאת מהמערכת?</div>
            </div>
            <div className="flex gap-2">
              <GlowButton tone="ghost" className="flex-1" onClick={() => setLogoutConfirmOpen(false)}>לא</GlowButton>
              <GlowButton tone="red" icon={LogOut} className="flex-1" onClick={onLogout}>כן</GlowButton>
            </div>
          </div>
        </div>
      )}

      {warConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setWarConfirmOpen(false)}>
          <div className="w-full sm:max-w-xs bg-zinc-950 border border-red-600/40 rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-4">
              <Siren size={28} className="text-red-400 mb-2" />
              <div className="text-base font-black text-zinc-100">להפעיל מצב מלחמה?</div>
              <div className="text-sm text-zinc-500 mt-1.5">דף הבית שלך יוצג מלא בתוכנית חירום של 6 שבועות. אפשר לכבות בחזרה בכל רגע מכאן.</div>
            </div>
            <div className="flex gap-2">
              <GlowButton tone="ghost" className="flex-1" onClick={() => setWarConfirmOpen(false)}>ביטול</GlowButton>
              <GlowButton tone="red" icon={Siren} className="flex-1" onClick={() => { updateProfile({ warMode: true }); setWarConfirmOpen(false); }}>כן, בטוח/ה</GlowButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== ATTENDANCE TAB (TEAM LEADER) ============================== */

function AttendanceTab({ users, currentUser, officialEvents, showToast }) {
  const myTeamId = currentUser.profile?.teamCode || "";
  const [cadets, setCadets] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const todayEvent = officialEvents.find((e) => e.date === toKey(new Date()));

  useEffect(() => {
    const registered = users
      .filter((u) => u.role === "trainee" && u.onboarded && u.profile?.teamCode === myTeamId)
      .map((u) => ({ id: u.id, name: u.profile?.fullName || u.email.split("@")[0], present: false }));
    setCadets(registered);
    setLoadingRoster(false);
  }, [users, myTeamId]);

  const presentCount = cadets.filter((c) => c.present).length;
  const pct = cadets.length ? Math.round((presentCount / cadets.length) * 100) : 0;

  async function submit() {
    setSubmitting(true);
    try {
      const dateKey = toKey(new Date());
      await submitAttendanceRemote({ teamId: myTeamId, eventId: todayEvent.id, date: dateKey, percentage: pct });
      await submitIndividualAttendanceRemote(
        cadets.map((c) => ({ id: `${todayEvent.id}_${c.id}`, eventId: todayEvent.id, date: dateKey, teamId: myTeamId, userId: c.id, present: c.present }))
      );
      showToast("נוכחות נשמרה בהצלחה", "success");
    } catch (e) {
      showToast("שגיאה בשמירה", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!todayEvent) {
    return (
      <div className="p-4">
        <Card className="p-6 text-center">
          <ClipboardCheck size={28} className="text-zinc-600 mx-auto mb-2" />
          <div className="text-base text-zinc-400">אין אימון רשמי היום</div>
          <div className="text-sm text-zinc-600 mt-1">נוכחות ניתן לרשום רק כשהמאמן פרסם אימון לתאריך הנוכחי</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <SectionTitle icon={ClipboardCheck} tone="amber">נוכחות - {todayEvent.title} {myTeamId && `(צוות ${myTeamId})`}</SectionTitle>
        <div className="text-[12px] text-zinc-600 mb-3">הרשימה כוללת רק חניכים רשומים באמת בצוות שלך - אין אפשרות להוסיף שמות ידנית</div>
        {loadingRoster ? (
          <div className="text-center py-4 text-sm text-zinc-600">טוען...</div>
        ) : cadets.length === 0 ? (
          <div className="text-center py-4 text-sm text-zinc-600">אין עדיין חניכים רשומים בצוות שלך</div>
        ) : (
          <div className="space-y-1.5">
            {cadets.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
                <button onClick={() => setCadets((cs) => cs.map((x) => (x.id === c.id ? { ...x, present: !x.present } : x)))} className="flex items-center gap-2 flex-1">
                  <span className={`w-5 h-5 rounded flex items-center justify-center border ${c.present ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"}`}>
                    {c.present && <Check size={13} className="text-black" />}
                  </span>
                  <span className="text-base text-zinc-200">{c.name}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-bold text-zinc-300">אחוז נוכחות</span>
          <span className="text-2xl font-black text-emerald-400">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3"><div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
        <GlowButton tone="emerald" icon={submitting ? Loader2 : Send} className="w-full" disabled={submitting || cadets.length === 0} onClick={submit}>
          {submitting ? "שולח..." : "שלח נוכחות"}
        </GlowButton>
      </Card>
    </div>
  );
}

/* ============================== MANAGEMENT TAB (ADMIN) ============================== */

const CONTENT_CATEGORIES = [
  { id: "unit_info", label: "תוכן ערכי" },
];
const TRAINING_SUBCATS = TRAINING_BANK.map((b) => [b.id, b.title]);
const UNIT_INFO_SUBCATS = [["יחידות", "יחידות"], ["גיבושים", "גיבושים"], ["ערכים", "ערכים"], ["ירפא", "ירפ״א (טיס)"]];

/* ============================== COACH HOME (teams, members, push training, appoint leaders) ============================== */

function CoachHomeTab({ users, toggleTeamLeader, toggleAdmin, addOfficialEvent, officialEvents, removeOfficialEvent, showToast, onLogout }) {
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [openTeam, setOpenTeam] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const [search, setSearch] = useState("");
  const [eventForm, setEventForm] = useState({ date: "", title: "", time: "", endTime: "", location: "" });
  const [pushing, setPushing] = useState(false);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(null);
  const [injectForm, setInjectForm] = useState(null); // { date, time, title, detail }
  const [injecting, setInjecting] = useState(false);

  const roster = users.filter((u) => u.role !== "admin");
  const teamGroups = TEAM_LIST.map((t) => ({ ...t, members: roster.filter((u) => u.onboarded && u.profile?.teamCode === t.id) }));

  function leaderCountFor(teamId) {
    return roster.filter((u) => u.profile?.teamCode === teamId && u.role === "team_leader").length;
  }

  async function injectWorkout(member) {
    if (!injectForm?.date || !injectForm?.title?.trim()) { showToast("נא למלא תאריך וכותרת", "error"); return; }
    setInjecting(true);
    try {
      await addPersonalLogRemote(member.id, { id: Date.now(), date: injectForm.date, time: injectForm.time || "", title: injectForm.title.trim(), detail: injectForm.detail?.trim() || "" });
      showToast("האימון נוסף ליומן האישי של החניך/ה", "success");
      setInjectForm(null);
    } catch (e) {
      showToast("שגיאה בהוספה", "error");
    } finally {
      setInjecting(false);
    }
  }

  function handleMakeLeader(member) {
    const teamId = member.profile?.teamCode;
    if (member.role !== "team_leader" && leaderCountFor(teamId) >= 3) {
      showToast("הגעתם למכסה של 3 ראשי צוות לצוות זה", "error");
      return;
    }
    toggleTeamLeader(member.id);
    setViewingMember((prev) => (prev ? { ...prev, role: prev.role === "team_leader" ? "trainee" : "team_leader" } : prev));
  }

  function pushEvent() {
    if (!eventForm.date || !eventForm.title.trim()) { showToast("נא למלא תאריך וכותרת", "error"); return; }
    setPushing(true);
    addOfficialEvent({ id: Date.now(), ...eventForm });
    setEventForm({ date: "", title: "", time: "", endTime: "", location: "" });
    setPushing(false);
    showToast("האימון נוסף ליומני כל החניכים", "success");
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-lg font-black text-zinc-100">בית - מאמן</div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-black border border-red-500/25 rounded-2xl p-3 text-center tech-grid">
          <div className="text-2xl font-black text-red-400 font-mono tabular-nums">{roster.filter((u) => u.onboarded).length}</div>
          <div className="text-[11px] text-zinc-500 font-semibold mt-0.5">חניכים</div>
        </div>
        <div className="bg-black border border-emerald-500/25 rounded-2xl p-3 text-center tech-grid">
          <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">{teamGroups.filter((t) => t.members.length > 0).length}</div>
          <div className="text-[11px] text-zinc-500 font-semibold mt-0.5">צוותים פעילים</div>
        </div>
        <div className="bg-black border border-amber-500/25 rounded-2xl p-3 text-center tech-grid">
          <div className="text-2xl font-black text-amber-400 font-mono tabular-nums">{(officialEvents || []).filter((e) => e.date >= toKey(new Date())).length}</div>
          <div className="text-[11px] text-zinc-500 font-semibold mt-0.5">אימונים קרובים</div>
        </div>
      </div>

      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש מהיר של חניך..."
          className="w-full bg-black border border-zinc-700 rounded-xl pr-10 pl-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all duration-300"
        />
        <Compass size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        {search.trim() && (
          <div className="absolute top-full mt-1.5 w-full bg-zinc-950 border border-red-500/30 rounded-xl overflow-hidden z-10 max-h-56 overflow-y-auto">
            {(() => {
              const q = search.trim().toLowerCase();
              const matches = roster.filter((u) => (u.profile?.fullName || u.email || "").toLowerCase().includes(q));
              return matches.length === 0 ? (
                <div className="text-[13px] text-zinc-600 text-center py-3">אין תוצאות</div>
              ) : (
                matches.slice(0, 8).map((m) => (
                  <button key={m.id} onClick={() => { setViewingMember(m); setSearch(""); }} className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-zinc-900 transition">
                    <span className="text-sm font-bold text-zinc-200">{m.profile?.fullName || m.email}</span>
                    <span className="text-[11px] text-zinc-600">צוות {m.profile?.teamCode || "-"}</span>
                  </button>
                ))
              );
            })()}
          </div>
        )}
      </div>

      <Card className="p-4">
        <SectionTitle icon={Users} tone="red">צוותים</SectionTitle>
        <div className="space-y-1.5">
          {teamGroups.map((t) => (
            <div key={t.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <button onClick={() => setOpenTeam(openTeam === t.id ? null : t.id)} className="w-full flex items-center justify-between px-3.5 py-2.5">
                <span className="text-base font-bold text-zinc-200">{t.label}</span>
                <div className="flex items-center gap-2">
                  <Pill tone="zinc">{t.members.length} חברים</Pill>
                  <ChevronDown size={14} className={`text-zinc-500 transition ${openTeam === t.id ? "rotate-180" : ""}`} />
                </div>
              </button>
              {openTeam === t.id && (
                <div className="px-3 pb-3 space-y-1">
                  {t.members.length === 0 ? (
                    <div className="text-[13px] text-zinc-600 px-1">אין עדיין חברים בצוות זה</div>
                  ) : (
                    t.members.map((m) => (
                      <button key={m.id} onClick={() => { setViewingMember(m); setInjectForm(null); }} className="w-full flex items-center justify-between bg-zinc-900 rounded-lg px-3 py-2 hover:border-red-500/40 border border-transparent transition">
                        <span className="text-sm font-bold text-zinc-300">{m.profile?.fullName || m.email}</span>
                        {m.role === "team_leader" && <Pill tone="amber">ראש צוות</Pill>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 tech-grid tech-corners border border-amber-500/25">
        <SectionTitle icon={CalendarDays} tone="amber">פרסום אימון שבועי ליומני החניכים</SectionTitle>
        <div className="grid grid-cols-3 gap-2 mb-2.5">
          <div>
            <label className="text-[11px] text-zinc-500 font-semibold block mb-1">תאריך</label>
            <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className="w-full bg-black border border-amber-500/30 rounded-lg px-2 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 font-semibold block mb-1">משעה</label>
            <input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} className="w-full bg-black border border-amber-500/30 rounded-lg px-2 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 font-semibold block mb-1">עד שעה</label>
            <input type="time" value={eventForm.endTime} onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })} className="w-full bg-black border border-amber-500/30 rounded-lg px-2 py-2.5 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
          </div>
        </div>
        <div className="text-[12px] text-amber-400/70 mb-2.5 flex items-center gap-1.5">
          <Clock size={12} /> משוב האימון ייפתח לחניכים 3 שעות מרגע הסיום
        </div>
        <input placeholder="סוג אימון (לדוגמה: דיונות)" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="w-full mb-2.5 bg-black border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
        <input placeholder="מיקום" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} className="w-full mb-3 bg-black border border-zinc-700 rounded-lg px-3 py-2.5 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
        <GlowButton tone="amber" icon={pushing ? Loader2 : Plus} className="w-full" disabled={pushing} onClick={pushEvent}>הוסף ליומן כל החניכים</GlowButton>
      </Card>

      <Card className="p-4 tech-grid">
        <SectionTitle icon={CalendarDays} tone="red">אימונים קרובים</SectionTitle>
        {(() => {
          const upcoming = (officialEvents || []).filter((e) => e.date >= toKey(new Date())).sort((a, b) => (a.date < b.date ? -1 : 1));
          return upcoming.length === 0 ? (
            <div className="text-sm text-zinc-600 text-center py-3">אין אימונים קרובים מתוכננים</div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-red-500/20">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-red-500/10 border-b border-red-500/20">
                    <th className="text-right font-bold text-red-400 py-2 px-2.5 text-[11px]">תאריך</th>
                    <th className="text-right font-bold text-red-400 py-2 px-1.5 text-[11px]">שעה</th>
                    <th className="text-right font-bold text-red-400 py-2 px-1.5 text-[11px]">אימון</th>
                    <th className="text-right font-bold text-red-400 py-2 px-1.5 text-[11px]">הועלה ע״י</th>
                    <th className="py-2 px-1.5 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((ev, i) => {
                    const uploader = users.find((u) => u.id === ev.createdBy);
                    return (
                      <tr key={ev.id} className={i % 2 === 0 ? "bg-zinc-950" : "bg-black"}>
                        <td className="text-right py-2.5 px-2.5 text-zinc-300 text-[12px] font-mono tabular-nums">{ev.date}</td>
                        <td className="text-right py-2.5 px-1.5 text-zinc-300 text-[12px] font-mono tabular-nums">{ev.time || "-"}</td>
                        <td className="text-right py-2.5 px-1.5 text-zinc-100 text-[13px] font-bold">{ev.title}</td>
                        <td className="text-right py-2.5 px-1.5 text-emerald-500/80 text-[11px]">{uploader?.profile?.fullName || uploader?.email || "-"}</td>
                        <td className="py-2.5 px-1.5">
                          <button
                            onClick={() => setConfirmDeleteEvent(ev)}
                            className="text-red-400 hover:text-red-300 p-1.5"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </Card>

      {confirmDeleteEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setConfirmDeleteEvent(null)}>
          <div className="w-full sm:max-w-xs bg-zinc-950 border-2 border-red-500/40 rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-red-400 font-black text-base mb-2">
              <Trash2 size={18} /> ביטול אימון
            </div>
            <div className="text-sm text-zinc-400 mb-4">
              לבטל את <span className="font-bold text-zinc-200">{confirmDeleteEvent.title}</span> בתאריך {confirmDeleteEvent.date}? הפעולה תמחק אותו מיומני כל החניכים ולא ניתן לשחזר אותה.
            </div>
            <div className="flex gap-2">
              <GlowButton tone="ghost" className="flex-1" onClick={() => setConfirmDeleteEvent(null)}>ביטול</GlowButton>
              <GlowButton tone="red" icon={Trash2} className="flex-1" onClick={() => { removeOfficialEvent(confirmDeleteEvent.id); showToast("האימון בוטל", "success"); setConfirmDeleteEvent(null); }}>מחק</GlowButton>
            </div>
          </div>
        </div>
      )}

      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => { setViewingMember(null); setInjectForm(null); }}>
          <div className="w-full sm:max-w-sm bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-base font-black text-zinc-100">{viewingMember.profile?.fullName || viewingMember.email}</div>
              <button onClick={() => { setViewingMember(null); setInjectForm(null); }} className="text-zinc-500 hover:text-zinc-300"><X size={18} /></button>
            </div>
            <div className="space-y-2 text-sm text-zinc-400 mb-4">
              <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-600">אימייל</span><span dir="ltr">{viewingMember.email}</span></div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-600">גיל</span><span>{viewingMember.profile?.age || "—"}</span></div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-600">גובה / משקל</span><span>{viewingMember.profile?.height || "—"} ס״מ / {viewingMember.profile?.weight || "—"} ק״ג</span></div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-600">רמת כושר</span><span>{viewingMember.profile?.level || "—"}</span></div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-600">יעד קרבי</span><span>{viewingMember.profile?.targetUnitName || "—"}</span></div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-600">בעיות בריאות</span><span>{(viewingMember.profile?.healthIssues || []).join(", ") || "אין"}</span></div>
              <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-600">צוות</span><span>{viewingMember.profile?.teamCode || "—"}</span></div>
              {viewingMember.profile?.gibushDate && (
                <div className="flex justify-between border-b border-zinc-900 pb-1.5"><span className="text-zinc-600">{viewingMember.profile?.gibushType}</span><span>{viewingMember.profile.gibushDate}</span></div>
              )}
            </div>

            {injectForm ? (
              <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-3 mb-2 space-y-2">
                <div className="text-sm font-bold text-emerald-400">הוספת אימון ליומן האישי</div>
                <input type="date" value={injectForm.date} onChange={(e) => setInjectForm({ ...injectForm, date: e.target.value })} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <input placeholder="שעה (אופציונלי)" value={injectForm.time} onChange={(e) => setInjectForm({ ...injectForm, time: e.target.value })} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <input placeholder="כותרת האימון" value={injectForm.title} onChange={(e) => setInjectForm({ ...injectForm, title: e.target.value })} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <input placeholder="פירוט (אופציונלי)" value={injectForm.detail} onChange={(e) => setInjectForm({ ...injectForm, detail: e.target.value })} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
                <div className="flex gap-2">
                  <GlowButton tone="ghost" className="flex-1" onClick={() => setInjectForm(null)}>ביטול</GlowButton>
                  <GlowButton tone="emerald" icon={injecting ? Loader2 : Plus} className="flex-1" disabled={injecting} onClick={() => injectWorkout(viewingMember)}>הוסף</GlowButton>
                </div>
              </div>
            ) : (
              <GlowButton tone="emerald" icon={Plus} className="w-full mb-2" onClick={() => setInjectForm({ date: toKey(new Date()), time: "", title: "", detail: "" })}>
                הוסף אימון ליומן החניך/ה
              </GlowButton>
            )}

            <GlowButton tone={viewingMember.role === "team_leader" ? "ghost" : "amber"} icon={ClipboardCheck} className="w-full mb-2" onClick={() => handleMakeLeader(viewingMember)}>
              {viewingMember.role === "team_leader" ? "הסר מתפקיד ראש צוות" : "סמן כראש צוות"}
            </GlowButton>
            <button onClick={() => toggleAdmin(viewingMember.id)} className="w-full text-center text-[13px] text-red-400/70 hover:text-red-400 py-1">
              מנה למאמן
            </button>
          </div>
        </div>
      )}

      <GlowButton tone="ghost" icon={LogOut} className="w-full" onClick={() => setLogoutConfirmOpen(true)}>
        התנתקות
      </GlowButton>

      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setLogoutConfirmOpen(false)}>
          <div className="w-full sm:max-w-xs bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-4">
              <LogOut size={28} className="text-zinc-400 mb-2" />
              <div className="text-base font-black text-zinc-100">האם אתה בטוח שאתה רוצה לצאת מהמערכת?</div>
            </div>
            <div className="flex gap-2">
              <GlowButton tone="ghost" className="flex-1" onClick={() => setLogoutConfirmOpen(false)}>לא</GlowButton>
              <GlowButton tone="red" icon={LogOut} className="flex-1" onClick={onLogout}>כן</GlowButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== COACH CALENDARS (trainee monitoring by team) ============================== */

function CoachCalendarsTab({ users }) {
  const [openTeam, setOpenTeam] = useState(null);
  const [viewingTrainee, setViewingTrainee] = useState(null);
  const [traineeLogs, setTraineeLogs] = useState([]);
  const [loadingTraineeLogs, setLoadingTraineeLogs] = useState(false);

  const roster = users.filter((u) => u.role !== "admin" && u.onboarded);
  const teamGroups = TEAM_LIST.map((t) => ({ ...t, members: roster.filter((u) => u.profile?.teamCode === t.id) }));

  async function openTraineeCalendar(trainee) {
    setViewingTrainee(trainee);
    setLoadingTraineeLogs(true);
    const logs = await loadPersonalLogsRemote(trainee.id);
    setTraineeLogs(logs.sort((a, b) => (a.date < b.date ? 1 : -1)));
    setLoadingTraineeLogs(false);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-lg font-black text-zinc-100">יומני מתאמנים</div>
      <div className="text-[13px] text-zinc-600 -mt-2">בדיקת עומס אימונים אישי לפי צוות - לזיהוי מתאמנים שמתאמנים יותר מדי</div>

      <div className="space-y-1.5">
        {teamGroups.map((t) => (
          <Card key={t.id} className="overflow-hidden p-0">
            <button onClick={() => setOpenTeam(openTeam === t.id ? null : t.id)} className="w-full flex items-center justify-between px-3.5 py-2.5">
              <span className="text-base font-bold text-zinc-200">{t.label}</span>
              <div className="flex items-center gap-2">
                <Pill tone="zinc">{t.members.length} חברים</Pill>
                <ChevronDown size={14} className={`text-zinc-500 transition ${openTeam === t.id ? "rotate-180" : ""}`} />
              </div>
            </button>
            {openTeam === t.id && (
              <div className="px-3 pb-3 space-y-1">
                {t.members.length === 0 ? (
                  <div className="text-[13px] text-zinc-600 px-1">אין עדיין חברים בצוות זה</div>
                ) : (
                  t.members.map((m) => (
                    <button key={m.id} onClick={() => openTraineeCalendar(m)} className="w-full flex items-center justify-between bg-zinc-950 rounded-lg px-3 py-2 hover:border-red-500/40 border border-zinc-800 transition">
                      <span className="text-sm font-bold text-zinc-300">{m.profile?.fullName || m.email}</span>
                      <CalendarDays size={13} className="text-zinc-600" />
                    </button>
                  ))
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {viewingTrainee && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setViewingTrainee(null)}>
          <div className="w-full sm:max-w-sm bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-base font-black text-zinc-100">{viewingTrainee.profile?.fullName || viewingTrainee.email}</div>
              <button onClick={() => setViewingTrainee(null)} className="text-zinc-500 hover:text-zinc-300"><X size={18} /></button>
            </div>
            {loadingTraineeLogs ? (
              <div className="text-center py-6 text-sm text-zinc-600">טוען...</div>
            ) : traineeLogs.length === 0 ? (
              <div className="text-center py-6 text-sm text-zinc-600">המתאמן/ת עדיין לא הוסיף/ה אירועים אישיים ליומן</div>
            ) : (
              <div className="space-y-1.5">
                {traineeLogs.map((l) => (
                  <div key={l.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-200">{l.title}</span>
                      <span className="text-[12px] text-zinc-500">{l.date} {l.time || ""}</span>
                    </div>
                    {l.detail && <div className="text-[13px] text-zinc-500 mt-0.5">{l.detail}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== COACH FEEDBACK (attendance %, end-of-training feedback, monthly leaderboard) ============================== */

function CoachFeedbackTab({ users, officialEvents, showToast }) {
  const [openEventId, setOpenEventId] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [attendanceReports, setAttendanceReports] = useState([]);
  const [individualAttendance, setIndividualAttendance] = useState([]);

  useEffect(() => {
    (async () => {
      setFeedbackList(await loadFeedbackRemote());
      setLoadingFeedback(false);
      setAttendanceReports(await loadAttendanceReportsRemote());
      setIndividualAttendance(await loadAllIndividualAttendance());
    })();
  }, []);

  async function approveFeedback(id) {
    await approveFeedbackRemote(id);
    setFeedbackList((prev) => prev.map((f) => (f.id === id ? { ...f, status: "approved" } : f)));
    showToast("המשוב אושר", "success");
  }

  function nameOf(userId) {
    const u = users.find((x) => x.id === userId);
    return u ? u.profile?.fullName || u.email : "משתמש לא ידוע";
  }

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyCounts = {};
  individualAttendance
    .filter((r) => r.present && r.date && r.date.startsWith(monthKey))
    .forEach((r) => { monthlyCounts[r.userId] = (monthlyCounts[r.userId] || 0) + 1; });
  const leaderboard = Object.entries(monthlyCounts)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="p-4 space-y-4">
      <div className="text-lg font-black text-zinc-100">מה שהתקבל</div>

      <Card className="p-4">
        <SectionTitle icon={CalendarDays} tone="amber">לוח האימונים שפרסמת</SectionTitle>
        {officialEvents.length === 0 ? (
          <div className="text-sm text-zinc-600 text-center py-3">עדיין לא פרסמת אימונים</div>
        ) : (
          <div className="space-y-1.5">
            {officialEvents.map((ev) => {
              const reports = attendanceReports.filter((r) => r.eventId === ev.id);
              return (
                <div key={ev.id} className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenEventId(openEventId === ev.id ? null : ev.id)} className="w-full flex items-center justify-between px-3.5 py-2.5">
                    <span className="text-sm font-bold text-zinc-200">{ev.title} · {ev.date}</span>
                    <ChevronDown size={14} className={`text-zinc-500 transition ${openEventId === ev.id ? "rotate-180" : ""}`} />
                  </button>
                  {openEventId === ev.id && (
                    <div className="px-4 pb-3">
                      {reports.length === 0 ? (
                        <div className="text-[13px] text-zinc-600">ראשי הצוות עדיין לא סימנו נוכחות לאימון זה</div>
                      ) : (
                        <div className="space-y-1">
                          {reports.map((r, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="text-zinc-400">צוות {r.teamId}</span>
                              <Pill tone="emerald">{r.percentage}%</Pill>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <SectionTitle icon={ClipboardCheck} tone="amber">משובי סוף אימון</SectionTitle>
        {loadingFeedback ? (
          <div className="text-sm text-zinc-600 text-center py-3">טוען...</div>
        ) : feedbackList.length === 0 ? (
          <div className="text-sm text-zinc-600 text-center py-3">עדיין לא התקבלו משובים</div>
        ) : (
          <div className="space-y-2">
            {feedbackList.map((f) => (
              <div key={f.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-zinc-200">{f.firstName} · צוות {f.teamCode}</span>
                  {f.status === "approved" ? <Pill tone="emerald">אושר</Pill> : <Pill tone="amber">חדש</Pill>}
                </div>
                <div className="text-[13px] text-zinc-500 mb-1">מאמן: {f.coach} · ציון: {f.valueRating}/5 · המלצה: {f.recommendRating}/5</div>
                <div className="text-sm text-zinc-400">{f.opinion}</div>
                {f.status !== "approved" && (
                  <button onClick={() => approveFeedback(f.id)} className="mt-2 text-[13px] font-bold text-emerald-400 hover:text-emerald-300">סמן כנקרא</button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <SectionTitle icon={TrendingUp} tone="amber">הכי הרבה אימונים החודש</SectionTitle>
        <div className="text-[12px] text-zinc-600 mb-3">מתאפס בכל חודש - לפי נוכחות שראשי הצוות סימנו</div>
        {leaderboard.length === 0 ? (
          <div className="text-sm text-zinc-600 text-center py-3">אין עדיין נתוני נוכחות החודש</div>
        ) : (
          <div className="space-y-1.5">
            {leaderboard.map((row, i) => (
              <div key={row.userId} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-amber-400 w-4">{i + 1}</span>
                  <span className="text-sm font-bold text-zinc-200">{nameOf(row.userId)}</span>
                </div>
                <Pill tone="emerald">{row.count} אימונים</Pill>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================== COACH CONTENT (publishing - articles, training bank, unit info, values) ============================== */

function CoachContentTab({ addArticle, addContent, showToast }) {
  const [contentForm, setContentForm] = useState({ category: "unit_info", subcategory: "ערכים", title: "", body: "", unit: "", imageUrl: "", dateLabel: "" });
  const [publishing, setPublishing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [published, setPublished] = useState([]);
  const [loadingPublished, setLoadingPublished] = useState(true);
  const [confirmDeleteContent, setConfirmDeleteContent] = useState(null);

  async function refreshPublished(subcat) {
    setLoadingPublished(true);
    const rows = await loadContentRemote("unit_info", subcat || contentForm.subcategory);
    setPublished(rows);
    setLoadingPublished(false);
  }
  useEffect(() => { refreshPublished("ערכים"); }, []);

  async function handleImageFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("נא לבחור קובץ תמונה", "error"); return; }
    setUploadingImage(true);
    try {
      const url = await uploadUnitImage(file);
      setContentForm((f) => ({ ...f, imageUrl: url }));
      showToast("התמונה הועלתה", "success");
    } catch (e) {
      showToast(`שגיאת העלאה: ${e.message || "לא ידוע"}`, "error");
    } finally {
      setUploadingImage(false);
    }
  }

  async function publish() {
    if (!contentForm.title.trim()) return;
    setPublishing(true);
    try {
      if (contentForm.category === "tip_article") {
        await addArticle({ id: Date.now(), title: contentForm.title, unit: contentForm.unit || "כללי", author: "מאמן", excerpt: contentForm.body, imageUrl: contentForm.imageUrl.trim() });
      } else {
        if (!contentForm.subcategory) { showToast("נא לבחור תת-קטגוריה", "error"); setPublishing(false); return; }
        await addContent({ category: contentForm.category, subcategory: contentForm.subcategory, title: contentForm.title, body: contentForm.body, dateLabel: contentForm.dateLabel.trim(), imageUrl: contentForm.imageUrl.trim() });
      }
      showToast("התוכן פורסם", "success");
      setContentForm({ category: contentForm.category, subcategory: "", title: "", body: "", unit: "", imageUrl: "", dateLabel: "" });
      refreshPublished();
    } catch (e) {
      showToast("שגיאה בפרסום", "error");
    } finally {
      setPublishing(false);
    }
  }

  async function deletePublished(item) {
    try {
      await removeContentRemote(item.id);
      setPublished((prev) => prev.filter((p) => p.id !== item.id));
      showToast("התוכן נמחק", "success");
    } catch (e) {
      showToast("שגיאה במחיקה", "error");
    }
    setConfirmDeleteContent(null);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-lg font-black text-zinc-100">פרסום תוכן למאגר</div>

      <Card className="p-4 tech-grid border border-sky-500/25">
        <div className="rounded-xl bg-sky-500/10 border border-sky-500/30 p-3 mb-4">
          <div className="text-sm font-black text-sky-400 flex items-center gap-1.5 mb-1"><Star size={13} /> פרסום תוכן ערכי</div>
          <div className="text-[13px] text-zinc-400">תוכן ערכי לקראת השירות - מופיע לכל החניכים במאגר. (מאגר האימונים ותוכן ירפ״א מנוהלים בנפרד)</div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-1.5">
            {UNIT_INFO_SUBCATS.map(([id, label]) => (
              <button key={id} onClick={() => { setContentForm({ ...contentForm, subcategory: id, title: "", unit: "", imageUrl: "" }); refreshPublished(id); }} className={`flex-1 rounded-lg py-2 text-[13px] font-bold border ${contentForm.subcategory === id ? "bg-sky-500/15 border-sky-500 text-sky-400" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>{label}</button>
            ))}
          </div>

          {contentForm.subcategory === "ירפא" ? (
            <>
              <label className="text-[12px] text-zinc-500 font-semibold block">איזה חלק?</label>
              <div className="flex gap-1.5">
                {YERPA_LIST.map((name) => (
                  <button key={name} onClick={() => setContentForm({ ...contentForm, title: name })} className={`flex-1 rounded-lg py-2 text-[13px] font-bold border ${contentForm.title === name ? "bg-sky-500/15 border-sky-500 text-sky-400" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>
                    {name}
                  </button>
                ))}
              </div>
              <div className="text-[12px] text-zinc-600">התוכן יופיע רק למי שבחר קורס טיס כיעד הקרבי שלו/ה</div>
            </>
          ) : contentForm.subcategory === "יחידות" ? (
            <>
              <label className="text-[12px] text-zinc-500 font-semibold block">איזו יחידה?</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
                {UNITS.map((u) => (
                  <button key={u.id} onClick={() => setContentForm({ ...contentForm, title: u.id })} className="rounded-lg py-2 text-[13px] font-bold border" style={contentForm.title === u.id ? { backgroundColor: `${u.hex}22`, borderColor: u.hex, color: u.hex } : { backgroundColor: "#18181b", borderColor: "#27272a", color: "#a1a1aa" }}>
                    {u.name}
                  </button>
                ))}
              </div>
              <label className="text-[12px] text-zinc-500 font-semibold block">תמונת סיכה/סמל (אופציונלי)</label>
              {contentForm.imageUrl ? (
                <div className="flex items-center gap-2">
                  <img src={contentForm.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-zinc-700" />
                  <button onClick={() => setContentForm({ ...contentForm, imageUrl: "" })} className="text-[13px] text-red-400 hover:text-red-300 font-bold">הסר תמונה</button>
                </div>
              ) : (
                <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg py-3 cursor-pointer transition ${uploadingImage ? "border-zinc-700 text-zinc-600" : "border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-400"}`}>
                  {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span className="text-sm font-bold">{uploadingImage ? "מעלה..." : "העלו תמונה מהמכשיר"}</span>
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={(e) => handleImageFile(e.target.files?.[0])} />
                </label>
              )}
              <div className="text-[12px] text-zinc-600">התוכן יופיע בכרטיס היחידה במאגר, כשלוחצים על הסמל שלה. אם כבר יש תוכן ליחידה זו, הפרסום החדש יחליף אותו.</div>
            </>
          ) : contentForm.subcategory === "גיבושים" ? (
            <>
              <label className="text-[12px] text-zinc-500 font-semibold block">איזה גיבוש?</label>
              <div className="grid grid-cols-2 gap-1.5">
                {GIBUSHIM_LIST.map((name) => (
                  <button key={name} onClick={() => setContentForm({ ...contentForm, title: name })} className={`rounded-lg py-2 text-[13px] font-bold border ${contentForm.title === name ? "bg-red-500/15 border-red-500 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>
                    {name}
                  </button>
                ))}
              </div>
              <label className="text-[12px] text-zinc-500 font-semibold block">מועד</label>
              <input placeholder='לדוגמה: אפריל 2026 שייטת 13' value={contentForm.dateLabel} onChange={(e) => setContentForm({ ...contentForm, dateLabel: e.target.value })} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all duration-300" />
            </>
          ) : (
            <input placeholder="כותרת" value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all duration-300" />
          )}
          {contentForm.category === "tip_article" && (
            <>
              <label className="text-[12px] text-zinc-500 font-semibold block">סיווג לפי יחידה (אופציונלי - משמש לסינון בעיתון)</label>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setContentForm({ ...contentForm, unit: "" })} className={`rounded-full px-3 py-1.5 text-[13px] font-bold border ${!contentForm.unit ? "bg-red-500/15 border-red-500 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>כללי</button>
                {ARTICLE_UNIT_TAGS.map((tag) => (
                  <button key={tag} onClick={() => setContentForm({ ...contentForm, unit: tag })} className={`rounded-full px-3 py-1.5 text-[13px] font-bold border ${contentForm.unit === tag ? "bg-red-500/15 border-red-500 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>{tag}</button>
                ))}
              </div>
              <input placeholder="קישור לתמונה (אופציונלי - אם ריק, ייווצר עיצוב אוטומטי)" dir="ltr" value={contentForm.imageUrl} onChange={(e) => setContentForm({ ...contentForm, imageUrl: e.target.value })} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all duration-300" />
            </>
          )}
          {contentForm.category === "training_pool" && (
            <div className="text-[12px] text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5">
              פורמט לטבלת תרגילים - שורה לכל תרגיל: <span dir="ltr" className="font-mono">שם תרגיל|סטים|חזרות|מנוחה</span><br/>
              שורת הערה (אופציונלי, למעלה): <span dir="ltr" className="font-mono">META|הטקסט שלך</span>
            </div>
          )}
          <textarea placeholder={contentForm.category === "training_pool" ? "לדוגמה: מתח רגיל|5|5-8|2-3 דקות" : "תוכן / הקשר"} value={contentForm.body} onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })} rows={4} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 resize-none" />
          <GlowButton tone="red" icon={publishing ? Loader2 : Send} className="w-full" disabled={publishing || !contentForm.title.trim()} onClick={publish}>{publishing ? "מפרסם..." : "פרסם"}</GlowButton>
        </div>
      </Card>

      <Card className="p-4 tech-grid">
        <SectionTitle icon={ClipboardCheck} tone="emerald">תוכן שפורסם - ניתן למחוק</SectionTitle>
        {loadingPublished ? (
          <div className="text-sm text-zinc-600 text-center py-3">טוען...</div>
        ) : published.length === 0 ? (
          <div className="text-sm text-zinc-600 text-center py-3">עדיין לא פורסם תוכן ב{UNIT_INFO_SUBCATS.find(([id]) => id === contentForm.subcategory)?.[1] || "קטגוריה זו"}</div>
        ) : (
          <div className="space-y-1.5">
            {published.map((item) => {
              const unitObj = contentForm.subcategory === "יחידות" ? UNITS.find((u) => u.id === item.title) : null;
              return (
                <div key={item.id} className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5">
                  <div className="text-sm font-bold text-zinc-200">{unitObj ? unitObj.name : item.title}</div>
                  <button onClick={() => setConfirmDeleteContent(item)} className="text-red-400 hover:text-red-300 p-1.5 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {confirmDeleteContent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" dir="rtl" onClick={() => setConfirmDeleteContent(null)}>
          <div className="w-full sm:max-w-xs bg-zinc-950 border-2 border-red-500/40 rounded-t-3xl sm:rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-red-400 font-black text-base mb-2">
              <Trash2 size={18} /> מחיקת תוכן
            </div>
            <div className="text-sm text-zinc-400 mb-4">
              למחוק את <span className="font-bold text-zinc-200">{confirmDeleteContent.title}</span>? זה יוסר מיד מהמאגר של כל החניכים ולא ניתן לשחזר.
            </div>
            <div className="flex gap-2">
              <GlowButton tone="ghost" className="flex-1" onClick={() => setConfirmDeleteContent(null)}>ביטול</GlowButton>
              <GlowButton tone="red" icon={Trash2} className="flex-1" onClick={() => deletePublished(confirmDeleteContent)}>מחק</GlowButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== TRAINING FEEDBACK PAGE ============================== */

function FeedbackTab({ currentUser, officialEvents, showToast, onBack }) {
  const [openEvent] = useState(() => getOpenFeedbackEvent(officialEvents));
  const [checking, setChecking] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [teamCode, setTeamCode] = useState(currentUser.profile?.teamCode || "");
  const [coach, setCoach] = useState("");
  const [coachOther, setCoachOther] = useState("");
  const [valueRating, setValueRating] = useState(0);
  const [recommendRating, setRecommendRating] = useState(0);
  const [opinion, setOpinion] = useState("");
  const [kindWordTeam, setKindWordTeam] = useState("");
  const [kindWordValue, setKindWordValue] = useState("");
  const [kindWordText, setKindWordText] = useState("");
  const [howAreYou, setHowAreYou] = useState("");
  const [messageToYuval, setMessageToYuval] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!openEvent) { setChecking(false); return; }
      const already = await checkFeedbackSubmitted(currentUser.id, openEvent.id);
      setAlreadySubmitted(already);
      setChecking(false);
    })();
  }, [openEvent, currentUser.id]);

  async function submit() {
    if (!firstName.trim() || !teamCode || !coach || valueRating === 0 || recommendRating === 0 || !opinion.trim()) {
      showToast("נא למלא את כל השדות המסומנים כחובה", "error");
      return;
    }
    setSaving(true);
    try {
      const entry = {
        id: Date.now(),
        userId: currentUser.id,
        eventId: openEvent?.id || null,
        eventTitle: openEvent?.title || "",
        submittedAt: new Date().toISOString(),
        status: "pending",
        firstName: firstName.trim(),
        teamCode,
        coach: coach === "אחר" ? coachOther.trim() || "אחר" : coach,
        valueRating,
        recommendRating,
        opinion: opinion.trim(),
        kindWord: kindWordText.trim() ? { team: kindWordTeam, value: kindWordValue, text: kindWordText.trim() } : null,
        howAreYou: howAreYou.trim(),
        messageToYuval: messageToYuval.trim(),
      };
      await submitFeedbackRemote(entry);
      setSubmitted(true);
      showToast("המשוב נשלח למאמן בהצלחה", "success");
    } catch (e) {
      showToast("שגיאה בשליחה, נסה שוב", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 text-base font-bold mb-4">
        <ChevronRight size={16} /> חזרה לדף הבית
      </button>

      {checking ? (
        <div className="text-center py-10 text-zinc-600 text-base">בודק זמינות...</div>
      ) : !openEvent ? (
        <Card className="p-6 text-center">
          <ClipboardCheck size={28} className="text-zinc-600 mx-auto mb-2" />
          <div className="text-base text-zinc-400">אין כרגע משוב אימון פתוח למילוי.</div>
          <div className="text-sm text-zinc-600 mt-1">הטופס נפתח לשלוש שעות מרגע סיום כל אימון רשמי.</div>
        </Card>
      ) : alreadySubmitted || submitted ? (
        <Card className="p-6 text-center">
          <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
          <div className="text-base text-zinc-300 font-bold">כבר שלחת משוב לאימון הזה. תודה!</div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-4 space-y-5">
            <div>
              <SectionTitle icon={ClipboardCheck} tone="amber">משוב אימון - {openEvent.title}</SectionTitle>
              <div className="space-y-3">
                <div>
                  <label className="text-[13px] text-zinc-500 font-semibold">שם פרטי</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
              </div>
              <div>
                <label className="text-[13px] text-zinc-500 font-semibold mb-1.5 block">מספר צוות</label>
                <div className="text-base font-black text-amber-400 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5">
                  {teamCode ? `צוות ${teamCode}` : "לא הוגדר בפרופיל"}
                </div>
              </div>
              <div>
                <label className="text-[13px] text-zinc-500 font-semibold mb-1.5 block">אצל מי התאמנת?</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["עוז", "יובל", "אור", "אחר"].map((c) => (
                    <button key={c} onClick={() => setCoach(c)} className={`rounded-lg py-2 text-sm font-bold border ${coach === c ? "bg-amber-500/15 border-amber-500 text-amber-400" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}>
                      {c}
                    </button>
                  ))}
                </div>
                {coach === "אחר" && (
                  <input value={coachOther} onChange={(e) => setCoachOther(e.target.value)} placeholder="שם המאמן" className="w-full mt-2 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
                )}
              </div>
              <div>
                <label className="text-[13px] text-zinc-500 font-semibold mb-1.5 block">האימון נתן לי ערך (1-5)</label>
                <RatingButtons value={valueRating} onChange={setValueRating} />
              </div>
              <div>
                <label className="text-[13px] text-zinc-500 font-semibold mb-1.5 block">האם היית ממליץ לחברייך להצטרף אלינו? (1-5)</label>
                <RatingButtons value={recommendRating} onChange={setRecommendRating} />
              </div>
              <div>
                <label className="text-[13px] text-zinc-500 font-semibold">מה דעתך על האימון?</label>
                <textarea value={opinion} onChange={(e) => setOpinion(e.target.value)} rows={3} className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all duration-300" />
              </div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-5">
              <SectionTitle icon={Heart} tone="red">מילה טובה (לא חובה)</SectionTitle>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                  <label className="text-[12px] text-zinc-500 font-semibold">צוות</label>
                  <select value={kindWordTeam} onChange={(e) => setKindWordTeam(e.target.value)} className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100">
                    <option value="">בחר/י</option>
                    {TEAM_LIST.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] text-zinc-500 font-semibold">ערך</label>
                  <select value={kindWordValue} onChange={(e) => setKindWordValue(e.target.value)} className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100">
                    <option value="">בחר/י</option>
                    {CORE_VALUES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea value={kindWordText} onChange={(e) => setKindWordText(e.target.value)} placeholder="כתוב/י מילה טובה על מישהו/י מהצוות..." rows={2} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 transition-all duration-300" />
            </div>
            </div>

            <div className="border-t border-zinc-800 pt-5">
              <SectionTitle icon={MessageSquare}>עוד כמה דברים (לא חובה)</SectionTitle>
              <div className="space-y-3">
                <div>
                  <label className="text-[13px] text-zinc-500 font-semibold">מה שלומך?</label>
                  <textarea value={howAreYou} onChange={(e) => setHowAreYou(e.target.value)} rows={2} className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
                </div>
                <div>
                  <label className="text-[13px] text-zinc-500 font-semibold">משהו שתרצה/י להגיד ליובל?</label>
                  <textarea value={messageToYuval} onChange={(e) => setMessageToYuval(e.target.value)} rows={2} className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60 transition-all duration-300" />
                </div>
              </div>
            </div>
          </Card>

          <GlowButton tone="amber" icon={saving ? Loader2 : Send} className="w-full" disabled={saving} onClick={submit}>
            {saving ? "שולח..." : "שלח משוב"}
          </GlowButton>
        </div>
      )}
    </div>
  );
}

/* ============================== ROOT APP ============================== */

export default function CombatFitApp() {
  const [authState, setAuthState] = useState(() => {
    // Skips the intro screen entirely for anyone who's already seen it on this
    // device/browser before - localStorage persists across visits, which is what
    // actually achieves "remember this computer already came here" (a literal IP
    // address isn't something a website can reliably read or store client-side).
    try {
      return localStorage.getItem("sayert_intro_seen") ? "auth" : "intro";
    } catch (e) {
      return "intro";
    }
  }); // 'intro' | 'auth' | 'onboarding' | 'app'
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [tabResetSignal, setTabResetSignal] = useState(0);
  const mainScrollRef = useRef(null);
  const scrollContentToTop = () => mainScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });

  const [users, setUsers] = useState([]);
  const [officialEvents, setOfficialEvents] = useState([]);
  const [personalLogs, setPersonalLogs] = useState([]);
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [trainingContent, setTrainingContent] = useState([]);

  function showToast(msg, tone = "info") { setToast({ msg, tone }); }
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (authState !== "app" || !currentUser) return;
    let cancelled = false;
    (async () => {
      const [u, ev, arts, logs, tb] = await Promise.all([
        loadUsers(),
        loadOfficialEvents(),
        loadArticlesRemote(),
        loadPersonalLogsRemote(currentUser.id),
        loadContentRemote("training_pool"),
      ]);
      if (cancelled) return;
      setUsers(u);
      setOfficialEvents(ev);
      setArticles(arts);
      setPersonalLogs(logs);
      setTrainingContent(tb);
    })();
    return () => { cancelled = true; };
  }, [authState, currentUser?.id]);

  function handleAuthed(user) {
    setCurrentUser(user);
    setAuthState(user.onboarded ? "app" : "onboarding");
    if (user.role === "admin") setActiveTab("coach_home");
  }
  function handleOnboardingDone(user) {
    setCurrentUser(user);
    setAuthState("app");
  }
  function handleLogout() {
    session.accessToken = null;
    setCurrentUser(null);
    setAuthState("auth");
    setActiveTab("home");
  }

  async function addPersonalLog(entry) {
    const saved = await addPersonalLogRemote(currentUser.id, entry);
    setPersonalLogs((prev) => [saved, ...prev]);
  }
  async function updatePersonalLog(id, patch) {
    setPersonalLogs((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    await updatePersonalLogRemote(currentUser.id, id, patch);
  }
  async function removePersonalLog(id) {
    await removePersonalLogRemote(currentUser.id, id);
    setPersonalLogs((prev) => prev.filter((l) => l.id !== id));
  }
  async function updateProfile(patch) {
    const newUser = { ...currentUser, profile: { ...currentUser.profile, ...patch } };
    setCurrentUser(newUser);
    try {
      await saveUserProfile(newUser);
    } catch (e) {
      showToast("שגיאה בשמירה", "error");
    }
  }
  async function setGibushDate(dateStr, gibushType) {
    const newUser = { ...currentUser, profile: { ...currentUser.profile, gibushDate: dateStr, gibushType: gibushType || currentUser.profile?.gibushType || "" } };
    setCurrentUser(newUser);
    try {
      await saveUserProfile(newUser);
    } catch (e) {
      showToast("שגיאה בשמירת מועד הגיבוש", "error");
    }
  }
  async function addOfficialEvent(entry) {
    const saved = await addOfficialEventRemote(entry);
    setOfficialEvents((prev) => [saved, ...prev]);
  }
  async function removeOfficialEvent(id) {
    await removeOfficialEventRemote(id);
    setOfficialEvents((prev) => prev.filter((e) => e.id !== id));
  }
  async function addArticle(entry) {
    const saved = await addArticleRemote(entry);
    setArticles((prev) => [saved, ...prev]);
  }
  async function addContent(entry) {
    const saved = await addContentRemote(entry);
    if (entry.category === "training_pool") setTrainingContent((prev) => [saved, ...prev]);
  }
  async function toggleTeamLeader(userId) {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const updated = { ...target, role: target.role === "team_leader" ? "trainee" : "team_leader" };
    await saveUserProfile(updated);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    showToast("העדכון בוצע", "success");
  }
  async function toggleAdmin(userId) {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const updated = { ...target, role: target.role === "admin" ? "trainee" : "admin" };
    await saveUserProfile(updated);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    showToast("העדכון בוצע", "success");
  }

  const baseTabs = [
    { id: "home", label: "בית", icon: Home },
    { id: "calendar", label: "יומן", icon: CalendarDays },
    { id: "chat", label: "צ'אט", icon: MessageSquare },
    { id: "hub", label: "מאגר", icon: BookOpen },
    { id: "fitness", label: "מד הכושר", icon: TrendingUp },
  ];
  const coachTabs = [
    { id: "coach_home", label: "בית", icon: Home },
    { id: "coach_calendars", label: "יומנים", icon: CalendarDays },
    { id: "coach_feedback", label: "התקבל", icon: ClipboardCheck },
    { id: "coach_content", label: "מאגר", icon: BookOpen },
  ];
  const tabs =
    currentUser?.role === "admin" ? coachTabs
    : currentUser?.role === "team_leader" ? [...baseTabs, { id: "attendance", label: "נוכחות", icon: ClipboardCheck }]
    : baseTabs;
  const isLight = Boolean(currentUser?.profile?.lightMode);
  const customBg = currentUser?.profile?.customBgEnabled ? currentUser?.profile?.customBgUrl : null;

  return (
    <div dir="rtl" className="w-full min-h-screen bg-black flex justify-center" style={{ fontFamily: "'Heebo', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif" }}>
      <div
        className={`w-full max-w-md min-h-screen border-x flex flex-col h-screen relative ${isLight ? "light-theme border-zinc-200" : "border-zinc-900"}`}
        style={{
          background: customBg
            ? `linear-gradient(${isLight ? "rgba(248,250,252,0.88)" : "rgba(0,0,0,0.82)"}, ${isLight ? "rgba(248,250,252,0.88)" : "rgba(0,0,0,0.82)"}), url(${customBg})`
            : isLight
            ? "radial-gradient(ellipse 100% 40% at 50% 0%, rgba(16,185,129,0.08), transparent 70%), #f8fafc"
            : "radial-gradient(ellipse 100% 40% at 50% 0%, rgba(16,185,129,0.06), transparent 70%), #000",
          backgroundSize: customBg ? "cover" : undefined,
          backgroundPosition: customBg ? "center" : undefined,
          backgroundAttachment: customBg ? "fixed" : undefined,
        }}
      >
        {!isLight && !customBg && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            <div className="absolute w-72 h-72 rounded-full blur-3xl opacity-[0.12] bg-emerald-500" style={{ top: "-5%", right: "-15%", animation: "floatBlob1 18s ease-in-out infinite" }} />
            <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-[0.10] bg-sky-500" style={{ top: "35%", left: "-20%", animation: "floatBlob2 22s ease-in-out infinite" }} />
            <div className="absolute w-56 h-56 rounded-full blur-3xl opacity-[0.09] bg-amber-500" style={{ bottom: "5%", right: "-10%", animation: "floatBlob3 26s ease-in-out infinite" }} />
            <div className="absolute inset-0 tech-grid opacity-[0.35]" />
          </div>
        )}
        <style>{`
          /* Heebo font is loaded via <link> in index.html, not @import, for performance */
          @keyframes floatBlob1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%      { transform: translate(-30px, 40px) scale(1.15); }
          }
          @keyframes floatBlob2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%      { transform: translate(25px, -35px) scale(1.1); }
          }
          @keyframes floatBlob3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50%      { transform: translate(-20px, -25px) scale(1.2); }
          }
          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 6px 1px var(--glow-strong), 0 0 18px 4px var(--glow-soft); }
            50%      { box-shadow: 0 0 14px 3px var(--glow-strong), 0 0 34px 8px var(--glow-soft); }
          }
          .glow-btn {
            background-color: #000;
            animation: glowPulse 2.2s ease-in-out infinite;
          }
          .glow-pulse {
            animation: glowPulse 2.2s ease-in-out infinite;
          }
          .tech-grid {
            background-image: linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px);
            background-size: 18px 18px;
          }
          .tech-corners {
            position: relative;
          }
          .tech-corners::before, .tech-corners::after {
            content: '';
            position: absolute;
            width: 10px;
            height: 10px;
            border-color: inherit;
            pointer-events: none;
          }
          .tech-corners::before {
            top: -1px; right: -1px;
            border-top: 2px solid; border-right: 2px solid;
          }
          .tech-corners::after {
            bottom: -1px; left: -1px;
            border-bottom: 2px solid; border-left: 2px solid;
          }
          @keyframes tabFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .tab-fade {
            animation: tabFadeIn 0.2s ease-out;
          }

          /* ===== Light theme overrides (freshly re-scanned against every class in the file) ===== */
          .light-theme [class~="bg-black"] { background-color: #ffffff !important; }
          .light-theme [class~="bg-black/30"] { background-color: rgba(0,0,0,0.12) !important; }
          .light-theme [class~="bg-black/60"] { background-color: rgba(255,255,255,0.9) !important; }
          .light-theme [class~="bg-black/70"] { background-color: rgba(255,255,255,0.92) !important; }
          .light-theme [class~="bg-black/80"] { background-color: rgba(255,255,255,0.94) !important; }
          .light-theme [class~="bg-black/90"] { background-color: rgba(255,255,255,0.96) !important; }
          .light-theme [class~="bg-zinc-700"] { background-color: #cbd5e1 !important; }
          .light-theme [class~="bg-zinc-800"] { background-color: #e2e8f0 !important; }
          .light-theme [class~="bg-zinc-900"] { background-color: #ffffff !important; }
          .light-theme [class~="bg-zinc-900/40"] { background-color: rgba(241,245,249,0.75) !important; }
          .light-theme [class~="bg-zinc-900/60"] { background-color: rgba(248,250,252,0.9) !important; }
          .light-theme [class~="bg-zinc-900/70"] { background-color: rgba(255,255,255,0.92) !important; }
          .light-theme [class~="bg-zinc-900/80"] { background-color: rgba(255,255,255,0.95) !important; }
          .light-theme [class~="bg-zinc-950"] { background-color: #f1f5f9 !important; }
          .light-theme [class~="border-zinc-600"] { border-color: #cbd5e1 !important; }
          .light-theme [class~="border-zinc-700"] { border-color: #cbd5e1 !important; }
          .light-theme [class~="border-zinc-800"] { border-color: #e2e8f0 !important; }
          .light-theme [class~="border-zinc-800/60"] { border-color: rgba(226,232,240,0.8) !important; }
          .light-theme [class~="border-zinc-800/80"] { border-color: rgba(226,232,240,0.9) !important; }
          .light-theme [class~="border-zinc-900"] { border-color: #e2e8f0 !important; }
          .light-theme [class~="text-zinc-50"] { color: #000000 !important; }
          .light-theme [class~="text-zinc-100"] { color: #000000 !important; }
          .light-theme [class~="text-zinc-200"] { color: #111111 !important; }
          .light-theme [class~="text-zinc-300"] { color: #1f1f1f !important; }
          .light-theme [class~="text-zinc-400"] { color: #3f3f46 !important; }
          .light-theme [class~="text-zinc-500"] { color: #52525b !important; }
          .light-theme [class~="text-zinc-600"] { color: #71717a !important; }
          .light-theme [class~="text-zinc-700"] { color: #a1a1aa !important; }
          .light-theme [class~="placeholder-zinc-600"]::placeholder { color: #a1a1aa !important; }
          .light-theme [class~="shadow-black"] { --tw-shadow-color: rgba(0,0,0,0.08) !important; }
          .light-theme [class~="shadow-black/50"] { --tw-shadow-color: rgba(0,0,0,0.08) !important; }
        `}</style>
        {authState === "intro" && <IntroCarousel onDone={() => setAuthState("auth")} />}
        {authState === "auth" && <AuthScreen onAuthed={handleAuthed} showToast={showToast} />}
        {authState === "onboarding" && currentUser && <OnboardingFlow user={currentUser} onDone={handleOnboardingDone} showToast={showToast} />}
        {authState === "app" && currentUser && (
          <>
            <AppHeader user={currentUser} />
            <div key={activeTab} ref={mainScrollRef} className="flex-1 overflow-y-auto tab-fade">
              {activeTab === "home" && (
                <HomeTab
                  warMode={Boolean(currentUser.profile?.warMode)}
                  goToWarChat={() => setActiveTab("chat")}
                  officialEvents={officialEvents}
                  personalLogs={personalLogs}
                  goToHub={() => setActiveTab("hub")}
                  goToFitness={() => setActiveTab("fitness")}
                  goToProfile={() => setActiveTab("profile")}
                  goToFeedback={() => setActiveTab("feedback")}
                  goToCalendar={() => setActiveTab("calendar")}
                  role={currentUser.role}
                  trainingContent={trainingContent}
                  profile={currentUser.profile}
                  showToast={showToast}
                  userId={currentUser.id}
                  removePersonalLog={removePersonalLog}
                  updateProfile={updateProfile}
                  resetSignal={tabResetSignal}
                  scrollToTop={scrollContentToTop}
                />
              )}
              {activeTab === "calendar" && (
                <CalendarTab
                  officialEvents={officialEvents}
                  personalLogs={personalLogs}
                  addPersonalLog={addPersonalLog}
                  removePersonalLog={removePersonalLog}
                  updatePersonalLog={updatePersonalLog}
                  profile={currentUser.profile}
                  onSetGibushDate={setGibushDate}
                  userId={currentUser.id}
                  trainingContent={trainingContent}
                  resetSignal={tabResetSignal}
                  scrollToTop={scrollContentToTop}
                />
              )}
              {activeTab === "chat" && <ChatTab warMode={Boolean(currentUser.profile?.warMode)} showToast={showToast} profile={currentUser.profile} />}
              {activeTab === "hub" && <HubTab articles={articles} profile={currentUser.profile} resetSignal={tabResetSignal} scrollToTop={scrollContentToTop} />}
              {activeTab === "fitness" && <FitnessTab userId={currentUser.id} showToast={showToast} />}
              {activeTab === "profile" && <ProfileTab user={currentUser} setCurrentUser={setCurrentUser} showToast={showToast} onLogout={handleLogout} goBack={() => setActiveTab("home")} />}
              {activeTab === "attendance" && currentUser.role === "team_leader" && <AttendanceTab users={users} currentUser={currentUser} officialEvents={officialEvents} showToast={showToast} />}
              {activeTab === "coach_home" && currentUser.role === "admin" && (
                <CoachHomeTab users={users} toggleTeamLeader={toggleTeamLeader} toggleAdmin={toggleAdmin} addOfficialEvent={addOfficialEvent} officialEvents={officialEvents} removeOfficialEvent={removeOfficialEvent} showToast={showToast} onLogout={handleLogout} />
              )}
              {activeTab === "coach_calendars" && currentUser.role === "admin" && <CoachCalendarsTab users={users} />}
              {activeTab === "coach_feedback" && currentUser.role === "admin" && (
                <CoachFeedbackTab users={users} officialEvents={officialEvents} showToast={showToast} />
              )}
              {activeTab === "coach_content" && currentUser.role === "admin" && (
                <CoachContentTab addArticle={addArticle} addContent={addContent} showToast={showToast} />
              )}
              {activeTab === "feedback" && (
                <FeedbackTab currentUser={currentUser} officialEvents={officialEvents} showToast={showToast} onBack={() => setActiveTab("home")} />
              )}
            </div>
            {activeTab !== "feedback" && <BottomNav tabs={tabs} active={activeTab} setActive={setActiveTab} onSameTabClick={() => setTabResetSignal((n) => n + 1)} />}
          </>
        )}
        <Toast toast={toast} />
      </div>
    </div>
  );
}
