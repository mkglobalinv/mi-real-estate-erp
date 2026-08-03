"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Announcement } from '@/lib/types';
import { Megaphone, AlertCircle, Info } from 'lucide-react';

export default function NewsMarquee() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await api.getAnnouncements();
        const now = new Date().getTime();
        
        // Filter active and unexpired
        let active = data.filter(a => {
          if (!a.activeStatus) return false;
          const end = new Date(a.endDate).getTime();
          return end > now;
        });

        // Sort by priority (High -> Normal -> Low)
        const priorityScore = { High: 3, Normal: 2, Low: 1 };
        active.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

        setAnnouncements(active);
      } catch (err) {
        console.error("Failed to load announcements", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (isLoading) return null;

  const defaultMessage = {
    id: 'default',
    title: 'Welcome',
    message: 'Welcome to M.I. Real Estate & General Enterprises Ltd.',
    priority: 'Normal'
  } as Announcement;

  const displayAnnouncements = announcements.length > 0 ? announcements : [defaultMessage];

  return (
    <div className="bg-[var(--color-primary-dark)] text-white border-b border-white/10 relative z-40 overflow-hidden flex items-center h-10">
      <div className="bg-[var(--color-primary-dark)] px-4 h-full flex items-center justify-center z-10 border-r border-white/10 absolute left-0 shadow-[10px_0_10px_rgba(0,0,0,0.1)]">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-gold)] flex items-center gap-1.5 whitespace-nowrap">
          <Megaphone className="w-3 h-3" />
          News
        </span>
      </div>
      
      <div className="flex-1 overflow-hidden group ml-24 md:ml-28">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap py-2">
          {displayAnnouncements.map((ann, index) => (
            <div key={`${ann.id}-${index}`} className="flex items-center mx-8">
              {ann.priority === 'High' ? (
                <AlertCircle className="w-3 h-3 text-[var(--color-gold)] mr-2 flex-shrink-0" />
              ) : (
                <Info className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span className={`text-xs md:text-sm ${ann.priority === 'High' ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>
                {ann.title} <span className="mx-2 opacity-30">|</span> <span className="font-light">{ann.message}</span>
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {displayAnnouncements.map((ann, index) => (
            <div key={`dup-${ann.id}-${index}`} className="flex items-center mx-8">
              {ann.priority === 'High' ? (
                <AlertCircle className="w-3 h-3 text-[var(--color-gold)] mr-2 flex-shrink-0" />
              ) : (
                <Info className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span className={`text-xs md:text-sm ${ann.priority === 'High' ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>
                {ann.title} <span className="mx-2 opacity-30">|</span> <span className="font-light">{ann.message}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
