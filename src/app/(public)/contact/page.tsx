"use client";

import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { OfficeInfo } from '@/lib/types';

export default function ContactPage() {
  const [office, setOffice] = useState<OfficeInfo | null>(null);

  useEffect(() => {
    api.getOfficeInfo().then(setOffice);
  }, []);

  if (!office) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Get in touch with our team of real estate experts.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-green-50 p-4 rounded-full">
                  <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Office Address</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {office.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-50 p-4 rounded-full">
                  <Phone className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Phone & WhatsApp</h3>
                  <p className="text-gray-600">{office.phone1}</p>
                  {office.phone2 && <p className="text-gray-600">{office.phone2}</p>}
                  {office.whatsapp && <p className="text-green-600 font-medium mt-1">WhatsApp: {office.whatsapp}</p>}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-50 p-4 rounded-full">
                  <Mail className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email</h3>
                  <p className="text-gray-600">{office.email1}</p>
                  {office.email2 && <p className="text-gray-600">{office.email2}</p>}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-50 p-4 rounded-full">
                  <Clock className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Business Hours</h3>
                  <p className="text-gray-600 whitespace-pre-line">{office.businessHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Embed */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 h-full min-h-[400px] flex flex-col">
            <h2 className="text-xl font-bold mb-4 px-4 pt-4">Find Us on Google Maps</h2>
            <div className="flex-grow bg-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
               <a href={office.mapsLink} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline font-bold z-10 flex flex-col items-center">
                 Open in Google Maps
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
