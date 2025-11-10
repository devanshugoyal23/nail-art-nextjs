import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - User Agreement & Conditions | Nail Art AI",
  description: "Read Nail Art AI's Terms of Service. Learn about user rights, acceptable use, content ownership, disclaimers, and legal terms. Last updated November 2025.",
  keywords: [
    "terms of service",
    "user agreement",
    "terms and conditions",
    "legal terms",
    "service agreement",
    "user rights",
    "acceptable use policy"
  ],
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1b0d14] mb-3">Terms of Service</h1>
        <p className="text-lg text-[#1b0d14]/80 max-w-3xl mb-4">
          Welcome to Nail Art AI. By accessing or using our Service, you agree to be bound by these Terms of Service.
          Please read them carefully before using our platform.
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
              <a href="#acceptance" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Acceptance of Terms</a>
              <a href="#eligibility" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Eligibility & Accounts</a>
              <a href="#acceptable-use" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Acceptable Use</a>
              <a href="#user-content" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">User Content</a>
              <a href="#intellectual-property" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Intellectual Property</a>
              <a href="#third-party" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Third‑Party Services</a>
              <a href="#termination" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Termination</a>
              <a href="#disclaimers" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Disclaimers</a>
              <a href="#limitation" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Limitation of Liability</a>
              <a href="#indemnification" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Indemnification</a>
              <a href="#dispute-resolution" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Dispute Resolution</a>
              <a href="#changes" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Changes</a>
              <a href="#contact" className="block rounded-md px-3 py-2 text-[#1b0d14]/80 hover:bg-black/5 hover:text-[#1b0d14]">Contact</a>
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-6">
          <section id="acceptance" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">1. Acceptance of Terms</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              These Terms of Service ("Terms") constitute a legally binding agreement between you and Nail Art AI
              ("we," "us," or "our") regarding your access to and use of our website, mobile applications, and services
              (collectively, the "Service").
            </p>
            <p className="text-[#1b0d14]/80 mb-3">
              By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound
              by these Terms and our <a href="/privacy" className="text-[#ee2b8c] underline">Privacy Policy</a>. If you
              do not agree to these Terms, you must not access or use the Service.
            </p>
            <p className="text-[#1b0d14]/80">
              We reserve the right to modify these Terms at any time. Your continued use of the Service after changes
              become effective constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section id="eligibility" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">2. Eligibility & User Accounts</h2>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">2.1 Age Requirements</h3>
            <p className="text-[#1b0d14]/80 mb-3">
              You must be at least 13 years old (or the minimum age required in your jurisdiction) to use the Service.
              If you are under 18, you represent that you have your parent or guardian's permission to use the Service.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2">2.2 Account Creation</h3>
            <p className="text-[#1b0d14]/80 mb-2">
              To access certain features, you may need to create an account. When creating an account, you agree to:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-1 mb-3">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>

            <h3 className="font-semibold text-[#1b0d14] mb-2">2.3 Account Security</h3>
            <p className="text-[#1b0d14]/80">
              You are solely responsible for maintaining the confidentiality of your account credentials. We are not
              liable for any loss or damage arising from your failure to protect your account information.
            </p>
          </section>

          <section id="acceptable-use" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">3. Acceptable Use Policy</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">Prohibited Activities</h3>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2">
              <li>Violate any applicable local, state, national, or international law or regulation</li>
              <li>Infringe upon or violate our intellectual property rights or the rights of others</li>
              <li>Upload, post, or transmit content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity</li>
              <li>Upload viruses, malware, or any other malicious code</li>
              <li>Attempt to gain unauthorized access to the Service, other user accounts, or computer systems or networks</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
              <li>Use automated systems (bots, scrapers, crawlers) to access the Service without our written permission</li>
              <li>Collect or store personal information about other users without their consent</li>
              <li>Use the Service for any commercial purpose without our prior written consent</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Remove, alter, or obscure any copyright, trademark, or other proprietary rights notices</li>
            </ul>
          </section>

          <section id="user-content" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">4. User Content & Generated Designs</h2>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">4.1 Your Content</h3>
            <p className="text-[#1b0d14]/80 mb-3">
              You retain all ownership rights to content you upload, submit, or post to the Service ("User Content"),
              including hand photos, reviews, ratings, and comments. By submitting User Content, you grant us a
              worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute,
              prepare derivative works of, display, and perform the User Content solely to provide, maintain, and improve
              the Service.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2">4.2 AI-Generated Designs</h3>
            <p className="text-[#1b0d14]/80 mb-3">
              AI-generated nail art designs created using our virtual try-on feature are provided for your inspiration
              and personal use. Subject to these Terms and applicable law, we grant you a non-exclusive, worldwide,
              royalty-free license to use, download, and display AI-generated designs for personal and commercial purposes.
            </p>
            <p className="text-[#1b0d14]/80 mb-3">
              You acknowledge that:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-1">
              <li>AI-generated content may not be unique and similar designs may be generated for other users</li>
              <li>We do not guarantee the accuracy, quality, or suitability of AI-generated designs</li>
              <li>You are responsible for ensuring any commercial use complies with applicable laws and third-party rights</li>
            </ul>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">4.3 Content Moderation</h3>
            <p className="text-[#1b0d14]/80">
              We reserve the right (but have no obligation) to monitor, review, edit, or remove User Content that
              violates these Terms or is otherwise objectionable, at our sole discretion and without notice.
            </p>
          </section>

          <section id="intellectual-property" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">5. Intellectual Property Rights</h2>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">5.1 Our Intellectual Property</h3>
            <p className="text-[#1b0d14]/80 mb-3">
              The Service and its entire contents, features, and functionality (including but not limited to all information,
              software, code, text, displays, graphics, photographs, video, audio, design, presentation, selection, and
              arrangement) are owned by Nail Art AI, its licensors, or other providers of such material and are protected
              by United States and international copyright, trademark, patent, trade secret, and other intellectual property
              laws.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2">5.2 Trademarks</h3>
            <p className="text-[#1b0d14]/80 mb-3">
              "Nail Art AI" and all related logos, product and service names, designs, and slogans are trademarks of
              Nail Art AI. You may not use such marks without our prior written permission. Other names, logos, and brands
              are property of their respective owners.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2">5.3 Limited License</h3>
            <p className="text-[#1b0d14]/80">
              Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable license
              to access and use the Service for your personal, non-commercial use. This license does not include any right
              to: (a) resell or commercial use of the Service; (b) copy, reproduce, or download content except as
              permitted; (c) make derivative works; or (d) use data mining, robots, or similar tools.
            </p>
          </section>

          <section id="third-party" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">6. Third-Party Services & Links</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              The Service may contain links to third-party websites, applications, or services ("Third-Party Services")
              that are not owned or controlled by Nail Art AI, including nail salon websites, social media platforms,
              and payment processors.
            </p>
            <p className="text-[#1b0d14]/80 mb-3">
              We have no control over, and assume no responsibility for, the content, privacy policies, or practices of
              any Third-Party Services. You acknowledge and agree that we shall not be responsible or liable, directly
              or indirectly, for any damage or loss caused by or in connection with use of or reliance on any such content,
              goods, or services available on or through any Third-Party Services.
            </p>
            <p className="text-[#1b0d14]/80">
              We strongly advise you to read the terms and conditions and privacy policies of any Third-Party Services
              that you visit or use.
            </p>
          </section>

          <section id="termination" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">7. Termination & Suspension</h2>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">7.1 Termination by You</h3>
            <p className="text-[#1b0d14]/80 mb-3">
              You may stop using the Service at any time. If you have an account, you may close it by contacting us
              at <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] underline">help@nailartai.app</a>.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2">7.2 Termination by Us</h3>
            <p className="text-[#1b0d14]/80 mb-3">
              We may suspend or terminate your access to the Service immediately, without prior notice or liability,
              for any reason, including but not limited to:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-1 mb-3">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Extended periods of inactivity</li>
              <li>Technical or security issues</li>
              <li>Regulatory or legal requirements</li>
            </ul>

            <h3 className="font-semibold text-[#1b0d14] mb-2">7.3 Effect of Termination</h3>
            <p className="text-[#1b0d14]/80">
              Upon termination, your right to use the Service will immediately cease. All provisions of these Terms
              that by their nature should survive termination shall survive, including ownership provisions, warranty
              disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section id="disclaimers" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">8. Disclaimers & Warranties</h2>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-sm font-semibold text-yellow-800 mb-1">IMPORTANT LEGAL NOTICE</p>
              <p className="text-sm text-yellow-700">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND.
              </p>
            </div>

            <p className="text-[#1b0d14]/80 mb-3">
              TO THE FULLEST EXTENT PERMITTED BY LAW, NAIL ART AI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2">
              <li>WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
              <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF CONTENT</li>
              <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE</li>
              <li>WARRANTIES REGARDING THE QUALITY OR SUITABILITY OF AI-GENERATED DESIGNS</li>
              <li>WARRANTIES THAT DEFECTS WILL BE CORRECTED</li>
              <li>WARRANTIES REGARDING THIRD-PARTY SERVICES OR CONTENT</li>
            </ul>

            <p className="text-[#1b0d14]/80 mt-3">
              We do not warrant that the Service will meet your requirements or expectations. Any material downloaded
              or obtained through the Service is accessed at your own discretion and risk, and you will be solely
              responsible for any damage to your device or loss of data.
            </p>
          </section>

          <section id="limitation" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">9. Limitation of Liability</h2>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-sm font-semibold text-red-800 mb-1">LIABILITY CAP</p>
              <p className="text-sm text-red-700">
                OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM YOUR USE OF THE SERVICE IS LIMITED AS DESCRIBED BELOW.
              </p>
            </div>

            <p className="text-[#1b0d14]/80 mb-3">
              TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL NAIL ART AI, ITS AFFILIATES, OFFICERS, DIRECTORS,
              EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2 mb-3">
              <li>ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
              <li>ANY LOSS OF PROFITS, REVENUE, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES</li>
              <li>DAMAGES RESULTING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE</li>
              <li>DAMAGES RESULTING FROM ANY CONDUCT OR CONTENT OF THIRD PARTIES</li>
              <li>DAMAGES RESULTING FROM UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR CONTENT</li>
              <li>DAMAGES RESULTING FROM ANY AI-GENERATED CONTENT OR RECOMMENDATIONS</li>
            </ul>

            <p className="text-[#1b0d14]/80 mb-3">
              WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), PRODUCT LIABILITY, OR ANY OTHER LEGAL
              THEORY, AND WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
            </p>

            <p className="text-[#1b0d14]/80">
              <strong>Maximum Liability:</strong> In no event shall our total liability to you for all damages exceed
              the greater of (a) the amount you paid us in the 12 months prior to the event giving rise to liability, or
              (b) $100 USD.
            </p>
          </section>

          <section id="indemnification" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">10. Indemnification</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              You agree to defend, indemnify, and hold harmless Nail Art AI and its affiliates, officers, directors,
              employees, agents, suppliers, and licensors from and against any and all claims, damages, obligations,
              losses, liabilities, costs, and expenses (including but not limited to reasonable attorneys' fees) arising from:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-2">
              <li>Your use of or inability to use the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights, including intellectual property or privacy rights</li>
              <li>Your User Content</li>
              <li>Any fraudulent, negligent, or illegal conduct by you</li>
            </ul>
          </section>

          <section id="dispute-resolution" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">11. Dispute Resolution & Governing Law</h2>

            <h3 className="font-semibold text-[#1b0d14] mb-2 mt-4">11.1 Governing Law</h3>
            <p className="text-[#1b0d14]/80 mb-3">
              These Terms shall be governed by and construed in accordance with the laws of the United States and the
              state in which Nail Art AI is incorporated, without regard to its conflict of law provisions.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2">11.2 Informal Resolution</h3>
            <p className="text-[#1b0d14]/80 mb-3">
              Before filing a claim, you agree to try to resolve the dispute informally by contacting us at{' '}
              <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] underline">help@nailartai.app</a>. We will
              attempt to resolve the dispute informally within 60 days.
            </p>

            <h3 className="font-semibold text-[#1b0d14] mb-2">11.3 Jurisdiction</h3>
            <p className="text-[#1b0d14]/80">
              You agree to submit to the personal jurisdiction of the state and federal courts located within the United
              States for the purpose of litigating all such claims or disputes.
            </p>
          </section>

          <section id="changes" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">12. Changes to These Terms</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision
              is material, we will provide at least 30 days' notice prior to any new terms taking effect by:
            </p>
            <ul className="text-[#1b0d14]/80 list-disc pl-5 space-y-1 mb-3">
              <li>Updating the "Last Updated" date at the top of these Terms</li>
              <li>Sending you an email notification (if you have provided an email address)</li>
              <li>Posting a prominent notice on the Service</li>
            </ul>
            <p className="text-[#1b0d14]/80">
              Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance
              of the new Terms. If you do not agree to the new Terms, you must stop using the Service.
            </p>
          </section>

          <section id="contact" className="not-prose rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-xl font-semibold text-[#1b0d14] mb-3">13. Contact Us</h2>
            <p className="text-[#1b0d14]/80 mb-3">
              If you have any questions, concerns, or feedback about these Terms of Service, please contact us:
            </p>
            <div className="bg-[#f8f6f7] p-4 rounded-lg mb-4">
              <p className="text-[#1b0d14]/80"><strong>Email:</strong> <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] underline">help@nailartai.app</a></p>
              <p className="text-[#1b0d14]/80"><strong>Website:</strong> <a href="https://nailartai.app/contact" className="text-[#ee2b8c] underline">https://nailartai.app/contact</a></p>
              <p className="text-[#1b0d14]/80 mt-2"><strong>Response Time:</strong> We typically respond to legal inquiries within 48-72 hours.</p>
            </div>
            <p className="text-sm text-[#1b0d14]/70 mt-4">
              <strong>Last Updated:</strong> November 10, {new Date().getFullYear()}
            </p>
          </section>

          <section className="not-prose rounded-xl bg-gradient-to-br from-[#ee2b8c]/5 to-[#ee2b8c]/10 p-6">
            <h3 className="font-semibold text-[#1b0d14] mb-2">Acknowledgment</h3>
            <p className="text-sm text-[#1b0d14]/80">
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
