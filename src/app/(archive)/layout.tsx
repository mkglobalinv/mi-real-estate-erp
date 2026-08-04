"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, LayoutDashboard, Archive,
  Menu, X, LogoutButton
} from 'lucide-react';
import { RoleProvider, useRole } from '@/components/providers/RoleProvider';
import UserMenu from '@/components/UserMenu';

function ArchiveLayoutContent({ children }: { children: React.ReactNode }) {
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
          <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium tracking-widest uppercase">Loading Portal...</p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all group ${
    isActive(path) 
      ? 'bg-gray-200 text-gray-900' 
      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
  }`;

  const iconClass = (path: string) => `flex-shrink-0 mr-3 w-5 h-5 transition-colors ${
    isActive(path) ? 'text-gray-900' : 'text-gray-400 group-hover:text-white'
  }`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
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
          <Link href="/archive" className="flex items-center gap-3 group" onClick={closeMenu}>
            <div className="bg-gray-700 p-2 rounded-xl shadow-lg border border-gray-600">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide block leading-tight text-white uppercase">M.I. Real Estate</span>
              <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">ARCHIVE</span>
            </div>
          </Link>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={closeMenu}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="space-y-1.5 px-3">
            <div className="pt-2 pb-1 px-4">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Historical Records</p>
            </div>
            <Link href="/archive" onClick={closeMenu} className={linkClass('/archive')}>
              <Archive className={iconClass('/archive')} />
              Completed Workflows
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-800 bg-gray-900 flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold mr-3 shadow-md border border-gray-600">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white leading-tight">{userName || 'Loading...'}</p>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{role}</p>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 hidden sm:block tracking-tight">System Archive (Read Only)</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <UserMenu userName={userName || ''} role={role || ''} />
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-gray-50/50 relative">
          <div className="relative">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <ArchiveLayoutContent>{children}</ArchiveLayoutContent>
    </RoleProvider>
  );
}
