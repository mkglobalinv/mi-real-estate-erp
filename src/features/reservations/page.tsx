"use client";

import React, { useEffect, useState } from 'react';
import { Wallet, Filter, Calendar, Building, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { Reservation } from '@/lib/types';

export default function AdminReservationsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const fetchReservations = () => {
    api.getReservations().then(setReservations);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    api.updateReservationStatus(id, newStatus as any).then(fetchReservations);
    api.logActivity({ module: 'Reservations', action: `Updated Reservation status to ${newStatus}`, user: 'System' });
  };

  const handleAllocationStatus = (id: string, allocStatus: string) => {
    api.updateReservationAllocationStatus(id, allocStatus).then(fetchReservations);
    api.logActivity({ module: 'Reservations', action: `Updated Allocation status to ${allocStatus}`, user: 'System' });
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reservation Management</h1>
          <p className="text-gray-500 font-medium mt-1">Manage deposits, allocations, and customer conversions.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2 font-bold shadow-sm">
          <Filter className="w-4 h-4" /> Filter Records
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-blue-800">Allocation Preparation Active</h3>
          <p className="text-xs text-blue-700 mt-1">
            This module is prepared for the upcoming Phase 3 ERP Integration. You can assign Projects and Plots to Reservations, which will eventually tie into the Customer Portal.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Ref & Property</th>
                <th className="p-4">Customer Info</th>
                <th className="p-4">Financials</th>
                <th className="p-4">Reservation Status</th>
                <th className="p-4">Allocation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{reservation.ref}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Building className="w-3 h-3 text-gray-400" />
                      <p className="text-xs font-bold text-[var(--color-primary)]">{reservation.propertyRef}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{reservation.customerName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{reservation.date}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900 text-base">â‚¦{reservation.reservationAmount.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1
                      ${reservation.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
                    `}>
                      {reservation.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <select 
                      value={reservation.status}
                      onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                      className={`text-xs font-bold rounded-md px-2 py-1.5 outline-none border cursor-pointer w-full
                        ${reservation.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' : ''}
                        ${reservation.status === 'Paid' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                        ${reservation.status === 'Converted' ? 'bg-green-50 text-green-700 border-green-100' : ''}
                        ${reservation.status === 'Expired' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                      `}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Converted">Converted to Sale</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <select 
                      value={reservation.allocationStatus || 'Not Allocated'}
                      onChange={(e) => handleAllocationStatus(reservation.id, e.target.value)}
                      className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md px-2 py-1.5 outline-none cursor-pointer w-full mb-1"
                    >
                      <option value="Not Allocated">Not Allocated</option>
                      <option value="Pending Allocation">Pending Allocation</option>
                      <option value="Allocated">Allocated</option>
                    </select>
                    {reservation.allocationStatus === 'Allocated' && (
                      <p className="text-xs text-gray-500 mt-1 font-mono">Plot: {reservation.plotNumber || 'Unassigned'}</p>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No reservations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
