"use client";

import React, { useEffect, useState } from 'react';
import CampaignForm from '@/components/admin/CampaignForm';
import { api } from '@/lib/api';
import { Campaign } from '@/lib/types';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function EditCampaignPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const params = useParams();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await api.getCampaignById(id);
        if (data) {
          setCampaign(data);
        } else {
          toast.error('Campaign not found');
        }
      } catch (error) {
        toast.error('Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading campaign details...</div>;
  }

  if (!campaign) {
    return <div className="p-8 text-center text-red-500">Campaign not found.</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
        <p className="text-gray-500">Update your campaign settings.</p>
      </div>
      <CampaignForm initialData={campaign} isEdit={true} />
    </div>
  );
}
