# Security Configuration Guide (Cloudflare + Vercel/Railway)

## Cloudflare Setup (Recommended CDN & DDoS Protection)

### 1. Add Your Domain to Cloudflare
- Go to [cloudflare.com](https://cloudflare.com) and add your domain or subdomain (e.g., `groupbuy.yourdomain.com`)
- DNS propagation: ~5–15 minutes; update A/CNAME records pointing to Vercel/Railway

### 2. SSL/TLS Settings
- **Mode:** Full (strict) — recommended for production with valid certificates
- Cloudflare will automatically issue Let's Encrypt certificates if you use `.vercel.app` or custom domains

### 3. Security Headers (Automatically applied by Vercel + optional Cloudflare rules)
```yaml
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self' script-src 'self' style-src 'self' img-src 'self' data: https:
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

### 4. WAF Rules (Optional)
- Block suspicious IP ranges via Cloudflare > Firewall > WAF rules
- Enable "Under Attack" mode temporarily if you experience brute-force attempts on admin panel

### 5. Cache Settings
- **Cache Everything:** Enabled for static assets; dynamic routes (`/buy/[id]`, `/dashboard`) excluded
- Configure cache rules in Cloudflare > Cache Zone settings to exclude:
  - URLs containing `/admin` or `/api`
  - Query params like `?session_id=...`

### 6. Performance Settings
- Enable **Auto Minify** for HTML, CSS, JS (Next.js builds already optimized)
- Enable **Rocket Loader** if your site uses many dynamic scripts
- Configure **Browser Caching** to Cache Everything with a max age of 1 month for static assets

---

## Stripe Security Best Practices

### Webhook Verification
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourvercelapp.com/api/stripe/webhook` (replace with your actual domain)
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Verify webhook signature on the server using `stripe.webhooks.constructEvent()`

### Never Store Keys in Client-Side Code
- Keep `STRIPE_SECRET_KEY` and other sensitive keys in `.env.local` (never commit)
- Use Vercel/Railway environment variables for production deployments

---

## Demo Mode Security Notes

When running in demo mode (localStorage):
- Sensitive data like passwords are stored unencrypted — **do not deploy this to public without migrating to PostgreSQL + hashed passwords**
- For testing only: use `.env.local` to disable demo features and enable real payments

### Before Launch Checklist
- [ ] Remove or password-protect any debug/admin endpoints
- [ ] Set `DATABASE_URL` for production DB (migrate away from localStorage)
- [ ] Hash all user passwords on server-side before commit
- [ ] Enable rate limiting on admin routes (`/admin/*`) via middleware
- [ ] Review and tighten CSP headers in Cloudflare
