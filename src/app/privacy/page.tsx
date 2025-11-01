import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Nail Art AI",
  description: "How Nail Art AI collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1b0d14] mb-3">Privacy Policy</h1>
        <p className="text-[#1b0d14]/80 max-w-3xl">Your privacy matters. This Policy explains what data we collect, how we use it, and the choices you have.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-[#1b0d14] mb-2">On this page</h2>
            <nav className="space-y-1 text-sm" aria-label="Table of contents">
              <a href="#who-we-are" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Who We Are</a>
              <a href="#information-we-collect" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Information We Collect</a>
              <a href="#how-we-use-information" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">How We Use Information</a>
              <a href="#legal-bases" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Legal Bases</a>
              <a href="#sharing" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Sharing</a>
              <a href="#retention" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Retention</a>
              <a href="#security" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Security</a>
              <a href="#international-transfers" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">International Transfers</a>
              <a href="#your-rights" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Your Rights</a>
              <a href="#childrens-privacy" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Children’s Privacy</a>
              <a href="#cookies" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Cookies</a>
              <a href="#changes" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Changes</a>
              <a href="#contact" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Contact</a>
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-6">
          <section id="who-we-are" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">1. Who We Are</h2>
            <p className="text-sm text-[#1b0d14]/80">Nail Art AI is the controller of personal information processed in connection with the Service. Contact: <a href="mailto:privacy@nailartai.app" className="text-[#ee2b8c] underline">privacy@nailartai.app</a>.</p>
          </section>

          <section id="information-we-collect" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">2. Information We Collect</h2>
            <ul className="text-sm text-[#1b0d14]/80 list-disc pl-5 space-y-2">
              <li>Information you provide: account details, messages you send, uploaded images (e.g., hand photos for try‑on), and preferences.</li>
              <li>Information collected automatically: device and usage data, approximate location (from IP), pages viewed, and interactions used to improve performance and reliability.</li>
              <li>Cookies and similar technologies: used for essential functionality and analytics. See “Cookies” below.</li>
            </ul>
          </section>

          <section id="how-we-use-information" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">3. How We Use Information</h2>
            <ul className="text-sm text-[#1b0d14]/80 list-disc pl-5 space-y-2">
              <li>Provide, maintain, and improve the Service and its performance.</li>
              <li>Personalize content and recommendations (e.g., styles and categories).</li>
              <li>Prevent abuse, fraud, and ensure platform security.</li>
              <li>Comply with legal obligations and enforce our Terms.</li>
            </ul>
            <p className="text-sm text-[#1b0d14]/80 mt-2">We do not sell your personal information.</p>
          </section>

          <section id="legal-bases" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">4. Legal Bases (EEA/UK)</h2>
            <p className="text-sm text-[#1b0d14]/80">Where applicable, we rely on consent (e.g., analytics), contract necessity (to provide the Service), and legitimate interests (security, product improvement) to process data.</p>
          </section>

          <section id="sharing" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">5. Sharing</h2>
            <p className="text-sm text-[#1b0d14]/80">We may share information with service providers who help us operate the Service (e.g., cloud hosting, analytics) under appropriate confidentiality and data protection commitments. We may disclose information to comply with the law or protect rights and safety.</p>
          </section>

          <section id="retention" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">6. Retention</h2>
            <p className="text-sm text-[#1b0d14]/80">We retain personal information only as long as necessary for the purposes described or as required by law. You may request deletion where applicable.</p>
          </section>

          <section id="security" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">7. Security</h2>
            <p className="text-sm text-[#1b0d14]/80">We use reasonable technical and organizational measures to protect information. No system is 100% secure.</p>
          </section>

          <section id="international-transfers" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">8. International Transfers</h2>
            <p className="text-sm text-[#1b0d14]/80">If information is transferred across borders, we implement appropriate safeguards as required by law.</p>
          </section>

          <section id="your-rights" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">9. Your Rights</h2>
            <p className="text-sm text-[#1b0d14]/80">Depending on your region, you may have rights to access, correct, delete, or restrict the use of your personal information, and to object or withdraw consent. To exercise rights, contact us at <a href="mailto:privacy@nailartai.app" className="text-[#ee2b8c] underline">privacy@nailartai.app</a>.</p>
          </section>

          <section id="childrens-privacy" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">10. Children’s Privacy</h2>
            <p className="text-sm text-[#1b0d14]/80">The Service is not intended for children under the age where parental consent is required by law. If you believe we have collected information from a child, contact us.</p>
          </section>

          <section id="cookies" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">11. Cookies</h2>
            <p className="text-sm text-[#1b0d14]/80">We use essential cookies for core functionality and optional analytics cookies to understand usage. You can control cookies via your browser settings and, where applicable, consent tools.</p>
          </section>

          <section id="changes" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">12. Changes</h2>
            <p className="text-sm text-[#1b0d14]/80">We may update this Policy from time to time. Material changes will be indicated by updating the “Last updated” date.</p>
          </section>

          <section id="contact" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold text-[#1b0d14] mb-2">13. Contact</h2>
            <p className="text-sm text-[#1b0d14]/80">For questions or requests about this Policy, contact <a href="mailto:privacy@nailartai.app" className="text-[#ee2b8c] underline">privacy@nailartai.app</a>.</p>
            <p className="text-xs text-[#1b0d14]/60 mt-4">Last updated: {new Date().getFullYear()}</p>
          </section>
        </main>
      </div>
    </div>
  );
}


