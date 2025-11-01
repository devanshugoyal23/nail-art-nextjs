import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Nail Art AI",
  description: "The terms and conditions that govern your use of Nail Art AI.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16 prose prose-p:leading-relaxed max-w-3xl">
      <h1 className="text-[#1b0d14]">Terms of Service</h1>
      <p>
        By accessing or using Nail Art AI, you agree to these Terms. If you do not agree, please do
        not use the Service.
      </p>
      <h2>Use of the Service</h2>
      <p>
        You may use the Service only for lawful purposes and in accordance with these Terms. You are
        responsible for any content you upload or generate.
      </p>
      <h2>Intellectual Property</h2>
      <p>
        All site content, trademarks and logos are the property of their respective owners and may
        not be used without permission.
      </p>
      <h2>Disclaimers</h2>
      <p>
        The Service is provided &quot;as is&quot; without warranties of any kind. We do not warrant that the
        Service will be uninterrupted or error‑free.
      </p>
      <h2>Changes</h2>
      <p>
        We may update these Terms from time to time. Your continued use of the Service constitutes
        acceptance of the revised Terms.
      </p>
      <p className="text-sm text-[#1b0d14]/60">Last updated: {new Date().getFullYear()}</p>
    </div>
  );
}


