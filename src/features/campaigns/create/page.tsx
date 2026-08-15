import React from 'react';
import CampaignForm from '@/components/admin/CampaignForm';

export default function CreateCampaignPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
        <p className="text-gray-500">Set up a new marketing campaign and landing page.</p>
      </div>
      <CampaignForm basePath={basePath} />
    </div>
  );
}
