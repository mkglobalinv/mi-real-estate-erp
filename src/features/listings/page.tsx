"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PropertyListing } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminListingsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [listings, setListings] = useState<PropertyListing[]>([]);

  useEffect(() => {
    api.getProperties().then(setListings);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Property Listings</h1>
          <p className="text-gray-500">Manage your real estate catalog.</p>
        </div>
        <button onClick={() => toast.error('Add Listing feature coming soon')} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <PlusCircle className="w-4 h-4" /> Add Listing
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
              <tr>
                <th className="p-4">Ref / Title</th>
                <th className="p-4">Location</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {listings.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 font-mono">{item.ref}</p>
                  </td>
                  <td className="p-4 text-gray-700">{item.location}</td>
                  <td className="p-4 font-bold text-[var(--color-primary)]">
                    â‚¦{item.price.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => toast.error('Edit feature coming soon')} className="text-[var(--color-primary)] font-medium hover:underline text-xs mr-3">Edit</button>
                    <button onClick={() => toast.error('Delete feature coming soon')} className="text-red-500 font-medium hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
