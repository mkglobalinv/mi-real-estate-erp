"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import LeadQualificationFlow from './LeadQualificationFlow';

// Popup chrome (backdrop + card + close button) around the shared
// LeadQualificationFlow — used for the in-page "WhatsApp Us" trigger on
// the homepage. Ad-traffic landing (mirealestat.com/?qualify=true) uses
// the same Flow inside QualifierLandingPage instead, with no overlay.
export default function LeadQualificationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="p-6 md:p-8">
          <LeadQualificationFlow onDone={onClose} />
        </div>
      </motion.div>
    </div>
  );
}
