"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, Calendar, Bookmark, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { OfficeInfo } from '@/lib/types';

interface StickyMobileActionBarProps {
  propertyRef: string;
  propertyTitle: string;
}

export default function StickyMobileActionBar({ propertyRef, propertyTitle }: StickyMobileActionBarProps) {
  const [office, setOffice] = useState<OfficeInfo | null>(null);

  useEffect(() => {
    api.getOfficeInfo().then(setOffice);
  }, []);

  if (!office) return null;

  const whatsappMessage = `Hi, I am interested in property ${propertyRef} - ${propertyTitle}`;
  const whatsappUrl = `https://wa.me/${office.whatsapp?.replace(/[^0-9]/g, '') || '2348031234567'}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 lg:hidden safe-area-bottom pb-env-bottom">
      <div className="flex items-center justify-between p-2 sm:p-3 gap-2">
        <Link 
          href={`/requests/new?ref=${propertyRef}`}
          className="flex-1 flex flex-col items-center justify-center py-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors"
        >
          <Bookmark className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase">Reserve</span>
        </Link>
        
        <Link 
          href={`/advisor?intent=inspection&ref=${propertyRef}`}
          className="flex-1 flex flex-col items-center justify-center py-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors"
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase">Inspect</span>
        </Link>

        <a 
          href={`tel:${office.phone1 || '+2348031234567'}`}
          className="flex-1 flex flex-col items-center justify-center py-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors border-l border-gray-100"
        >
          <Phone className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold uppercase">Call</span>
        </a>

        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-[1.5] bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl flex items-center justify-center gap-2 py-3 shadow-sm transition-colors"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="text-xs font-bold uppercase">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
