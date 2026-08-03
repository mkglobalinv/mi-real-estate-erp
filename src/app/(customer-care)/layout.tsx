"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, LayoutDashboard, Users, MapPin, PlusCircle, 
  Settings, Activity, Calendar, Wallet, CheckSquare, FolderGit2,
  Menu, X, Bell, ExternalLink, ChevronDown, Shield, KanbanSquare, Megaphone
} from 'lucide-react';
import GlobalSearch from '@/components/admin/GlobalSearch';
import { RoleProvider, useRole } from '@/components/providers/RoleProvider';
import UserMenu from '@/components/UserMenu';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { role, userName, loading } = useRole();

  useEffect(() => {
    if (!loading && !role) {
      window.location.href = '/login';
    }
  }, [loading, role]);

  const closeMenu = () => setMobileMenuOpen(false);

  if (loading || !role) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium tracking-widest uppercase">Loading Portal...</p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all group ${
    isActive(path) 
      ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' 
      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
  }`;

  const iconClass = (path: string) => `flex-shrink-0 mr-3 w-5 h-5 transition-colors ${
    isActive(path) ? 'text-[var(--color-primary)]' : 'text-gray-400 group-hover:text-[var(--color-primary)]'
  }`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[280px] lg:w-[300px] bg-gray-950 text-white flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <Link href="/admin" className="flex items-center gap-3 group" onClick={closeMenu}>
            <div className="bg-[var(--color-primary)] p-2 rounded-xl shadow-lg border border-[var(--color-primary-dark)]">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide block leading-tight text-white uppercase">M.I. Real Estate</span>
              <span className="text-[10px] text-[var(--color-primary)] font-bold tracking-widest uppercase">{role || 'Loading...'}</span>
            </div>
          </Link>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={closeMenu}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="space-y-1.5 px-3">
            
            {/* DASHBOARD */}
            <div className="pt-2 pb-1 px-4">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Dashboard</p>
            </div>
            <Link href="/admin" onClick={closeMenu} className={linkClass('/admin')}>
              <LayoutDashboard className={iconClass('/admin')} />
              Overview Dashboard
            </Link>
            
            {/* CRM & SALES - Social Media Director & Customer Care */}
            {(role === 'Social Media Director' || role === 'Customer Care' || role === 'Super Admin') && (
              <>
                <div className="pt-6 pb-1 px-4">
                  <p className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Leads & CRM</p>
                </div>
                <Link href="/customer-care/leads" onClick={closeMenu} className={linkClass('/admin/leads')}>
                  <Users className={iconClass('/admin/leads')} />
                  Leads Pipeline
                </Link>
              </>
            )}

            {/* CUSTOMER CARE EXCLUSIVES */}
            {(role === 'Customer Care' || role === 'Super Admin') && (
              <>
                <Link href="/customer-care/tickets" onClick={closeMenu} className={linkClass('/admin/tickets')}>
                  <CheckSquare className={iconClass('/admin/tickets')} />
                  Support Tickets
                </Link>
                <Link href="/customer-care/inspections" onClick={closeMenu} className={linkClass('/admin/inspections')}>
                  <Calendar className={iconClass('/admin/inspections')} />
                  Inspections
                </Link>
              </>
            )}

            {/* MARKETING - Social Media Director Exclusives */}
            {(role === 'Social Media Director' || role === 'Super Admin') && (
              <>
                <div className="pt-6 pb-1 px-4">
                  <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">Marketing</p>
                </div>
                <Link href="/customer-care/campaigns" onClick={closeMenu} className={linkClass('/admin/campaigns')}>
                  <Megaphone className={iconClass('/admin/campaigns')} />
                  Campaign Manager
                </Link>
                <Link href="/customer-care/announcements" onClick={closeMenu} className={linkClass('/admin/operations/announcements')}>
                  <Megaphone className={iconClass('/admin/operations/announcements')} />
                  Announcements
                </Link>
              </>
            )}

            {/* SECRETARY EXCLUSIVES */}
            {(role === 'Secretary' || role === 'Chairman' || role === 'Super Admin') && (
              <>
                <div className="pt-6 pb-1 px-4">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Finance & Admin</p>
                </div>
                {(role === 'Secretary' || role === 'Super Admin') && (
                  <Link href="/customer-care/reservations" onClick={closeMenu} className={linkClass('/admin/reservations')}>
                    <Wallet className={iconClass('/admin/reservations')} />
                    Reservations
                  </Link>
                )}
                <Link href="/customer-care/payments" onClick={closeMenu} className={linkClass('/admin/payments')}>
                  <Wallet className={iconClass('/admin/payments')} />
                  Payments & Ledger
                </Link>
                {(role === 'Chairman' || role === 'Super Admin') && (
                  <Link href="/customer-care/approvals" onClick={closeMenu} className={linkClass('/admin/approvals')}>
                    <CheckSquare className={iconClass('/admin/approvals')} />
                    Approvals
                  </Link>
                )}
              </>
            )}

            {/* DIRECTOR EXCLUSIVES */}
            {(role === 'Director' || role === 'Chairman' || role === 'Super Admin') && (
              <>
                <div className="pt-6 pb-1 px-4">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Executive CRM</p>
                </div>
                <Link href="/customer-care/customers" onClick={closeMenu} className={linkClass('/admin/customers')}>
                  <Users className={iconClass('/admin/customers')} />
                  Customers & Allocations
                </Link>
              </>
            )}
            
            {/* PROPERTIES & SYSTEM - Admin Engineer Exclusives */}
            {(role === 'Admin Engineer' || role === 'Super Admin' || role === 'Director' || role === 'Chairman') && (
              <>
                <div className="pt-6 pb-1 px-4">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Web Properties</p>
                </div>
                <Link href="/customer-care/projects" onClick={closeMenu} className={linkClass('/admin/projects')}>
                  <FolderGit2 className={iconClass('/admin/projects')} />
                  Estate Projects
                </Link>
                {(role === 'Admin Engineer' || role === 'Super Admin') && (
                  <>
                    <Link href="/customer-care/listings" onClick={closeMenu} className={linkClass('/admin/listings')}>
                      <MapPin className={iconClass('/admin/listings')} />
                      Website Listings
                    </Link>
                    <Link href="/customer-care/property-submissions" onClick={closeMenu} className={linkClass('/admin/property-submissions')}>
                      <PlusCircle className={iconClass('/admin/property-submissions')} />
                      External Submissions
                    </Link>
                  </>
                )}
              </>
            )}
            
            {/* SYSTEM */}
            {(role === 'Admin Engineer' || role === 'Super Admin' || role === 'Chairman') && (
              <>
                <div className="pt-6 pb-1 px-4">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">System</p>
                </div>
                <Link href="/customer-care/logs" onClick={closeMenu} className={linkClass('/admin/logs')}>
                  <Activity className={iconClass('/admin/logs')} />
                  Global Audit Logs
                </Link>
                {(role === 'Admin Engineer' || role === 'Super Admin') && (
                  <>
                    <Link href="/customer-care/tasks" onClick={closeMenu} className={linkClass('/admin/tasks')}>
                      <CheckSquare className={iconClass('/admin/tasks')} />
                      System Tasks
                    </Link>
                    <Link href="/customer-care/settings" onClick={closeMenu} className={linkClass('/admin/settings')}>
                      <Settings className={iconClass('/admin/settings')} />
                      System Settings
                    </Link>
                    <div className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 flex items-center cursor-not-allowed">
                      <Shield className="flex-shrink-0 mr-3 w-5 h-5 opacity-40" /> User Roles Matrix
                    </div>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-800 bg-gray-900 flex items-center">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold mr-3 shadow-md border border-green-700">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white leading-tight">{userName || 'Loading...'}</p>
            <p className="text-[11px] text-[var(--color-primary)] font-medium uppercase tracking-wider">{role}</p>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
          <div className="flex items-center flex-1">
            <button 
              className="md:hidden p-2 -ml-2 mr-2 text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex flex-1 max-w-xl">
              <GlobalSearch />
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/customer-care/leads">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-full hover:bg-green-700 transition-colors shadow-sm">
                <PlusCircle className="w-4 h-4" /> CRM Dashboard
              </button>
            </Link>

            <button className="relative p-2 text-gray-500 hover:text-[var(--color-primary)] hover:bg-green-50 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <Link href="/" target="_blank" className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-[var(--color-primary)] font-medium transition-colors">
              Website <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <UserMenu />
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-gray-50 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </RoleProvider>
  );
}
