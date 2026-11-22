'use client';

// Demo-mode checkout modal. In production this is replaced by a redirect to
// Stripe Checkout (or the crypto/cash-app fallback rails) — the onComplete
// callback contract stays identical.

interface MockCheckoutProps {
  title: string;
  amount: number;
  note?: string;
  onClose: () => void;
  onComplete: () => void;
}

export function MockCheckout({ title, amount, note, onClose, onComplete }: MockCheckoutProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>

        <p className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 mb-4 font-medium">
          DEMO MODE — no real charge is made. Connect STRIPE_SECRET_KEY in .env.local to go live.
        </p>

        <div className="space-y-3 mb-5">
          <input
            defaultValue="4242 4242 4242 4242"
            placeholder="Card number"
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
          />
          <div className="flex gap-3">
            <input defaultValue="12 / 28" placeholder="MM / YY" className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono" />
            <input defaultValue="424" placeholder="CVC" className="w-24 border rounded-lg px-3 py-2 text-sm font-mono" />
          </div>
        </div>

        {note && <p className="text-xs text-gray-500 mb-4">{note}</p>}

        <button
          onClick={onComplete}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow"
        >
          Pay ${amount.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
