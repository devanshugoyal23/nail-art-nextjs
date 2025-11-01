import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Nail Art AI",
  description: "The terms and conditions that govern your use of Nail Art AI.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1b0d14] mb-3">Terms of Service</h1>
        <p className="text-[#1b0d14]/80 max-w-3xl">
          By accessing or using Nail Art AI (the “Service”), you agree to these Terms. If you do not
          agree, do not use the Service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-[#1b0d14] mb-2">On this page</h2>
            <nav className="space-y-1 text-sm" aria-label="Table of contents">
              <a href="#eligibility" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Eligibility & Accounts</a>
              <a href="#acceptable-use" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Acceptable Use</a>
              <a href="#user-content" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">User Content & Generated Designs</a>
              <a href="#intellectual-property" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Intellectual Property</a>
              <a href="#third-party-services" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Third‑Party Services</a>
              <a href="#disclaimers" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Disclaimers</a>
              <a href="#limitation-of-liability" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Limitation of Liability</a>
              <a href="#indemnification" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Indemnification</a>
              <a href="#changes" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Changes</a>
              <a href="#governing-law" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Governing Law</a>
              <a href="#contact" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Contact</a>
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-6">
          <section id="eligibility" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">1. Eligibility & Accounts</h2>
            <p className="text-sm text-[#1b0d14]/80">You must be able to form a binding contract to use the Service. If you create an account, you are responsible for maintaining the confidentiality of your credentials and for all activities under your account.</p>
          </section>

          <section id="acceptable-use" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">2. Acceptable Use</h2>
            <p className="text-sm text-[#1b0d14]/80">Do not misuse the Service, including violating laws, infringing intellectual property or privacy rights, uploading harmful content, interfering with the Service, or scraping without permission.</p>
          </section>

          <section id="user-content" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">3. User Content & Generated Designs</h2>
            <p className="text-sm text-[#1b0d14]/80">You retain ownership of content you upload (e.g., hand photos). By submitting content, you grant us a non‑exclusive, worldwide, royalty‑free license to host, process, and display it solely to provide and improve the Service. AI‑generated nail designs are provided for inspiration. Where applicable, we grant you a non‑exclusive license to use generated images for personal and commercial purposes, subject to third‑party rights and applicable law.</p>
          </section>

          <section id="intellectual-property" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">4. Intellectual Property</h2>
            <p className="text-sm text-[#1b0d14]/80">Site content, trademarks, and logos are the property of their respective owners and may not be used without permission. Do not remove notices or attempt to reverse engineer any part of the Service.</p>
          </section>

          <section id="third-party-services" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">5. Third‑Party Services</h2>
            <p className="text-sm text-[#1b0d14]/80">The Service may link to or integrate third‑party services. We do not control and are not responsible for those services or their policies.</p>
          </section>

          <section id="disclaimers" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">6. Disclaimers</h2>
            <p className="text-sm text-[#1b0d14]/80">The Service is provided “as is” and “as available” without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, secure, or error‑free, or that results will meet your expectations.</p>
          </section>

          <section id="limitation-of-liability" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">7. Limitation of Liability</h2>
            <p className="text-sm text-[#1b0d14]/80">To the fullest extent permitted by law, we will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or data, arising from or related to your use of the Service.</p>
          </section>

          <section id="indemnification" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">8. Indemnification</h2>
            <p className="text-sm text-[#1b0d14]/80">You agree to defend, indemnify, and hold harmless Nail Art AI from any claims, damages, and expenses (including reasonable attorneys’ fees) arising from your use of the Service or violation of these Terms.</p>
          </section>

          <section id="changes" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">9. Changes to the Service or Terms</h2>
            <p className="text-sm text-[#1b0d14]/80">We may modify the Service or these Terms at any time. Material changes will be indicated by updating the “Last updated” date. Your continued use constitutes acceptance of changes.</p>
          </section>

          <section id="governing-law" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">10. Governing Law</h2>
            <p className="text-sm text-[#1b0d14]/80">These Terms are governed by the laws applicable in your place of residence unless otherwise required by mandatory law. Venue will be as permitted by applicable law.</p>
          </section>

          <section id="contact" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">11. Contact</h2>
            <p className="text-sm text-[#1b0d14]/80">Questions about these Terms? Contact us at <a href="mailto:legal@nailartai.app" className="text-[#ee2b8c] underline">legal@nailartai.app</a>.</p>
            <p className="text-xs text-[#1b0d14]/60 mt-4">Last updated: {new Date().getFullYear()}</p>
          </section>
        </main>
      </div>
    </div>
  );
}


