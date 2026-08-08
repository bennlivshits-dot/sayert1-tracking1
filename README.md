# SayertTracking

Combat-fitness training tracker for IDF pre-military prep - calendar, AI coach chat, training bank, attendance, and network management.

## Deploy to GitHub Pages (primary setup)

1. **Paste your keys into `src/config.js`** - the only file you need to edit. Replace the three placeholder strings with your real Supabase URL, Supabase anon key, and Gemini API key.
   - ⚠️ This file gets committed to your repo with your real keys in it (unlike Netlify's env vars, GitHub Pages has no separate secrets system for static builds - the workflow needs the file present to build with it). The Supabase URL/anon key are safe to expose this way by design. The Gemini key is not - if your repo is public, that key is public. Use a private repo if that matters to you (available on GitHub's free plan).
2. Push this folder to a GitHub repo.
3. In the repo: **Settings -> Pages -> Build and deployment -> Source: GitHub Actions**. That's it - `.github/workflows/deploy.yml` is already set up to build and deploy automatically on every push to `main`.
4. Your site will be live at `https://your-username.github.io/your-repo-name/`.

## Before your first real deploy

1. **Run `supabase-full-schema.sql`** in your Supabase SQL editor - this is the complete schema (every table, every RLS policy, both RPCs, the signup trigger, seed data for the network and 12 teams). Safe to run on a fresh project top to bottom.
2. Sign up once through the app with your own email, then run the one-line bootstrap command at the bottom of that SQL file to make your account the first admin - or just use the coach code from inside the app.
3. From then on, promote anyone else to admin or team leader directly from the app's Management tab.

## Gemini key: two options

**Simple (default):** paste your key into `src/config.js`. Works immediately, no extra setup. The tradeoff: that key is visible to anyone who can see your deployed site's source - fine for a private repo, worth knowing for a public one.

**More secure (optional):** leave `GEMINI_API_KEY` blank in `config.js`, and instead:
1. In `supabase-full-schema.sql`, find the commented-out line under `SYSTEM SETTINGS` and run it with your real key: `insert into system_settings (key, value) values ('gemini_api_key', 'your-real-key');`
2. Deploy the Edge Function: `supabase functions deploy gemini-chat` (from `supabase/functions/gemini-chat/`).
3. That's it - the app already knows to fall back to this Edge Function automatically whenever `config.js` has no Gemini key. The key now lives only in `system_settings`, which has zero RLS policies - no client role, not even an admin, can read it back out. Only the Edge Function (using Supabase's service_role key, which never reaches the browser) can.

## Alternative: deploy to Netlify instead

If you'd rather keep secrets out of the repo entirely, Netlify's env-var system still works - `netlify.toml` is included. Leave `src/config.js` untouched (still placeholders) and instead set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`, and `VITE_NETWORK_CODE` in Netlify's dashboard (Site settings -> Environment variables). Real env vars always take priority over `config.js` if both are present, so you can use either path with the same code.

## Local development

```
npm install
npm run dev
```
Paste real values into `src/config.js` first, or the app runs in local demo mode automatically (browser storage instead of Supabase - never a blank screen either way).

## What's already wired up

- Team code verification runs server-side via the `verify_team_code` RPC - the actual codes are never in this bundle.
- Network code is required at signup and checked against the `verify_network_code` RPC once Supabase is connected.
- No admin invite code exists anywhere in this codebase - see the SQL fix for why and what replaced it.
- Local demo mode (no Supabase configured) uses the browser's own `localStorage`, not any Claude-specific API.
