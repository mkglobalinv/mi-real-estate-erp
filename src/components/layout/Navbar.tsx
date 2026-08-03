"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, Building2 } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Properties', path: '/properties' },
    { name: 'Easy Buy', path: '/easy-buy' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 md:h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="relative h-[30px] w-[30px] md:h-[45px] md:w-[45px] flex-shrink-0">
                <Image src="/logo.png" alt="M.I. Real Estate Logo" fill className="object-contain" priority quality={100} sizes="(max-width: 768px) 30px, 45px" />
              </div>
              <div>
                <span className="font-bold text-lg md:text-xl text-[var(--color-primary-dark)] block leading-none tracking-tight">M.I. REAL ESTATE</span>
                <span className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wider">& General Enterprises Ltd</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`font-semibold text-sm uppercase tracking-wider transition-colors duration-200 ${
                  pathname === link.path
                    ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] pb-1'
                    : 'text-gray-600 hover:text-[var(--color-primary)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/admin" className="text-xs bg-gray-100 font-bold text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-[var(--color-primary)] focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-semibold ${
                  pathname === link.path
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-semibold text-gray-500 hover:bg-gray-50"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
