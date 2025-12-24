import type { Metadata } from "next";
import OptimizedImage from "@/components/OptimizedImage";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptions";
import SalonPageComparison from "@/components/SalonPageComparison";

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

// Demo salon data for visual previews
const demoSalon = {
    name: "Luxe Nail Spa",
    rating: 4.9,
    reviewCount: 287,
    address: "456 Beauty Lane, Los Angeles, CA 90210",
    phone: "(310) 555-7890",
    hours: "9:00 AM - 8:00 PM",
    services: [
        "Classic Manicure - $25",
        "Gel Manicure - $45",
        "Acrylic Full Set - $65",
        "Pedicure - $40",
        "Nail Art - $10+",
        "Dip Powder - $55",
    ],
    instagram: "@luxenailspa_la",
    specialOffer: "15% OFF your first visit!",
};

// Gallery images for demos
const galleryImages = [
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=300&fit=crop&q=80",
];

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
        quote: "I got 23 new customers in the first month. At $45 average per visit, that's $1,035 from a $49 investment. No-brainer.",
        author: "Maria's Nail Studio",
        location: "Houston, TX",
        rating: 5,
        result: "+23 customers/month"
    },
    {
        quote: "Went from invisible to #1 in Phoenix. Now I'm turning away customers. Best problem I've ever had!",
        author: "Luxe Nail Spa",
        location: "Phoenix, AZ",
        rating: 5,
        result: "#1 in city"
    },
    {
        quote: "Was skeptical about $29/month. Then I tracked it: 8 bookings last week came directly from Nail Art AI. That's $400+ revenue.",
        author: "Nail Artistry Studio",
        location: "San Diego, CA",
        rating: 5,
        result: "8x ROI first week"
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
        answer: "You can cancel your subscription anytime. No long-term contracts, no cancellation fees. Your listing stays active until the end of your billing period."
    },
    {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Absolutely! You can change your plan anytime. Upgrades take effect immediately, and downgrades apply at your next billing cycle."
    }
];

export default function ForSalonsPage() {
    return (
        <div className="min-h-screen bg-[#f8f6f7]">
            {/* Hero Section - Conversion Optimized */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1b0d14] via-[#2d1520] to-[#1b0d14]">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-[#ee2b8c]/40 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#ee2b8c]/30 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Left: Copy */}
                        <div className="text-center lg:text-left">
                            {/* Urgency Badge */}
                            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1.5 mb-4">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-green-400 text-sm font-medium">3 salons upgraded in your area this week</span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                What if <span className="text-[#ee2b8c]">10 new customers</span> called you this week?
                            </h1>

                            <p className="text-lg md:text-xl text-white/80 mb-6 leading-relaxed">
                                Right now, <span className="text-white font-semibold">400,000+ people</span> are searching for nail salons on our site every month.
                                Your competitors are getting those calls. <span className="text-[#ee2b8c] font-semibold">You could be too.</span>
                            </p>

                            {/* Quick Value Props */}
                            <div className="flex flex-wrap gap-3 mb-6 justify-center lg:justify-start">
                                <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm">✓ Show up first</span>
                                <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm">✓ Photos & offers</span>
                                <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm">✓ Click-to-call</span>
                                <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm">✓ From $29/mo</span>
                            </div>

                            {/* Primary CTA */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                                <a
                                    href="#pricing"
                                    className="inline-flex items-center justify-center gap-2 bg-[#ee2b8c] text-white font-bold py-3.5 px-8 rounded-full hover:bg-[#ee2b8c]/90 transition-all shadow-xl shadow-[#ee2b8c]/30 hover:scale-105 text-lg"
                                >
                                    Get Featured Today
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </a>
                            </div>

                            {/* Social Proof */}
                            <div className="flex items-center gap-3 justify-center lg:justify-start text-sm text-white/60">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-xs text-white font-bold ring-2 ring-[#1b0d14]">S</div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-xs text-white font-bold ring-2 ring-[#1b0d14]">L</div>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs text-white font-bold ring-2 ring-[#1b0d14]">N</div>
                                </div>
                                <span>Join <strong className="text-white">127+ salons</strong> already featured</span>
                            </div>
                        </div>

                        {/* Right: Mini Featured Listing Preview - Hidden on small mobile, compact on tablet */}
                        <div className="relative hidden sm:block">
                            {/* "This could be you" label */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                <span className="bg-[#ee2b8c] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                                    ↓ This could be YOUR salon ↓
                                </span>
                            </div>

                            {/* Glow effect */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/20 via-[#ee2b8c]/20 to-purple-500/20 rounded-2xl blur-xl"></div>

                            {/* Featured Listing Card */}
                            <div className="relative bg-white rounded-xl overflow-hidden ring-2 ring-amber-400 shadow-2xl max-w-sm mx-auto lg:max-w-none">
                                {/* Verified Badge */}
                                <div className="absolute top-2 left-2 z-10">
                                    <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg">
                                        ⭐ VERIFIED
                                    </span>
                                </div>
                                <div className="absolute top-2 right-2 z-10">
                                    <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                                        🟢 Open
                                    </span>
                                </div>

                                {/* Photo Grid - smaller on mobile */}
                                <div className="grid grid-cols-4 gap-0.5">
                                    {galleryImages.map((img, i) => (
                                        <div key={i} className="h-14 sm:h-16 lg:h-20 overflow-hidden">
                                            <OptimizedImage
                                                src={img}
                                                alt={`Nail art ${i + 1}`}
                                                width={150}
                                                height={100}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="p-3 sm:p-4">
                                    <div className="flex items-start justify-between mb-1.5">
                                        <h3 className="text-base sm:text-lg font-bold text-[#1b0d14]">{demoSalon.name}</h3>
                                        <span className="text-[10px] sm:text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                                            #1 in LA
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 mb-2">
                                        <div className="flex text-yellow-500 text-xs sm:text-sm">⭐⭐⭐⭐⭐</div>
                                        <span className="font-bold text-xs sm:text-sm">{demoSalon.rating}</span>
                                        <span className="text-[10px] sm:text-xs text-gray-500">({demoSalon.reviewCount} reviews)</span>
                                    </div>

                                    {/* Special Offer */}
                                    <div className="bg-gradient-to-r from-[#ee2b8c]/10 to-[#ee2b8c]/5 border border-[#ee2b8c]/20 rounded-lg p-1.5 sm:p-2 mb-2 sm:mb-3">
                                        <p className="text-[#ee2b8c] font-semibold text-xs sm:text-sm">
                                            🎁 {demoSalon.specialOffer}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs mb-2 sm:mb-3">
                                        <p className="text-gray-600">📍 Los Angeles</p>
                                        <p className="text-gray-600">🕐 9AM - 8PM</p>
                                    </div>

                                    {/* CTAs */}
                                    <div className="flex gap-2">
                                        <span className="flex-1 bg-[#ee2b8c] text-white text-center py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm">
                                            📞 Call Now
                                        </span>
                                        <span className="flex-1 bg-green-500 text-white text-center py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm">
                                            📅 Book
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Annotation arrows - only on large screens */}
                            <div className="hidden lg:block absolute -right-4 top-1/4 text-white/60 text-xs">
                                <div className="flex items-center gap-1">
                                    <span>Photos that sell</span>
                                    <span>←</span>
                                </div>
                            </div>
                            <div className="hidden lg:block absolute -right-4 top-1/2 text-white/60 text-xs">
                                <div className="flex items-center gap-1">
                                    <span>Your special offer</span>
                                    <span>←</span>
                                </div>
                            </div>
                            <div className="hidden lg:block absolute -right-4 bottom-1/4 text-white/60 text-xs">
                                <div className="flex items-center gap-1">
                                    <span>Direct booking</span>
                                    <span>←</span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile: Simple CTA instead of preview card */}
                        <div className="sm:hidden text-center mt-4">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                                <span className="text-2xl">📸</span>
                                <div className="text-left">
                                    <p className="text-white font-semibold text-sm">Photos, offers & reviews</p>
                                    <p className="text-white/60 text-xs">See how your listing could look ↓</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Demo Section - See What You Get */}
            <div id="demo" className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-10">
                    <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block">
                        🔥 THE TRANSFORMATION
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1b0d14] mb-4">
                        Same Salon. <span className="text-[#ee2b8c]">10x More Clicks.</span>
                    </h2>
                    <p className="text-lg text-[#1b0d14]/70 max-w-2xl mx-auto">
                        Which listing would <em>you</em> click on? One gets scrolled past. The other gets booked.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Regular Listing */}
                    <div>
                        <div className="text-center mb-4">
                            <span className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm font-medium">
                                REGULAR LISTING (Free)
                            </span>
                        </div>
                        <div className="bg-white rounded-xl overflow-hidden ring-1 ring-gray-200">
                            <div className="h-48 bg-gradient-to-br from-[#ee2b8c]/20 to-[#f8f6f7] flex items-center justify-center">
                                <span className="text-6xl opacity-30">💅</span>
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-[#1b0d14] mb-2">{demoSalon.name}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-yellow-500">⭐</span>
                                    <span className="font-semibold">{demoSalon.rating}</span>
                                    <span className="text-sm text-gray-500">({demoSalon.reviewCount} reviews)</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">📍 {demoSalon.address}</p>
                                <p className="text-gray-600 text-sm">📞 {demoSalon.phone}</p>
                                <div className="mt-4 text-[#ee2b8c] text-sm font-semibold">
                                    View Details →
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-gray-500 text-sm mt-3">
                            ❌ No photos • ❌ Basic info only • ❌ Lost in the crowd
                        </p>
                    </div>

                    {/* Featured Listing (Spotlight) */}
                    <div>
                        <div className="text-center mb-4">
                            <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                ⭐ SPOTLIGHT LISTING ($99/mo)
                            </span>
                        </div>
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 via-amber-500/30 to-orange-500/30 rounded-xl blur-sm"></div>
                            <div className="relative bg-white rounded-xl overflow-hidden ring-2 ring-amber-400">
                                {/* Verified Badge */}
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                        ⭐ VERIFIED
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3 z-10">
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        🟢 Open Now
                                    </span>
                                </div>

                                {/* Photo Gallery */}
                                <div className="grid grid-cols-4 gap-0.5">
                                    {galleryImages.map((img, i) => (
                                        <div key={i} className="h-24 overflow-hidden">
                                            <OptimizedImage
                                                src={img}
                                                alt={`Nail art ${i + 1}`}
                                                width={200}
                                                height={150}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xl font-bold text-[#1b0d14]">{demoSalon.name}</h3>
                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
                                            #1 in LA
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex text-yellow-500">
                                            ⭐⭐⭐⭐⭐
                                        </div>
                                        <span className="font-bold">{demoSalon.rating}</span>
                                        <span className="text-sm text-gray-500">({demoSalon.reviewCount} reviews)</span>
                                        <span className="text-sm text-gray-500">💰💰</span>
                                    </div>

                                    {/* Special Offer */}
                                    <div className="bg-gradient-to-r from-[#ee2b8c]/10 to-[#ee2b8c]/5 border border-[#ee2b8c]/20 rounded-lg p-3 mb-3">
                                        <p className="text-[#ee2b8c] font-semibold text-sm">
                                            🎁 {demoSalon.specialOffer}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                        <p className="text-gray-600">📍 {demoSalon.address.split(',')[0]}</p>
                                        <p className="text-gray-600">🕐 {demoSalon.hours}</p>
                                        <p className="text-[#ee2b8c] font-medium">📞 {demoSalon.phone}</p>
                                        <p className="text-blue-600">📱 {demoSalon.instagram}</p>
                                    </div>

                                    {/* Services */}
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-1">Popular Services:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {demoSalon.services.slice(0, 4).map((service, i) => (
                                                <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTAs */}
                                    <div className="flex gap-2">
                                        <span className="flex-1 bg-[#ee2b8c] text-white text-center py-2.5 rounded-lg font-semibold text-sm">
                                            📞 Call Now
                                        </span>
                                        <span className="flex-1 bg-green-500 text-white text-center py-2.5 rounded-lg font-semibold text-sm">
                                            📅 Book Online
                                        </span>
                                        <span className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-semibold text-sm">
                                            📍
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-green-600 text-sm mt-3 font-medium">
                            ✓ Photos • ✓ Special offers • ✓ #1 Position • ✓ Booking link
                        </p>
                    </div>
                </div>
            </div>

            {/* All Tiers Visual Preview */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1b0d14] mb-4">
                            All Featured Listing Tiers
                        </h2>
                        <p className="text-lg text-[#1b0d14]/70 max-w-2xl mx-auto">
                            Here&apos;s how each tier looks in the salon directory — choose the level that fits your goals.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {/* Basic Tier */}
                        <div>
                            <div className="text-center mb-3">
                                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    ✨ BASIC BOOST - $29/mo
                                </span>
                            </div>
                            <div className="bg-white rounded-xl overflow-hidden ring-2 ring-blue-400 shadow-lg shadow-blue-500/10">
                                <div className="relative h-40 bg-gradient-to-br from-blue-50 to-blue-100">
                                    <OptimizedImage
                                        src={galleryImages[0]}
                                        alt="Nail art"
                                        width={400}
                                        height={200}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2">
                                        <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                                            ✨ Featured
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-[#1b0d14] mb-1">{demoSalon.name}</h3>
                                    <div className="flex items-center gap-1 text-sm mb-2">
                                        <span className="text-yellow-500">⭐</span>
                                        <span className="font-semibold">{demoSalon.rating}</span>
                                        <span className="text-gray-500">({demoSalon.reviewCount})</span>
                                    </div>
                                    <p className="text-gray-600 text-xs mb-1">📍 {demoSalon.address.split(',')[0]}</p>
                                    <p className="text-gray-600 text-xs mb-2">🌐 Website displayed</p>
                                    <div className="text-[#ee2b8c] text-sm font-semibold">View →</div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Tier */}
                        <div>
                            <div className="text-center mb-3">
                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    💎 PREMIUM - $49/mo ⭐ POPULAR
                                </span>
                            </div>
                            <div className="bg-white rounded-xl overflow-hidden ring-2 ring-purple-400 shadow-lg shadow-purple-500/10">
                                <div className="relative">
                                    <div className="grid grid-cols-3 gap-0.5 h-32">
                                        {galleryImages.slice(0, 3).map((img, i) => (
                                            <div key={i} className="overflow-hidden">
                                                <OptimizedImage
                                                    src={img}
                                                    alt={`Nail ${i + 1}`}
                                                    width={150}
                                                    height={150}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                                            💎 Premium
                                        </span>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                                            Open
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-[#1b0d14] mb-1">{demoSalon.name}</h3>
                                    <div className="flex items-center gap-1 text-sm mb-2">
                                        <span className="text-yellow-500">⭐</span>
                                        <span className="font-semibold">{demoSalon.rating}</span>
                                        <span className="text-gray-500">({demoSalon.reviewCount})</span>
                                        <span className="text-gray-400 ml-auto">💰💰</span>
                                    </div>
                                    <p className="text-gray-600 text-xs mb-1">📍 {demoSalon.address.split(',')[0]}</p>
                                    <p className="text-gray-600 text-xs mb-1">🕐 {demoSalon.hours}</p>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">Gel</span>
                                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">Acrylic</span>
                                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">+4</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="flex-1 bg-[#ee2b8c] text-white text-center py-1.5 rounded text-xs font-semibold">
                                            📞 Call
                                        </span>
                                        <span className="flex-1 bg-gray-100 text-gray-700 text-center py-1.5 rounded text-xs font-semibold">
                                            View →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spotlight Tier */}
                        <div>
                            <div className="text-center mb-3">
                                <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    ⭐ SPOTLIGHT - $99/mo
                                </span>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-xl blur-sm opacity-50"></div>
                                <div className="relative bg-white rounded-xl overflow-hidden ring-2 ring-amber-400">
                                    <div className="relative">
                                        <div className="grid grid-cols-4 gap-0.5 h-28">
                                            {galleryImages.map((img, i) => (
                                                <div key={i} className="overflow-hidden">
                                                    <OptimizedImage
                                                        src={img}
                                                        alt={`Nail ${i + 1}`}
                                                        width={100}
                                                        height={100}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow">
                                                ⭐ Verified
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                                                Open
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-[#1b0d14]">{demoSalon.name}</h3>
                                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">#1</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm mb-2">
                                            <span className="text-yellow-500">⭐</span>
                                            <span className="font-semibold">{demoSalon.rating}</span>
                                            <span className="text-gray-500">({demoSalon.reviewCount})</span>
                                        </div>
                                        <div className="bg-[#ee2b8c]/5 border border-[#ee2b8c]/20 rounded p-2 mb-2">
                                            <p className="text-[#ee2b8c] text-xs font-medium">🎁 15% OFF first visit!</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="flex-1 bg-[#ee2b8c] text-white text-center py-1.5 rounded text-xs font-semibold">
                                                📞 Call
                                            </span>
                                            <span className="flex-1 bg-green-500 text-white text-center py-1.5 rounded text-xs font-semibold">
                                                📅 Book
                                            </span>
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-xs">
                                                📍
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1b0d14] mb-4">
                        Quick Comparison: What Each Tier Gets
                    </h2>
                </div>
                <div className="bg-white rounded-2xl p-6 ring-1 ring-gray-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-2">Feature</th>
                                <th className="text-center py-3 px-2">
                                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">Regular</span>
                                    <div className="text-xs text-gray-500 mt-1">Free</div>
                                </th>
                                <th className="text-center py-3 px-2">
                                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Basic</span>
                                    <div className="text-xs text-gray-500 mt-1">$29/mo</div>
                                </th>
                                <th className="text-center py-3 px-2 bg-purple-50">
                                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded text-xs">Premium</span>
                                    <div className="text-xs text-purple-600 mt-1 font-medium">$49/mo ⭐</div>
                                </th>
                                <th className="text-center py-3 px-2">
                                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded text-xs">Spotlight</span>
                                    <div className="text-xs text-gray-500 mt-1">$99/mo</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="py-3 px-2">Photos</td>
                                <td className="text-center">❌</td>
                                <td className="text-center">1</td>
                                <td className="text-center bg-purple-50 font-medium">5</td>
                                <td className="text-center">10</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-2">Featured Badge</td>
                                <td className="text-center">❌</td>
                                <td className="text-center">✨</td>
                                <td className="text-center bg-purple-50">💎</td>
                                <td className="text-center">⭐ Verified</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-2">Position in Results</td>
                                <td className="text-center">Normal</td>
                                <td className="text-center">Higher</td>
                                <td className="text-center bg-purple-50 font-medium">Top 3</td>
                                <td className="text-center">#1</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-2">Services &amp; Pricing</td>
                                <td className="text-center">❌</td>
                                <td className="text-center">❌</td>
                                <td className="text-center bg-purple-50">✅</td>
                                <td className="text-center">✅</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-2">Website Link</td>
                                <td className="text-center">❌</td>
                                <td className="text-center">✅</td>
                                <td className="text-center bg-purple-50">✅</td>
                                <td className="text-center">✅</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-2">Monthly Analytics</td>
                                <td className="text-center">❌</td>
                                <td className="text-center">❌</td>
                                <td className="text-center bg-purple-50">✅</td>
                                <td className="text-center">✅</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-2">Book Online Button</td>
                                <td className="text-center">❌</td>
                                <td className="text-center">❌</td>
                                <td className="text-center bg-purple-50">❌</td>
                                <td className="text-center">✅</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-2">Special Offers Display</td>
                                <td className="text-center">❌</td>
                                <td className="text-center">❌</td>
                                <td className="text-center bg-purple-50">❌</td>
                                <td className="text-center">✅</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-3 px-2">Social Media Links</td>
                                <td className="text-center">❌</td>
                                <td className="text-center">❌</td>
                                <td className="text-center bg-purple-50">❌</td>
                                <td className="text-center">✅</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-2">Featured on State Page</td>
                                <td className="text-center">❌</td>
                                <td className="text-center">❌</td>
                                <td className="text-center bg-purple-50">❌</td>
                                <td className="text-center">✅</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Individual Salon Page: Before vs After - Interactive Tabbed Comparison */}
            <SalonPageComparison />

            {/* Pricing Section */}
            <div id="pricing" className="bg-gradient-to-br from-[#1b0d14] via-[#2d1520] to-[#1b0d14] py-14">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <span className="bg-[#ee2b8c]/20 text-[#ee2b8c] px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block border border-[#ee2b8c]/30">
                            💰 SIMPLE PRICING
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Stop Losing Customers to Competitors
                        </h2>
                        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-2">
                            One new customer pays for <span className="text-white font-semibold">3 months</span> of your listing. Most salons see ROI in the first week.
                        </p>
                        <p className="text-sm text-green-400 font-medium">
                            ✓ Cancel anytime • No long-term contracts
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pricingTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`relative rounded-2xl p-6 ${tier.popular
                                    ? 'bg-gradient-to-br from-[#ee2b8c] to-[#c91f6f] text-white ring-4 ring-[#ee2b8c]/30 scale-105'
                                    : 'bg-white ring-1 ring-white/20'
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
                                    className={`block w-full text-center font-bold py-3 px-6 rounded-full transition-all hover:scale-105 ${tier.popular
                                        ? 'bg-white text-[#ee2b8c] hover:bg-white/90 shadow-xl'
                                        : 'bg-[#ee2b8c] text-white hover:bg-[#ee2b8c]/90'
                                        }`}
                                >
                                    Get Started
                                </a>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-sm text-white/60 mt-8">
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
            <div className="bg-gradient-to-br from-[#ee2b8c]/5 to-[#f8f6f7] py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block">
                            💬 REAL RESULTS
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1b0d14] mb-4">
                            &quot;Best $29 I spend every month.&quot;
                        </h2>
                        <p className="text-lg text-[#1b0d14]/70">
                            Don&apos;t take our word for it. Here&apos;s what salon owners say:
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 relative"
                            >
                                {/* Result Badge */}
                                <div className="absolute -top-3 left-4">
                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                        {testimonial.result}
                                    </span>
                                </div>
                                <div className="flex gap-1 mb-3 mt-2">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="text-yellow-500">⭐</span>
                                    ))}
                                </div>
                                <p className="text-[#1b0d14]/80 mb-4">
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
            <div className="bg-gradient-to-br from-[#1b0d14] via-[#2d1520] to-[#1b0d14] py-14">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <span className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block border border-red-500/30">
                        ⏰ DON&apos;T WAIT
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Your Competitors Are Getting <span className="text-[#ee2b8c]">Your Customers</span>
                    </h2>
                    <p className="text-xl text-white/80 mb-4">
                        Right now, someone is searching for a nail salon in your area.
                    </p>
                    <p className="text-lg text-white/60 mb-8">
                        Will they find <span className="text-white">you</span>... or someone else?
                    </p>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10 max-w-lg mx-auto">
                        <p className="text-white/80 text-sm mb-3">💡 Quick math:</p>
                        <p className="text-white text-lg font-medium">
                            Just <span className="text-[#ee2b8c] font-bold">3 new customers</span> this month pays for your listing for the <span className="text-[#ee2b8c] font-bold">entire year</span>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                        <a
                            href="#pricing"
                            className="inline-flex items-center justify-center gap-2 bg-[#ee2b8c] text-white font-bold py-4 px-10 rounded-full hover:bg-[#ee2b8c]/90 transition-all shadow-xl shadow-[#ee2b8c]/30 hover:scale-105 text-lg"
                        >
                            Get Featured Now
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </a>
                    </div>

                    <p className="text-green-400 text-sm font-medium mb-4">
                        ✓ Cancel anytime • ✓ No contracts • ✓ Live in 24 hours
                    </p>

                    <p className="text-white/50 text-sm">
                        Questions? Email{' '}
                        <a href="mailto:salons@nailartai.app" className="text-[#ee2b8c] underline hover:text-[#ee2b8c]/80">
                            salons@nailartai.app
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
