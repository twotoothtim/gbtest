'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Buy, createBuy, updateBuy, getBuys, totalKitsForBuy, nextTierForBuy, getRegistrations } from '@/lib/store';
import { formatCountdown } from '@/lib/use-countdown';

function ParticipantRow({ reg, buyId }: { reg: any; buyId: string }) {
  function handleShip() {
    if (!reg.id) return;
    const tracking = `TRK-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 89 + 10).toString().padStart(3, '0')}`;
    alert(`Tracking # generated: ${tracking}`);
  }

  return (
    <tr className="bg-white">
      <td className="border px-3 py-2 w-64">
        {reg.username}
        {!reg.finalPaidAt && (
          <>
            {!reg.depositPaidAt ? (
              <span className="ml-2 text-xs font-bold bg-red-100 text-red-800 px-2.5 py-1 rounded-full border">DEPOSIT NOT PAID</span>
            ) : (
              <span className="ml-2 text-xs font-bold bg-green-600 text-white px-2.5 py-1 rounded-full">DEPOSIT PAID ✓</span>
            )}
            {reg.finalPaidAt && !reg.depositPaidAt ? (
              <span className="text-xs ml-2 font-bold bg-orange-100 text-orange-900 px-2.5 py-1 rounded-full border">FINAL PAYMENT MISSING</span>
            ) : null}
          </>
        )}
      </td>
      <td className="border px-3 py-2">{reg.kits} kit{reg.kits > 1 ? 's' : ''}</td>
      <td className="border px-3 py-2">
        {reg.finalPaidAt && !reg.trackingNumber ? (
          <button onClick={handleShip} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1 rounded">
            Ship → tracking #
          </button>
        ) : reg.trackingNumber ? (
          <span className="font-mono text-xs">{reg.trackingNumber}</span>
        ) : null}
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const [buys, setBuys] = useState<Buy[]>([]);
  const [newName, setNewName] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [fulfillmentMode, setFulfillmentMode] = useState<'direct' | 'collection'>('direct');
  const [collectionAddress, setCollectionAddress] = useState('');
  const [basePrice, setBasePrice] = useState(120);
  const [tiers, setTiers] = useState([
    { minKits: 1, pricePerKit: 120 },
    { minKits: 10, pricePerKit: 115 },
    { minKits: 25, pricePerKit: 110 },
    { minKits: 50, pricePerKit: 108 },
  ]);
  const [depositAmount, setDepositAmount] = useState(20);
  const [shippingFee, setShippingFee] = useState(10);
  const [finalWindowHours, setFinalWindowHours] = useState(24);
  const [signupDurationHours, setSignupDurationHours] = useState(48);

  function forceRender() {
    setBuys(buys); // re-render hook to show updates
  }

  useEffect(() => {
    const storeBuys = getBuys();
    if (!Array.isArray(storeBuys)) return;
    setBuys(storeBuys);
  }, []);

  function handleCreate() {
    const newBuy: Buy = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10),
      name: newName || 'New Group Buy',
      product: newProduct || 'New Product',
      description: newDesc || '',
      fulfillmentMode,
      collectionAddress,
      tiers,
      depositAmount,
      shippingFee,
      finalPaymentWindowHours: Number(finalWindowHours) ?? 24,
      deadline: Date.now() + signupDurationHours * 3600000,
      status: 'open',
    };
    createBuy(newBuy);
    forceRender();
  }

  function handleExtend(id: string, hours: number) {
    const buy = buys.find((b) => b.id === id);
    if (!buy) return;
    updateBuy(buy.id, { deadline: buy.deadline + hours * 3600000 });
    forceRender();
  }

  function handleClose(id: string) {
    const buy = buys.find((b) => b.id === id);
    if (!buy) return;
    updateBuy(buy.id, { status: 'closed' });
    forceRender();
  }

  function handleReopen(id: string) {
    const buy = buys.find((b) => b.id === id);
    if (!buy) return;
    updateBuy(buy.id, { status: 'open' });
    forceRender();
  }

  // Preload initial buys
  useEffect(() => {
    const storeBuys = getBuys();
    setBuys(storeBuys);
  }, [storeBuys]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-900 text-white px-4 py-6 shadow">
        <h1 className="text-2xl font-bold">Admin Panel — Research Group Buy</h1>
        <p className="text-sm opacity-80 mt-1">Manage group buys, deposits, final payments, and shipments.</p>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-indigo-800 px-4 py-2 flex gap-4 border-b border-indigo-700">
        <Link href="/" className="px-4 py-2 font-medium text-white hover:bg-indigo-900 rounded">Public Site</Link>
        <span className="text-gray-300 px-4 py-2 font-medium">Admin Panel</span>
      </nav>

      <main className="max-w-6xl mx-auto p-4 mt-4 grid md:grid-cols-12 gap-6">
        {/* Left column: create buy form */}
        <section className="md:col-span-5 bg-white border rounded shadow p-6">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Create / Edit Group Buy</h2>
          <p className="text-xs text-gray-500 mb-4">Fill fields below to create a new buy.</p>

          <div className="space-y-3">
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Buy Name</span>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Retatrutide Open Buy — Batch #2" className="w-full border rounded px-3 py-2.5 text-sm" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Product</span>
              <input value={newProduct} onChange={(e) => setNewProduct(e.target.value)} placeholder="Retatrutide (10 x 3mL vials @ 10mg/vial)" className="w-full border rounded px-3 py-2.5 text-sm" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Description</span>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Research-use-only. Ships cold-packed with COA on request." className="w-full border rounded px-3 py-2.5 text-sm" rows={3} />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Fulfillment Mode</span>
              <select value={fulfillmentMode} onChange={(e) => setFulfillmentMode(e.target.value as 'direct' | 'collection')} className="w-full border rounded px-3 py-2.5 text-sm">
                <option value="direct">Direct Fulfillment (ship to participant)</option>
                <option value="collection">Collection by Admin (test then distribute)</option>
              </select>
            </label>

            {fulfillmentMode === 'collection' && (
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Collection Address</span>
                <input value={collectionAddress} onChange={(e) => setCollectionAddress(e.target.value)} placeholder="Warehouse address where kits are held for pickup/distribution" className="w-full border rounded px-3 py-2.5 text-sm" />
              </label>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Base Price / Kit ($)</span>
                <input type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} placeholder="120.00" className="w-full border rounded px-3 py-2.5 text-sm" />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Shipping / Person ($)</span>
                <input type="number" value={shippingFee} onChange={(e) => setShippingFee(Number(e.target.value))} placeholder="10.00" defaultValue={10} className="w-full border rounded px-3 py-2.5 text-sm" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Deposit ($)</span>
                <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} defaultValue={20} className="w-full border rounded px-3 py-2.5 text-sm" />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">Final payment window (hours)</span>
                <input type="number" value={finalWindowHours} onChange={(e) => setFinalWindowHours(Number(e.target.value))} defaultValue={24} className="w-full border rounded px-3 py-2.5 text-sm" />
              </label>
            </div>

            <label className="block">
              <span className="block text-sm font-medium text-gray-700 mb-1">Signup window (hours, auto-closes)</span>
              <input type="number" value={signupDurationHours} onChange={(e) => setSignupDurationHours(Number(e.target.value))} defaultValue={48} className="w-full border rounded px-3 py-2.5 text-sm" />
            </label>

            {/* Tier table */}
            <div className="border rounded-lg bg-gray-50 p-3 mb-3">
              <h3 className="font-semibold text-gray-700 mb-2">Pricing Tiers (Total Kits → Price per Kit)</h3>
              <table className="w-full border-collapse text-sm bg-white">
                <thead>
                  <tr className="bg-indigo-100 text-indigo-900">
                    <th className="border px-2 py-2 text-left min-w-[140px]">Min Total Kits</th>
                    <th className="border px-2 py-2 text-left">Price / Kit ($)</th>
                    <th className="border px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">
                        <input type="number" value={t.minKits} onChange={(e) => { const next = [...tiers]; next[idx] = { ...next[idx], minKits: Number(e.target.value) }; setTiers(next); }} className="w-full border rounded px-2 py-1.5 text-center" />
                      </td>
                      <td className="border px-2 py-1">
                        $<input type="number" value={t.pricePerKit} onChange={(e) => { const next = [...tiers]; next[idx] = { ...next[idx], pricePerKit: Number(e.target.value) }; setTiers(next); }} className="w-32 border rounded px-2 py-1.5 text-left" />
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <button onClick={() => { const next = tiers.filter((_, i) => i !== idx); setTiers(next); }} className="bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">Edit thresholds/prices or remove rows as needed.</p>
            </div>

            <button onClick={handleCreate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded shadow">Save Buy Configuration</button>
          </div>
        </section>

        {/* Right column: active buys */}
        <section className="md:col-span-7 bg-white border rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Active Group Buys</h2>
          {buys.length === 0 && (
            <p className="text-gray-500 py-8 text-center">No active group buys. Create one above.</p>
          )}
          {buys.map((buy) => {
            const participants = getRegistrations(buy.id);
            const totalCommitted = totalKitsForBuy(buy.id);
            const nextTier = nextTierForBuy(buy);

            return (
              <div key={buy.id} className={`border rounded-lg p-4 mb-6 bg-indigo-50 ${buy.status === 'closed' ? 'opacity-75' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{buy.name}</h3>
                    <p className="text-sm text-gray-600">{buy.product}</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${buy.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {buy.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {buy.status === 'open' ? (
                      <>
                        <button onClick={() => handleClose(buy.id)} className="text-red-600 hover:text-red-700 text-sm font-medium underline">Close Early</button>
                      </>
                    ) : (
                      <button onClick={() => handleReopen(buy.id)} className="text-green-600 hover:text-green-700 text-sm font-medium underline">Reopen Buy</button>
                    )}

                    <span className="text-xs bg-gray-100 border px-2 py-1 rounded">{buy.deadline ? formatCountdown(buy.deadline) : 'N/A'}</span>
                  </div>

                </div>

                {/* Participant table */}
                {participants.length > 0 && (
                  <table className="w-full border-collapse text-sm mb-4">
                    <thead className="bg-indigo-100 text-indigo-900">
                      <tr>
                        <th className="border px-3 py-2 text-left font-semibold min-w-[250px]">Username (Status)</th>
                        <th className="border px-3 py-2 text-left font-semibold">Kits</th>
                        <th className="border px-3 py-2 text-left font-semibold">Shipping/Tracking</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((reg) => (
                        <ParticipantRow key={reg.id} reg={reg} buyId={buy.id} />
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Summary */}
                <div className="grid grid-cols-3 gap-2 text-xs bg-gray-100 p-3 rounded">
                  <span><span className="font-medium">Total committed kits:</span></span>
                  <span>{totalCommitted}</span>
                  <span><span className="font-medium">Next tier at:</span></span>
                  <span>{nextTier ? nextTier.minKits : '—'}</span>
                </div>

                {/* Deadline extension controls */}
                {buy.status === 'open' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => handleExtend(buy.id, 1)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-3 py-2 rounded text-sm">+1h</button>
                    <button onClick={() => handleExtend(buy.id, 6)} className="bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-2 rounded text-sm">+6h</button>
                    <button onClick={() => handleExtend(buy.id, 24)} className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded text-sm">+24h</button>
                  </div>
                )}

                {/* Buy details */}
                <details className="mt-4 border-t pt-4 text-xs bg-gray-50 p-3 rounded">
                  <summary className="font-semibold cursor-pointer">Show full buy configuration (tier table, deadline, etc.)</summary>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-left">
                    <span className="text-gray-500">Deposit:</span>
                    <span>{buy.depositAmount}</span>
                    <span className="text-gray-500">Shipping:</span>
                    <span>{buy.shippingFee}</span>
                    <span className="text-gray-500">Final payment window:</span>
                    <span>{buy.finalPaymentWindowHours}h</span>
                    <span className="text-gray-500">Deadline:</span>
                    <span>{buy.deadline ? new Date(buy.deadline).toLocaleString() : '—'}</span>
                    <span className="text-gray-500">Status:</span>
                    <span>{buy.status.toUpperCase()}</span>
                  </div>
                </details>
              </div>
            );
          })}

          {/* Empty state */}
          {buys.length === 0 && (
            <p className="text-gray-600 text-center py-8">No active group buys. Create one above.</p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12 text-center text-sm">
        <p>© 2025 Group Buy Platform — Admin Panel</p>
        <p className="mt-2">Research Use Only. Not for human consumption.</p>
      </footer>
    </div>
  );
}
