'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      icon: '🏠',
      label: 'Home',
      active: pathname === '/',
    },
    {
      href: '/categories',
      icon: '📁',
      label: 'Browse',
      active: pathname.startsWith('/categories'),
    },
    {
      href: '/try-on',
      icon: '✨',
      label: 'Try-On',
      active: pathname === '/try-on',
      highlight: true,
    },
    {
      href: '/nail-art-gallery',
      icon: '🎨',
      label: 'Gallery',
      active: pathname.startsWith('/nail-art-gallery'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 shadow-2xl pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 min-w-[70px] ${
              item.active
                ? item.highlight
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className={`text-xl ${item.active && item.highlight ? 'animate-bounce' : ''}`}>
              {item.icon}
            </span>
            <span className={`text-xs font-semibold ${item.active ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
            {item.active && (
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                item.highlight ? 'bg-white' : 'bg-purple-500'
              }`}></div>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
