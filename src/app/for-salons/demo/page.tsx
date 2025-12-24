import type { Metadata } from "next";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";

export const metadata: Metadata = {
    title: "Featured Listing Demo - See What Your Salon Could Look Like",
    description: "Preview how your nail salon listing could look with Featured, Premium, or Spotlight placement on Nail Art AI.",
    robots: {
        index: false,
        follow: false,
    },
};

// Sample salon data for demo
const demoSalon = {
    name: "Luxe Nail Spa",
    rating: 4.9,
    reviewCount: 287,
    address: "456 Beauty Lane, Los Angeles, CA 90210",
    phone: "(310) 555-7890",
    website: "https://luxenailspa.com",
    priceLevel: "MODERATE",
    isOpen: true,
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

// Gallery images (using real nail art images)
const galleryImages = [
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=300&fit=crop&q=80",
];

export default function FeaturedDemoPage() {
    return (
        <div className="min-h-screen bg-[#f8f6f7]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1b0d14] via-[#2d1520] to-[#1b0d14] py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Featured Listing Demo
                    </h1>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto">
                        See exactly how your salon listing could look with our Featured, Premium, or Spotlight tiers.
                        Use these screenshots to visualize the difference!
                    </p>
                </div>
            </div>

            {/* Demo Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">

                {/* Section 1: Side-by-side comparison */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[#1b0d14] mb-2 text-center">
                        Regular vs Featured Comparison
                    </h2>
                    <p className="text-[#1b0d14]/70 text-center mb-8 max-w-2xl mx-auto">
                        See how a Featured listing stands out from regular listings in search results
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
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
                                    ⭐ SPOTLIGHT LISTING ($149/mo)
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
                                            <a href="#" className="flex-1 bg-[#ee2b8c] text-white text-center py-2.5 rounded-lg font-semibold text-sm hover:bg-[#ee2b8c]/90 transition-all">
                                                📞 Call Now
                                            </a>
                                            <a href="#" className="flex-1 bg-green-500 text-white text-center py-2.5 rounded-lg font-semibold text-sm hover:bg-green-600 transition-all">
                                                📅 Book Online
                                            </a>
                                            <a href="#" className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-all">
                                                📍
                                            </a>
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

                {/* Section 2: All Tiers */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[#1b0d14] mb-2 text-center">
                        All Featured Listing Tiers
                    </h2>
                    <p className="text-[#1b0d14]/70 text-center mb-8">
                        Here&apos;s how each tier looks in the salon directory
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Basic Tier */}
                        <div>
                            <div className="text-center mb-3">
                                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    ✨ BASIC BOOST - $29/mo
                                </span>
                            </div>
                            <div className="bg-white rounded-xl overflow-hidden ring-2 ring-blue-400 shadow-lg shadow-blue-500/10">
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                                        ✨ Featured
                                    </span>
                                </div>
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
                                    💎 PREMIUM - $79/mo
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
                                    ⭐ SPOTLIGHT - $149/mo
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

                {/* Section 3: In-Context Demo */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[#1b0d14] mb-2 text-center">
                        How Featured Listings Appear in Search Results
                    </h2>
                    <p className="text-[#1b0d14]/70 text-center mb-8">
                        Featured listings appear FIRST, above all regular listings
                    </p>

                    <div className="bg-white rounded-2xl p-6 ring-1 ring-gray-200">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-[#1b0d14]">Nail Salons in Los Angeles, California</h3>
                            <p className="text-gray-500 text-sm">47 salons found</p>
                        </div>

                        {/* Featured Section */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">⭐</span>
                                <h4 className="font-bold text-[#1b0d14]">Featured Salons</h4>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Spotlight Salon */}
                                <div className="relative">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-xl blur-sm"></div>
                                    <div className="relative bg-white rounded-xl p-4 ring-2 ring-amber-400">
                                        <div className="flex items-start gap-3">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                <OptimizedImage src={galleryImages[0]} alt="Salon" width={80} height={80} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded font-bold">⭐ Verified</span>
                                                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">#1</span>
                                                </div>
                                                <h5 className="font-bold text-[#1b0d14]">Luxe Nail Spa</h5>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <span className="text-yellow-500">⭐</span>
                                                    <span className="font-semibold">4.9</span>
                                                    <span className="text-gray-400">(287)</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">📍 456 Beauty Lane</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Premium Salon */}
                                <div className="bg-white rounded-xl p-4 ring-2 ring-purple-400">
                                    <div className="flex items-start gap-3">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                            <OptimizedImage src={galleryImages[1]} alt="Salon" width={80} height={80} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded font-bold">💎 Premium</span>
                                            </div>
                                            <h5 className="font-bold text-[#1b0d14]">Diamond Nails</h5>
                                            <div className="flex items-center gap-1 text-sm">
                                                <span className="text-yellow-500">⭐</span>
                                                <span className="font-semibold">4.7</span>
                                                <span className="text-gray-400">(156)</span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate">📍 123 Main Street</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-6"></div>

                        {/* Regular Listings */}
                        <div>
                            <h4 className="font-bold text-[#1b0d14] mb-3">All Salons</h4>
                            <div className="space-y-3 opacity-70">
                                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-2xl">💅</div>
                                    <div>
                                        <h5 className="font-medium text-[#1b0d14] text-sm">Sky Nails</h5>
                                        <p className="text-xs text-gray-500">⭐ 4.5 (89) • 789 Oak Ave</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-2xl">💅</div>
                                    <div>
                                        <h5 className="font-medium text-[#1b0d14] text-sm">Royal Nails</h5>
                                        <p className="text-xs text-gray-500">⭐ 4.3 (67) • 456 Pine St</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-2xl">💅</div>
                                    <div>
                                        <h5 className="font-medium text-[#1b0d14] text-sm">Bliss Nails</h5>
                                        <p className="text-xs text-gray-500">⭐ 4.1 (45) • 321 Elm Blvd</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Individual Salon Page Before/After */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[#1b0d14] mb-2 text-center">
                        Individual Salon Page: Before vs After
                    </h2>
                    <p className="text-[#1b0d14]/70 text-center mb-8 max-w-2xl mx-auto">
                        See how your salon&apos;s dedicated page transforms with a Featured Listing
                    </p>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* BEFORE - Regular Page */}
                        <div>
                            <div className="text-center mb-4">
                                <span className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm font-bold">
                                    ❌ BEFORE: Regular Listing (Free)
                                </span>
                            </div>
                            <div className="bg-white rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-sm">
                                {/* Hero - Basic */}
                                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-8xl opacity-20">💅</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <p className="text-white/80 text-xs mb-1">← Back to Los Angeles Salons</p>
                                        <h3 className="text-xl font-bold text-white">{demoSalon.name}</h3>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Rating - Basic */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-500">⭐</span>
                                        <span className="font-bold">{demoSalon.rating}</span>
                                        <span className="text-gray-500 text-sm">({demoSalon.reviewCount} reviews)</span>
                                    </div>

                                    {/* Contact Info - Basic */}
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>📍 {demoSalon.address}</p>
                                        <p>📞 {demoSalon.phone}</p>
                                    </div>

                                    {/* Hours - Basic */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Today&apos;s Hours:</p>
                                        <p className="text-sm font-medium">{demoSalon.hours}</p>
                                    </div>

                                    {/* No services, no photos, no special features */}
                                    <div className="text-center py-4 text-gray-400 text-sm border-t border-dashed">
                                        <p>No photos available</p>
                                        <p className="mt-1">No services listed</p>
                                        <p className="mt-1">No special offers</p>
                                    </div>

                                    {/* Basic CTA */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-[#ee2b8c] text-white py-2 rounded-lg text-sm font-semibold">
                                            View on Map
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-gray-500">
                                <p className="flex items-center gap-2">❌ No photos of your work</p>
                                <p className="flex items-center gap-2">❌ No services & pricing displayed</p>
                                <p className="flex items-center gap-2">❌ No verified badge</p>
                                <p className="flex items-center gap-2">❌ No booking integration</p>
                                <p className="flex items-center gap-2">❌ No special offers</p>
                                <p className="flex items-center gap-2">❌ Basic, forgettable look</p>
                            </div>
                        </div>

                        {/* AFTER - Featured Page (Spotlight) */}
                        <div>
                            <div className="text-center mb-4">
                                <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                    ✅ AFTER: Spotlight Listing ($149/mo)
                                </span>
                            </div>
                            <div className="relative">
                                {/* Glow effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 via-amber-500/20 to-orange-500/20 rounded-2xl blur-md"></div>
                                <div className="relative bg-white rounded-2xl overflow-hidden ring-2 ring-amber-400 shadow-xl">
                                    {/* Hero - Enhanced with photo gallery */}
                                    <div className="relative">
                                        <div className="grid grid-cols-4 gap-0.5">
                                            {galleryImages.map((img, i) => (
                                                <div key={i} className="h-24 overflow-hidden">
                                                    <OptimizedImage
                                                        src={img}
                                                        alt={`Work sample ${i + 1}`}
                                                        width={200}
                                                        height={150}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute top-2 left-2 flex gap-2">
                                            <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                ⭐ VERIFIED
                                            </span>
                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                                🟢 Open Now
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded text-xs">
                                                📷 +6 photos
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        {/* Title with badges */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#1b0d14] flex items-center gap-2">
                                                    {demoSalon.name}
                                                    <span className="text-amber-500">⭐</span>
                                                </h3>
                                                <p className="text-sm text-gray-500">Los Angeles, CA</p>
                                            </div>
                                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                                                #1 in LA
                                            </span>
                                        </div>

                                        {/* Rating - Enhanced */}
                                        <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#1b0d14]">{demoSalon.rating}</div>
                                                <div className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</div>
                                            </div>
                                            <div className="flex-1 border-l border-amber-200 pl-4">
                                                <p className="text-sm font-medium">{demoSalon.reviewCount} reviews</p>
                                                <p className="text-xs text-gray-500">&quot;Best nails in LA!&quot;</p>
                                            </div>
                                            <span className="text-sm text-gray-500">💰💰</span>
                                        </div>

                                        {/* Special Offer - Featured */}
                                        <div className="bg-gradient-to-r from-[#ee2b8c]/10 to-[#ee2b8c]/5 border-2 border-[#ee2b8c]/30 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xl">🎁</span>
                                                <span className="font-bold text-[#ee2b8c]">SPECIAL OFFER</span>
                                            </div>
                                            <p className="text-[#1b0d14] font-medium">{demoSalon.specialOffer}</p>
                                            <p className="text-xs text-gray-500 mt-1">Valid for new customers only</p>
                                        </div>

                                        {/* Contact Info - Enhanced */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <a href="#" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <span>📍</span>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Address</p>
                                                    <p className="font-medium truncate">{demoSalon.address.split(',')[0]}</p>
                                                </div>
                                            </a>
                                            <a href="#" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <span>📞</span>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Phone</p>
                                                    <p className="font-medium text-[#ee2b8c]">{demoSalon.phone}</p>
                                                </div>
                                            </a>
                                            <a href="#" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <span>🌐</span>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Website</p>
                                                    <p className="font-medium text-blue-600">luxenailspa.com</p>
                                                </div>
                                            </a>
                                            <a href="#" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <span>📱</span>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Instagram</p>
                                                    <p className="font-medium">{demoSalon.instagram}</p>
                                                </div>
                                            </a>
                                        </div>

                                        {/* Services & Pricing - Featured */}
                                        <div className="border-t pt-4">
                                            <h4 className="font-bold text-[#1b0d14] mb-3 flex items-center gap-2">
                                                💅 Services & Pricing
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {demoSalon.services.map((service, i) => {
                                                    const [name, price] = service.split(' - ');
                                                    return (
                                                        <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                            <span className="text-sm">{name}</span>
                                                            <span className="text-sm font-bold text-[#ee2b8c]">{price}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Hours - Enhanced */}
                                        <div className="border-t pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-bold text-[#1b0d14] flex items-center gap-2">
                                                    🕐 Hours
                                                </h4>
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                                    Open Now
                                                </span>
                                            </div>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-green-800 font-medium">Today: {demoSalon.hours}</p>
                                            </div>
                                        </div>

                                        {/* CTAs - Premium */}
                                        <div className="flex gap-2 pt-2">
                                            <a href="#" className="flex-1 bg-[#ee2b8c] text-white text-center py-3 rounded-xl font-bold hover:bg-[#ee2b8c]/90 transition-all shadow-lg shadow-[#ee2b8c]/20">
                                                📞 Call Now
                                            </a>
                                            <a href="#" className="flex-1 bg-green-500 text-white text-center py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20">
                                                📅 Book Online
                                            </a>
                                            <a href="#" className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                                                📍
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-green-600 font-medium">
                                <p className="flex items-center gap-2">✅ 10 photos showcasing your work</p>
                                <p className="flex items-center gap-2">✅ Full services & pricing listed</p>
                                <p className="flex items-center gap-2">✅ ⭐ Verified badge for trust</p>
                                <p className="flex items-center gap-2">✅ Book Online button integration</p>
                                <p className="flex items-center gap-2">✅ Special offers prominently displayed</p>
                                <p className="flex items-center gap-2">✅ Premium, professional appearance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 5: Premium ($79) Individual Page Comparison */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-[#1b0d14] mb-2 text-center">
                        Premium Tier ($79/mo): Individual Page
                    </h2>
                    <p className="text-[#1b0d14]/70 text-center mb-2 max-w-2xl mx-auto">
                        Our most popular option - best value for money
                    </p>
                    <p className="text-center mb-8">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                            ⭐ MOST POPULAR - 60% of salons choose this tier
                        </span>
                    </p>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* BEFORE - Regular Page */}
                        <div>
                            <div className="text-center mb-4">
                                <span className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm font-bold">
                                    ❌ BEFORE: Regular Listing (Free)
                                </span>
                            </div>
                            <div className="bg-white rounded-2xl overflow-hidden ring-1 ring-gray-200 shadow-sm">
                                {/* Hero - Basic */}
                                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-8xl opacity-20">💅</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <p className="text-white/80 text-xs mb-1">← Back to Los Angeles Salons</p>
                                        <h3 className="text-xl font-bold text-white">{demoSalon.name}</h3>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Rating - Basic */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-500">⭐</span>
                                        <span className="font-bold">{demoSalon.rating}</span>
                                        <span className="text-gray-500 text-sm">({demoSalon.reviewCount} reviews)</span>
                                    </div>

                                    {/* Contact Info - Basic */}
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>📍 {demoSalon.address}</p>
                                        <p>📞 {demoSalon.phone}</p>
                                    </div>

                                    {/* Hours - Basic */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Today&apos;s Hours:</p>
                                        <p className="text-sm font-medium">{demoSalon.hours}</p>
                                    </div>

                                    {/* No services, no photos, no special features */}
                                    <div className="text-center py-4 text-gray-400 text-sm border-t border-dashed">
                                        <p>No photos available</p>
                                        <p className="mt-1">No services listed</p>
                                        <p className="mt-1">No special offers</p>
                                    </div>

                                    {/* Basic CTA */}
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-[#ee2b8c] text-white py-2 rounded-lg text-sm font-semibold">
                                            View on Map
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-gray-500">
                                <p className="flex items-center gap-2">❌ No photos of your work</p>
                                <p className="flex items-center gap-2">❌ No services & pricing displayed</p>
                                <p className="flex items-center gap-2">❌ No premium badge</p>
                                <p className="flex items-center gap-2">❌ No website link</p>
                                <p className="flex items-center gap-2">❌ Basic, forgettable look</p>
                            </div>
                        </div>

                        {/* AFTER - Premium Page ($79) */}
                        <div>
                            <div className="text-center mb-4">
                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                    ✅ AFTER: Premium Listing ($79/mo)
                                </span>
                            </div>
                            <div className="relative">
                                {/* Glow effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-md"></div>
                                <div className="relative bg-white rounded-2xl overflow-hidden ring-2 ring-purple-400 shadow-xl">
                                    {/* Hero - Enhanced with 5 photos */}
                                    <div className="relative">
                                        <div className="grid grid-cols-3 gap-0.5">
                                            {galleryImages.slice(0, 3).map((img, i) => (
                                                <div key={i} className="h-28 overflow-hidden">
                                                    <OptimizedImage
                                                        src={img}
                                                        alt={`Work sample ${i + 1}`}
                                                        width={200}
                                                        height={150}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute top-2 left-2 flex gap-2">
                                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                💎 PREMIUM
                                            </span>
                                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                                🟢 Open Now
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded text-xs">
                                                📷 +2 photos
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        {/* Title with badge */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#1b0d14] flex items-center gap-2">
                                                    {demoSalon.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">Los Angeles, CA</p>
                                            </div>
                                        </div>

                                        {/* Rating - Enhanced */}
                                        <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-[#1b0d14]">{demoSalon.rating}</div>
                                                <div className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</div>
                                            </div>
                                            <div className="flex-1 border-l border-purple-200 pl-4">
                                                <p className="text-sm font-medium">{demoSalon.reviewCount} reviews</p>
                                                <p className="text-xs text-gray-500">&quot;Excellent service!&quot;</p>
                                            </div>
                                            <span className="text-sm text-gray-500">💰💰</span>
                                        </div>

                                        {/* Contact Info - Enhanced */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <a href="#" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <span>📍</span>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Address</p>
                                                    <p className="font-medium truncate">{demoSalon.address.split(',')[0]}</p>
                                                </div>
                                            </a>
                                            <a href="#" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <span>📞</span>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Phone</p>
                                                    <p className="font-medium text-[#ee2b8c]">{demoSalon.phone}</p>
                                                </div>
                                            </a>
                                            <a href="#" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors col-span-2">
                                                <span>🌐</span>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Website</p>
                                                    <p className="font-medium text-blue-600">luxenailspa.com</p>
                                                </div>
                                            </a>
                                        </div>

                                        {/* Services & Pricing - Premium */}
                                        <div className="border-t pt-4">
                                            <h4 className="font-bold text-[#1b0d14] mb-3 flex items-center gap-2">
                                                💅 Services & Pricing
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {demoSalon.services.map((service, i) => {
                                                    const [name, price] = service.split(' - ');
                                                    return (
                                                        <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                            <span className="text-sm">{name}</span>
                                                            <span className="text-sm font-bold text-[#ee2b8c]">{price}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Hours - Enhanced */}
                                        <div className="border-t pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-bold text-[#1b0d14] flex items-center gap-2">
                                                    🕐 Hours
                                                </h4>
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                                    Open Now
                                                </span>
                                            </div>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-green-800 font-medium">Today: {demoSalon.hours}</p>
                                            </div>
                                        </div>

                                        {/* CTAs - Premium (No Book Online - that's Spotlight only) */}
                                        <div className="flex gap-2 pt-2">
                                            <a href="#" className="flex-1 bg-[#ee2b8c] text-white text-center py-3 rounded-xl font-bold hover:bg-[#ee2b8c]/90 transition-all shadow-lg shadow-[#ee2b8c]/20">
                                                📞 Call Now
                                            </a>
                                            <a href="#" className="flex-1 bg-blue-500 text-white text-center py-3 rounded-xl font-bold hover:bg-blue-600 transition-all">
                                                🌐 Website
                                            </a>
                                            <a href="#" className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                                                📍
                                            </a>
                                        </div>

                                        {/* Upgrade hint */}
                                        <div className="text-center pt-2 border-t border-dashed">
                                            <p className="text-xs text-gray-400">
                                                Want booking integration & special offers?
                                                <span className="text-purple-600 font-medium"> Upgrade to Spotlight</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                                <p className="flex items-center gap-2 text-green-600 font-medium">✅ 5 photos showcasing your work</p>
                                <p className="flex items-center gap-2 text-green-600 font-medium">✅ Full services & pricing listed</p>
                                <p className="flex items-center gap-2 text-green-600 font-medium">✅ 💎 Premium badge for trust</p>
                                <p className="flex items-center gap-2 text-green-600 font-medium">✅ Website link displayed</p>
                                <p className="flex items-center gap-2 text-green-600 font-medium">✅ Monthly analytics report</p>
                                <p className="flex items-center gap-2 text-gray-400">○ No booking integration (Spotlight only)</p>
                                <p className="flex items-center gap-2 text-gray-400">○ No special offers display (Spotlight only)</p>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="mt-12 bg-white rounded-2xl p-6 ring-1 ring-gray-200">
                        <h3 className="text-xl font-bold text-[#1b0d14] mb-6 text-center">
                            Quick Comparison: What Each Tier Gets
                        </h3>
                        <div className="overflow-x-auto">
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
                                            <div className="text-xs text-purple-600 mt-1 font-medium">$79/mo ⭐</div>
                                        </th>
                                        <th className="text-center py-3 px-2">
                                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded text-xs">Spotlight</span>
                                            <div className="text-xs text-gray-500 mt-1">$149/mo</div>
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
                                        <td className="py-3 px-2">Services & Pricing</td>
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
                </div>

                {/* CTA */}
                <div className="text-center bg-gradient-to-br from-[#ee2b8c]/5 to-[#ee2b8c]/10 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">
                        Ready to Get Featured?
                    </h2>
                    <p className="text-[#1b0d14]/70 mb-6 max-w-xl mx-auto">
                        Contact us to upgrade your salon listing and start attracting more customers today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/for-salons"
                            className="bg-[#ee2b8c] text-white font-bold py-3 px-8 rounded-full hover:bg-[#ee2b8c]/90 transition-all"
                        >
                            See Pricing Plans
                        </Link>
                        <a
                            href="mailto:salons@nailartai.app?subject=I want to feature my salon"
                            className="bg-white text-[#1b0d14] font-bold py-3 px-8 rounded-full ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/40 transition-all"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
