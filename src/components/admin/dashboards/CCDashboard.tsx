"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { UserPlus, Users as UsersIcon, Calendar, Ticket, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function CCDashboard({ leads: propLeads }: { leads?: any[] | null }) {
  const [leads, setLeads] = useState<any[]>(propLeads || []);
  const [tickets, setTickets] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propLeads !== undefined && propLeads !== null) {
      setLeads(propLeads);
      setLoading(false);
    }
  }, [propLeads]);

  useEffect(() => {
    async function loadData() {
      const fetchPromises: Promise<void>[] = [];
      if (propLeads === undefined) {
        fetchPromises.push(api.getLeads().then(setLeads));
      }
      fetchPromises.push(api.getTickets().then(setTickets));
      fetchPromises.push(api.getInspections().then(setInspections));

      await Promise.all(fetchPromises);
      if (propLeads === undefined || propLeads !== null) {
        setLoading(false);
      }
    }
    loadData();
  }, [propLeads]);

  if (loading) return (
    <div className="mb-12 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-28"></div>
        ))}
      </div>
    </div>
  );

  const today = new Date().toISOString().split('T')[0];
  const newLeadsCC = leads.filter(l => l.status === 'New').length;
  const assignedLeadsCC = leads.filter(l => l.assignedTo === 'Customer Care').length;
  const followUpsToday = leads.filter(l => l.followUpDate === today).length;
  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const scheduledInspections = inspections.filter(i => i.status === 'Scheduled' || i.status === 'Pending').length;
  const convertedLeads = leads.filter(l => l.status === 'Closed Won').length;
  const lostLeads = leads.filter(l => l.status === 'Closed Lost').length;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Operations & Pipeline</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><UserPlus className="w-4 h-4 text-indigo-500"/><span className="text-xs font-bold text-gray-500 uppercase">New Leads</span></div>
          <h3 className="text-2xl font-extrabold">{newLeadsCC}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><UsersIcon className="w-4 h-4 text-blue-500"/><span className="text-xs font-bold text-gray-500 uppercase">Assigned Leads</span></div>
          <h3 className="text-2xl font-extrabold">{assignedLeadsCC}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-orange-500"/><span className="text-xs font-bold text-gray-500 uppercase">Follow-Ups</span></div>
          <h3 className="text-2xl font-extrabold">{followUpsToday}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><Ticket className="w-4 h-4 text-red-500"/><span className="text-xs font-bold text-gray-500 uppercase">Open Tickets</span></div>
          <h3 className="text-2xl font-extrabold">{openTickets}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-blue-500"/><span className="text-xs font-bold text-gray-500 uppercase">Inspections</span></div>
          <h3 className="text-2xl font-extrabold">{scheduledInspections}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-green-500"/><span className="text-xs font-bold text-gray-500 uppercase">Converted</span></div>
          <h3 className="text-2xl font-extrabold text-green-600">{convertedLeads}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><XCircle className="w-4 h-4 text-red-500"/><span className="text-xs font-bold text-gray-500 uppercase">Lost</span></div>
          <h3 className="text-2xl font-extrabold text-red-600">{lostLeads}</h3>
        </div>
      </div>
    </div>
  );
}
