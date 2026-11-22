import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'PepBuy — Research Use Only Group Buys',
  description:
    'Tiered group buys for research-use-only peptide products. More participants, lower price per kit.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Research Use Only banner — visible on every page */}
        <header className="sticky top-0 z-50 bg-red-700 text-white px-4 py-3 text-center font-bold shadow-md">
          <p className="text-xs sm:text-sm leading-snug">
            ⚠️ RESEARCH USE ONLY — NOT FOR HUMAN CONSUMPTION OR MEDICAL USE.
            NO DOSE INSTRUCTIONS, HEALTH CLAIMS, OR SAFETY DATA ARE PROVIDED.
          </p>
        </header>

        {/* Site nav */}
        <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <Link href="/" className="text-xl font-extrabold text-indigo-700 tracking-tight">
            PepBuy<span className="text-red-600">.ruo</span>
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-indigo-700">Active Buys</Link>
            <Link href="/dashboard" className="hover:text-indigo-700">My Orders</Link>
            <Link
              href="/admin"
              className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Admin Panel
            </Link>
          </div>
        </nav>

        <main>{children}</main>

        {/* Footer disclaimer */}
        <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-2">
            <p className="text-sm font-semibold text-white">Research Use Only — Always.</p>
            <p className="text-xs max-w-3xl mx-auto">
              All products sold through this platform are intended strictly for laboratory and
              research purposes. They are not drugs, are not approved by the FDA or any health
              authority, and must not be administered to humans or animals. By purchasing you
              agree to our Terms of Service and represent that you are 18+ and will use all
              materials in a lawful manner for research only.
            </p>
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} PepBuy — All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
