# רשימת מתנות - יום הולדת ראשון של מיקה 🎈

Hebrew (RTL) wishlist site for Mika's 1st birthday. Guests can claim which gift they're bringing so no one buys duplicates. Real-time sync across all visitors.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (Heebo font, RTL)
- React Router
- Supabase (database + real-time subscriptions)
- Falls back to localStorage if Supabase env vars are missing — handy for local preview

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 — the home page lists gifts; `/admin` is the management page (password: `mika2026`).

## Connect Supabase (production)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, paste the contents of `supabase-schema.sql` and run it. This creates the `gifts` table, opens public read/write policies (trust-based, fine for a small family event), and enables realtime.
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` from your project's API settings.
4. Restart `npm run dev`.

To seed the live database with the 15 starter gifts, log in to `/admin` and add them manually, or run a one-off insert in the Supabase SQL editor using the data in `src/seed.ts`.

## Edit content

- **Title / date**: `src/components/Hero.tsx`
- **Admin password**: `ADMIN_PASSWORD` constant in `src/pages/Admin.tsx`
- **Theme colors**: `tailwind.config.js`
- **Gift list**: through `/admin` (or `src/seed.ts` for the localStorage demo)

## Deploy

Any static host works (Vercel, Netlify, Cloudflare Pages). Set the two `VITE_SUPABASE_*` env vars in the host's dashboard. `npm run build` outputs to `dist/`.
