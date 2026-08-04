"use client";

import React from 'react';
import { notFound } from 'next/navigation';
import { Building2, Key, Users, Home, Map, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const servicesData: Record<string, { title: string; description: string; icon: any; content: string }> = {
  'property-sales': {
    title: 'Property Sales',
    description: 'Premium corporate and residential properties across Kano and beyond.',
    icon: Key,
    content: 'At M.I. Real Estate, we specialize in the sale of premium residential and commercial properties. Whether you are looking for a plot of land in a fast-developing area, a luxury family home, or a commercial space for your business, we have a diverse portfolio to meet your needs. All our properties undergo rigorous verification to ensure 100% secure ownership and peace of mind.'
  },
  'property-management': {
    title: 'Property Management',
    description: 'Comprehensive property management services to maximize your ROI.',
    icon: Home,
    content: 'We take the stress out of being a landlord. Our comprehensive property management services include tenant screening, rent collection, routine maintenance, and legal compliance. We ensure your property is well-maintained and yields maximum return on investment while keeping your tenants satisfied.'
  },
  'real-estate-advisory': {
    title: 'Real Estate Advisory',
    description: 'Expert guidance on real estate investments and portfolio management.',
    icon: Users,
    content: 'Navigating the real estate market requires deep insight and experience. Our advisory team provides data-driven recommendations on property investments, market trends, portfolio diversification, and risk management. Let our experts guide you to make the most profitable real estate decisions.'
  },
  'facility-management': {
    title: 'Facility Management',
    description: 'Professional maintenance and upkeep for commercial and residential estates.',
    icon: Building2,
    content: 'A well-maintained facility preserves its value and enhances the experience of its occupants. We offer professional facility management services covering security, cleaning, landscaping, waste management, and preventative maintenance for residential estates, corporate buildings, and commercial complexes.'
  },
  'land-survey': {
    title: 'Land Survey',
    description: 'Accurate and legal land surveying and documentation services.',
    icon: Map,
    content: 'Proper boundary demarcation and documentation are the foundations of secure real estate ownership. Our certified surveyors utilize modern equipment to provide accurate topographic surveys, boundary surveys, layout designs, and assistance with processing land titles and documentation.'
  }
};

export default function ClientServicePage({ slug }: { slug: string }) {
  const service = servicesData[slug];
  
  if (!service) {
    notFound();
  }

  const Icon = service.icon;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      {/* Hero Section */}
      <div className="bg-[var(--color-primary-dark)] text-white py-20 px-4 mt-[-6rem] pt-[12rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Icon className="w-16 h-16 text-[var(--color-gold)] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">{service.title}</h1>
          <p className="text-xl text-green-50 max-w-2xl mx-auto">
            {service.description}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="prose prose-lg prose-green max-w-none text-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">About This Service</h2>
            <p className="leading-relaxed text-lg mb-8">{service.content}</p>
            
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to get started?</h3>
                <p className="text-gray-600">Contact our team today to discuss your specific requirements.</p>
              </div>
              <Link href="/contact" className="btn-primary whitespace-nowrap flex items-center gap-2">
                Contact Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
