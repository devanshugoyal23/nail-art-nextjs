import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - How We Protect Your Data | Nail Art AI",
  description: "Read Nail Art AI's comprehensive privacy policy. Learn how we collect, use, and protect your personal information. We never sell your data. GDPR and CCPA compliant. Updated November 2025.",
  keywords: [
    "privacy policy",
    "data protection",
    "gdpr compliance",
    "ccpa compliance",
    "user privacy",
    "data security",
    "privacy rights"
  ],
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1b0d14] mb-3">Privacy Policy</h1>
        <p className="text-lg text-[#1b0d14]/80 max-w-3xl mb-4">
          At Nail Art AI, your privacy is our top priority. This Privacy Policy explains how we collect, use, protect,
          and share your personal information when you use our virtual nail art try-on platform and related services.
        </p>
        <p className="text-sm text-[#1b0d14]/70 max-w-3xl">
          <strong>Effective Date:</strong> November 10, 2025 | <strong>Last Updated:</strong> November 10, 2025
        </p>
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
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">1. Who We Are</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              Nail Art AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is the data controller responsible for personal information collected and
              processed in connection with our website, mobile applications, and services (collectively, the &quot;Service&quot;).
              Our Service provides AI-powered virtual nail art try-on technology, design galleries, nail salon directories,
              and educational resources.
            </p>
            <p className="text-[#1b0d14]/80">
              <strong>Contact Information:</strong><br />
              Email: <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] underline">help@nailartai.app</a><br />
              Website: <a href="https://nailartai.app" className="text-[#ee2b8c] underline">https://nailartai.app</a>
            </p>
          </section>

          <section id="information-we-collect" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">2. Information We Collect</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              We collect information to provide, improve, and personalize our Service. The types of information we collect include:
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">2.1 Information You Provide Directly</h3>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2 mb-4">
              <li><strong>Account Information:</strong> If you create an account, we collect your name, email address, and password.</li>
              <li><strong>Hand Photos:</strong> When you use our virtual try-on feature, you upload photos of your hands. These images are processed temporarily and are not stored permanently unless you explicitly save them to your account.</li>
              <li><strong>Communications:</strong> When you contact us via email or forms, we collect your name, email address, and message content.</li>
              <li><strong>Preferences:</strong> Design favorites, saved designs, search history, and personalization settings.</li>
              <li><strong>User-Generated Content:</strong> Reviews, ratings, comments, or designs you submit to our platform.</li>
            </ul>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">2.2 Information Collected Automatically</h3>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2 mb-4">
              <li><strong>Device Information:</strong> IP address, browser type and version, operating system, device type, unique device identifiers.</li>
              <li><strong>Usage Data:</strong> Pages viewed, time spent on pages, links clicked, search queries, referral sources, date and time of visits.</li>
              <li><strong>Location Information:</strong> Approximate geographic location based on IP address (used for salon recommendations).</li>
              <li><strong>Performance Data:</strong> Page load times, errors, crashes, and technical diagnostics to improve Service performance.</li>
            </ul>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">2.3 Cookies and Similar Technologies</h3>
            <p className="text-[#1b0d14]/80 mb-2">
              We use cookies, web beacons, and similar tracking technologies for essential functionality and analytics.
              See Section 11 &quot;Cookies&quot; for detailed information and choices.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">2.4 Third-Party Information</h3>
            <p className="text-[#1b0d14]/80">
              We may receive information from third-party analytics providers (e.g., Google Analytics) and advertising partners
              to understand how you interact with our Service and measure campaign effectiveness.
            </p>
          </section>

          <section id="how-we-use-information" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">3. How We Use Information</h2>
            <p className="text-[#1b0d14]/80 mb-3">We use the information we collect for the following purposes:</p>

            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2 mb-4">
              <li><strong>Provide and Maintain Service:</strong> Process your requests, enable virtual try-on functionality, deliver design recommendations, and provide customer support.</li>
              <li><strong>Personalization:</strong> Customize content, recommendations, and search results based on your preferences, browsing history, and design favorites.</li>
              <li><strong>Improve and Develop:</strong> Analyze usage patterns, test new features, improve AI accuracy, optimize performance, and develop new products and services.</li>
              <li><strong>Security and Fraud Prevention:</strong> Detect and prevent fraudulent activity, abuse, spam, and security incidents; enforce our Terms of Service.</li>
              <li><strong>Communications:</strong> Send service updates, technical notices, security alerts, and respond to your inquiries. With your consent, send marketing communications about new features and promotions.</li>
              <li><strong>Analytics:</strong> Understand how users interact with our Service, measure effectiveness of features, and create aggregated statistics.</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws, regulations, legal processes, and governmental requests.</li>
            </ul>
            <p className="text-[#1b0d14]/80 font-semibold bg-[#ee2b8c]/10 p-3 rounded">
              <strong>Important:</strong> We do NOT sell your personal information to third parties, and we never will.
            </p>
          </section>

          <section id="legal-bases" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">4. Legal Bases for Processing (GDPR)</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we process your personal information based on the following legal grounds:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2">
              <li><strong>Consent:</strong> When you provide explicit consent (e.g., for marketing communications or non-essential cookies).</li>
              <li><strong>Contract Performance:</strong> To fulfill our contractual obligations when you use our Service.</li>
              <li><strong>Legitimate Interests:</strong> For purposes such as improving our Service, security, fraud prevention, and analytics, where our interests do not override your rights.</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws, regulations, and legal processes.</li>
            </ul>
          </section>

          <section id="sharing" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">5. How We Share Information</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              We may share your personal information in the following circumstances:
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">5.1 Service Providers</h3>
            <p className="text-[#1b0d14]/80 mb-2">
              We work with third-party service providers who perform services on our behalf, including:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-1 mb-4">
              <li>Cloud hosting and infrastructure providers (e.g., Vercel, Cloudflare, AWS)</li>
              <li>Database and storage services (e.g., Supabase, Cloudflare R2)</li>
              <li>Analytics providers (e.g., Google Analytics, Vercel Analytics)</li>
              <li>Email service providers</li>
              <li>Customer support tools</li>
            </ul>
            <p className="text-[#1b0d14]/80 mb-4">
              These providers are contractually bound to protect your data and use it only for the services they provide to us.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2">5.2 Legal Requirements</h3>
            <p className="text-[#1b0d14]/80 mb-4">
              We may disclose information if required by law, subpoena, court order, or governmental request, or to protect our rights, property, safety, or that of users or the public.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2">5.3 Business Transfers</h3>
            <p className="text-[#1b0d14]/80 mb-4">
              In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of that transaction.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2">5.4 Aggregated Data</h3>
            <p className="text-[#1b0d14]/80">
              We may share aggregated, de-identified information that cannot reasonably be used to identify you.
            </p>
          </section>

          <section id="retention" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">6. Data Retention</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2">
              <li><strong>Account Data:</strong> Retained as long as your account is active, plus a reasonable period thereafter.</li>
              <li><strong>Hand Photos:</strong> Processed temporarily during virtual try-on and deleted immediately after processing unless you save them to your account.</li>
              <li><strong>Usage Data:</strong> Typically retained for 12-24 months for analytics purposes.</li>
              <li><strong>Support Communications:</strong> Retained for 2-3 years to provide ongoing support.</li>
              <li><strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations.</li>
            </ul>
            <p className="text-[#1b0d14]/80 mt-3">
              You may request deletion of your personal information at any time by contacting <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] underline">help@nailartai.app</a>.
            </p>
          </section>

          <section id="security" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">7. Security Measures</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              We implement reasonable technical and organizational security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. Our security measures include:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2">
              <li>HTTPS encryption for all data transmission</li>
              <li>Secure cloud infrastructure with industry-standard protections</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication requirements</li>
              <li>Encrypted data storage where appropriate</li>
              <li>Employee training on data protection and security</li>
            </ul>
            <p className="text-[#1b0d14]/80 mt-3">
              However, no system is completely secure. While we strive to protect your information, we cannot guarantee absolute security. Please use strong passwords and keep your account credentials confidential.
            </p>
          </section>

          <section id="international-transfers" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">8. International Data Transfers</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              Your information may be transferred to, stored, and processed in countries other than your own, including the United States, where our servers and service providers are located. These countries may have different data protection laws than your jurisdiction.
            </p>
            <p className="text-[#1b0d14]/80">
              When we transfer personal information from the EEA, UK, or Switzerland to other countries, we implement appropriate safeguards, including Standard Contractual Clauses approved by the European Commission, to ensure your data receives an adequate level of protection.
            </p>
          </section>

          <section id="your-rights" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">9. Your Privacy Rights</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">General Rights</h3>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2 mb-4">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (&quot;right to be forgotten&quot;).</li>
              <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format.</li>
              <li><strong>Object:</strong> Object to certain processing activities.</li>
              <li><strong>Restrict:</strong> Request restriction of processing in certain circumstances.</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent.</li>
            </ul>

            <h3 className="font-semibold text-[#1b0d14] mb-2">California Privacy Rights (CCPA/CPRA)</h3>
            <p className="text-[#1b0d14]/80 mb-2">California residents have additional rights including:</p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-1 mb-4">
              <li>Right to know what personal information we collect, use, and share</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of &quot;sales&quot; (we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>

            <h3 className="font-semibold text-[#1b0d14] mb-2">How to Exercise Your Rights</h3>
            <p className="text-[#1b0d14]/80">
              To exercise any of these rights, please contact us at <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] underline">help@nailartai.app</a> with &quot;Privacy Rights Request&quot; in the subject line. We will respond within the timeframe required by applicable law (typically 30 days).
            </p>
          </section>

          <section id="childrens-privacy" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">10. Children&apos;s Privacy</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              Our Service is not directed to children under the age of 13 (or the minimum age required in your jurisdiction for data processing without parental consent). We do not knowingly collect personal information from children under 13.
            </p>
            <p className="text-[#1b0d14]/80">
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] underline">help@nailartai.app</a>. We will delete such information from our systems promptly.
            </p>
          </section>

          <section id="cookies" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">11. Cookies and Tracking Technologies</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              We use cookies and similar tracking technologies to collect and store information. Cookies are small data files stored on your device.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">Types of Cookies We Use</h3>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2 mb-4">
              <li><strong>Essential Cookies:</strong> Required for basic site functionality, authentication, and security. Cannot be disabled.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site (e.g., Google Analytics). You can opt out.</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings.</li>
              <li><strong>Performance Cookies:</strong> Collect information about site performance and errors.</li>
            </ul>

            <h3 className="font-semibold text-[#1b0d14] mb-2">Managing Cookies</h3>
            <p className="text-[#1b0d14]/80 mb-2">
              You can control cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-1 mb-3">
              <li>View and delete cookies</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies</li>
              <li>Clear cookies when you close your browser</li>
            </ul>
            <p className="text-[#1b0d14]/80">
              Note that blocking or deleting cookies may affect your ability to use certain features of our Service.
            </p>
          </section>

          <section id="changes" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">12. Changes to This Policy</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-1 mb-3">
              <li>Update the &quot;Last Updated&quot; date at the top of this policy</li>
              <li>Notify you via email or prominent notice on our Service</li>
              <li>Obtain your consent where required by law</li>
            </ul>
            <p className="text-[#1b0d14]/80">
              We encourage you to review this Privacy Policy periodically. Your continued use of the Service after changes become effective constitutes acceptance of the revised policy.
            </p>
          </section>

          <section id="contact" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">13. Contact Us</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-[#f8f6f7] p-4 rounded-lg mb-4">
              <p className="text-[#1b0d14]/80"><strong>Email:</strong> <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] underline">help@nailartai.app</a></p>
              <p className="text-[#1b0d14]/80"><strong>Website:</strong> <a href="https://nailartai.app/contact" className="text-[#ee2b8c] underline">https://nailartai.app/contact</a></p>
              <p className="text-[#1b0d14]/80 mt-2"><strong>Response Time:</strong> We typically respond to privacy inquiries within 48 hours.</p>
            </div>
            <p className="text-sm text-[#1b0d14]/70 mt-4">
              <strong>Last Updated:</strong> November 10, {new Date().getFullYear()}
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}


