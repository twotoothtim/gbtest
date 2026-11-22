'use client';

import Link from 'next/link';
import { Buy, effectivePricePerKit, nextTierForBuy, totalKitsForBuy } from '@/lib/store';
import { useCountdown, formatCountdown } from '@/lib/use-countdown';

export function GroupBuyCard({ buy }: { buy: Buy }) {
  const price = effectivePricePerKit(buy);
  const committed = totalKitsForBuy(buy.id);
  const nextTier = nextTierForBuy(buy);
  const countdown = useCountdown(buy.deadline);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{buy.name}</h3>
          <p className="text-sm text-indigo-700 font-medium mt-1">{buy.product}</p>
        </div>
        <span
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
            buy.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {buy.status === 'open' ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      {/* Current price + progress to next tier */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-baseline">
          <p className="text-xs text-gray-600">{committed} kits committed so far</p>
          <p className="text-xl font-extrabold text-green-700">${price.toFixed(2)}/kit</p>
        </div>
        {nextTier && (
          <>
            <div className="flex justify-between text-xs text-gray-500 mt-2 mb-1">
              <span>{committed} / {nextTier.minKits} kits for next tier</span>
              <span>${nextTier.pricePerKit.toFixed(2)}/kit</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full"
                style={{ width: `${Math.min(100, (committed / nextTier.minKits) * 100)}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Countdown */}
      <div
        className={`text-center py-2 rounded-lg mb-4 text-sm font-semibold ${
          buy.status === 'open' ? 'bg-amber-50 text-amber-800' : 'bg-red-100 text-red-900'
        }`}
      >
        {buy.status === 'open' ? `Closes in ${formatCountdown(countdown)}` : 'Buy closed'}
      </div>

      <Link
        href={buy.status === 'open' ? `/buy/${buy.id}` : '#'}
        className={`text-center font-semibold py-3 rounded-lg shadow-sm ${
          buy.status === 'open'
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {buy.status === 'open' ? `Join — $${buy.depositAmount} deposit` : 'No longer available'}
      </Link>

      <p className="text-xs text-gray-500 mt-4">
        Kit = 10 x 3mL vials · Shipping ${buy.shippingFee}/person · Final payment due within{' '}
        {buy.finalPaymentWindowHours}h after close.
      </p>

      <div className="mt-3 p-2 bg-red-50 text-red-800 text-xs rounded-lg font-medium">
        ⚠️ RESEARCH USE ONLY — NOT FOR HUMAN CONSUMPTION.
      </div>
    </div>
  );
}
