"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Customer } from '@/lib/types';
import { User, Mail, Phone, MapPin, Briefcase, FileText, UploadCloud, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

type EditableCustomer = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  status: Customer['status'];
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinRelationship: string;
};

const emptyEdit: EditableCustomer = {
  fullName: '', phone: '', email: '', address: '', occupation: '', status: 'Pending Review',
  nextOfKinName: '', nextOfKinPhone: '', nextOfKinRelationship: ''
};

export default function CustomerProfilePage({ params, basePath = '/admin', readOnly = false }: { params: { id: string }, basePath?: string, readOnly?: boolean }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditableCustomer>(emptyEdit);
  const [saving, setSaving] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCustomer();
  }, [params.id]);

  const loadCustomer = async () => {
    try {
      const allCustomers = await api.getCustomers();
      const c = allCustomers.find(c => c.id === params.id) || null;
      setCustomer(c);
    } catch (err: any) {
      toast.error('Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    if (!customer) return;
    setEditForm({
      fullName: customer.fullName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      occupation: customer.occupation || '',
      status: customer.status,
      nextOfKinName: customer.nextOfKinName || '',
      nextOfKinPhone: customer.nextOfKinPhone || '',
      nextOfKinRelationship: customer.nextOfKinRelationship || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setSaving(true);
    try {
      // Spread the full existing record before the edited fields - saveCustomer
      // upserts, and Postgres validates NOT NULL on the proposed row even when
      // updating an existing one, so a partial payload can fail on columns
      // that aren't actually changing.
      const updated = await api.saveCustomer({ ...customer, ...editForm });
      setCustomer(updated);
      setIsEditOpen(false);
      toast.success('Customer profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!customer || deleteConfirmText !== customer.fullName) return;
    setDeleting(true);
    try {
      await api.deleteCustomer(customer.id);
      toast.success(`${customer.fullName} has been deleted.`);
      router.push(`${basePath}/customers`);
    } catch (err: any) {
      const msg: string = err.message || '';
      if (msg.toLowerCase().includes('foreign key') || msg.toLowerCase().includes('violates')) {
        toast.error('Cannot delete: this customer has an active plot allocation. Remove or reassign it first.');
      } else {
        toast.error(msg || 'Failed to delete customer');
      }
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading Customer Profile...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-red-500 font-bold">Customer not found.</div>;
  }

  return (
    <div className="pb-20">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <User className="w-8 h-8 text-[var(--color-primary)]" />
            Customer 360: {customer.fullName}
          </h1>
          <p className="text-gray-500 font-medium mt-1">Ref: {customer.ref} &bull; Status: {customer.status}</p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <button onClick={openEdit} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-sm rounded-lg transition-colors shadow-sm">
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
            <button onClick={() => { setDeleteConfirmText(''); setIsDeleteOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 font-bold text-sm rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button onClick={() => toast.error('Create Application not implemented')} className="btn-primary flex items-center gap-2">
              <FileText className="w-5 h-5" /> Create Application
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Profile Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Phone</p>
                <p className="font-medium text-gray-900">{customer.phone}</p>
              </div>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Email</p>
                  <p className="font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Address</p>
                  <p className="font-medium text-gray-900">{customer.address}</p>
                </div>
              </div>
            )}
            {customer.occupation && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Occupation</p>
                  <p className="font-medium text-gray-900">{customer.occupation}</p>
                </div>
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-gray-900 mb-4 mt-8 border-b pb-1">Next of Kin</h3>
          <div className="space-y-3">
            <p className="text-sm"><span className="font-bold text-gray-500 mr-2">Name:</span> {customer.nextOfKinName || 'N/A'}</p>
            <p className="text-sm"><span className="font-bold text-gray-500 mr-2">Phone:</span> {customer.nextOfKinPhone || 'N/A'}</p>
            <p className="text-sm"><span className="font-bold text-gray-500 mr-2">Relation:</span> {customer.nextOfKinRelationship || 'N/A'}</p>
          </div>
        </div>

        {/* Applications & Documents */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-900">Applications & Allocations</h2>
            </div>
            <div className="text-center py-8 text-gray-500">
              <p>No applications found for this customer.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-900">Documents</h2>
              {!readOnly && (
                <button onClick={() => toast.error('Document Upload not implemented')} className="text-[var(--color-primary)] font-bold text-sm flex items-center gap-1 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                  <UploadCloud className="w-4 h-4" /> Upload Document
                </button>
              )}
            </div>
            <div className="text-center py-8 text-gray-500">
              <p>No documents uploaded yet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><Pencil className="w-5 h-5" /> Edit Customer</h2>
              <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <form id="editCustForm" onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input required type="text" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                  value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                  <input required type="text" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                    value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                    value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                <input type="text" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                  value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Occupation</label>
                  <input type="text" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                    value={editForm.occupation} onChange={e => setEditForm({ ...editForm, occupation: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                    value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as Customer['status'] })}>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Next of Kin</p>
                <div className="space-y-4">
                  <input type="text" placeholder="Full Name" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                    value={editForm.nextOfKinName} onChange={e => setEditForm({ ...editForm, nextOfKinName: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Phone Number" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                      value={editForm.nextOfKinPhone} onChange={e => setEditForm({ ...editForm, nextOfKinPhone: e.target.value })} />
                    <input type="text" placeholder="Relationship" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                      value={editForm.nextOfKinRelationship} onChange={e => setEditForm({ ...editForm, nextOfKinRelationship: e.target.value })} />
                  </div>
                </div>
              </div>
            </form>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button form="editCustForm" type="submit" disabled={saving} className="flex-1 btn-primary py-3 font-bold disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-red-100 bg-red-50 rounded-t-2xl flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-extrabold text-red-700">Delete {customer.fullName}?</h2>
                <p className="text-sm text-red-600 mt-1">This permanently deletes their Easy Buy account, installments, payment proofs, and documents. This cannot be undone.</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Type <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{customer.fullName}</span> to confirm
                </label>
                <input
                  type="text"
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== customer.fullName || deleting}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
