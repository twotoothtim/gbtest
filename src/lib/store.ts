// Demo-mode data layer backed by localStorage.
// Every function here maps 1:1 to a database query — when PostgreSQL + Stripe
// are connected, replace the bodies with API calls and the UI stays unchanged.

export interface Tier {
  minKits: number;          // total committed kits required for this tier
  pricePerKit: number;      // unit price at this tier
}

export interface Buy {
  id: string;
  name: string;
  product: string;          // e.g. "Retatrutide (10 x 3mL vials @ 10mg/vial)"
  description: string;
  fulfillmentMode: 'direct' | 'collection';
  collectionAddress?: string;
  tiers: Tier[];            // sorted ascending by minKits
  depositAmount: number;    // $20 flat signup deposit
  shippingFee: number;      // $10 per person, paid with final payment
  finalPaymentWindowHours: number; // window after close to pay balance (default 24h)
  deadline: number;         // epoch ms — adjustable from admin panel
  status: 'open' | 'closed';
}

export interface Registration {
  id: string;
  buyId: string;
  username: string;
  kits: number;
  depositPaidAt?: number;   // timestamp the $20 deposit cleared
  finalPaidAt?: number;     // timestamp the balance cleared
  trackingNumber?: string;
  createdAt: number;
}

interface Account {
  username: string;
  email: string;
  password: string; // demo only — real deployment uses hashed passwords (bcrypt) server-side
}

const BUYS_KEY = 'gb_buys_v1';
const REGS_KEY = 'gb_regs_v1';
const USERS_KEY = 'gb_users_v1';
const SESSION_KEY = 'gb_session_v1';

function isBrowser() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full / private mode — demo continues in-memory only
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

// ---------------------------------------------------------------------------
// Seeds: two example buys so the site is never empty.
// ---------------------------------------------------------------------------
function seedBuys(): Buy[] {
  const now = Date.now();
  return [
    {
      id: 'retatrutide-open',
      name: 'Retatrutide Open Buy — Batch #12',
      product: 'Retatrutide (10 x 3mL vials, 10mg per vial)',
      description:
        'Research-grade retatrutide for laboratory use only. Kits ship cold-packed with COA on request.',
      fulfillmentMode: 'direct',
      tiers: [
        { minKits: 1, pricePerKit: 120 },
        { minKits: 10, pricePerKit: 115 },
        { minKits: 25, pricePerKit: 110 },
        { minKits: 50, pricePerKit: 108 },
      ],
      depositAmount: 20,
      shippingFee: 10,
      finalPaymentWindowHours: 24,
      deadline: now + 48 * 3600000, // opens with a 48h signup window (admin-adjustable)
      status: 'open',
    },
    {
      id: 'semaglutide-open',
      name: 'Semaglutide Research Buy — Batch #7',
      product: 'Semaglutide (10 x 3mL vials, 1mg per vial)',
      description:
        'Research-use-only semaglutide. Admin collects the batch for testing, then distributes to purchasers.',
      fulfillmentMode: 'collection',
      collectionAddress: 'Lab pickup — address shared after final payment clears',
      tiers: [
        { minKits: 1, pricePerKit: 95 },
        { minKits: 10, pricePerKit: 92 },
        { minKits: 25, pricePerKit: 88 },
        { minKits: 40, pricePerKit: 86 },
      ],
      depositAmount: 20,
      shippingFee: 10,
      finalPaymentWindowHours: 24,
      deadline: now + 36 * 3600000,
      status: 'open',
    },
  ];
}

export function getBuys(): Buy[] {
  let buys = read<Buy[]>(BUYS_KEY, []);
  if (buys.length === 0) {
    buys = seedBuys();
    write(BUYS_KEY, buys);
  }
  return buys;
}

export function getBuy(id: string): Buy | undefined {
  return getBuys().find((b) => b.id === id);
}

export function createBuy(buy: Omit<Buy, 'id'>): Buy {
  const next = { ...buy, id: uid() };
  write(BUYS_KEY, [...getBuys(), next]);
  return next;
}

export function updateBuy(id: string, patch: Partial<Buy>): void {
  write(
    BUYS_KEY,
    getBuys().map((b) => (b.id === id ? { ...b, ...patch } : b))
  );
}

// ---------------------------------------------------------------------------
// Pricing helpers
// ---------------------------------------------------------------------------
export function totalKitsForBuy(buyId: string): number {
  return getRegistrations(buyId).reduce((sum, r) => sum + r.kits, 0);
}

/** Best (lowest) tier price unlocked by current total commitment. */
export function effectivePricePerKit(buy: Buy): number {
  const committed = totalKitsForBuy(buy.id);
  let price = buy.tiers[0]?.pricePerKit ?? 0;
  for (const t of [...buy.tiers].sort((a, b) => a.minKits - b.minKits)) {
    if (committed >= t.minKits) price = t.pricePerKit;
  }
  return price;
}

/** Next tier the buy is working toward, or null when top tier reached. */
export function nextTierForBuy(buy: Buy): Tier | null {
  const committed = totalKitsForBuy(buy.id);
  const sorted = [...buy.tiers].sort((a, b) => a.minKits - b.minKits);
  return sorted.find((t) => t.minKits > committed) ?? null;
}

/** Remaining balance for one registration at the current tier price. */
export function remainingBalance(reg: Registration, buy: Buy): number {
  const perKit = effectivePricePerKit(buy);
  return Math.max(0, reg.kits * perKit + buy.shippingFee - buy.depositAmount);
}

/** When must the balance be paid? (deadline + admin-set window) */
export function finalPaymentDueAt(buy: Buy): number {
  return buy.deadline + buy.finalPaymentWindowHours * 3600000;
}

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------
export function getRegistrations(buyId?: string): Registration[] {
  const all = read<Registration[]>(REGS_KEY, []);
  return buyId ? all.filter((r) => r.buyId === buyId) : all;
}

export function addRegistration(
  buyId: string,
  username: string,
  kits: number
): Registration {
  const reg: Registration = {
    id: uid(),
    buyId,
    username,
    kits,
    createdAt: Date.now(),
  };
  write(REGS_KEY, [...getRegistrations(), reg]);
  return reg;
}

export function patchRegistration(id: string, patch: Partial<Registration>): void {
  write(
    REGS_KEY,
    getRegistrations().map((r) => (r.id === id ? { ...r, ...patch } : r))
  );
}

// ---------------------------------------------------------------------------
// Demo auth (replace with real server-side sessions later)
// ---------------------------------------------------------------------------
export function registerUser(
  username: string,
  email: string,
  password: string
): { ok: boolean; error?: string } {
  const users = read<Account[]>(USERS_KEY, []);
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: 'Username already taken.' };
  }
  users.push({ username, email, password });
  write(USERS_KEY, users);
  write(SESSION_KEY, username);
  return { ok: true };
}

export function loginUser(
  username: string,
  password: string
): { ok: boolean; error?: string } {
  const users = read<Account[]>(USERS_KEY, []);
  const match = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  if (!match) return { ok: false, error: 'Invalid credentials.' };
  write(SESSION_KEY, match.username);
  return { ok: true };
}

export function currentUser(): string | null {
  return read<string | null>(SESSION_KEY, null);
}

export function logout(): void {
  if (isBrowser()) window.localStorage.removeItem(SESSION_KEY);
}
