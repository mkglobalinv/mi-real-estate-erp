"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, Filter, UserPlus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { InspectionBooking } from '@/lib/types';

export default function AdminInspectionsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [inspections, setInspections] = useState<InspectionBooking[]>([]);

  const fetchInspections = () => {
    api.getInspections().then(setInspections);
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    api.updateInspectionStatus(id, newStatus as any).then(fetchInspections);
    api.logActivity({ module: 'Inspections', action: `Updated Inspection status to ${newStatus}`, user: 'System' });
  };

  const handleAssign = (id: string, staffName: string) => {
    api.updateInspectionAssignment(id, staffName).then(fetchInspections);
    api.logActivity({ module: 'Inspections', action: `Assigned Inspection to ${staffName}`, user: 'System' });
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inspection Management</h1>
          <p className="text-gray-500 font-medium mt-1">Schedule, assign, and track property viewings.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2 font-bold shadow-sm">
          <Filter className="w-4 h-4" /> Filter Bookings
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Reference & Property</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Status & Action</th>
                <th className="p-4">Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {inspections.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="text-xs text-gray-500 font-mono mb-1">{booking.ref}</p>
                    <p className="font-bold text-[var(--color-primary)] text-sm">{booking.propertyRef}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{booking.customerName}</p>
                    <p className="text-xs text-gray-600 mt-1">ðŸ“ž {booking.phone}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-800">{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600 font-medium">{booking.time}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className={`text-xs font-bold rounded-md px-2 py-1.5 outline-none border cursor-pointer w-full mb-2
                        ${booking.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' : ''}
                        ${booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                        ${booking.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' : ''}
                        ${booking.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                      `}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-gray-400" />
                      <select 
                        value={booking.assignedTo || ''}
                        onChange={(e) => handleAssign(booking.id, e.target.value)}
                        className="text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer border-b border-gray-200 pb-0.5"
                      >
                        <option value="">Unassigned</option>
                        <option value="Admin Engineer">Admin Engineer</option>
                        <option value="Customer Care">Customer Care</option>
                        <option value="Sales Director">Sales Director</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {inspections.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No inspections scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
