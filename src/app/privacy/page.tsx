import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Nail Art AI",
  description: "How Nail Art AI collects, uses and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16 prose prose-p:leading-relaxed max-w-3xl">
      <h1 className="text-[#1b0d14]">Privacy Policy</h1>
      <p>
        Your privacy matters. This Policy explains what data we collect, how we use it, and the
        choices you have.
      </p>
      <h2>Information We Collect</h2>
      <p>
        We may collect basic usage analytics, device information and content you submit (e.g.
        uploaded images) to provide and improve the Service.
      </p>
      <h2>How We Use Information</h2>
      <p>
        To operate the Service, personalize content, prevent abuse, and analyze performance. We do
        not sell your personal information.
      </p>
      <h2>Your Choices</h2>
      <p>
        You may request deletion of your data or opt out of certain analytics. Contact us for any
        privacy requests.
      </p>
      <p className="text-sm text-[#1b0d14]/60">Last updated: {new Date().getFullYear()}</p>
    </div>
  );
}


