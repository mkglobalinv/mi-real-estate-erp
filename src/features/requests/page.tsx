"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PropertyRequest } from '@/lib/types';

export default function AdminRequestsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);

  useEffect(() => {
    api.getRequests().then(setRequests);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Requests</h1>
          <p className="text-gray-500">Manage buyer property requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Client</th>
                <th className="p-4">Requirements</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{req.name}</p>
                    <p className="text-gray-500">{req.phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{req.type} - {req.location}</p>
                    <p className="text-xs text-gray-500">Budget: {req.budget}</p>
                    {req.notes && <p className="text-xs text-gray-400 mt-1 italic max-w-xs truncate">{req.notes}</p>}
                  </td>
                  <td className="p-4">
                    <select 
                      value={req.status}
                      onChange={(e) => {
                        api.updateRequestStatus(req.id, e.target.value as any).then(() => {
                          api.getRequests().then(setRequests);
                        });
                      }}
                      className="text-xs font-bold bg-gray-100 text-gray-700 rounded-md px-2 py-1 outline-none border-none cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
