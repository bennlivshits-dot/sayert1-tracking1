// ⚙️ הדביקו כאן את המפתחות שלכם - זה הדבר היחיד שצריך לערוך בכל הפרויקט.
// כל שאר הקוד כבר מחובר למשתנים האלה ולא דורש שום שינוי נוסף.
//
// ⚠️ אבטחה: SUPABASE_URL ו-SUPABASE_ANON_KEY בטוחים לחלוטין להיות גלויים בקוד -
// כך בדיוק Supabase אמור לעבוד בצד לקוח, ההגנה האמיתית היא ב-RLS בבסיס הנתונים.
//
// GEMINI_API_KEY מושאר ריק בכוונה - המפתח לא נמצא כאן בכלל. הוא שמור בצד השרת
// בטבלת system_settings (שאין לה שום מדיניות RLS - אף תפקיד לקוח לא יכול לקרוא
// ממנה), ונקרא רק מתוך ה-Edge Function ב-supabase/functions/gemini-chat/. הקוד
// כבר בנוי לזהות שהמפתח כאן ריק ולעבור אוטומטית לקרוא ל-Edge Function הזה במקום.
// אל תדביקו כאן מפתח Gemini אמיתי - זה בדיוק מה שרצינו להימנע ממנו.

const SUPABASE_URL = 'https://sxcyfjhuacuzybxgoxtp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_IKn546qB_JNQPom0YyxhIg_HoUpmQQ-';
const GEMINI_API_KEY = '';

const NETWORK_CODE = '12131415';

export { SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY, NETWORK_CODE };
