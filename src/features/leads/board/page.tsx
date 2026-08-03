"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Lead } from '@/lib/types';
import { GripVertical, Phone, Mail, MoreHorizontal } from 'lucide-react';

const COLUMNS = [
  'New',
  'Contacted',
  'Follow Up',
  'Qualified',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

export default function CRMBoardPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    api.getLeads().then(setLeads);
  }, []);

  const getColumnLeads = (status: string) => {
    return leads.filter(l => l.status === status);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-700 border-red-200';
    if (score >= 50) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">CRM Pipeline Board</h1>
          <p className="text-gray-500 font-medium mt-1">Drag and drop leads to update their current status.</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4">
        <div className="flex gap-4 h-full items-start w-max">
          {COLUMNS.map(col => {
            const columnLeads = getColumnLeads(col);
            return (
              <div key={col} className="w-80 h-full flex flex-col bg-gray-100/50 rounded-2xl border border-gray-200 shrink-0">
                <div className="p-4 border-b border-gray-200 bg-gray-50/80 rounded-t-2xl flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-gray-800 text-sm">{col}</h3>
                  <span className="bg-white text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-gray-100">
                    {columnLeads.length}
                  </span>
                </div>
                
                <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {columnLeads.map(lead => (
                    <div 
                      key={lead.id} 
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5 -ml-1 text-gray-400 group-hover:text-gray-600 transition-colors">
                          <GripVertical className="w-4 h-4" />
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getScoreColor(lead.score)}`}>
                            {lead.score} PTS
                          </span>
                        </div>
                        <button className="text-gray-400 hover:text-[var(--color-primary)]">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{lead.name}</h4>
                      <p className="text-xs text-[var(--color-primary)] font-bold mb-3 truncate">{lead.interest}</p>
                      
                      <div className="flex items-center gap-3 text-gray-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {columnLeads.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium">
                      Drop lead here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
