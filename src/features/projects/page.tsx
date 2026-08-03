"use client";

import React, { useEffect, useState } from 'react';
import { FolderGit2, PlusCircle, Edit2, Play, Pause, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { Project } from '@/lib/types';

export default function AdminProjectsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = () => {
    api.getProjects().then(setProjects);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const toggleStatus = (id: string, active: boolean) => {
    api.updateProjectStatus(id, !active).then(fetchProjects);
    api.logActivity({ module: 'Projects', action: `Toggled status for project`, user: 'System' });
  };

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Master Projects</h1>
          <p className="text-gray-500 font-medium mt-1">Manage estates, development phases, and Easy Buy projects.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2 font-bold shadow-sm">
          <PlusCircle className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="h-40 bg-gray-200 relative overflow-hidden">
              <img 
                src={project.coverImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'} 
                alt={project.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm backdrop-blur-md ${project.active ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                  {project.active ? 'Active' : 'Paused'}
                </span>
                {project.easyBuyStatus && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm backdrop-blur-md bg-[var(--color-gold)]/90 text-[var(--color-primary)]">
                    Easy Buy Enabled
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{project.name}</h3>
              
              <div className="flex items-center gap-1.5 mt-2 mb-4 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{project.location || 'Kano State'}</span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-5">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Starting Price</p>
                  <p className="text-sm font-bold text-gray-900">â‚¦{project.startingPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Available Units</p>
                  <p className="text-sm font-bold text-gray-900">{project.availableUnits} Plots</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => toggleStatus(project.id, project.active)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${project.active ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                >
                  {project.active ? <><Pause className="w-4 h-4" /> Pause Sales</> : <><Play className="w-4 h-4" /> Resume Sales</>}
                </button>
                <button className="flex items-center justify-center p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100">
            <FolderGit2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-500">Create your first master project to begin organizing listings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
