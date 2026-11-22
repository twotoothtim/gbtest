'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Buy } from '@/lib/store';
import { getBuys, currentUser } from '@/lib/store';
import { GroupBuyCard } from '@/components/pages/GroupBuyCard';

export default function Home() {
  const [buys, setBuys] = useState<Buy[]>([]);
  const [loaded, setLoaded] = useState(false);
  const user = currentUser();

  useEffect(() => {
    setBuys(getBuys());
    setLoaded(true);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
            Tiered Group Buys for Research Peptides
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            The more kits the group commits, the lower your price per kit. Lock in with a $20
            deposit — pay the balance after the buy closes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-green-600 hover:bg-green-700 font-semibold py-3 px-6 rounded-lg shadow"
              >
                Go to My Orders ({user})
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-green-600 hover:bg-green-700 font-semibold py-3 px-6 rounded-lg shadow"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="border border-white/40 hover:bg-white/10 font-semibold py-3 px-6 rounded-lg"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Active buys */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Active Group Buys</h2>

        {!loaded ? (
          <p className="text-center text-gray-500">Loading open buys…</p>
        ) : buys.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No group buys are currently open. Check back soon — or create one from the Admin Panel.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {buys.map((buy) => (
              <GroupBuyCard key={buy.id} buy={buy} />
            ))}
          </div>
        )}

        {/* How it works */}
        <section className="mt-14 bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-gray-800">How group buys work</h3>
          <ol className="grid md:grid-cols-4 gap-4 text-sm text-gray-700 list-none">
            {[
              ['1. Register', 'Create a free account and pick how many kits you want for an open buy.'],
              [`2. Pay the $${buys[0]?.depositAmount ?? 20} deposit`, 'Secures your kits at your current tier price. Refundable before the buy closes.'],
              ['3. Buy closes', 'Admin locks quantities and places the supplier order. Balance + shipping become due within the posted window.'],
              ['4. Fulfillment', 'Direct shipment to you, or admin collection → testing → distribution to purchasers.'],
            ].map(([title, body]) => (
              <li key={title} className="bg-gray-50 border rounded-lg p-3">
                <p className="font-semibold text-indigo-700 mb-1">{title}</p>
                {body}
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-8 text-center text-gray-600 text-sm">
          Deposit ${buys[0]?.depositAmount ?? 20}/participant · Shipping $10/person · Final payment
          due within the countdown window or the deposit is forfeited.
        </p>
      </main>
    </div>
  );
}
