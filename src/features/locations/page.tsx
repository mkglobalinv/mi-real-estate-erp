"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { Location } from '@/lib/types';

export default function LocationsAdminPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const data = await api.getLocations();
    setLocations(data);
  };

  const handleSave = async () => {
    if (!nameInput.trim()) return;

    if (editingId) {
      await api.saveLocation({ id: editingId, name: nameInput.trim() });
    } else {
      await api.saveLocation({ name: nameInput.trim(), status: 'Active' });
    }

    setNameInput('');
    setEditingId(null);
    setIsAdding(false);
    loadLocations();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      await api.deleteLocation(id);
      loadLocations();
    }
  };

  const startEdit = (loc: Location) => {
    setEditingId(loc.id);
    setNameInput(loc.name);
    setIsAdding(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <MapPin className="mr-2 text-[var(--color-primary)]" />
          Location Management
        </h1>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setNameInput('');
          }}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[var(--color-primary-dark)]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Location
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Location' : 'New Location'}</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">State / City Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                placeholder="e.g. Kano, Abuja"
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {locations.map((loc) => (
              <tr key={loc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{loc.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loc.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {loc.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => startEdit(loc)} className="text-blue-600 hover:text-blue-900 mr-4">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(loc.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No locations found. Add some states or cities!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
