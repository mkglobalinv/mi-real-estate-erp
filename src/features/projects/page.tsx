"use client";

import React, { useEffect, useState } from 'react';
import { FolderGit2, PlusCircle, Edit2, Play, Pause, MapPin, X, Archive, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { Project, Location } from '@/lib/types';
import { toast } from 'react-hot-toast';

interface ProjectFormState {
  name: string;
  description: string;
  locationId: string;
  coverImage: string;
  availableUnits: string;
  startingPrice: string;
  easyBuyStatus: boolean;
  active: boolean;
}

const emptyForm: ProjectFormState = {
  name: '',
  description: '',
  locationId: '',
  coverImage: '',
  availableUnits: '',
  startingPrice: '',
  easyBuyStatus: true,
  active: true,
};

export default function AdminProjectsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState<'current' | 'archived'>('current');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const [projData, locData] = await Promise.all([api.getProjects(), api.getLocations()]);
      setProjects(projData);
      setLocations(locData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openNewForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      locationId: project.locationId || '',
      coverImage: project.coverImage || '',
      availableUnits: project.availableUnits !== undefined ? String(project.availableUnits) : '',
      startingPrice: project.startingPrice !== undefined ? String(project.startingPrice) : '',
      easyBuyStatus: !!project.easyBuyStatus,
      active: !!project.active,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    const units = Number(formData.availableUnits);
    if (formData.availableUnits.trim() === '' || Number.isNaN(units) || units < 0 || !Number.isInteger(units)) {
      toast.error('Available units must be a whole, non-negative number');
      return;
    }
    const price = Number(formData.startingPrice);
    if (formData.startingPrice.trim() === '' || Number.isNaN(price) || price < 0) {
      toast.error('Starting price must be a valid, non-negative number');
      return;
    }

    setSaving(true);
    try {
      await api.saveProject({
        ...(editingId ? { id: editingId } : {}),
        name: formData.name.trim(),
        description: formData.description.trim(),
        locationId: formData.locationId,
        coverImage: formData.coverImage.trim(),
        availableUnits: units,
        startingPrice: price,
        easyBuyStatus: formData.easyBuyStatus,
        active: formData.active,
      });
      await api.logActivity({ module: 'Projects', action: `${editingId ? 'Updated' : 'Created'} project "${formData.name.trim()}"`, user: 'System' });
      toast.success(`Project ${editingId ? 'updated' : 'created'} successfully`);
      closeForm();
      fetchProjects();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, active: boolean) => {
    try {
      await api.updateProjectStatus(id, !active);
      await api.logActivity({ module: 'Projects', action: `Toggled status for project`, user: 'System' });
      fetchProjects();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update project status');
    }
  };

  const toggleArchive = async (project: Project) => {
    const archiving = !project.archived;
    if (archiving && !confirm(`Archive "${project.name}"? It will be hidden from the public site and campaign/project selectors, but existing campaigns and allocations that reference it will keep working.`)) {
      return;
    }
    try {
      await api.updateProjectArchiveStatus(project.id, archiving);
      await api.logActivity({ module: 'Projects', action: `${archiving ? 'Archived' : 'Restored'} project "${project.name}"`, user: 'System' });
      toast.success(`Project ${archiving ? 'archived' : 'restored'}`);
      fetchProjects();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update archive status');
    }
  };

  const visibleProjects = projects.filter(p => viewFilter === 'archived' ? p.archived : !p.archived);

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Master Projects</h1>
          <p className="text-gray-500 font-medium mt-1">Manage estates, development phases, and Easy Buy projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewFilter('current')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewFilter === 'current' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Active &amp; Paused
            </button>
            <button
              onClick={() => setViewFilter('archived')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewFilter === 'archived' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Archived
            </button>
          </div>
          <button onClick={openNewForm} className="btn-primary flex items-center gap-2 text-sm px-4 py-2 font-bold shadow-sm">
            <PlusCircle className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="h-40 bg-gray-200 relative overflow-hidden">
              <img
                src={project.coverImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80'}
                alt={project.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm backdrop-blur-md ${project.archived ? 'bg-gray-700/90 text-white' : project.active ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                  {project.archived ? 'Archived' : project.active ? 'Active' : 'Paused'}
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
                  <p className="text-sm font-bold text-gray-900">₦{project.startingPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Available Units</p>
                  <p className="text-sm font-bold text-gray-900">{project.availableUnits} Plots</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                {!project.archived && (
                  <button
                    onClick={() => toggleStatus(project.id, project.active)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${project.active ? 'bg-orange-50 text-orange-700 hover:bg-orange-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                  >
                    {project.active ? <><Pause className="w-4 h-4" /> Pause Sales</> : <><Play className="w-4 h-4" /> Resume Sales</>}
                  </button>
                )}
                <button
                  onClick={() => openEditForm(project)}
                  className="flex items-center justify-center p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Edit Project"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleArchive(project)}
                  className={`flex items-center justify-center p-2 rounded-lg transition-colors ${project.archived ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                  title={project.archived ? 'Restore Project' : 'Archive Project'}
                >
                  {project.archived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && visibleProjects.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100">
            <FolderGit2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">{viewFilter === 'archived' ? 'No Archived Projects' : 'No Projects Found'}</h3>
            <p className="text-gray-500">{viewFilter === 'archived' ? 'Projects you archive will appear here.' : 'Create your first master project to begin organizing listings.'}</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">{editingId ? 'Edit Project' : 'New Project'}</h2>
                <p className="text-sm text-gray-500">{editingId ? 'Update this estate project.' : 'Add a new master estate project.'}</p>
              </div>
              <button onClick={closeForm} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="projectForm" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Project Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Yarimawa Estate Phase 2"
                    className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the project..."
                    className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <select
                    className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={formData.locationId}
                    onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                  >
                    <option value="">Select a location...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={formData.coverImage}
                    onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Available Units *</label>
                    <input
                      required
                      type="number"
                      min={0}
                      step={1}
                      placeholder="e.g. 50"
                      className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                      value={formData.availableUnits}
                      onChange={e => setFormData({ ...formData, availableUnits: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Starting Price (₦) *</label>
                    <input
                      required
                      type="number"
                      min={0}
                      step="any"
                      placeholder="e.g. 3500000"
                      className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                      value={formData.startingPrice}
                      onChange={e => setFormData({ ...formData, startingPrice: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Easy Buy Enabled</p>
                    <p className="text-xs text-gray-500">Allow installment-based purchase for this project.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[var(--color-primary)]"
                    checked={formData.easyBuyStatus}
                    onChange={e => setFormData({ ...formData, easyBuyStatus: e.target.checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Active (Open for Sales)</p>
                    <p className="text-xs text-gray-500">Paused projects are hidden from the public website.</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[var(--color-primary)]"
                    checked={formData.active}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white">
              <button form="projectForm" type="submit" disabled={saving} className="w-full btn-primary py-4 text-base shadow-lg shadow-green-200 disabled:opacity-60">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
