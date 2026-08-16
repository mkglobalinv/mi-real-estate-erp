"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, MapPin, Wallet, ArrowRight,
  ShieldCheck, AlertCircle, FileText
} from 'lucide-react';
import Link from 'next/link';

import { createClient } from '@/utils/supabase/client';
import { Customer, Application, Allocation, EasyBuyAccount, Installment, Project } from '@/lib/types';

export default function PortalDashboard() {
  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [account, setAccount] = useState<EasyBuyAccount | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const { data: cust } = await supabase.from('customers').select('*').eq('email', user.email).single();
          if (cust) {
            setCustomer(cust);
            const { data: app } = await supabase.from('applications').select('*').eq('customer_id', cust.id).order('created_at', { ascending: false }).limit(1).single();
            if (app) setApplication(app);

            const { data: alloc } = await supabase.from('allocations').select('*').eq('customer_id', cust.id).order('created_at', { ascending: false }).limit(1).single();
            if (alloc) {
              setAllocation(alloc);
              if (alloc.project_id) {
                const { data: proj } = await supabase.from('projects').select('*, locations(name)').eq('id', alloc.project_id).single();
                if (proj) setProject({ ...proj, location: proj.locations?.name || proj.location });
              }
            }

            const { data: acc } = await supabase.from('easy_buy_accounts').select('*').eq('customer_id', cust.id).order('created_at', { ascending: false }).limit(1).single();
            if (acc) {
              // Convert keys back
              const mappedAcc = {
                id: acc.id,
                totalPropertyPrice: Number(acc.total_amount),
                initialDeposit: Number(acc.initial_deposit),
                amountPaid: Number(acc.amount_paid || acc.initial_deposit), // Assume at least deposit is paid
                outstandingBalance: Number(acc.outstanding_balance),
                monthlyInstallment: Number(acc.monthly_installment)
              } as EasyBuyAccount;
              setAccount(mappedAcc);

              const { data: insts } = await supabase.from('installments').select('*').eq('account_id', acc.id).order('month_number', { ascending: true });
              if (insts) {
                setInstallments(insts.map(i => ({
                  ...i,
                  installmentNumber: i.month_number,
                  dueDate: i.due_date,
                  amountDue: Number(i.amount),
                  status: i.status
                } as Installment)));
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to load portal data', e);
      } finally {
        setMounted(true);
      }
    }
    loadUserData();
  }, []);

  if (!mounted) return null;

  const totalPaid = account ? account.initialDeposit + (installments.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amountDue, 0)) : 0;
  const outstanding = account ? account.totalPropertyPrice - totalPaid : 0;
  const progressPercent = account && account.totalPropertyPrice > 0 ? Math.round((totalPaid / account.totalPropertyPrice) * 100) : 0;

  const isChairmanApproved = customer?.status === 'Active' || customer?.status === 'Chairman Approved';
  const isAllocated = allocation?.status === 'Allocated';
  
  const pendingInstallments = installments.filter(i => i.status !== 'Paid');
  const nextInstallment = pendingInstallments.length > 0 ? pendingInstallments[0] : null;
  const isPaymentUpToDate = !nextInstallment || new Date(nextInstallment.dueDate) >= new Date();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-3xl p-6 md:p-10 shadow-xl text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Welcome back, {customer?.fullName || customer?.full_name || 'Customer'}!</h1>
            <p className="text-green-50 font-medium max-w-lg opacity-90">
              Your Easy Buy investment is progressing smoothly. You are currently on track with your payments.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 text-center min-w-[140px]">
            <p className="text-xs uppercase tracking-wider font-bold opacity-80 mb-1">Completion</p>
            <div className="flex items-end justify-center gap-1">
              <span className="text-4xl font-extrabold">{progressPercent}</span>
              <span className="text-xl font-bold mb-1">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status Center */}
      <h2 className="text-xl font-extrabold text-gray-900 mb-4 px-1">Live Status Center</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Registration Status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${isChairmanApproved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            {isChairmanApproved ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Registration</p>
            <p className="text-lg font-extrabold text-gray-900 mb-1">
              {isChairmanApproved ? 'Active' : application?.status || 'Pending Review'}
            </p>
            <p className="text-xs text-gray-500 font-medium">Your account is {isChairmanApproved ? 'fully active' : 'under review'}.</p>
          </div>
        </div>

        {/* Allocation Status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${isAllocated ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Allocation</p>
            <p className="text-lg font-extrabold text-gray-900 mb-1">
              {allocation?.status || 'Not Allocated'}
            </p>
            <p className="text-xs text-gray-500 font-medium">
              {isAllocated ? `Plot ${allocation?.plot_number}, Block ${allocation?.block_number}` : 'Pending allocation criteria.'}
            </p>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${isPaymentUpToDate ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {isPaymentUpToDate ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Payment Status</p>
            <p className="text-lg font-extrabold text-gray-900 mb-1">
              {isPaymentUpToDate ? 'Up To Date' : 'Overdue'}
            </p>
            <p className="text-xs text-gray-500 font-medium">
              {nextInstallment ? `Next payment due: ${new Date(nextInstallment.dueDate).toLocaleDateString()}` : 'All payments completed'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Financial Summary */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[var(--color-primary)]" />
                Financial Summary
              </h2>
              <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
                Active Installment Plan
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Property Value</p>
                  <p className="text-2xl font-extrabold text-gray-900">₦{account?.totalPropertyPrice.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Total Paid</p>
                  <p className="text-2xl font-extrabold text-green-700">₦{totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Outstanding Balance</p>
                  <p className="text-2xl font-extrabold text-amber-700">₦{outstanding.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-600">Payment Progress</span>
                  <span className="text-[var(--color-primary)]">{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-[var(--color-primary)] h-3 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/portal/payments" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-green-50 group-hover:border-green-100 transition-colors">
                  <Wallet className="w-6 h-6 text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Upload Payment</h3>
                  <p className="text-xs font-medium text-gray-500">Submit your transfer proof</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
            </Link>
            
            <Link href="/portal/documents" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                  <FileText className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">My Statements</h3>
                  <p className="text-xs font-medium text-gray-500">View receipts and ledger</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </Link>
          </div>

        </div>

        {/* Right Column - Property Info & Next Action */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-lg font-extrabold mb-4 relative z-10 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" /> Action Required
            </h3>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 relative z-10">
              <p className="text-xs uppercase tracking-wide font-bold text-amber-400 mb-1">Upcoming Installment</p>
              {nextInstallment ? (
                <>
                  <p className="text-2xl font-extrabold mb-1">₦{nextInstallment.amountDue.toLocaleString()}</p>
                  <p className="text-sm text-gray-300 mb-4">Due on {new Date(nextInstallment.dueDate).toLocaleDateString()}</p>
                  <Link href="/portal/payments" className="block w-full py-2.5 bg-white text-gray-900 text-center rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                    Submit Payment Proof
                  </Link>
                </>
              ) : (
                <p className="text-sm text-gray-300">No pending installments.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-extrabold text-gray-900 mb-4">Property Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Estate Project</p>
                  <p className="font-bold text-gray-900">{project?.name || 'TBD'}</p>
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Property Allocation</p>
                  <p className="font-bold text-gray-900">
                    {allocation?.status === 'Allocated' ? `Plot ${allocation?.plot_number}, Block ${allocation?.block_number}` : 'Pending Allocation'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Location</p>
                  <p className="font-bold text-gray-900">{project?.location || 'TBD'}</p>
                </div>
              </div>
              <div className="flex justify-between items-end pb-1">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Next of Kin</p>
                  <p className="font-bold text-gray-900">{customer?.nok_name || customer?.nextOfKinName || 'N/A'} - {customer?.nok_phone || customer?.nextOfKinPhone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
