'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Buy,
  Registration,
  currentUser,
  getBuy,
  getRegistrations,
  addRegistration,
  patchRegistration,
  effectivePricePerKit,
  totalKitsForBuy,
  remainingBalance,
  finalPaymentDueAt,
} from '@/lib/store';
import { useCountdown, formatCountdown } from '@/lib/use-countdown';
import { MockCheckout } from '@/components/pages/MockCheckout';

export default function BuyDetailPage() {
  const params = useParams<{ id: string }>();
  const [buy, setBuy] = useState<Buy | null>(null);
  const [regs, setRegs] = useState<Registration[]>([]);
  const [kitCount, setKitCount] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [balanceFor, setBalanceFor] = useState<Registration | null>(null);
  const [, forceRender] = useState(0);

  const user = currentUser();
  const myReg = useMemo(() => regs.find((r) => r.username === user), [regs, user]);

  useEffect(() => {
    const b = getBuy(params.id);
    setBuy(b ?? null);
    if (b) setRegs(getRegistrations(b.id));
  }, [params.id]);

  // Refresh registrations after any payment completes
  function refresh() {
    forceRender((n) => n + 1);
    if (buy) setRegs(getRegistrations(buy.id));
  }

  if (!buy) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Buy not found</h1>
        <Link href="/" className="text-indigo-600 hover:underline">← Back to active buys</Link>
      </div>
    );
  }

  const price = effectivePricePerKit(buy);
  const committed = totalKitsForBuy(buy.id);
  const closeCountdown = useCountdown(buy.deadline);
  const dueCountdown = useCountdown(finalPaymentDueAt(buy));
  const sortedTiers = [...buy.tiers].sort((a, b) => a.minKits - b.minKits);

  function handleDepositComplete() {
    if (!user || !buy) return;
    const reg = addRegistration(buy.id, user, kitCount);
    patchRegistration(reg.id, { depositPaidAt: Date.now() });
    setCheckoutOpen(false);
    refresh();
  }

  function handleBalanceComplete() {
    if (!balanceFor || !buy) return;
    patchRegistration(balanceFor.id, { finalPaidAt: Date.now() });
    setBalanceFor(null);
    refresh();
  }

  const depositDue = myReg && !myReg.depositPaidAt;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{buy.name}</h1>
          <p className="text-indigo-700 font-medium mt-1">{buy.product}</p>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">{buy.description}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-bold ${
            buy.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {buy.status === 'open' ? 'OPEN — SIGNUPS ACCEPTED' : 'CLOSED'}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column: pricing + tiers */}
        <section className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Group Pricing Tiers</h2>
          <p className="text-xs text-gray-500 mb-3">
            Price per kit drops as total committed kits grow. Current commitment:{' '}
            <span className="font-semibold text-gray-700">{committed} kits</span>.
          </p>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-indigo-50 text-indigo-900">
                <th className="text-left p-2 rounded-l-lg font-semibold">Total kits committed</th>
                <th className="text-right p-2 font-semibold">Price / kit</th>
              </tr>
            </thead>
            <tbody>
              {sortedTiers.map((t) => {
                const isActive = t.pricePerKit === price;
                return (
                  <tr key={t.minKits} className={isActive ? 'bg-green-50' : ''}>
                    <td className={`p-2 border-t ${isActive ? 'font-bold text-green-800' : 'text-gray-700'}`}>
                      {t.minKits === sortedTiers[0].minKits
                        ? `${t.minKits}+ kits (base)`
                        : `${t.minKits}–${(sortedTiers.find((x) => x.minKits > t.minKits)?.minKits ?? Infinity) - 1} kits`}
                      {isActive && <span className="ml-2 text-xs font-bold bg-green-600 text-white px-2 py-0.5 rounded-full">YOU ARE HERE</span>}
                    </td>
                    <td className={`p-2 border-t text-right ${isActive ? 'font-extrabold text-green-700' : 'text-gray-700'}`}>
                      ${t.pricePerKit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Deposit (secures your spot)</p>
              <p className="font-bold text-gray-900">${buy.depositAmount.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Shipping (per person)</p>
              <p className="font-bold text-gray-900">${buy.shippingFee.toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* Right column: countdowns + fulfillment */}
        <section className="space-y-6">
          <div
            className={`rounded-xl p-5 text-center ${
              buy.status === 'open' ? 'bg-amber-50 border border-amber-200' : 'bg-red-100 border border-red-300'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
              Buy closes in
            </p>
            <p className={`text-3xl font-extrabold ${buy.status === 'open' ? 'text-amber-800' : 'text-red-900'}`}>
              {buy.status === 'open' ? formatCountdown(closeCountdown) : 'Closed'}
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
              Final payment due within {buy.finalPaymentWindowHours}h after close
            </p>
            <p className="text-2xl font-extrabold text-indigo-800">{formatCountdown(dueCountdown)}</p>
            <p className="text-xs text-gray-600 mt-1">Unpaid balances forfeit the $20 deposit.</p>
          </div>

          {/* Fulfillment mode */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">Fulfillment: {buy.fulfillmentMode === 'direct' ? 'Direct to you' : 'Admin collection & distribution'}</h3>
            <p className="text-sm text-gray-600">
              {buy.fulfillmentMode === 'direct'
                ? 'Kits ship directly from the distributor to your address after final payment clears. Tracking provided on your dashboard.'
                : `The admin collects the batch for independent testing, then distributes kits to purchasers. ${buy.collectionAddress ?? ''}`}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg p-3 font-medium">
            ⚠️ RESEARCH USE ONLY — NOT FOR HUMAN CONSUMPTION OR MEDICAL USE. No dosing or safety information is provided with this product.
          </div>
        </section>
      </div>

      {/* Join / status panel */}
      <section className="mt-8 bg-white border rounded-xl shadow-sm p-6">
        {buy.status === 'closed' ? (
          <p className="text-gray-600 font-medium">This buy has closed. New signups are no longer accepted.</p>
        ) : !user ? (
          <div className="text-center py-4">
            <h2 className="text-lg font-bold mb-3 text-gray-800">Join this group buy</h2>
            <p className="text-sm text-gray-600 mb-4">You need an account to commit kits and pay the ${buy.depositAmount} deposit.</p>
            <div className="flex justify-center gap-3">
              <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg">Create Account</Link>
              <Link href="/login" className="border border-gray-400 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 rounded-lg">Log In</Link>
            </div>
          </div>
        ) : myReg ? (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Your reservation — {myReg.username}</h2>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Kits reserved</p>
                <p className="font-bold">{myReg.kits} kit{myReg.kits > 1 ? 's' : ''}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Deposit</p>
                <p className={`font-bold ${myReg.depositPaidAt ? 'text-green-700' : 'text-red-600'}`}>
                  {myReg.depositPaidAt ? `PAID ✓ (${buy.depositAmount}.00)` : 'NOT PAID'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Final payment</p>
                {myReg.finalPaidAt ? (
                  <p className="font-bold text-green-700">PAID ✓ — awaiting fulfillment</p>
                ) : (
                  <>
                    <p className="font-bold text-orange-600">${remainingBalance(myReg, buy).toFixed(2)} due</p>
                    {myReg.trackingNumber && <p className="text-xs mt-1">Tracking: {myReg.trackingNumber}</p>}
                  </>
                )}
              </div>
            </div>

            {!myReg.finalPaidAt ? (
              <button
                onClick={() => setBalanceFor(myReg)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow"
              >
                Pay Balance — ${remainingBalance(myReg, buy).toFixed(2)} (incl. shipping)
              </button>
            ) : (
              <p className="mt-4 text-sm text-green-700 font-medium">
                ✓ You are fully paid. {buy.fulfillmentMode === 'direct' ? 'You will receive tracking on your dashboard when it ships.' : 'The admin will contact you once testing is complete and kits are ready for distribution.'}
              </p>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Join as {user}</h2>
            <div className="flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Number of kits</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={kitCount}
                  onChange={(e) => setKitCount(Math.max(1, Number(e.target.value)))}
                  className="w-28 border rounded-lg px-3 py-2 text-sm font-semibold"
                />
              </label>
              <div className="bg-gray-50 rounded-lg p-3 text-sm flex-1 min-w-[220px]">
                <p>Kits: {kitCount} × ${price.toFixed(2)} = <span className="font-bold">${(kitCount * price).toFixed(2)}</span></p>
                <p>+ Shipping: ${buy.shippingFee.toFixed(2)}</p>
                <p>− Deposit now: −${buy.depositAmount.toFixed(2)}</p>
                <p className="mt-1 font-bold text-indigo-700">Due now: ${buy.depositAmount.toFixed(2)} · Later: ${(kitCount * price + buy.shippingFee - buy.depositAmount).toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow"
            >
              Pay ${buy.depositAmount} Deposit to Reserve {kitCount} Kit{kitCount > 1 ? 's' : ''}
            </button>
            <p className="text-xs text-gray-500 mt-2">Deposit is refundable if you cancel before the buy closes.</p>
          </div>
        )}
      </section>

      {/* Checkout modals */}
      {checkoutOpen && (
        <MockCheckout
          title={`$${buy.depositAmount} Deposit — ${buy.name}`}
          amount={buy.depositAmount}
          note="Secures your kits at the current tier price. Refundable before close."
          onClose={() => setCheckoutOpen(false)}
          onComplete={handleDepositComplete}
        />
      )}
      {balanceFor && (
        <MockCheckout
          title={`Final Balance — ${buy.name}`}
          amount={remainingBalance(balanceFor, buy)}
          note="Includes shipping. Due before the final-payment window expires."
          onClose={() => setBalanceFor(null)}
          onComplete={handleBalanceComplete}
        />
      )}
    </div>
  );
}
