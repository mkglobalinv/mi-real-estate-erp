"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Clock, Users, FolderGit2, Calendar, FileText, ArrowRight } from 'lucide-react';

export default function DirectorDashboard({ basePath = '/director' }: { basePath?: string }) {
  const [pendingApplications, setPendingApplications] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [upcomingInspections, setUpcomingInspections] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [applications, customers, projects, inspections] = await Promise.all([
          api.getApplications(),
          api.getCustomers(),
          api.getProjects(),
          api.getInspections(),
        ]);
        setPendingApplications(applications.filter(a => a.status === 'Pending Review').length);
        setTotalCustomers(customers.length);
        setActiveProjects(projects.filter(p => p.active).length);
        setUpcomingInspections(inspections.filter((i: any) => i.status === 'Pending' || i.status === 'Confirmed').length);
      } catch (err) {
        console.error('Failed to load Director dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Pending Applications', value: pendingApplications, icon: Clock, color: 'text-amber-600 bg-amber-100' },
    { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Active Projects', value: activeProjects, icon: FolderGit2, color: 'text-green-600 bg-green-100' },
    { label: 'Upcoming Inspections', value: upcomingInspections, icon: Calendar, color: 'text-purple-600 bg-purple-100' },
  ];

  const actions = [
    {
      label: 'Application Inbox',
      description: 'Review and approve pending customer applications.',
      href: `${basePath}/applications`,
      icon: FileText,
      color: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100',
      badge: pendingApplications > 0 ? pendingApplications : undefined,
    },
    {
      label: 'Customer Records',
      description: 'View and manage registered customers.',
      href: `${basePath}/customers`,
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100',
    },
    {
      label: 'Estate Projects',
      description: 'Manage estates and property listings.',
      href: `${basePath}/projects`,
      icon: FolderGit2,
      color: 'bg-green-50 text-green-600 border-green-100 group-hover:bg-green-100',
    },
    {
      label: 'Inspection Records',
      description: 'Track scheduled and completed site inspections.',
      href: `${basePath}/inspections`,
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-100',
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map(action => (
            <Link
              key={action.label}
              href={action.href}
              className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    {action.label}
                    {!!action.badge && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">{action.badge}</span>
                    )}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
