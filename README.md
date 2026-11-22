# Research Use Only Group Buy Platform (Demo Mode)

> This scaffold ships in **client-side demo mode** using localStorage to simulate a database. Every store function here maps 1:1 to a SQL query — swap these for PostgreSQL when you connect to a DB.

A tiered group-buy website for research-use-only peptide products, with adjustable countdowns, deposit tracking, and multiple payment rails (Stripe + crypto/cash fallback).

## Features

- **Tiered pricing**: Admin sets discount tiers based on total kits committed across participants
- **Deposit system**: $20 flat deposit per participant; final payment due within configurable window
- **Multiple fulfillment modes**: Direct shipment or admin collection after testing
- **Payment rails**: Stripe (primary), Crypto (USDC fallback), Cash App manual route
- **Live countdown timers** on all active group buy pages
- **Admin panel**: Create/edit buys, view participants + payment states, export orders to CSV for supplier

## Research Use Only Disclaimer

Every page includes a prominent RUO banner and footer. The site is intentionally designed with no dosing instructions or health claims.

---

## Quick Start (Demo Mode — No Server Required)

```bash
cd groupbuy && npm install && npm run dev
```

Visit:
- `http://localhost:3000` — public landing page with example active group buys and countdowns
- `http://localhost:3000/admin` — admin panel to create/edit buys, view participants, handle refunds/shipments

> Demo mode uses localStorage, so data persists across page reloads in your browser. No database or server required for initial testing.

---

## Hosting Options

### Option 1: GitHub + Vercel (Recommended)

**Step 1 — Push to GitHub:**
```bash
git init
git add -A
git commit -m "Initial commit"
# Create a repo on github.com and push:
git remote add origin https://github.com/YOUR_USERNAME/groupbuy.git
git branch -M main
git push -u origin main
```

**Step 2 — Deploy to Vercel:**
1. Go to [vercel.com](https://vercel.com) and connect your GitHub account
2. Import the `groupbuy` repository
3. Vercel will auto-detect Next.js; set:
   - Build command: `npm run build`
   - Output directory: `.next`
4. Deploy! You'll get a production URL like `https://groupbuy.vercel.app`.

**Step 3 — Add Cloudflare as CDN (optional):**
1. Go to [cloudflare.com](https://cloudflare.com) and add your Vercel domain as a custom hostname
2. Set up SSL/TLS: Flexible or Full (recommended: Full if you have a valid certificate)
3. Proxy status: Proxied ✓ (for CDN caching)

---

### Option 2: GitHub Pages + Cloudflare Pages

**Step 1 — Enable GitHub Actions workflow:**
After pushing to main, enable the `.github/workflows/deploy.yml` workflow in your repo settings.

**Step 2 — Deploy via Vercel action or manual build:**
Alternatively, create a `pages.yml` workflow that builds and uploads artifacts to Cloudflare Pages:

```bash
# After push, visit https://pages.github.com/ for manual deployment or enable the workflow
```

---

### Option 3: Railway (with PostgreSQL)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app), connect your GitHub account
3. Select "Deploy from GitHub repo" → choose your `groupbuy` repo
4. Add environment variables: `DATABASE_URL`, `STRIPE_SECRET_KEY`, etc.
5. Railway will auto-detect Dockerfile and deploy

---

## Environment Variables

Copy `.env.example` to `.env.local` for development (never commit `.env.local`):

```bash
cp .env.example .env.local
```

Required keys:
- `STRIPE_SECRET_KEY` — from Stripe Dashboard > Developers > API keys
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — same dashboard, publishable keys
- `DATABASE_URL` — optional (only needed when migrating to PostgreSQL)
- `NEXT_PUBLIC_CRYPTOWALLET_ADDRESS` — optional fallback rail
- `NEXT_PUBLIC_CASHAPP_CASHTAG` — optional manual route

---

## Development Workflow

1. Start dev server:
   ```bash
   npm install && npm run dev
   ```
2. Visit `http://localhost:3000` to see the site live with demo data
3. Test flows: Register → Join a buy → Pay deposit (mock) → View dashboard → Admin panel

---

## Demo Mode vs Production Path

This scaffold runs **entirely client-side** using localStorage to simulate a database:

- Buys, participants, deposits/final payments all live in your browser
- No server required for development; data persists across page reloads in the same browser

### To go production (connect PostgreSQL + Stripe)

1. Run `psql -f db/schema.sql` against your PostgreSQL instance to create tables
2. Set `DATABASE_URL`, `STRIPE_SECRET_KEY`, etc., in `.env.local`
3. Configure Stripe webhook endpoints (`checkout.session.completed`) on your server
4. Migrate client store calls in `src/lib/store.ts` with server-side DB queries using an ORM (e.g., Prisma/Drizzle)

The UI stays unchanged — only the data layer swaps out.

---

## Payment Flow Overview

1. **Deposit (signup):** User pays $20 via Stripe Checkout (or crypto/cash fallback). Deposit status recorded in `deposits` table.
2. **Countdown:** The buy's countdown timer runs; participants can add kits until close.
3. **Buy closes / Final payment window ends:** Remaining balance is due within the configured duration. If not paid, deposit becomes forfeited or refunded per policy (currently: non-refundable unless buy fails minimum).
4. **Final payment:** User pays remaining balance via Stripe Checkout session (`final-payment/success` page on completion).
5. **Shipping / Tracking:** Admin exports CSV for direct fulfillment mode; records tracking numbers in `shipments` table.

---

## License & Legal

This software is provided as-is for a research-use-only group buy platform. All products remain strictly RUO and must comply with local laws. Review Terms of Service, Privacy Policy, and refund policies with legal counsel before launch.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Payments:** Stripe Checkout + fallback rails (crypto/cash app)
- **Database:** PostgreSQL (demo mode uses localStorage)
- **Hosting:** Vercel / Railway / GitHub Pages
- **CDN:** Cloudflare (optional but recommended for security & performance)
