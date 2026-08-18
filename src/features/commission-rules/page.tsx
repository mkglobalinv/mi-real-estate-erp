"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CommissionRule } from '@/lib/types';
import { Banknote, Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyRule: Partial<CommissionRule> = { isActive: true };

export default function CommissionRulesManager({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<CommissionRule>>(emptyRule);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await api.getCommissionRules();
    setRules(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current.label || !current.commissionAmount) return;
    setSaving(true);
    try {
      await api.saveCommissionRule(current);
      setIsEditing(false);
      setCurrent(emptyRule);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (rule: CommissionRule) => {
    await api.saveCommissionRule({ ...rule, isActive: !rule.isActive });
    loadData();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Banknote className="w-6 h-6 text-[var(--color-primary)]" /> Commission Rules
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configure the commission amount for each plot size. Secretary picks from these active rules when confirming eligibility.</p>
        </div>
        <button onClick={() => { setIsEditing(true); setCurrent(emptyRule); }} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold mb-4">{current.id ? 'Edit Rule' : 'Create Rule'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Label *</label>
              <input required type="text" value={current.label || ''} onChange={e => setCurrent({ ...current, label: e.target.value })} placeholder="e.g. 40x40" className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Property Value (₦)</label>
                <input type="number" value={current.referencePropertyValue ?? ''} onChange={e => setCurrent({ ...current, referencePropertyValue: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Initial Deposit (₦)</label>
                <input type="number" value={current.referenceInitialDeposit ?? ''} onChange={e => setCurrent({ ...current, referenceInitialDeposit: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Commission (₦) *</label>
                <input required type="number" value={current.commissionAmount ?? ''} onChange={e => setCurrent({ ...current, commissionAmount: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="rule-active" checked={current.isActive ?? true} onChange={e => setCurrent({ ...current, isActive: e.target.checked })} className="w-5 h-5 accent-[var(--color-primary)]" />
              <label htmlFor="rule-active" className="font-bold text-gray-700">Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-gray-600 text-sm">Label</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Property Value</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Initial Deposit</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Commission</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rules.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-900">{r.label}</td>
                <td className="p-4 text-gray-600">{r.referencePropertyValue ? `₦${r.referencePropertyValue.toLocaleString()}` : '—'}</td>
                <td className="p-4 text-gray-600">{r.referenceInitialDeposit ? `₦${r.referenceInitialDeposit.toLocaleString()}` : '—'}</td>
                <td className="p-4 font-extrabold text-[var(--color-primary)]">₦{r.commissionAmount.toLocaleString()}</td>
                <td className="p-4">
                  <button onClick={() => toggleActive(r)} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {r.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {r.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4">
                  <button onClick={() => { setCurrent(r); setIsEditing(true); }} className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-green-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rules.length === 0 && (
          <div className="text-center py-12 text-gray-500">No commission rules configured yet.</div>
        )}
      </div>
    </div>
  );
}
