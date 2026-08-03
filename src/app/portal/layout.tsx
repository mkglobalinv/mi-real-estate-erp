"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import UserMenu from '@/components/UserMenu';
import { RoleProvider, useRole } from '@/components/providers/RoleProvider';
import { 
  Building2, LayoutDashboard, Wallet, FileText, 
  Menu, X, Bell, User, LogOut, ChevronRight
} from 'lucide-react';

function PortalLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { userName } = useRole();

  const closeMenu = () => setMobileMenuOpen(false);
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const linkClass = (path: string) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all group ${
    isActive(path) && path !== '/portal' || (path === '/portal' && pathname === '/portal')
      ? 'bg-[var(--color-primary)] text-white shadow-md' 
      : 'text-gray-600 hover:bg-green-50 hover:text-[var(--color-primary)]'
  }`;

  const iconClass = (path: string) => `flex-shrink-0 mr-3 w-5 h-5 transition-colors ${
    isActive(path) && path !== '/portal' || (path === '/portal' && pathname === '/portal')
      ? 'text-white' : 'text-gray-400 group-hover:text-[var(--color-primary)]'
  }`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] bg-white border-r border-gray-200 text-gray-800 flex flex-col h-full
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <Link href="/" className="flex items-center gap-3 group" onClick={closeMenu}>
            <div className="bg-[var(--color-primary)] p-2 rounded-xl shadow-sm">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wide block leading-tight text-gray-900 uppercase">M.I. Real Estate</span>
              <span className="text-[10px] text-[var(--color-primary)] font-bold tracking-widest uppercase">Customer Portal</span>
            </div>
          </Link>
          <button className="lg:hidden text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-lg" onClick={closeMenu}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar px-4">
          
          {/* Customer Profile Snippet */}
          
<div className="bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-100 flex items-center gap-3">
  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-white shadow-sm shrink-0">
    {userName ? userName.charAt(0).toUpperCase() : 'U'}
  </div>
  <div className="overflow-hidden">
    <p className="text-sm font-bold text-gray-900 truncate">{userName || 'Loading...'}</p>
    <p className="text-[10px] font-bold text-gray-500 truncate font-mono mt-0.5">CUSTOMER</p>
  </div>
</div>


          <nav className="space-y-2">
            <Link href="/portal" onClick={closeMenu} className={linkClass('/portal')}>
              <LayoutDashboard className={iconClass('/portal')} />
              Overview
            </Link>
            <Link href="/portal/payments" onClick={closeMenu} className={linkClass('/portal/payments')}>
              <Wallet className={iconClass('/portal/payments')} />
              My Payments
            </Link>
            <Link href="/portal/documents" onClick={closeMenu} className={linkClass('/portal/documents')}>
              <FileText className={iconClass('/portal/documents')} />
              My Documents
            </Link>
          </nav>
        </div>
        
        
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden p-2 -ml-2 mr-3 text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden sm:flex items-center text-sm font-medium text-gray-500">
              <span className="text-[var(--color-primary)] font-bold">Portal</span>
              <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
              <span className="capitalize">{pathname.split('/').pop() || 'Overview'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="relative p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-green-50 rounded-full transition-colors border border-gray-100 shadow-sm bg-white">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <Link href="/" className="hidden sm:block text-xs font-bold text-gray-500 hover:text-[var(--color-primary)] transition-colors">
              Back to Website
            </Link>
            <div className="ml-2">
              <UserMenu />
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto bg-gray-50 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleProvider>
      <PortalLayoutContent>{children}</PortalLayoutContent>
    </RoleProvider>
  );
}
