"use client";

import React from 'react';
import { Activity } from 'lucide-react';
import { useRole } from '@/components/providers/RoleProvider';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';

const SMDDashboard = dynamic(() => import('@/components/admin/dashboards/SMDDashboard'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-xl mb-4"></div>
});

const CCDashboard = dynamic(() => import('@/components/admin/dashboards/CCDashboard'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-xl mb-4"></div>
});

const ChairmanDashboard = dynamic(() => import('@/components/admin/dashboards/ChairmanDashboard'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-xl mb-4"></div>
});

const DirectorDashboard = dynamic(() => import('@/components/admin/dashboards/DirectorDashboard'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-xl mb-4"></div>
});

const SecretaryDashboard = dynamic(() => import('@/components/admin/dashboards/SecretaryDashboard'), {
  ssr: false,
  loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-xl mb-4"></div>
});

export default function AdminOverviewDashboard({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const { role, loading: roleLoading } = useRole();
  const [leads, setLeads] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    if (!roleLoading && role === 'Super Admin') {
      api.getLeads().then(setLeads).catch((err: any) => console.error('Overview getLeads error:', err));
    }
  }, [role, roleLoading]);

  if (roleLoading) return (
    <div className="flex items-center justify-center h-full min-h-[500px]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading Dashboard Data...</p>
      </div>
    </div>
  );

  const isSMD = role === 'Social Media Director' || role === 'Super Admin';
  const isCC = role === 'Customer Care' || role === 'Super Admin';
  const isChairman = role === 'Chairman' || role === 'Super Admin';
  const isDirector = role === 'Director' || role === 'Super Admin';
  const isSecretary = role === 'Secretary' || role === 'Super Admin';

  const getDashboardTitle = () => {
    if (role === 'Social Media Director') return 'Marketing & Campaigns';
    if (role === 'Customer Care') return 'Customer Care Operations';
    if (role === 'Chairman') return 'Executive Dashboard';
    if (role === 'Director') return 'Director Dashboard';
    if (role === 'Secretary') return 'Secretary Dashboard';
    if (role === 'Admin Engineer') return 'System Overview';
    return 'Overview Dashboard';
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-[var(--color-primary)]" />
            {getDashboardTitle()}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {role === 'Social Media Director' && 'Manage your ad campaigns, leads, and analytics.'}
            {role === 'Customer Care' && 'Monitor follow-ups, tickets, and pipeline conversions.'}
            {role === 'Chairman' && 'Executive overview of revenue, operations, and approvals.'}
            {role === 'Director' && 'Review applications and documentation.'}
            {role === 'Secretary' && 'Registrations, applications, and payment verification.'}
            {!['Social Media Director', 'Customer Care', 'Chairman', 'Director', 'Secretary'].includes(role || '') && 'Manage digital properties and system health.'}
          </p>
        </div>
      </div>

      {isSMD && <SMDDashboard leads={role === 'Super Admin' ? leads : undefined} />}
      {isCC && <CCDashboard leads={role === 'Super Admin' ? leads : undefined} />}
      {isDirector && <DirectorDashboard />}
      {isChairman && <ChairmanDashboard />}
      {isSecretary && <SecretaryDashboard basePath={basePath} />}
    </div>
  );
}
