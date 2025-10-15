
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800/30">
      <div className="container mx-auto py-4 px-2 sm:px-4 text-center text-gray-400">
        <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} Nail Art AI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
