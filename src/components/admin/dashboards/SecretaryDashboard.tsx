"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Building2, CheckSquare, Wallet, Users, Clock, CreditCard, ArrowRight
} from 'lucide-react';

export default function SecretaryDashboard({ basePath = '/secretary' }: { basePath?: string }) {
  const [pendingApplications, setPendingApplications] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [applications, proofs, customers, leads] = await Promise.all([
          api.getApplications(),
          api.getPaymentProofs(),
          api.getCustomers(),
          api.getLeads(),
        ]);
        setPendingApplications(applications.filter(a => a.status === 'Pending Review').length);
        setPendingPayments(proofs.filter(p => p.status === 'Pending Verification').length);
        setTotalCustomers(customers.length);
        setNewLeads(leads.filter((l: any) => l.status === 'New').length);
      } catch (err) {
        console.error('Failed to load Secretary dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Pending Applications', value: pendingApplications, icon: Clock, color: 'text-amber-600 bg-amber-100' },
    { label: 'Pending Payment Verification', value: pendingPayments, icon: CreditCard, color: 'text-amber-600 bg-amber-100' },
    { label: 'Registered Customers', value: totalCustomers, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'New Leads', value: newLeads, icon: Building2, color: 'text-green-600 bg-green-100' },
  ];

  const actions = [
    {
      label: 'Applicant Registration',
      description: 'Register new applicants and record their details.',
      href: `${basePath}/customers`,
      icon: Building2,
      color: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100',
    },
    {
      label: 'Application Records',
      description: 'Review and track submitted applications.',
      href: `${basePath}/applications`,
      icon: CheckSquare,
      color: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-100',
    },
    {
      label: 'Payment Verification',
      description: 'Verify customer payment proofs and update ledgers.',
      href: `${basePath}/payments`,
      icon: Wallet,
      color: 'bg-green-50 text-green-600 border-green-100 group-hover:bg-green-100',
      badge: pendingPayments > 0 ? pendingPayments : undefined,
    },
    {
      label: 'Lead Queue',
      description: 'Work leads handed off from Customer Care.',
      href: `${basePath}/leads`,
      icon: Users,
      color: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100',
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
