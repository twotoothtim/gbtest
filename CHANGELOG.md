# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Tiered pricing system with configurable discount tiers (10, 25, 50 kits thresholds)
- Deposit tracking ($20 flat per participant) with Stripe Checkout mock flow
- Crypto fallback rail (USDC on Solana/ERC20) and Cash App manual route
- Admin panel: create/edit group buys, view participants, extend countdowns, export orders to CSV
- Live countdown timers for buy deadlines and final payment windows
- Direct vs. collection fulfillment modes with tracking support

### Changed
- Rewrote store layer to use localStorage in demo mode (maps 1:1 to PostgreSQL schema)
- Updated README with comprehensive hosting instructions (GitHub + Vercel, Railway, Cloudflare Pages)
- Added security headers and CSP configuration for Cloudflare CDN

### Fixed
- Buy detail page now shows current tier price dynamically based on total kits committed
- Dashboard displays deposit/final-payment status badges next to usernames
- Admin panel participant rows show "DEPOSIT PAID ✓" / "FINAL PAYMENT MISSING" indicators

## [0.1.0] — Initial Release (2025)

### Added
- Landing page with hero, active buys grid, and how-it-works section
- Buy detail pages with tier table, countdowns, and join flow
- User dashboard for order tracking
- Admin panel for managing group buys and shipments
- Preview HTML file for static testing without installing dependencies
