"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Campaign, CampaignPackage } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CampaignPackagesPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const params = useParams();
  const campaignId = params.id as string;
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [packages, setPackages] = useState<CampaignPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<Partial<CampaignPackage>>({
    name: '',
    outrightPrice: 0,
    initialDeposit: 0,
    monthlyInstallment: 0,
    durationMonths: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const camp = await api.getCampaignById(campaignId);
      if (!camp) {
        toast.error('Campaign not found');
        router.push(`${basePath}/campaigns`);
        return;
      }
      setCampaign(camp);
      const pkgs = await api.getCampaignPackages(campaignId);
      setPackages(pkgs);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) loadData();
  }, [campaignId]);

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPackage.name || currentPackage.outrightPrice === undefined) {
      toast.error('Name and Outright Price are required');
      return;
    }

    try {
      await api.saveCampaignPackage({
        ...currentPackage,
        campaignId
      });
      toast.success(isEditing ? 'Package updated' : 'Package added');
      
      // Reset form
      setIsEditing(false);
      setCurrentPackage({
        name: '',
        outrightPrice: 0,
        initialDeposit: 0,
        monthlyInstallment: 0,
        durationMonths: 0
      });
      loadData();
    } catch (error) {
      toast.error('Failed to save package');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await api.deleteCampaignPackage(id);
        toast.success('Package deleted');
        loadData();
      } catch (error) {
        toast.error('Failed to delete package');
      }
    }
  };

  const handleEdit = (pkg: CampaignPackage) => {
    setCurrentPackage(pkg);
    setIsEditing(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!campaign) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`${basePath}/campaigns`} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Packages & Pricing</h1>
          <p className="text-gray-500">Manage payment packages for campaign: <strong>{campaign.name}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{isEditing ? 'Edit Package' : 'Add New Package'}</h2>
            <form onSubmit={handleSavePackage} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={currentPackage.name || ''}
                  onChange={(e) => setCurrentPackage({...currentPackage, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="e.g. 40x40 Plot"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Outright Price (₦) *</label>
                <input
                  type="number"
                  required
                  value={currentPackage.outrightPrice || 0}
                  onChange={(e) => setCurrentPackage({...currentPackage, outrightPrice: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">Installment Plan (Optional)</label>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Initial Deposit (₦)</label>
                    <input
                      type="number"
                      value={currentPackage.initialDeposit || 0}
                      onChange={(e) => setCurrentPackage({...currentPackage, initialDeposit: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Monthly Installment (₦)</label>
                    <input
                      type="number"
                      value={currentPackage.monthlyInstallment || 0}
                      onChange={(e) => setCurrentPackage({...currentPackage, monthlyInstallment: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Months)</label>
                    <input
                      type="number"
                      value={currentPackage.durationMonths || 0}
                      onChange={(e) => setCurrentPackage({...currentPackage, durationMonths: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentPackage({
                        name: '',
                        outrightPrice: 0,
                        initialDeposit: 0,
                        monthlyInstallment: 0,
                        durationMonths: 0
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold hover:bg-opacity-90"
                >
                  {isEditing ? 'Update' : 'Add Package'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Current Packages</h2>
              <span className="text-sm font-medium text-gray-500">{packages.length} packages total</span>
            </div>
            
            {packages.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No packages added yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {packages.map((pkg) => (
                  <li key={pkg.id} className="p-4 hover:bg-gray-50 flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg mb-1">{pkg.name}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                        <div><strong>Outright:</strong> ₦{pkg.outrightPrice.toLocaleString()}</div>
                        <div><strong>Deposit:</strong> ₦{pkg.initialDeposit.toLocaleString()}</div>
                        <div><strong>Monthly:</strong> ₦{pkg.monthlyInstallment.toLocaleString()}</div>
                        <div><strong>Duration:</strong> {pkg.durationMonths} Months</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(pkg)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
