'use client';

import React from 'react';

interface SocialShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export default function SocialShareButton({ title, text, url }: SocialShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
        // Fallback: show the URL for manual copying
        alert(`Copy this link: ${url}`);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="text-purple-400 hover:text-purple-300 transition-colors"
      title="Share this design"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3 3 0 000-1.38l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
      </svg>
    </button>
  );
}
