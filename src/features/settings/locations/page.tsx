"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Location } from '@/lib/types';
import { MapPin, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function LocationsManager({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<Location>>({ status: 'Active' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await api.getLocations();
    setLocations(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current.name) return;
    await api.saveLocation(current);
    setIsEditing(false);
    setCurrent({ status: 'Active' });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      await api.deleteLocation(id);
      loadData();
    }
  };

  const toggleStatus = async (loc: Location) => {
    await api.saveLocation({ ...loc, status: loc.status === 'Active' ? 'Inactive' : 'Active' });
    loadData();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[var(--color-primary)]" /> Location Manager
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage states and areas for the property search engine.</p>
        </div>
        <button onClick={() => { setIsEditing(true); setCurrent({ status: 'Active' }); }} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold mb-4">{current.id ? 'Edit Location' : 'Add Location'}</h2>
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Location Name</label>
              <input required type="text" placeholder="e.g., Kano - Nasarawa LGA" value={current.name || ''} onChange={e => setCurrent({...current, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="status" checked={current.status === 'Active'} onChange={e => setCurrent({...current, status: e.target.checked ? 'Active' : 'Inactive'})} className="w-5 h-5 accent-[var(--color-primary)]" />
              <label htmlFor="status" className="font-bold text-gray-700">Active</label>
            </div>
            <div className="flex justify-start gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-green-700">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-gray-600 text-sm">Location Name</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {locations.map(loc => (
              <tr key={loc.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-900">{loc.name}</td>
                <td className="p-4">
                  <button onClick={() => toggleStatus(loc)} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-max ${loc.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {loc.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {loc.status}
                  </button>
                </td>
                <td className="p-4 flex items-center gap-2">
                  <button onClick={() => { setCurrent(loc); setIsEditing(true); }} className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-green-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(loc.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {locations.length === 0 && (
          <div className="text-center py-12 text-gray-500">No locations found.</div>
        )}
      </div>
    </div>
  );
}
