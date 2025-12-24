import Link from 'next/link';

interface ClaimListingCTAProps {
    salonName: string;
    variant?: 'card' | 'inline' | 'banner';
}

/**
 * CTA component for salon owners to claim their listing
 * Place this on individual salon pages and city listing pages
 */
export default function ClaimListingCTA({ salonName, variant = 'card' }: ClaimListingCTAProps) {
    if (variant === 'banner') {
        return (
            <div className="bg-gradient-to-r from-[#ee2b8c]/10 via-[#ee2b8c]/5 to-[#ee2b8c]/10 border-y border-[#ee2b8c]/20 py-4">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏪</span>
                        <div>
                            <p className="text-sm font-bold text-[#1b0d14]">Are you a salon owner?</p>
                            <p className="text-xs text-[#1b0d14]/70">Get featured to attract more customers</p>
                        </div>
                    </div>
                    <Link
                        href="/for-salons"
                        className="bg-[#ee2b8c] text-white text-sm font-bold py-2 px-6 rounded-full hover:bg-[#ee2b8c]/90 transition-all whitespace-nowrap"
                    >
                        Get Featured →
                    </Link>
                </div>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className="flex items-center gap-3 p-4 bg-[#ee2b8c]/5 rounded-xl border border-[#ee2b8c]/15">
                <span className="text-xl">🏪</span>
                <div className="flex-1">
                    <p className="text-sm font-medium text-[#1b0d14]">Own this salon?</p>
                    <Link href="/for-salons" className="text-xs text-[#ee2b8c] font-semibold hover:underline">
                        Claim & upgrade your listing →
                    </Link>
                </div>
            </div>
        );
    }

    // Default: card variant
    return (
        <div className="bg-gradient-to-br from-[#ee2b8c]/5 to-white rounded-2xl p-6 ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/40 transition-all">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#ee2b8c]/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🏪
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#1b0d14] mb-1">
                        Own {salonName}?
                    </h3>
                    <p className="text-sm text-[#1b0d14]/70 mb-4">
                        Claim your listing to get featured placement, add photos, display your services, and attract more customers.
                    </p>

                    <ul className="text-sm text-[#1b0d14]/80 space-y-1.5 mb-4">
                        <li className="flex items-center gap-2">
                            <span className="text-[#ee2b8c]">✓</span>
                            <span>Get top placement in search results</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-[#ee2b8c]">✓</span>
                            <span>&quot;Featured&quot; badge to stand out</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-[#ee2b8c]">✓</span>
                            <span>Add photos, services & booking link</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-[#ee2b8c]">✓</span>
                            <span>Monthly analytics on views & clicks</span>
                        </li>
                    </ul>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            href="/for-salons"
                            className="inline-flex items-center justify-center gap-2 bg-[#ee2b8c] text-white text-sm font-bold py-2.5 px-5 rounded-full hover:bg-[#ee2b8c]/90 transition-all"
                        >
                            Claim This Listing
                            <span>→</span>
                        </Link>
                        <a
                            href={`mailto:salons@nailartai.app?subject=Claim Listing: ${encodeURIComponent(salonName)}`}
                            className="inline-flex items-center justify-center gap-2 bg-white text-[#1b0d14] text-sm font-medium py-2.5 px-5 rounded-full ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/40 transition-all"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
