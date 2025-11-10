import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch with Nail Art AI Support",
  description: "Contact Nail Art AI for customer support, technical help, partnership inquiries, or general questions. We respond to most inquiries within 24 hours. Email us at help@nailartai.app or use our contact form.",
  keywords: [
    "contact nail art ai",
    "nail art ai support",
    "customer service",
    "technical support",
    "partnership inquiries",
    "nail art help",
    "contact us"
  ],
  openGraph: {
    title: "Contact Nail Art AI - Support & Inquiries",
    description: "Get in touch with our team for support, partnerships, and questions. Fast response times and friendly service.",
    type: "website",
  },
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1b0d14] mb-4">Contact Us</h1>
      <p className="text-lg text-[#1b0d14]/80 max-w-3xl mb-8">
        We&apos;re here to help! Whether you have a question about our virtual try-on technology, need technical support,
        want to explore partnership opportunities, or simply want to share feedback, our team is ready to assist you.
        Get in touch using any of the methods below, and we&apos;ll respond as quickly as possible.
      </p>

      {/* Primary Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-5xl">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6 hover:ring-[#ee2b8c]/30 transition-all">
          <div className="text-4xl mb-3">📧</div>
          <h2 className="text-xl font-semibold text-[#1b0d14] mb-2">Email Support</h2>
          <p className="text-sm text-[#1b0d14]/70 mb-3">
            For general inquiries, technical support, or detailed questions
          </p>
          <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] font-semibold hover:underline">
            help@nailartai.app
          </a>
          <p className="text-xs text-[#1b0d14]/60 mt-2">
            Response time: Within 24 hours
          </p>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6 hover:ring-[#ee2b8c]/30 transition-all">
          <div className="text-4xl mb-3">💼</div>
          <h2 className="text-xl font-semibold text-[#1b0d14] mb-2">Business & Partnerships</h2>
          <p className="text-sm text-[#1b0d14]/70 mb-3">
            For salon partnerships, brand collaborations, or business inquiries
          </p>
          <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] font-semibold hover:underline">
            help@nailartai.app
          </a>
          <p className="text-xs text-[#1b0d14]/60 mt-2">
            Response time: Within 48 hours
          </p>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6 hover:ring-[#ee2b8c]/30 transition-all">
          <div className="text-4xl mb-3">🤝</div>
          <h2 className="text-xl font-semibold text-[#1b0d14] mb-2">Press & Media</h2>
          <p className="text-sm text-[#1b0d14]/70 mb-3">
            For press inquiries, media kits, or interview requests
          </p>
          <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] font-semibold hover:underline">
            help@nailartai.app
          </a>
          <p className="text-xs text-[#1b0d14]/60 mt-2">
            Response time: Within 24 hours
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-8 mb-10 max-w-3xl">
        <h2 className="text-2xl font-bold mb-2">Send Us a Message</h2>
        <p className="text-[#1b0d14]/70 mb-6">
          Fill out the form below and we&apos;ll get back to you as soon as possible. For urgent matters,
          please email us directly at <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] underline">help@nailartai.app</a>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-[#1b0d14] block mb-1">Name *</label>
            <input
              className="w-full rounded-lg border border-[#ee2b8c]/30 bg-white px-4 py-2.5 focus:ring-2 focus:ring-[#ee2b8c] focus:border-transparent transition-all"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1b0d14] block mb-1">Email *</label>
            <input
              type="email"
              className="w-full rounded-lg border border-[#ee2b8c]/30 bg-white px-4 py-2.5 focus:ring-2 focus:ring-[#ee2b8c] focus:border-transparent transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#1b0d14] block mb-1">Subject *</label>
            <input
              className="w-full rounded-lg border border-[#ee2b8c]/30 bg-white px-4 py-2.5 focus:ring-2 focus:ring-[#ee2b8c] focus:border-transparent transition-all"
              placeholder="What is your message about?"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-[#1b0d14] block mb-1">Message *</label>
            <textarea
              className="w-full rounded-lg border border-[#ee2b8c]/30 bg-white px-4 py-2.5 h-32 focus:ring-2 focus:ring-[#ee2b8c] focus:border-transparent transition-all resize-none"
              placeholder="Tell us how we can help you..."
              required
            />
          </div>
          <div className="sm:col-span-2">
            <button className="bg-[#ee2b8c] text-white font-semibold py-3 px-8 rounded-full hover:bg-[#ee2b8c]/90 transition-colors">
              Send Message
            </button>
          </div>
        </div>
        <p className="text-xs text-[#1b0d14]/60 mt-4">
          * This contact form will be functional in production. For now, please email us directly at help@nailartai.app
        </p>
      </div>

      {/* FAQ Quick Links */}
      <div className="rounded-xl bg-gradient-to-br from-[#ee2b8c]/5 to-[#ee2b8c]/10 p-8 mb-10 max-w-5xl">
        <h2 className="text-2xl font-bold mb-4">Quick Help</h2>
        <p className="text-[#1b0d14]/80 mb-6">
          Looking for immediate answers? Check out these resources before contacting us:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/faq" className="flex items-center gap-3 p-4 bg-white rounded-lg hover:ring-2 hover:ring-[#ee2b8c]/30 transition-all">
            <span className="text-2xl">❓</span>
            <div>
              <h3 className="font-semibold text-[#1b0d14]">Frequently Asked Questions</h3>
              <p className="text-sm text-[#1b0d14]/70">Find answers to common questions</p>
            </div>
          </a>
          <a href="/nail-care-tips" className="flex items-center gap-3 p-4 bg-white rounded-lg hover:ring-2 hover:ring-[#ee2b8c]/30 transition-all">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-[#1b0d14]">Nail Care Tips</h3>
              <p className="text-sm text-[#1b0d14]/70">Expert advice and guides</p>
            </div>
          </a>
          <a href="/try-on" className="flex items-center gap-3 p-4 bg-white rounded-lg hover:ring-2 hover:ring-[#ee2b8c]/30 transition-all">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="font-semibold text-[#1b0d14]">Virtual Try-On Help</h3>
              <p className="text-sm text-[#1b0d14]/70">Learn how to use our AI tool</p>
            </div>
          </a>
          <a href="/about" className="flex items-center gap-3 p-4 bg-white rounded-lg hover:ring-2 hover:ring-[#ee2b8c]/30 transition-all">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-[#1b0d14]">About Nail Art AI</h3>
              <p className="text-sm text-[#1b0d14]/70">Learn about our platform</p>
            </div>
          </a>
        </div>
      </div>

      {/* Support Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-5xl">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h3 className="text-xl font-semibold mb-3">Support Hours</h3>
          <div className="space-y-2 text-sm text-[#1b0d14]/80">
            <p><strong>Email Support:</strong> 24/7 (responses within 24 hours)</p>
            <p><strong>Business Inquiries:</strong> Monday - Friday, 9 AM - 6 PM EST</p>
            <p><strong>Emergency Support:</strong> For urgent technical issues, mark your email as &quot;URGENT&quot;</p>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h3 className="text-xl font-semibold mb-3">What to Expect</h3>
          <ul className="space-y-2 text-sm text-[#1b0d14]/80">
            <li className="flex items-start gap-2">
              <span className="text-[#ee2b8c] mt-0.5">✓</span>
              <span>Friendly, professional support from our team</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ee2b8c] mt-0.5">✓</span>
              <span>Fast response times (usually within 24 hours)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ee2b8c] mt-0.5">✓</span>
              <span>Detailed answers and step-by-step guidance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ee2b8c] mt-0.5">✓</span>
              <span>Follow-up until your issue is fully resolved</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Partnership Information */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-8 max-w-5xl">
        <h2 className="text-2xl font-bold mb-4">Partnership Opportunities</h2>
        <div className="text-[#1b0d14]/80 space-y-4">
          <p>
            We&apos;re always looking to collaborate with nail salons, nail artists, beauty brands, and content creators
            who share our passion for nail art. If you&apos;re interested in any of the following, please reach out:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-[#ee2b8c] text-xl">•</span>
              <div>
                <strong>Nail Salon Partnerships</strong>
                <p className="text-sm">Feature your salon in our directory with premium placement</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#ee2b8c] text-xl">•</span>
              <div>
                <strong>Content Collaborations</strong>
                <p className="text-sm">Share your designs, tutorials, and expertise with our community</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#ee2b8c] text-xl">•</span>
              <div>
                <strong>Brand Partnerships</strong>
                <p className="text-sm">Promote your nail care products to our engaged audience</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#ee2b8c] text-xl">•</span>
              <div>
                <strong>API Integration</strong>
                <p className="text-sm">Integrate our AI technology into your platform or app</p>
              </div>
            </div>
          </div>
          <p className="mt-4">
            Email us at <a href="mailto:help@nailartai.app" className="text-[#ee2b8c] font-semibold underline">help@nailartai.app</a> with
            &quot;Partnership&quot; in the subject line, and tell us about your idea!
          </p>
        </div>
      </div>
    </div>
  );
}


