"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MessageSquare, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { Testimonial } from '@/lib/types';
import Image from 'next/image';

export default function TestimonialsAdminPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    customerName: '',
    customerPhoto: '',
    review: '',
    rating: 5,
    isActive: true
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    const data = await api.getTestimonials();
    setTestimonials(data);
  };

  const handleSave = async () => {
    if (!formData.customerName || !formData.review) return;

    await api.saveTestimonial(formData);

    setFormData({
      customerName: '',
      customerPhoto: '',
      review: '',
      rating: 5,
      isActive: true
    });
    setEditingId(null);
    setIsAdding(false);
    loadTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      await api.deleteTestimonial(id);
      loadTestimonials();
    }
  };

  const startEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setFormData(t);
    setIsAdding(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <MessageSquare className="mr-2 text-[var(--color-primary)]" />
          Testimonials Management
        </h1>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({
              customerName: '',
              customerPhoto: '',
              review: '',
              rating: 5,
              isActive: true
            });
          }}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[var(--color-primary-dark)]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Testimonial
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Testimonial' : 'New Testimonial'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={formData.customerName || ''}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
              <input
                type="text"
                value={formData.customerPhoto || ''}
                onChange={(e) => setFormData({...formData, customerPhoto: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Content</label>
              <textarea
                value={formData.review || ''}
                onChange={(e) => setFormData({...formData, review: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.rating || 5}
                onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">
                Active on Website
              </label>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700"
            >
              Save Testimonial
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className={`bg-white rounded-xl shadow-sm border p-6 relative ${t.isActive ? 'border-gray-200' : 'border-red-200 opacity-60'}`}>
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => startEdit(t)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1 rounded">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                {t.customerPhoto ? (
                  <Image src={t.customerPhoto} alt={t.customerName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
                    {t.customerName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t.customerName}</h3>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm italic">"{t.review}"</p>
            {!t.isActive && (
              <span className="mt-4 inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md font-medium">Inactive</span>
            )}
          </div>
        ))}
      </div>
      {testimonials.length === 0 && !isAdding && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No testimonials yet.</p>
        </div>
      )}
    </div>
  );
}
