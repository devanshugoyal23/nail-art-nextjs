'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function StickySalonCTA() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show CTA after scrolling 500px or so to avoid cluttering initial view
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 md:hidden ${isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
        >
            <div className="bg-white/95 backdrop-blur-md border-t border-[#ee2b8c]/20 p-4 shadow-2xl flex items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm font-bold text-[#1b0d14]">
                        Visiting a salon? 💅
                    </p>
                    <p className="text-xs text-[#1b0d14]/70">
                        Try 1000+ designs virtually!
                    </p>
                </div>
                <Link
                    href="/try-on"
                    className="bg-[#ee2b8c] text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-[#ee2b8c]/90 transition-colors shadow-lg shadow-[#ee2b8c]/20 flex-shrink-0"
                >
                    Try Virtual Try-On
                </Link>
            </div>
        </div>
    );
}
