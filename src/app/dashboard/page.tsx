'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Buy,
  Registration,
  currentUser,
  getBuy,
  getRegistrations,
  patchRegistration,
  remainingBalance,
  effectivePricePerKit,
  finalPaymentDueAt,
  logout,
} from '@/lib/store';
import { useCountdown, formatCountdown } from '@/lib/use-countdown';
import { MockCheckout } from '@/components/pages/MockCheckout';

function StatusBadge({ reg }: { reg: Registration }) {
  if (reg.finalPaidAt) return <span className="text-xs font-bold bg-green-600 text-white px-2.5 py-1 rounded-full">PAID IN FULL ✓</span>;
  if (reg.depositPaidAt) return <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-full">DEPOSIT PAID ✓</span>;
  return <span className="text-xs font-bold bg-red-600 text-white px-2.5 py-1 rounded-full">NO PAYMENT</span>;
}

function MyOrderCard({ buy, reg }: { buy: Buy; reg: Registration }) {
  const [balanceOpen, setBalanceOpen] = useState(false);
  const dueCountdown = useCountdown(finalPaymentDueAt(buy));
  const price = effectivePricePerKit(buy);

  return (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      {/* Username with status badge next to it */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-lg font-bold text-gray-900">{reg.username}</span>
        <StatusBadge reg={reg} />
        {reg.trackingNumber && (
          <span className="text-xs bg-gray-100 border rounded-full px-3 py-1 font-mono">📦 {reg.trackingNumber}</span>
        )}
      </div>

      <p className="font-semibold text-indigo-700">{buy.name}</p>
      <p className="text-sm text-gray-500 mb-4">{buy.product}</p>

      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Kits</p>
          <p className="font-bold">{reg.kits} × ${price.toFixed(2)}/kit</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Deposit (${buy.depositAmount}.00)</p>
          <p className={`font-bold ${reg.depositPaidAt ? 'text-green-700' : 'text-red-600'}`}>
            {reg.depositPaidAt ? 'PAID ✓' : 'NOT PAID'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Final payment</p>
          {reg.finalPaidAt ? (
            <p className="font-bold text-green-700">PAID ✓ — awaiting fulfillment</p>
          ) : (
            <>
              <p className="font-bold text-orange-600">${remainingBalance(reg, buy).toFixed(2)} due</p>
              <p className="text-xs text-gray-500 mt-1">in {formatCountdown(dueCountdown)}</p>
            </>
          )}
        </div>
      </div>

      {!reg.finalPaidAt && (
        <button
          onClick={() => setBalanceOpen(true)}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-8 rounded-lg shadow"
        >
          Pay Balance — ${remainingBalance(reg, buy).toFixed(2)} (incl. shipping)
        </button>
      )}

      {balanceOpen && (
        <MockCheckout
          title={`Final Balance — ${buy.name}`}
          amount={remainingBalance(reg, buy)}
          note="Includes the $10 per-person shipping fee."
          onClose={() => setBalanceOpen(false)}
          onComplete={() => {
            patchRegistration(reg.id, { finalPaidAt: Date.now() });
            setBalanceOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<string | null>(null);
  const [regs, setRegs] = useState<Registration[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const u = currentUser();
    setUser(u);
    if (u) setRegs(getRegistrations().filter((r) => r.username === u));
    setLoaded(true);
  }, []);

  const ordersWithBuys = useMemo(
    () =>
      regs
        .map((reg) => ({ reg, buy: getBuy(reg.buyId) }))
        .filter((x): x is { reg: Registration; buy: Buy } => !!x.buy),
    [regs]
  );

  if (!loaded) return <p className="text-center text-gray-500 py-20">Loading…</p>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">My Orders</h1>
        <p className="text-gray-600 mb-5">Log in to see your reservations, payment status, and tracking.</p>
        <div className="flex justify-center gap-3">
          <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg">Log In</Link>
          <Link href="/register" className="border border-gray-400 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 rounded-lg">Register</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">My Orders — {user}</h1>
        <button
          onClick={() => { logoutAndRedirect(); }}
          className="text-sm text-gray-500 hover:text-red-600 underline"
        >
          Log out
        </button>
      </div>

      {ordersWithBuys.length === 0 ? (
        <div className="bg-white border rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-600 mb-4">You haven't joined any group buys yet.</p>
          <Link href="/" className="text-indigo-600 hover:underline font-medium">Browse active buys →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {ordersWithBuys.map(({ reg, buy }) => (
            <MyOrderCard key={reg.id} buy={buy} reg={reg} />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-8">
        Reminder: all products are research use only — not for human consumption. Deposits are forfeited if the final payment window expires unpaid.
      </p>
    </div>
  );
}

function logoutAndRedirect() {
  logout();
  window.location.href = '/';
}
