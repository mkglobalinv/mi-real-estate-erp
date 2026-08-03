"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    api.getOfficeInfo().then((info) => {
      setWhatsappNumber(info.whatsapp);
    });
  }, []);

  if (!whatsappNumber) return null;

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=Hi, I need help with M.I. Real Estate services.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:shadow-[0_10px_25px_rgba(37,211,102,0.5)] transition-all duration-300 flex items-center justify-center group"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
      <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden md:block">
        Need Help? Chat With Us
      </span>
    </a>
  );
}
