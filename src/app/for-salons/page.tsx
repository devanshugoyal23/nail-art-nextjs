import type { Metadata } from "next";
import Link from "next/link";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptions";

export const metadata: Metadata = {
    title: "For Salon Owners - Get Featured on Nail Art AI | Grow Your Business",
    description: "Attract more customers to your nail salon with featured listings on Nail Art AI. Get premium placement, verified badges, and analytics. 400,000+ monthly views from customers searching for nail salons.",
    keywords: [
        "nail salon advertising",
        "promote nail salon",
        "nail salon marketing",
        "featured salon listing",
        "nail business growth",
        "salon directory listing",
        "nail salon customers",
        "local nail salon ads"
    ],
    openGraph: {
        title: "For Salon Owners - Get Featured on Nail Art AI",
        description: "Attract more customers to your nail salon with featured listings. 400,000+ monthly views from people searching for nail salons.",
        type: "website",
    },
    alternates: {
        canonical: '/for-salons',
    },
};

// Revalidate once per day
export const revalidate = 86400;

const pricingTiers = [
    {
        name: SUBSCRIPTION_PLANS.BASIC_BOOST.name,
        price: SUBSCRIPTION_PLANS.BASIC_BOOST.price,
        checkoutUrl: SUBSCRIPTION_PLANS.BASIC_BOOST.checkout_url,
        icon: "🥉",
        popular: false,
        features: [
            '"Featured" badge on listing',
            "Higher position in search results",
            "Highlighted border styling",
            "1 photo on your listing",
            "Website link displayed",
            "Email support"
        ],
        notIncluded: [
            "Top 3 positioning",
            "Multiple photos",
            "Analytics dashboard",
            "Verified badge"
        ]
    },
    {
        name: SUBSCRIPTION_PLANS.PREMIUM_BOOST.name,
        price: SUBSCRIPTION_PLANS.PREMIUM_BOOST.price,
        checkoutUrl: SUBSCRIPTION_PLANS.PREMIUM_BOOST.checkout_url,
        icon: "🥈",
        popular: true,
        features: [
            'Everything in Basic, plus:',
            "Top 3 position in city search",
            '"Premium" verified badge',
            "Up to 5 photos",
            "Extended description (200 words)",
            "Click-to-call button",
            "Business hours display",
            "Services list",
            "Monthly analytics report",
            "Priority email support"
        ],
        notIncluded: [
            "#1 position guarantee",
            "Social media links"
        ]
    },
    {
        name: SUBSCRIPTION_PLANS.SPOTLIGHT_BOOST.name,
        price: SUBSCRIPTION_PLANS.SPOTLIGHT_BOOST.price,
        checkoutUrl: SUBSCRIPTION_PLANS.SPOTLIGHT_BOOST.checkout_url,
        icon: "🥇",
        popular: false,
        features: [
            'Everything in Premium, plus:',
            "#1 position in your city",
            '"⭐ Verified" prominent badge',
            "Up to 10 photos + cover photo",
            "Featured on state page",
            "Social media links",
            "Special offers section",
            "Booking link integration",
            "Priority support",
            "Quarterly strategy call"
        ],
        notIncluded: []
    }
];

const testimonials = [
    {
        quote: "Since getting featured, I've received 15+ new customer calls per week directly from Nail Art AI!",
        author: "Sunny Nails",
        location: "Houston, TX",
        rating: 5
    },
    {
        quote: "The analytics dashboard helps me understand where my customers are coming from. Worth every penny.",
        author: "Luxe Nail Spa",
        location: "Phoenix, AZ",
        rating: 5
    },
    {
        quote: "I was skeptical at first, but within a month I recovered my investment 10x over.",
        author: "Nail Artistry Studio",
        location: "San Diego, CA",
        rating: 5
    }
];

const faqs = [
    {
        question: "How do I verify I own the salon?",
        answer: "We'll verify ownership through a simple process: either a phone call to your business number, an email to your business email, or by sending a verification code to your salon's address. This typically takes 1-2 business days."
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes! All plans are month-to-month with no long-term contracts. Cancel anytime from your dashboard, and your listing will revert to a standard listing at the end of your billing period."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and PayPal through our secure Stripe payment system."
    },
    {
        question: "How long until my listing is featured?",
        answer: "Once verified, your featured listing goes live within 24 hours. You'll receive an email confirmation with a link to view your enhanced listing."
    },
    {
        question: "What if I'm not satisfied?",
        answer: "We offer a 14-day money-back guarantee. If you're not seeing results in the first 14 days, contact us for a full refund, no questions asked."
    },
    {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Absolutely! You can change your plan anytime. Upgrades take effect immediately, and downgrades apply at your next billing cycle."
    }
];

export default function ForSalonsPage() {
    return (
        <div className="min-h-screen bg-[#f8f6f7]">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1b0d14] via-[#2d1520] to-[#1b0d14]">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-[#ee2b8c]/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ee2b8c]/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-[#ee2b8c]/20 border border-[#ee2b8c]/30 rounded-full px-4 py-2 mb-6">
                            <span className="text-[#ee2b8c] text-sm font-medium">🏪 For Salon Owners</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Get More Customers from{' '}
                            <span className="text-[#ee2b8c]">Nail Art AI</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
                            Your potential customers are already searching for you.{' '}
                            <span className="text-white font-semibold">400,000+ monthly impressions</span>{' '}
                            from people looking for nail salons in their area.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <a
                                href="#pricing"
                                className="inline-block bg-[#ee2b8c] text-white font-bold py-4 px-10 rounded-full hover:bg-[#ee2b8c]/90 transition-all shadow-xl shadow-[#ee2b8c]/20 hover:scale-105"
                            >
                                See Pricing Plans 💰
                            </a>
                            <a
                                href="mailto:salons@nailartai.app?subject=Claim My Salon Listing"
                                className="inline-block bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-10 rounded-full hover:bg-white/20 transition-all border border-white/20"
                            >
                                Claim Your Free Listing
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="text-3xl md:text-4xl font-bold text-[#ee2b8c]">407k+</div>
                                <div className="text-sm text-white/70">Monthly Views</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="text-3xl md:text-4xl font-bold text-[#ee2b8c]">50</div>
                                <div className="text-sm text-white/70">States Covered</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="text-3xl md:text-4xl font-bold text-[#ee2b8c]">10k+</div>
                                <div className="text-sm text-white/70">Salons Listed</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="text-3xl md:text-4xl font-bold text-[#ee2b8c]">#1</div>
                                <div className="text-sm text-white/70">Nail Art Site</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Feature Your Salon Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1b0d14] mb-4">
                        Why Feature Your Salon?
                    </h2>
                    <p className="text-lg text-[#1b0d14]/70 max-w-2xl mx-auto">
                        Stand out from competitors and attract customers who are actively looking for nail salons in your area.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 transition-all hover:shadow-lg">
                        <div className="w-12 h-12 bg-[#ee2b8c]/10 rounded-xl flex items-center justify-center text-2xl mb-4">
                            🔝
                        </div>
                        <h3 className="text-xl font-bold text-[#1b0d14] mb-2">Top Search Placement</h3>
                        <p className="text-[#1b0d14]/70">
                            Appear at the top of your city&apos;s salon listings, above competitors. Be the first salon customers see.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 transition-all hover:shadow-lg">
                        <div className="w-12 h-12 bg-[#ee2b8c]/10 rounded-xl flex items-center justify-center text-2xl mb-4">
                            ⭐
                        </div>
                        <h3 className="text-xl font-bold text-[#1b0d14] mb-2">&quot;Featured&quot; &amp; &quot;Verified&quot; Badges</h3>
                        <p className="text-[#1b0d14]/70">
                            Build instant trust with eye-catching badges that show customers you&apos;re a premium, verified business.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 transition-all hover:shadow-lg">
                        <div className="w-12 h-12 bg-[#ee2b8c]/10 rounded-xl flex items-center justify-center text-2xl mb-4">
                            📸
                        </div>
                        <h3 className="text-xl font-bold text-[#1b0d14] mb-2">Enhanced Photo Gallery</h3>
                        <p className="text-[#1b0d14]/70">
                            Showcase up to 10 photos of your best work, interior, and happy customers to attract more bookings.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 transition-all hover:shadow-lg">
                        <div className="w-12 h-12 bg-[#ee2b8c]/10 rounded-xl flex items-center justify-center text-2xl mb-4">
                            📊
                        </div>
                        <h3 className="text-xl font-bold text-[#1b0d14] mb-2">Analytics Dashboard</h3>
                        <p className="text-[#1b0d14]/70">
                            See exactly how many people view your listing, click for directions, or call your salon each month.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 transition-all hover:shadow-lg">
                        <div className="w-12 h-12 bg-[#ee2b8c]/10 rounded-xl flex items-center justify-center text-2xl mb-4">
                            📅
                        </div>
                        <h3 className="text-xl font-bold text-[#1b0d14] mb-2">Booking Link Integration</h3>
                        <p className="text-[#1b0d14]/70">
                            Add your booking link (Vagaro, Fresha, etc.) so customers can book appointments directly from your listing.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 transition-all hover:shadow-lg">
                        <div className="w-12 h-12 bg-[#ee2b8c]/10 rounded-xl flex items-center justify-center text-2xl mb-4">
                            💬
                        </div>
                        <h3 className="text-xl font-bold text-[#1b0d14] mb-2">Priority Support</h3>
                        <p className="text-[#1b0d14]/70">
                            Get fast responses from our team and help optimizing your listing for maximum visibility and conversions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1b0d14] mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-lg text-[#1b0d14]/70 max-w-2xl mx-auto">
                            Choose the plan that works for your salon. All plans include a 14-day money-back guarantee.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pricingTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`relative rounded-2xl p-6 ${tier.popular
                                    ? 'bg-gradient-to-br from-[#ee2b8c] to-[#c91f6f] text-white ring-4 ring-[#ee2b8c]/30 scale-105'
                                    : 'bg-[#f8f6f7] ring-1 ring-[#ee2b8c]/15'
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="bg-yellow-400 text-[#1b0d14] text-xs font-bold px-3 py-1 rounded-full">
                                            MOST POPULAR
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <div className="text-4xl mb-2">{tier.icon}</div>
                                    <h3 className={`text-2xl font-bold mb-2 ${tier.popular ? 'text-white' : 'text-[#1b0d14]'}`}>
                                        {tier.name}
                                    </h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className={`text-4xl font-bold ${tier.popular ? 'text-white' : 'text-[#ee2b8c]'}`}>
                                            ${tier.price}
                                        </span>
                                        <span className={tier.popular ? 'text-white/80' : 'text-[#1b0d14]/60'}>/month</span>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {tier.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-2">
                                            <span className={`text-lg ${tier.popular ? 'text-white' : 'text-[#ee2b8c]'}`}>✓</span>
                                            <span className={`text-sm ${tier.popular ? 'text-white/90' : 'text-[#1b0d14]/80'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href={tier.checkoutUrl}
                                    className={`block w-full text-center font-bold py-3 px-6 rounded-full transition-all ${tier.popular
                                        ? 'bg-white text-[#ee2b8c] hover:bg-white/90'
                                        : 'bg-[#ee2b8c] text-white hover:bg-[#ee2b8c]/90'
                                        }`}
                                >
                                    Get Started
                                </a>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-sm text-[#1b0d14]/60 mt-8">
                        💰 All plans are less than what you earn from ONE new customer. Cancel anytime.
                    </p>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1b0d14] mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg text-[#1b0d14]/70 max-w-2xl mx-auto">
                        Getting featured is simple. Here&apos;s how to get started in 4 easy steps.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#ee2b8c] rounded-full flex items-center justify-center text-2xl text-white font-bold mx-auto mb-4">
                            1
                        </div>
                        <h3 className="text-lg font-bold text-[#1b0d14] mb-2">Find Your Salon</h3>
                        <p className="text-sm text-[#1b0d14]/70">
                            Search our directory to find your salon&apos;s existing listing.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#ee2b8c] rounded-full flex items-center justify-center text-2xl text-white font-bold mx-auto mb-4">
                            2
                        </div>
                        <h3 className="text-lg font-bold text-[#1b0d14] mb-2">Verify Ownership</h3>
                        <p className="text-sm text-[#1b0d14]/70">
                            We&apos;ll verify you own the business (usually takes 1-2 days).
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#ee2b8c] rounded-full flex items-center justify-center text-2xl text-white font-bold mx-auto mb-4">
                            3
                        </div>
                        <h3 className="text-lg font-bold text-[#1b0d14] mb-2">Choose Your Plan</h3>
                        <p className="text-sm text-[#1b0d14]/70">
                            Select Basic, Premium, or Spotlight based on your goals.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#ee2b8c] rounded-full flex items-center justify-center text-2xl text-white font-bold mx-auto mb-4">
                            4
                        </div>
                        <h3 className="text-lg font-bold text-[#1b0d14] mb-2">Get Featured!</h3>
                        <p className="text-sm text-[#1b0d14]/70">
                            Your enhanced listing goes live within 24 hours.
                        </p>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="bg-gradient-to-br from-[#ee2b8c]/5 to-[#f8f6f7] py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1b0d14] mb-4">
                            What Salon Owners Say
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="text-yellow-500">⭐</span>
                                    ))}
                                </div>
                                <p className="text-[#1b0d14]/80 mb-4 italic">
                                    &quot;{testimonial.quote}&quot;
                                </p>
                                <div className="text-sm">
                                    <div className="font-bold text-[#1b0d14]">{testimonial.author}</div>
                                    <div className="text-[#1b0d14]/60">{testimonial.location}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1b0d14] mb-4">
                        Frequently Asked Questions
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15"
                        >
                            <h3 className="text-lg font-bold text-[#1b0d14] mb-2">{faq.question}</h3>
                            <p className="text-[#1b0d14]/70">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final CTA Section */}
            <div className="bg-gradient-to-br from-[#1b0d14] via-[#2d1520] to-[#1b0d14] py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Grow Your Salon?
                    </h2>
                    <p className="text-xl text-white/80 mb-8">
                        Join hundreds of salons already benefiting from featured listings on Nail Art AI.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:salons@nailartai.app?subject=I want to feature my salon"
                            className="inline-block bg-[#ee2b8c] text-white font-bold py-4 px-10 rounded-full hover:bg-[#ee2b8c]/90 transition-all shadow-xl shadow-[#ee2b8c]/20 hover:scale-105"
                        >
                            Get Started Today 🚀
                        </a>
                        <Link
                            href="/nail-salons"
                            className="inline-block bg-white/10 backdrop-blur-sm text-white font-bold py-4 px-10 rounded-full hover:bg-white/20 transition-all border border-white/20"
                        >
                            Browse Salon Directory
                        </Link>
                    </div>
                    <p className="text-white/60 text-sm mt-6">
                        Questions? Email us at{' '}
                        <a href="mailto:salons@nailartai.app" className="text-[#ee2b8c] underline">
                            salons@nailartai.app
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
