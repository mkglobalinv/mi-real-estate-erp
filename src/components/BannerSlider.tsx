"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { api } from '@/lib/api';
import { Banner } from '@/lib/types';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 50;

// Wide, short promotional slider for the customer portal dashboard.
// Autoplays, supports drag/swipe, and degrades to nothing (not a blank
// gap) when there are no active banners or every image fails to load.
export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const draggedRef = useRef(false);

  useEffect(() => {
    api.getActiveBanners()
      .then(data => setBanners(data))
      .catch(() => setBanners([]))
      .finally(() => setLoaded(true));
  }, []);

  const slides = banners.filter(b => !brokenIds.has(b.id));
  // Derived, not effect-synced: if a broken image shrinks the visible list
  // out from under the stored index, clamp it back in range for this render
  // instead of scheduling a extra setState-in-effect render.
  const safeIndex = slides.length > 0 ? index % slides.length : 0;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length > 1 && !paused) {
      timerRef.current = setInterval(() => {
        setIndex(prev => (prev + 1) % slides.length);
      }, AUTOPLAY_MS);
    }
  }, [slides.length, paused]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  if (!loaded || slides.length === 0) return null;

  const current = slides[safeIndex];

  const goTo = (i: number) => {
    setIndex(i);
    resetTimer();
  };

  const handleDrag = (_e: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 10) draggedRef.current = true;
  };

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      setIndex(prev => (prev + 1) % slides.length);
      resetTimer();
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      setIndex(prev => (prev - 1 + slides.length) % slides.length);
      resetTimer();
    }
  };

  const handleClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    if (current.clickUrl) {
      window.open(current.clickUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="mb-8 rounded-3xl overflow-hidden border border-gray-100 shadow-sm relative bg-gray-100 select-none touch-pan-y"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full aspect-[16/4.2] max-h-[157px]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={current.id}
            className={`absolute inset-0 ${current.clickUrl ? 'cursor-pointer' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            drag={slides.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragStart={() => { draggedRef.current = false; }}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.imageUrl}
              alt={current.title || 'Promotion'}
              className="w-full h-full object-cover"
              draggable={false}
              onError={() => setBrokenIds(prev => new Set(prev).add(current.id))}
            />
            {(current.title || current.description) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex flex-col justify-end p-4 sm:p-6 pointer-events-none">
                {current.title && (
                  <h3 className="text-white font-extrabold text-base sm:text-xl drop-shadow-sm leading-tight">{current.title}</h3>
                )}
                {current.description && (
                  <p className="text-white/90 text-xs sm:text-sm font-medium mt-0.5 max-w-lg line-clamp-2">{current.description}</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {slides.map((b, i) => (
            <button
              key={b.id}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
