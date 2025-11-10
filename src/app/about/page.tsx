import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - Our Story, Mission & Team | Nail Art AI",
  description: "Discover the story behind Nail Art AI, the world's first AI-powered virtual nail art try-on platform. Learn about our mission to revolutionize nail art discovery, our cutting-edge technology, and how we help 50,000+ users find their perfect manicure every month.",
  keywords: [
    "about nail art ai",
    "nail art AI platform",
    "virtual nail try-on",
    "AI nail art technology",
    "nail art innovation",
    "nail design platform",
    "about us",
    "company story",
    "nail art mission"
  ],
  openGraph: {
    title: "About Nail Art AI - Our Story & Mission",
    description: "The world's first AI-powered virtual nail art try-on platform. Serving 50,000+ users with 1M+ designs generated.",
    type: "website",
  },
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1b0d14] mb-4">About Nail Art AI</h1>
      <p className="text-lg text-[#1b0d14]/80 max-w-3xl mb-8">
        Nail Art AI is revolutionizing how people discover, visualize, and plan their perfect manicure.
        We combine cutting-edge artificial intelligence with a passion for nail art to create the world&apos;s
        most comprehensive nail design platform.
      </p>

      {/* Our Story - Detailed */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-8 mb-8 max-w-5xl">
        <h2 className="text-2xl font-bold mb-4">Our Story</h2>
        <div className="text-[#1b0d14]/80 space-y-4">
          <p>
            Nail Art AI was born from a simple frustration: finding the perfect nail design shouldn&apos;t be so hard.
            Our founder spent countless hours scrolling through Pinterest, Instagram, and nail salon portfolios,
            saving screenshots and trying to imagine how different designs would actually look on her hands.
            The disconnect between inspiration images and reality was enormous.
          </p>
          <p>
            In 2023, we brought together a team of experienced software engineers, AI specialists, and nail art
            enthusiasts to solve this problem. We asked ourselves: &quot;What if you could instantly see any nail design
            on your actual hands before committing?&quot; That question led to the creation of our revolutionary
            AI-powered virtual try-on technology.
          </p>
          <p>
            Today, Nail Art AI serves over 50,000 monthly users across the United States, helping them discover
            their perfect manicure with confidence. We&apos;ve generated over 1 million nail art previews and maintain
            a curated gallery of more than 1,000 professional designs across every style, color, technique, and occasion.
          </p>
          <p>
            What started as a solution to a personal problem has grown into a comprehensive platform that nail
            enthusiasts, professionals, and casual users alike rely on for inspiration, education, and decision-making.
            We&apos;re proud to be making nail art more accessible and enjoyable for everyone.
          </p>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h2 className="text-xl font-semibold mb-3 text-[#ee2b8c]">Our Mission</h2>
          <p className="text-[#1b0d14]/80">
            To empower everyone to find and visualize their perfect nail art design instantly, removing
            the guesswork from choosing a manicure and making salon visits stress-free and exciting. We believe
            every person deserves to feel confident about their nail art choices.
          </p>
        </div>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h2 className="text-xl font-semibold mb-3 text-[#ee2b8c]">Our Vision</h2>
          <p className="text-[#1b0d14]/80">
            To become the world&apos;s most trusted source for nail art inspiration and visualization, where
            every design decision is informed, personalized, and backed by cutting-edge AI technology.
            We envision a future where trying on nail art is as easy as applying a filter.
          </p>
        </div>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h2 className="text-xl font-semibold mb-3 text-[#ee2b8c]">Our Values</h2>
          <p className="text-[#1b0d14]/80">
            Innovation through technology, respect for creativity, commitment to user privacy, and dedication
            to accessibility. We build tools that are powerful yet simple, sophisticated yet approachable,
            and always put our users&apos; needs first.
          </p>
        </div>
      </div>

      {/* What We Offer */}
      <div className="rounded-xl bg-gradient-to-br from-[#ee2b8c]/5 to-[#ee2b8c]/10 p-8 mb-10 max-w-5xl">
        <h2 className="text-2xl font-bold mb-6">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span>AI Virtual Try-On</span>
            </h3>
            <p className="text-[#1b0d14]/80 text-sm">
              Our flagship feature uses advanced computer vision and AI to realistically apply nail art designs
              to photos of your actual hands. Upload a hand photo and instantly see how hundreds of designs
              look on you – no appointments, no commitment, just pure experimentation.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span>Curated Design Gallery</span>
            </h3>
            <p className="text-[#1b0d14]/80 text-sm">
              Browse over 1,000 professionally curated nail art designs organized by color, shape, technique,
              season, occasion, and style. Every design includes detailed information about colors used,
              techniques required, difficulty level, and step-by-step instructions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <span>Nail Salon Directory</span>
            </h3>
            <p className="text-[#1b0d14]/80 text-sm">
              Find the perfect nail salon near you with our comprehensive directory covering all 50 states.
              We provide detailed information including ratings, reviews, services offered, pricing,
              photos, and contact details to help you make informed decisions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span>Educational Resources</span>
            </h3>
            <p className="text-[#1b0d14]/80 text-sm">
              Learn everything about nail care, techniques, trends, and maintenance through our comprehensive
              guides and tutorials. From beginner basics to advanced techniques, we provide expert knowledge
              to help you achieve salon-quality results at home.
            </p>
          </div>
        </div>
      </div>

      {/* By The Numbers */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-8 mb-10 max-w-5xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Nail Art AI By The Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#ee2b8c] mb-2">1M+</div>
            <div className="text-sm text-[#1b0d14]/70">Designs Generated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#ee2b8c] mb-2">50K+</div>
            <div className="text-sm text-[#1b0d14]/70">Monthly Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#ee2b8c] mb-2">1,000+</div>
            <div className="text-sm text-[#1b0d14]/70">Design Styles</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#ee2b8c] mb-2">4.8★</div>
            <div className="text-sm text-[#1b0d14]/70">User Rating</div>
          </div>
        </div>
      </div>

      {/* Technology & Innovation */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-8 mb-10 max-w-5xl">
        <h2 className="text-2xl font-bold mb-4">Technology & Innovation</h2>
        <div className="text-[#1b0d14]/80 space-y-4">
          <p>
            Our platform is built on cutting-edge artificial intelligence and machine learning technologies.
            We use advanced computer vision algorithms to detect hand shapes, nail positions, and lighting
            conditions, ensuring that virtual try-ons look realistic and natural.
          </p>
          <p>
            The website is built with Next.js 15 and React 19, ensuring lightning-fast page loads and smooth
            interactions. We&apos;ve optimized every aspect of performance, from image delivery through our global
            CDN to intelligent caching strategies that reduce server costs while maintaining instant access
            to all content.
          </p>
          <p>
            We continuously improve our AI models based on user feedback and the latest research in computer
            vision and image processing. Our commitment to innovation means that Nail Art AI gets better
            every day, with new features and improvements rolled out regularly.
          </p>
        </div>
      </div>

      {/* Our Commitment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 max-w-5xl">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h3 className="text-lg font-semibold mb-3">Quality & Performance</h3>
          <p className="text-sm text-[#1b0d14]/80">
            Every design in our gallery is carefully curated for quality and practicality. Our platform
            is optimized for speed with sub-second page loads, optimized images, and a responsive design
            that works beautifully on any device – from smartphones to desktops.
          </p>
        </div>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h3 className="text-lg font-semibold mb-3">Privacy & Security</h3>
          <p className="text-sm text-[#1b0d14]/80">
            Your privacy is paramount. We use secure HTTPS connections, never sell your personal data,
            and give you full control over your information. Hand photos used for virtual try-on are
            processed securely and never stored without your explicit permission.
          </p>
        </div>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <h3 className="text-lg font-semibold mb-3">Community & Creators</h3>
          <p className="text-sm text-[#1b0d14]/80">
            We celebrate nail artists, technicians, and salons by featuring their work and providing
            attribution. We partner with creators to showcase seasonal trends, tutorials, and innovative
            techniques that inspire our community and advance the art of nail design.
          </p>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="rounded-xl bg-gradient-to-r from-[#ee2b8c] to-[#ee2b8c]/80 p-8 text-white text-center max-w-5xl">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="mb-6 text-white/90 max-w-2xl mx-auto">
          Whether you&apos;re a nail art enthusiast, a professional technician, or someone looking for their
          next manicure inspiration, we&apos;re here to help. Have questions, suggestions, or partnership
          ideas? We&apos;d love to hear from you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-block bg-white text-[#ee2b8c] font-semibold py-3 px-8 rounded-full hover:bg-white/90 transition-colors"
          >
            Contact Us
          </Link>
          <a
            href="mailto:help@nailartai.app"
            className="inline-block bg-white/20 text-white font-semibold py-3 px-8 rounded-full hover:bg-white/30 transition-colors"
          >
            Email: help@nailartai.app
          </a>
        </div>
      </div>
    </div>
  );
}


