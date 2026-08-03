import React from 'react';
import Image from 'next/image';
import { Target, Lightbulb, Users, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen pb-20">
      <section className="relative h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Corporate Building"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[var(--color-primary-dark)]/80"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">About Us</h1>
          <p className="text-xl md:text-2xl text-gray-200 font-light">
            M.I. Real Estate & General Enterprises Ltd. (RC No. 1771366)
          </p>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Who We Are</h2>
            <div className="w-20 h-1 bg-[var(--color-primary)] mb-8"></div>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              M.I. Real Estate & General Enterprises Ltd. is a premier indigenous real estate firm registered in Nigeria. We specialize in providing top-tier property solutions spanning residential, commercial, and land investments.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Our foundation is built on integrity, professionalism, and a commitment to delivering unparalleled value to our clients. Whether you are looking for your dream home, a strategic commercial space, or a lucrative land investment, our team of experts is dedicated to guiding you every step of the way.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-50 p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform">
              <Target className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Our Mission</h3>
              <p className="text-sm text-gray-600">To provide accessible, premium, and legally sound real estate solutions.</p>
            </div>
            <div className="bg-amber-50 p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform mt-10">
              <Lightbulb className="w-12 h-12 text-[var(--color-accent)] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Our Vision</h3>
              <p className="text-sm text-gray-600">To be the most trusted and innovative real estate brand in Africa.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform">
              <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Our Team</h3>
              <p className="text-sm text-gray-600">Driven by passion, expertise, and a client-first approach.</p>
            </div>
            <div className="bg-blue-50 p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform mt-10">
              <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Our Promise</h3>
              <p className="text-sm text-gray-600">Absolute transparency and verified properties only.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
