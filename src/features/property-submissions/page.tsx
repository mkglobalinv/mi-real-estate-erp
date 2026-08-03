"use client";

import React, { useEffect, useState } from 'react';
import { PlusCircle, Filter, Home, User, Settings, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { createClient } from '@/utils/supabase/client';
import { PropertySubmission } from '@/lib/types';

const supabase = createClient();

export default function AdminSubmissionsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [submissions, setSubmissions] = useState<PropertySubmission[]>([]);

  const fetchSubmissions = () => {
    api.getSubmissions().then(setSubmissions);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    api.updateSubmissionStatus(id, newStatus as any).then(fetchSubmissions);
    api.logActivity({ module: 'Submissions', action: `Updated Property Submission status to ${newStatus}`, user: 'System' });
  };

  const handleAssign = (id: string, staffName: string) => {
    api.updateSubmissionStatus(id, submissions.find(s => s.id === id)?.status || 'Pending Review').then(fetchSubmissions);
    supabase.from('property_submissions').update({ assigned_to: staffName }).eq('id', id).then(() => fetchSubmissions());
    api.logActivity({ module: 'Submissions', action: `Assigned Submission review to ${staffName}`, user: 'System' });
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Property Submissions</h1>
          <p className="text-gray-500 font-medium mt-1">Review properties submitted by external owners.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2 font-bold shadow-sm">
          <Filter className="w-4 h-4" /> Filter Submissions
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Pending Review</p>
            <p className="text-2xl font-extrabold text-orange-600 mt-1">
              {submissions.filter(s => s.status === 'Pending Review').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <Filter className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Approved</p>
            <p className="text-2xl font-extrabold text-green-600 mt-1">
              {submissions.filter(s => s.status === 'Approved').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <Home className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Rejected</p>
            <p className="text-2xl font-extrabold text-red-600 mt-1">
              {submissions.filter(s => s.status === 'Rejected').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <Settings className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Owner Info</th>
                <th className="p-4">Property Details</th>
                <th className="p-4">Documents & Notes</th>
                <th className="p-4">Review Status</th>
                <th className="p-4">Reviewer Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900 flex items-center gap-2"><User className="w-3 h-3 text-gray-400"/> {submission.name}</p>
                    <p className="text-xs text-gray-600 mt-1">ðŸ“ž {submission.phone}</p>
                    {submission.email && <p className="text-xs text-gray-600">âœ‰ï¸ {submission.email}</p>}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[var(--color-primary)] text-sm flex items-center gap-1.5">
                      <Home className="w-4 h-4" /> {submission.purpose} - {submission.type}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{submission.location}</p>
                    {submission.budget && <p className="text-xs font-bold text-gray-700 mt-1">Asking: {submission.budget}</p>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-xs text-gray-600 max-w-[200px] line-clamp-3">{submission.description || 'No additional notes provided.'}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={submission.status}
                      onChange={(e) => handleStatusChange(submission.id, e.target.value)}
                      className={`text-xs font-bold rounded-md px-2 py-1.5 outline-none border cursor-pointer w-full
                        ${submission.status === 'Pending Review' ? 'bg-orange-50 text-orange-700 border-orange-100' : ''}
                        ${submission.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' : ''}
                        ${submission.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                      `}
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <select 
                        value={submission.assignedTo || ''}
                        onChange={(e) => handleAssign(submission.id, e.target.value)}
                        className="text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer border-b border-gray-200 pb-0.5"
                      >
                        <option value="">Unassigned</option>
                        <option value="Admin Engineer">Admin Engineer</option>
                        <option value="Sales Director">Sales Director</option>
                        <option value="Secretary">Secretary</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No property submissions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
