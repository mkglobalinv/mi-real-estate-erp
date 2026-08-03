"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, MapPin, Phone, Mail, ArrowRight, Laptop, Shield, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { OfficeInfo } from '@/lib/types';

const Footer = () => {
  const [office, setOffice] = useState<OfficeInfo | null>(null);

  useEffect(() => {
    api.getOfficeInfo().then(setOffice);
  }, []);

  return (
    <>
      <footer className="bg-[var(--color-primary-dark)] text-white pt-10 pb-24 md:pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative h-[45px] w-[45px] md:h-[60px] md:w-[60px] bg-white rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                <Image src="/logo.png" alt="M.I. Real Estate Logo" fill className="object-contain p-1" sizes="(max-width: 768px) 45px, 60px" />
              </div>
              <div>
                <span className="font-bold text-xl block leading-none">M.I. REAL ESTATE</span>
                <span className="text-[10px] text-gray-300 font-medium tracking-wider uppercase">RC No. 1771366</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Your trusted partner in premium corporate and residential real estate. We deliver excellence, integrity, and unmatched value in every property transaction.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b-2 border-green-500/50 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-300 font-medium">
              <li><Link href="/" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Home</Link></li>
              <li><Link href="/about" className="hover:text-white hover:translate-x-1 inline-block transition-transform">About Us</Link></li>
              <li><Link href="/properties" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Properties</Link></li>
              <li><Link href="/easy-buy" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Easy Buy Scheme</Link></li>
              <li><Link href="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Contact Us</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b-2 border-green-500/50 pb-2 inline-block">Our Services</h3>
            <ul className="space-y-3 text-sm text-gray-300 font-medium">
              <li><Link href="/services/property-sales" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Property Sales</Link></li>
              <li><Link href="/services/property-management" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Property Management</Link></li>
              <li><Link href="/services/real-estate-advisory" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Real Estate Advisory</Link></li>
              <li><Link href="/services/facility-management" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Facility Management</Link></li>
              <li><Link href="/services/land-survey" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Land Survey</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b-2 border-green-500/50 pb-2 inline-block">Contact Info</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 flex-shrink-0 text-green-400 w-5 h-5" />
                <span>{office?.address || 'M.I. Real Estate Plaza, Zoo Road, Kano'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="flex-shrink-0 text-green-400 w-5 h-5" />
                <span>{office?.phone1 || '+234 803 123 4567'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="flex-shrink-0 text-green-400 w-5 h-5" />
                <span>{office?.email1 || 'info@mirealestate.com.ng'}</span>
              </li>
            </ul>
            
            <div className="mt-8">
              <h4 className="text-sm font-bold mb-4 text-gray-300 uppercase tracking-wider">Connect With Us</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-black hover:-translate-y-1 transition-all">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Global Trust Badges */}
        <div className="border-t border-white/10 pt-8 pb-8 mt-4 mb-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 items-center">
            <div className="flex items-center gap-2 text-gray-300">
              <Shield className="w-6 h-6 text-[var(--color-gold)]" />
              <span className="text-sm font-bold uppercase tracking-wider">Verified Company</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-sm font-bold uppercase tracking-wider">Secure Transactions</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Building2 className="w-6 h-6 text-[var(--color-gold)]" />
              <span className="text-sm font-bold uppercase tracking-wider">Easy Buy Certified</span>
            </div>
          </div>
        </div>

          <div className="border-t border-white/10 pt-6 flex flex-col lg:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-300 font-medium text-center lg:text-left">
              &copy; {new Date().getFullYear()} M.I. Real Estate & General Enterprises Ltd. All rights reserved.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm text-gray-300 font-medium">
              <div className="flex items-center gap-6">
                <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              </div>
              
              <Link 
                href="/website-enquiry" 
                className="bg-black/40 hover:bg-black/60 border border-white/10 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5 mt-2 md:mt-0"
              >
                <Laptop className="w-3 h-3" />
                Website By ReciprocalTech
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
