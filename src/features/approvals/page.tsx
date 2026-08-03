"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Customer, Allocation } from '@/lib/types';
import { 
  ShieldCheck, Check, X as XIcon, Clock, UserCheck, MapPin, Search 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ChairmanApprovalsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [activeTab, setActiveTab] = useState<'registrations' | 'allocations'>('registrations');
  const [pendingCustomers, setPendingCustomers] = useState<Customer[]>([]);
  const [pendingAllocations, setPendingAllocations] = useState<Allocation[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const custs = await api.getCustomers();
    const allocs = await api.getAllocations();
    
    // Filter to only those requiring Chairman Approval
    setPendingCustomers(custs.filter(c => c.status === 'Pending Review' || c.status === 'Director Approved'));
    setPendingAllocations(allocs.filter(a => a.status === 'Pending Allocation'));
  };

  const handleApproveAllocation = async (id: string) => {
    const alloc = pendingAllocations.find(a => a.id === id);
    if (!alloc) return;

    try {
      await api.saveAllocation({
        ...alloc,
        status: 'Allocated'
      });
      await api.logActivity({
        user: 'Chairman',
        module: 'Approvals',
        action: `Approved Allocation for Plot ${alloc.plotNumber}`
      });
      toast.success('Allocation approved successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve allocation');
    }
  };

  const handleApproveRegistration = async (id: string) => {
    const customer = pendingCustomers.find(c => c.id === id);
    if (!customer) return;

    try {
      // Update Customer Status
      await api.saveCustomer({
        ...customer,
        status: 'Chairman Approved',
        approvedByChairman: 'Chairman',
        approvalDate: new Date().toISOString()
      });

      // Automagically Create Easy Buy Account
      await api.saveEasyBuyAccount({
        customerId: customer.id,
        projectId: 'PROJ-1', // In a real app, this is pulled from registration payload
        propertyId: 'PROP-1',
        totalPropertyPrice: 5000000,
        initialDeposit: 500000, // Look up payment proofs
        monthlyInstallment: 187500,
        durationMonths: 24,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 24)).toISOString(),
        outstandingBalance: 4500000,
        status: 'Active'
      });

      // Log Activity
      await api.logActivity({
        user: 'Chairman',
        module: 'Approvals',
        action: `Approved Registration: ${customer.fullName}`
      });

      toast.success('Registration approved successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve registration');
    }
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" />
            Chairman Approvals
          </h1>
          <p className="text-gray-500 font-medium mt-1">Final executive authority for operations, registrations, and allocations.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-px">
        <button 
          onClick={() => setActiveTab('registrations')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'registrations' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Customer Registrations ({pendingCustomers.length})
        </button>
        <button 
          onClick={() => setActiveTab('allocations')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'allocations' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Plot Allocations ({pendingAllocations.length})
        </button>
      </div>

      {/* Registrations List */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          {pendingCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-sm">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-bold">No pending registrations requiring approval.</p>
            </div>
          ) : (
            pendingCustomers.map(cust => (
              <div key={cust.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{cust.fullName}</h3>
                    <p className="text-xs text-gray-500 font-mono font-bold mb-2">{cust.ref}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> Submitted: {new Date(cust.createdAt!).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-600"/> By: {cust.submittedByDirector}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                  <button onClick={() => handleApproveRegistration(cust.id)} className="flex-1 md:flex-none btn-primary py-2.5 px-6 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => toast.error('Reject flow coming soon')} className="flex-1 md:flex-none py-2.5 px-6 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors border border-red-100">
                    <XIcon className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Allocations List */}
      {activeTab === 'allocations' && (
        <div className="space-y-4">
          {pendingAllocations.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-sm">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-bold">No pending allocations requiring approval.</p>
            </div>
          ) : (
            pendingAllocations.map(alloc => (
              <div key={alloc.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                    <MapPin className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Project: {alloc.projectId}</h3>
                    <p className="text-xs text-gray-500 font-mono font-bold mb-2">Block {alloc.blockNumber} / Plot {alloc.plotNumber}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-600"/> By: {alloc.submittedByDirector}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                  <button onClick={() => handleApproveAllocation(alloc.id)} className="flex-1 md:flex-none btn-primary py-2.5 px-6 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => toast.error('Reject flow coming soon')} className="flex-1 md:flex-none py-2.5 px-6 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors border border-red-100">
                    <XIcon className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
