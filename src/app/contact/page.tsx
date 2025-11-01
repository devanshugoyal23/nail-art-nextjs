import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Nail Art AI",
  description: "Get in touch with the Nail Art AI team for support, partnerships, and general questions.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1b0d14] mb-4">Contact</h1>
      <p className="text-[#1b0d14]/80 max-w-2xl mb-8">
        Have a question, partnership idea, or feedback? We’d love to hear from you.
      </p>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-[#1b0d14]">Name</label>
            <input className="mt-1 w-full rounded-lg border border-[#ee2b8c]/30 bg-white px-3 py-2 focus:ring-2 focus:ring-[#ee2b8c]" placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1b0d14]">Email</label>
            <input type="email" className="mt-1 w-full rounded-lg border border-[#ee2b8c]/30 bg-white px-3 py-2 focus:ring-2 focus:ring-[#ee2b8c]" placeholder="you@example.com" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#1b0d14]">Message</label>
            <textarea className="mt-1 w-full rounded-lg border border-[#ee2b8c]/30 bg-white px-3 py-2 h-32 focus:ring-2 focus:ring-[#ee2b8c]" placeholder="How can we help?" />
          </div>
          <div className="sm:col-span-2">
            <button className="inline-flex items-center justify-center rounded-full bg-[#ee2b8c] px-5 py-3 font-semibold text-white">Send</button>
          </div>
        </div>
        <p className="text-xs text-[#1b0d14]/60 mt-4">This simple form is non-functional in this demo. Use your preferred form handler in production.</p>
      </div>
    </div>
  );
}


