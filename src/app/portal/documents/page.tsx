"use client";

import React, { useState } from 'react';
import { 
  FileText, Download, Folder, File, ChevronRight, Lock, Stamp
} from 'lucide-react';

export default function PortalDocuments() {
  
  interface DocumentFile {
    id: number;
    name: string;
    date: string;
    type: string;
    size: string;
    secure: boolean;
    locked?: boolean;
  }

  interface DocumentGroup {
    category: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    border: string;
    files: DocumentFile[];
  }

  // Grouped documents for the UI prototype
  const documentGroups: DocumentGroup[] = [
    {
      category: "Registration Documents",
      description: "Your official profile and onboarding files.",
      icon: <Folder className="w-5 h-5 text-indigo-500" />,
      color: "bg-indigo-50",
      border: "border-indigo-100",
      files: [
        { id: 1, name: "Customer Registration Form", date: "Jan 10, 2025", type: "PDF", size: "1.2 MB", secure: false },
        { id: 2, name: "Customer Profile Verification", date: "Jan 12, 2025", type: "PDF", size: "0.8 MB", secure: true }
      ]
    },
    {
      category: "Financial Documents",
      description: "Payment receipts and account statements.",
      icon: <Folder className="w-5 h-5 text-emerald-500" />,
      color: "bg-emerald-50",
      border: "border-emerald-100",
      files: [
        { id: 3, name: "Initial Deposit Receipt", date: "Jan 10, 2025", type: "PDF", size: "0.5 MB", secure: false },
        { id: 4, name: "Account Statement (Q1 2025)", date: "Apr 01, 2025", type: "PDF", size: "1.5 MB", secure: false },
        { id: 5, name: "Installment 4 Receipt", date: "May 12, 2025", type: "PDF", size: "0.5 MB", secure: false }
      ]
    },
    {
      category: "Allocation Documents",
      description: "Official site plans and allocation letters.",
      icon: <Folder className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-50",
      border: "border-blue-100",
      files: [
        { id: 6, name: "Provisional Allocation Letter", date: "Feb 05, 2025", type: "PDF", size: "2.1 MB", secure: true },
        { id: 7, name: "Block C Site Plan", date: "Feb 05, 2025", type: "PDF", size: "4.5 MB", secure: false }
      ]
    },
    {
      category: "Legal Documents",
      description: "Agreements and ownership documentation.",
      icon: <Folder className="w-5 h-5 text-amber-500" />,
      color: "bg-amber-50",
      border: "border-amber-100",
      files: [
        { id: 8, name: "Contract of Sale", date: "Pending Completion", type: "PDF", size: "--", secure: true, locked: true },
        { id: 9, name: "Deed of Assignment", date: "Pending Completion", type: "PDF", size: "--", secure: true, locked: true }
      ]
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <Stamp className="w-8 h-8 text-[var(--color-primary)]" />
          Document Center
        </h1>
        <p className="text-gray-500 font-medium mt-2 max-w-2xl">
          Secure access to all your official files. Documents marked with a lock require your secure PIN to download.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documentGroups.map((group, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`p-6 border-b ${group.border} ${group.color} flex items-center gap-4`}>
              <div className="bg-white p-3 rounded-xl shadow-sm">
                {group.icon}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">{group.category}</h2>
                <p className="text-xs text-gray-600 font-medium mt-0.5">{group.description}</p>
              </div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {group.files.map((file) => (
                <div key={file.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <File className={`w-8 h-8 ${file.locked ? 'text-gray-300' : 'text-[var(--color-primary)] opacity-80'}`} />
                    <div>
                      <p className={`text-sm font-bold flex items-center gap-2 ${file.locked ? 'text-gray-400' : 'text-gray-900'}`}>
                        {file.name}
                        {file.secure && !file.locked && <Lock className="w-3 h-3 text-amber-500" />}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">
                        {file.locked ? 'Available upon completion' : `${file.date} • ${file.size}`}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    disabled={file.locked}
                    className={`p-2 rounded-lg transition-colors ${
                      file.locked 
                        ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-[var(--color-primary)] hover:bg-green-50 bg-white border border-gray-100 shadow-sm'
                    }`}
                  >
                    {file.locked ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
