import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Nail Art AI",
  description: "Learn about Nail Art AI – our mission, what we build, and how we help you find your next manicure with beautiful AI-powered previews.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1b0d14] mb-4">About Us</h1>
      <p className="text-[#1b0d14]/80 max-w-3xl mb-8">
        Nail Art AI helps you discover your next manicure in minutes. We blend design sensibility with
        modern AI to preview nail art on real hands, explore styles by color, shape, season and
        occasion, and get inspired with premium galleries.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <h2 className="text-lg font-semibold mb-2">Our Mission</h2>
          <p className="text-sm text-[#1b0d14]/80">
            Make nail inspiration accessible, personal and fast – so you step into the salon with
            confidence and a look you love.
          </p>
        </div>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <h2 className="text-lg font-semibold mb-2">What We Build</h2>
          <p className="text-sm text-[#1b0d14]/80">
            AI try‑on, curated galleries, category browsing and helpful guides – designed to load
            quickly and look beautiful on every device.
          </p>
        </div>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <h2 className="text-lg font-semibold mb-2">For Creators</h2>
          <p className="text-sm text-[#1b0d14]/80">
            We partner with artists and salons to showcase styles, seasonal trends and tutorials.
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h2 className="text-lg font-semibold mb-3">Our Story</h2>
          <p className="text-[#1b0d14]/80 text-sm">
            We started Nail Art AI after seeing how hard it was to visualize designs on your own hands.
            Endless scrolling, screenshots, and guesswork made salon visits stressful. Today, our
            virtual try‑on and curated galleries turn that process into a few delightful taps.
          </p>
        </div>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h2 className="text-lg font-semibold mb-3">How It Works</h2>
          <ul className="text-[#1b0d14]/80 text-sm list-disc pl-5 space-y-2">
            <li>Browse by color, shape, season, occasion, or style.</li>
            <li>Try designs on real hands with our fast, realistic preview.</li>
            <li>Save favorites, share looks, and bring them to your salon.</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <h3 className="text-base font-semibold mb-2">Quality & Performance</h3>
          <p className="text-sm text-[#1b0d14]/80">Optimized images, fast page loads, and a smooth experience on every device.</p>
        </div>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <h3 className="text-base font-semibold mb-2">Privacy‑First</h3>
          <p className="text-sm text-[#1b0d14]/80">Clear controls for your data and sensible defaults. We never sell personal data.</p>
        </div>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <h3 className="text-base font-semibold mb-2">Community</h3>
          <p className="text-sm text-[#1b0d14]/80">We highlight artists and trends, credit creators, and uplift the nail art community.</p>
        </div>
      </div>
    </div>
  );
}


