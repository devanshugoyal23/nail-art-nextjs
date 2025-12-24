'use client';

import { useState } from 'react';
import OptimizedImage from '@/components/OptimizedImage';

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

type TierType = 'basic' | 'premium' | 'spotlight';

interface TierConfig {
    id: TierType;
    name: string;
    price: string;
    popular?: boolean;
    badge: string;
    badgeClass: string;
    ringClass: string;
    glowClass?: string;
    photos: number;
    hasVerifiedBadge: boolean;
    hasServices: boolean;
    hasSpecialOffer: boolean;
    hasInstagram: boolean;
    hasWebsite: boolean;
    hasBookOnline: boolean;
    features: string[];
}

const tierConfigs: TierConfig[] = [
    {
        id: 'basic',
        name: 'Basic Boost',
        price: '$29/mo',
        badge: '🥉 BASIC BOOST',
        badgeClass: 'bg-blue-500 text-white',
        ringClass: 'ring-blue-400',
        photos: 1,
        hasVerifiedBadge: false,
        hasServices: false,
        hasSpecialOffer: false,
        hasInstagram: false,
        hasWebsite: true,
        hasBookOnline: false,
        features: [
            '✅ 1 photo on your listing',
            '✅ Website link displayed',
            '✅ "Featured" badge',
            '❌ No verified badge',
            '❌ No services listing',
            '❌ No special offers display',
        ],
    },
    {
        id: 'premium',
        name: 'Premium Boost',
        price: '$49/mo',
        popular: true,
        badge: '🥈 PREMIUM BOOST ⭐',
        badgeClass: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        ringClass: 'ring-purple-400',
        glowClass: 'from-purple-400/20 via-pink-500/20 to-purple-400/20',
        photos: 5,
        hasVerifiedBadge: true,
        hasServices: true,
        hasSpecialOffer: false,
        hasInstagram: false,
        hasWebsite: true,
        hasBookOnline: true,
        features: [
            '✅ 5 photos showcasing your work',
            '✅ Verified badge for trust',
            '✅ Full services & pricing',
            '✅ Book Online button',
            '❌ No special offers display',
            '❌ No social media links',
        ],
    },
    {
        id: 'spotlight',
        name: 'Spotlight',
        price: '$99/mo',
        badge: '🥇 SPOTLIGHT',
        badgeClass: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white',
        ringClass: 'ring-amber-400',
        glowClass: 'from-yellow-400/20 via-amber-500/20 to-orange-500/20',
        photos: 10,
        hasVerifiedBadge: true,
        hasServices: true,
        hasSpecialOffer: true,
        hasInstagram: true,
        hasWebsite: true,
        hasBookOnline: true,
        features: [
            '✅ 10 photos showcasing your work',
            '✅ ⭐ Verified badge for trust',
            '✅ Full services & pricing listed',
            '✅ Book Online button',
            '✅ Special offers displayed',
            '✅ Social media links',
        ],
    },
];

export default function SalonPageComparison() {
    const [selectedTier, setSelectedTier] = useState<TierType>('premium');

    const currentTier = tierConfigs.find(t => t.id === selectedTier)!;

    return (
        <div className="bg-gradient-to-br from-[#ee2b8c]/5 to-[#f8f6f7] py-16">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <span className="bg-[#ee2b8c]/10 text-[#ee2b8c] px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block">
                        🏪 YOUR SALON PAGE
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#1b0d14] mb-4">
                        Individual Salon Page: Before vs After
                    </h2>
                    <p className="text-lg text-[#1b0d14]/70 max-w-2xl mx-auto">
                        See how your salon&apos;s dedicated page transforms with each tier
                    </p>
                </div>

                {/* Tier Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-white rounded-xl p-1.5 shadow-lg ring-1 ring-gray-200">
                        {tierConfigs.map((tier) => (
                            <button
                                key={tier.id}
                                onClick={() => setSelectedTier(tier.id)}
                                className={`relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${selectedTier === tier.id
                                        ? tier.id === 'basic'
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : tier.id === 'premium'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                                                : 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {tier.popular && selectedTier !== tier.id && (
                                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-[10px] text-gray-900 px-1.5 py-0.5 rounded-full font-bold">
                                        ⭐
                                    </span>
                                )}
                                {tier.name}
                                <span className="ml-1.5 opacity-80">{tier.price}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* BEFORE - Regular Page (Always the same) */}
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
                                    <span className="flex-1 bg-[#ee2b8c] text-white py-2 rounded-lg text-sm font-semibold text-center">
                                        View on Map
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-gray-500">
                            <p className="flex items-center gap-2">❌ No photos of your work</p>
                            <p className="flex items-center gap-2">❌ No services &amp; pricing displayed</p>
                            <p className="flex items-center gap-2">❌ No premium badge</p>
                            <p className="flex items-center gap-2">❌ No website link</p>
                            <p className="flex items-center gap-2">❌ Basic, forgettable look</p>
                        </div>
                    </div>

                    {/* AFTER - Dynamic based on selected tier */}
                    <div>
                        <div className="text-center mb-4">
                            <span className={`${currentTier.badgeClass} px-4 py-2 rounded-full text-sm font-bold`}>
                                ✅ AFTER: {currentTier.name} ({currentTier.price})
                            </span>
                        </div>
                        <div className="relative">
                            {/* Glow effect for premium/spotlight */}
                            {currentTier.glowClass && (
                                <div className={`absolute -inset-1 bg-gradient-to-r ${currentTier.glowClass} rounded-2xl blur-md`}></div>
                            )}
                            <div className={`relative bg-white rounded-2xl overflow-hidden ring-2 ${currentTier.ringClass} shadow-xl`}>
                                {/* Hero - Enhanced with photos */}
                                <div className="relative">
                                    <div className={`grid ${currentTier.photos >= 4 ? 'grid-cols-4' : currentTier.photos >= 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-0.5`}>
                                        {galleryImages.slice(0, Math.min(currentTier.photos, 4)).map((img, i) => (
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
                                        {currentTier.hasVerifiedBadge && (
                                            <span className={`${currentTier.badgeClass} px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                                                ⭐ VERIFIED
                                            </span>
                                        )}
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                            🟢 Open Now
                                        </span>
                                    </div>
                                    {currentTier.photos > 1 && (
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-black/50 backdrop-blur text-white px-2 py-1 rounded text-xs">
                                                📷 +{currentTier.photos - Math.min(currentTier.photos, 4)} photos
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 space-y-4">
                                    {/* Title with badge */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#1b0d14] flex items-center gap-2">
                                                {demoSalon.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">Los Angeles, CA • 💰💰</p>
                                        </div>
                                        {currentTier.id === 'spotlight' && (
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">
                                                #1 in LA
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating - Enhanced */}
                                    <div className={`flex items-center gap-4 p-3 rounded-lg border ${currentTier.id === 'spotlight'
                                            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
                                            : currentTier.id === 'premium'
                                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                                                : 'bg-gradient-to-r from-blue-50 to-blue-50 border-blue-200'
                                        }`}>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-[#1b0d14]">{demoSalon.rating}</div>
                                            <div className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</div>
                                        </div>
                                        <div className={`flex-1 border-l pl-4 ${currentTier.id === 'spotlight'
                                                ? 'border-amber-200'
                                                : currentTier.id === 'premium'
                                                    ? 'border-purple-200'
                                                    : 'border-blue-200'
                                            }`}>
                                            <p className="text-sm font-medium">{demoSalon.reviewCount} reviews</p>
                                            <p className="text-xs text-gray-500">&quot;Excellent service!&quot;</p>
                                        </div>
                                    </div>

                                    {/* Special Offer - Spotlight only */}
                                    {currentTier.hasSpecialOffer && (
                                        <div className="bg-gradient-to-r from-[#ee2b8c]/10 to-[#ee2b8c]/5 border border-[#ee2b8c]/20 rounded-lg p-3">
                                            <p className="text-[#ee2b8c] font-bold flex items-center gap-2">
                                                🎁 SPECIAL OFFER: {demoSalon.specialOffer}
                                            </p>
                                        </div>
                                    )}

                                    {/* Contact Info - Enhanced */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            <span>📍</span>
                                            <div className="text-sm">
                                                <p className="text-gray-500 text-xs">Address</p>
                                                <p className="font-medium truncate">{demoSalon.address.split(',')[0]}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            <span>📞</span>
                                            <div className="text-sm">
                                                <p className="text-gray-500 text-xs">Phone</p>
                                                <p className="font-medium text-[#ee2b8c]">{demoSalon.phone}</p>
                                            </div>
                                        </div>
                                        {currentTier.hasWebsite && (
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                <span>🌐</span>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Website</p>
                                                    <p className="font-medium text-blue-600">luxenailspa.com</p>
                                                </div>
                                            </div>
                                        )}
                                        {currentTier.hasInstagram && (
                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                                <span>📱</span>
                                                <div className="text-sm">
                                                    <p className="text-gray-500 text-xs">Instagram</p>
                                                    <p className="font-medium text-pink-600">{demoSalon.instagram}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Services - Premium and Spotlight only */}
                                    {currentTier.hasServices && (
                                        <div className="border-t pt-4">
                                            <h4 className="font-bold text-[#1b0d14] mb-3 flex items-center gap-2">
                                                💅 Services &amp; Pricing
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {demoSalon.services.map((service, i) => {
                                                    const [name, price] = service.split(' - ');
                                                    return (
                                                        <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                                                            <span>{name}</span>
                                                            <span className="font-bold text-[#ee2b8c]">{price}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hours - Enhanced */}
                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between mb-2">
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

                                    {/* CTAs */}
                                    <div className="flex gap-2 pt-2">
                                        <span className="flex-1 bg-[#ee2b8c] text-white text-center py-3 rounded-xl font-bold">
                                            📞 Call Now
                                        </span>
                                        {currentTier.hasBookOnline && (
                                            <span className="flex-1 bg-green-500 text-white text-center py-3 rounded-xl font-bold">
                                                📅 Book Online
                                            </span>
                                        )}
                                        <span className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold">
                                            📍
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2 text-sm">
                            {currentTier.features.map((feature, i) => (
                                <p
                                    key={i}
                                    className={`flex items-center gap-2 ${feature.startsWith('✅') ? 'text-green-600 font-medium' : 'text-gray-400'
                                        }`}
                                >
                                    {feature}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
