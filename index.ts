// Deploy: supabase functions deploy gemini-chat
//
// The Gemini key is NOT in this file anywhere - that's the whole point. It's
// read from the system_settings table (which has zero RLS policies, so no
// client role can read it) using the service_role key, which Supabase injects
// automatically into every Edge Function's environment.
//
// Matches the request/response shape the frontend calls:
//   POST { systemPrompt, userText, history } -> { text }
//   history is an array of { role: "user"|"assistant", text } from earlier in the
//   same chat session - without it, every message was answered with zero memory
//   of anything said before it.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cached across requests within the same warm function instance - the Gemini key
// essentially never changes, so re-querying the database for it on every single
// chat message was pure wasted latency. Cuts a real database round-trip off most
// requests (all but the very first cold-start call after the function goes idle).
let cachedKey = null;

async function getGeminiKey() {
  if (cachedKey) return cachedKey;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );
  const { data, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "gemini_api_key")
    .single();
  if (error || !data?.value) return null;
  cachedKey = data.value;
  return cachedKey;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { systemPrompt, userText, history } = await req.json();
    if (!userText) {
      return new Response(JSON.stringify({ error: "userText is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = await getGeminiKey();
    if (!key) {
      return new Response(JSON.stringify({ error: "Gemini key not configured in system_settings" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cap history to the last 20 turns - real conversation memory without letting a
    // long-running chat session grow the request (and cost) without bound.
    const trimmedHistory = Array.isArray(history) ? history.slice(-20) : [];
    const contents = [
      ...trimmedHistory.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })),
      { role: "user", parts: [{ text: userText }] },
    ];

    async function callGemini(model) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt || "" }] },
              contents,
            }),
            signal: controller.signal,
          }
        );
        return res;
      } finally {
        clearTimeout(timeout);
      }
    }

    let geminiRes;
    try {
      geminiRes = await callGemini("gemini-3.5-flash");
      if (!geminiRes.ok) throw new Error(`status ${geminiRes.status}`);
    } catch (e) {
      // First model failed or is overloaded ("high demand") - retry on a
      // DIFFERENT model rather than hitting the same congested one again.
      // Overload is usually model-specific, not a blanket Gemini outage.
      try {
        geminiRes = await callGemini("gemini-3.1-flash-lite");
      } catch (e2) {
        return new Response(JSON.stringify({ error: "Both gemini-3.5-flash and gemini-3.1-flash-lite failed - likely a broader Gemini issue right now" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => null);
      return new Response(JSON.stringify({ error: errBody?.error?.message || `Gemini request failed (${geminiRes.status})` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה מהמאמן.";

    // Real token counts from Gemini itself - logged so actual usage can be checked
    // later, instead of estimating.
    const usage = geminiData?.usageMetadata;
    if (usage) {
      console.log(`TOKEN_USAGE prompt=${usage.promptTokenCount} output=${usage.candidatesTokenCount} total=${usage.totalTokenCount}`);
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
