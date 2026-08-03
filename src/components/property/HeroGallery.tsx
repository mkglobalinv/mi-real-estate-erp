"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface HeroGalleryProps {
  images: string[];
  title: string;
}

export default function HeroGallery({ images, title }: HeroGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fallback if no images
  const displayImages = images.length > 0 ? images : ['https://via.placeholder.com/800x600?text=No+Image+Available'];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  // Simple swipe detection for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  return (
    <>
      <div 
        className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[21/9] group shadow-sm"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Image 
          src={displayImages[currentIndex]} 
          alt={`${title} - Image ${currentIndex + 1}`}
          fill
          sizes="100vw"
          priority
          className="object-cover transition-opacity duration-500"
        />

        {/* Overlay gradient for better button visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        <button 
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* Pagination Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {displayImages.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <button 
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Image 
              src={displayImages[currentIndex]} 
              alt={`${title} - Fullscreen ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Fullscreen Nav */}
          {displayImages.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-50"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-50"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          
          {/* Pagination */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md z-50">
            {currentIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  );
}
