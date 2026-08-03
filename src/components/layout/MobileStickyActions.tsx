"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle, Home } from 'lucide-react';
import { api } from '@/lib/api';

const MobileStickyActions = () => {
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    api.getOfficeInfo().then(info => {
      setPhone(info.phone1);
      setWhatsapp(info.whatsapp);
    });
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        <a href={`tel:${phone}`} className="flex flex-col items-center justify-center w-full h-full text-gray-600 hover:text-[var(--color-primary)] active:bg-gray-50">
          <Phone className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Call Us</span>
        </a>
        
        <div className="w-px h-8 bg-gray-200"></div>
        
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-full h-full text-green-600 hover:text-green-700 active:bg-green-50">
          <MessageCircle className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium uppercase tracking-wider">WhatsApp</span>
        </a>
        
        <div className="w-px h-8 bg-gray-200"></div>
        
        <Link href="/advisor" className="flex flex-col items-center justify-center w-full h-full text-[var(--color-accent)] hover:text-amber-600 active:bg-amber-50">
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Advisor</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileStickyActions;
