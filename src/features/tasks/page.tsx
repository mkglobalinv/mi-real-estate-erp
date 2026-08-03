"use client";

import React, { useEffect, useState } from 'react';
import { CheckSquare, Filter, PlusCircle, UserPlus, Clock, PlayCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Task } from '@/lib/types';

export default function AdminTasksPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = () => {
    api.getTasks().then(setTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    api.updateTaskStatus(id, newStatus as any).then(fetchTasks);
    api.logActivity({ module: 'Tasks', action: `Updated Task status to ${newStatus}`, user: 'System' });
  };

  const handleAssign = (id: string, staffName: string) => {
    api.saveTask({ id, assignedTo: staffName }).then(fetchTasks);
    api.logActivity({ module: 'Tasks', action: `Assigned Task to ${staffName}`, user: 'System' });
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Follow-Up Engine</h1>
          <p className="text-gray-500 font-medium mt-1">Manage operations, assign tasks, and track internal workflows.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2 font-bold shadow-sm">
          <PlusCircle className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Task Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Timeline</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Engineer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{task.title}</p>
                    {task.relatedRecordId && <p className="text-xs text-[var(--color-primary)] font-mono mt-1">Ref: {task.relatedRecordId}</p>}
                    {task.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-[200px]">{task.notes}</p>}
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {task.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-bold text-gray-800 text-xs">Due: {task.dueDate}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Created: {new Date(task.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {task.status === 'Pending' && <Clock className="w-4 h-4 text-orange-500" />}
                      {task.status === 'In Progress' && <PlayCircle className="w-4 h-4 text-blue-500" />}
                      {task.status === 'Completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      <select 
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`text-xs font-bold bg-transparent outline-none cursor-pointer border-b pb-0.5
                          ${task.status === 'Pending' ? 'text-orange-700 border-orange-200' : ''}
                          ${task.status === 'In Progress' ? 'text-blue-700 border-blue-200' : ''}
                          ${task.status === 'Completed' ? 'text-green-700 border-green-200' : ''}
                        `}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-gray-400" />
                      <select 
                        value={task.assignedTo || ''}
                        onChange={(e) => handleAssign(task.id, e.target.value)}
                        className="text-xs font-medium text-gray-700 bg-transparent outline-none cursor-pointer border-b border-gray-200 pb-0.5"
                      >
                        <option value="">Unassigned</option>
                        <option value="Admin Engineer">Admin Engineer</option>
                        <option value="Customer Care">Customer Care</option>
                        <option value="Sales Director">Sales Director</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No tasks currently tracked. Create a new task to begin.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
