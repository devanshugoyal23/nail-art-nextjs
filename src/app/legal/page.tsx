import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal | Nail Art AI",
  description: "Legal information for Nail Art AI including Terms of Service and Privacy Policy.",
};

export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1b0d14] mb-6">Legal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Link href="/terms" className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5 hover:shadow-md transition">
          <h2 className="text-lg font-semibold mb-2">Terms of Service</h2>
          <p className="text-sm text-[#1b0d14]/80">Read the terms that govern your use of Nail Art AI.</p>
        </Link>
        <Link href="/privacy" className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5 hover:shadow-md transition">
          <h2 className="text-lg font-semibold mb-2">Privacy Policy</h2>
          <p className="text-sm text-[#1b0d14]/80">Learn how we collect, use, and protect your data.</p>
        </Link>
      </div>
    </div>
  );
}


