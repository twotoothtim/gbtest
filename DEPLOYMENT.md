# Deployment Checklist (GitHub + Cloudflare)

## Pre-Deployment Checklist

### 1. Code Review ✅
- [ ] All changes tested in demo mode (`npm run dev`)
- [ ] No sensitive keys committed to Git (`.env.local` excluded by `.gitignore`)
- [ ] Test files pass: `npm test`
- [ ] Linting passes: `npm run lint`

### 2. Demo Mode vs Production ✅
- [ ] Confirm you're deploying demo mode (localStorage) OR production mode (PostgreSQL + Stripe webhooks configured)
- [ ] If using production, verify:
  - `DATABASE_URL` is set in hosting platform's environment variables
  - Password hashing implemented server-side (not demo mode behavior)
  - Webhook endpoint for Stripe registered at `/api/stripe/webhook`

### 3. GitHub Repository Setup ✅
- [ ] Create a new repo on GitHub (e.g., `groupbuy`)
- [ ] Push code:
  ```bash
  git init
  git add -A
  git commit -m "Initial scaffold for group buy platform"
  # Add remote and push to main branch
  git remote add origin https://github.com/YOUR_USERNAME/groupbuy.git
  git branch -M main
  git push -u origin main
  ```

### 4. Vercel Deployment ✅
- [ ] Go to [vercel.com](https://vercel.com) and import your GitHub repo
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Deploy! You'll get a production URL like `https://groupbuy.vercel.app`

### 5. Cloudflare CDN Configuration ✅
- [ ] Go to [cloudflare.com](https://cloudflare.com) and add your domain (e.g., `groupbuy.yourdomain.com`)
- **DNS Records:**
  - A record: `@` → Vercel IP addresses or Railway URL
  - CNAME record: If using subdomain (`groupbuy.yourdomain.com`)
- [ ] SSL/TLS Mode: Full (strict) — recommended with valid certificates
- [ ] Proxy Status: Proxied ✓ (for CDN caching)

### 6. Cloudflare Security Settings ✅
- **Security Headers:**
  ```yaml
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self' script-src 'self' style-src 'self' img-src 'self' data: https:
  X-Frame-Options: DENY
  ```
- **WAF Rules:** Enable rate limiting and block suspicious IP ranges if needed
- **Cache Settings:** Cache static assets with appropriate TTL; exclude admin/API routes

### 7. Production Database Migration (Optional) ✅
If moving from demo mode to production PostgreSQL:
1. Run `psql -f db/schema.sql` against your database instance
2. Update `.env.local` with `DATABASE_URL`
3. Migrate store calls in `src/lib/store.ts` to use server-side queries
4. Test payment flows end-to-end with real Stripe keys

---

## Post-Deployment Verification

After deploying, test these pages on production:

1. **Landing Page:** `https://yourdomain.com/` — verify active buys grid and countdowns live
2. **Buy Detail:** `https://yourdomain.com/buy/[id]` — join flow works correctly
3. **Dashboard:** `https://yourdomain.com/dashboard` — order status badges display
4. **Admin Panel:** `https://yourdomain.com/admin` — create/edit buys, view participants
5. **Deposit Payment:** Complete mock checkout or Stripe payment (if configured)
6. **Final Payment:** Balance payment flow works end-to-end

---

## Troubleshooting

### Build Fails on Vercel/Railway
- Ensure `node_modules/` is excluded by `.gitignore`
- Run `npm install` locally and verify all dependencies are in the repo
- Check that build command matches: `npm run build` (in vercel.json)

### Deployment Not Picking Up Changes
- Push code to main branch
- Clear Cloudflare cache (if proxied): Toggle "Cache Everything" off/on
- Re-deploy via Vercel/Railway dashboard or GitHub Actions workflow

### Stripe Webhooks Failing
- Verify webhook endpoint is accessible from `api.stripe.com`
- Check that event payload signature matches expected secret key
- Add test event to Stripe Dashboard and monitor logs

---

## Next Steps After Deployment

1. **Set up email service** (optional): For final payment reminders, shipment notifications
2. **Add Terms of Service & Privacy Policy pages**: Required by Stripe/PayPal compliance
3. **Configure admin authentication**: Protect `/admin/*` routes behind middleware
4. **Export order CSV for supplier**: Test the export functionality before go-live

---

## Support Contacts

- **Vercel Docs:** https://vercel.com/docs
- **Cloudflare Docs:** https://developers.cloudflare.com/
- **Stripe Webhooks:** https://stripe.com/docs/webhooks
- **GitHub Actions:** https://docs.github.com/actions
