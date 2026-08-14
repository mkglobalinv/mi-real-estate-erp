"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  Users,
  Calendar,
  FolderGit2,
  FileText,
  Menu,
  X,
  Bell,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import GlobalSearch from '@/components/admin/GlobalSearch';
import { RoleProvider, useRole } from '@/components/providers/RoleProvider';
import LogoutButton from '@/components/LogoutButton';
import UserMenu from '@/components/UserMenu';

// ─── Nav definition ───────────────────────────────────────────────────────────
// Director is scoped to: Dashboard, Application Inbox, Customers, Projects, Inspections.
// All other links (leads, tickets, campaigns, announcements, reservations, payments,
// approvals, property-submissions, logs, tasks, settings) belong to other roles and
// are intentionally excluded here.

const NAV_SECTIONS = [
  {
    label: 'Dashboard',
    color: 'text-gray-500',
    items: [
      { label: 'Overview Dashboard', href: '/director', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Applications',
    color: 'text-[var(--color-primary)]',
    items: [
      { label: 'Application Inbox', href: '/director/applications', icon: FileText, exact: false },
    ],
  },
  {
    label: 'Customers',
    color: 'text-gray-500',
    items: [
      { label: 'Customer Records', href: '/director/customers', icon: Users, exact: false },
    ],
  },
  {
    label: 'Properties',
    color: 'text-gray-500',
    items: [
      { label: 'Estate Projects', href: '/director/projects', icon: FolderGit2, exact: false },
      { label: 'Inspection Records', href: '/director/inspections', icon: Calendar, exact: false },
    ],
  },
];

// ─── Inner layout ─────────────────────────────────────────────────────────────

function DirectorLayoutContent({ children }: { children: React.ReactNode }) {
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
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500 font-medium tracking-widest uppercase">Loading Portal...</p>
        </div>
      </div>
    );
  }

  // Active helpers — use startsWith for sub-routes, exact match for the root dashboard
  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const linkClass = (href: string, exact: boolean) =>
    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all group ${
      isActive(href, exact)
        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const iconClass = (href: string, exact: boolean) =>
    `flex-shrink-0 mr-3 w-5 h-5 transition-colors ${
      isActive(href, exact)
        ? 'text-[var(--color-primary)]'
        : 'text-gray-400 group-hover:text-[var(--color-primary)]'
    }`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">

      {/* Mobile overlay */}
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
        {/* Branding */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <Link href="/director" className="flex items-center gap-3 group" onClick={closeMenu}>
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

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="space-y-1.5 px-3">
            {NAV_SECTIONS.map((section) => (
              <React.Fragment key={section.label}>
                <div className="pt-6 pb-1 px-4 first:pt-2">
                  <p className={`text-[11px] font-bold uppercase tracking-widest ${section.color}`}>
                    {section.label}
                  </p>
                </div>
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={linkClass(item.href, item.exact)}
                  >
                    <item.icon className={iconClass(item.href, item.exact)} />
                    {item.label}
                  </Link>
                ))}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 flex items-center">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold mr-3 shadow-md border border-green-700">
            {userName ? userName.charAt(0).toUpperCase() : 'D'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white leading-tight">{userName || 'Loading...'}</p>
            <p className="text-[11px] text-[var(--color-primary)] font-medium uppercase tracking-wider">{role}</p>
          </div>
          <div className="ml-2">
            <LogoutButton className="text-gray-400 hover:text-red-400 bg-gray-800 p-2 rounded-lg hover:bg-gray-700" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Header */}
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
            {/* CTA — Application Inbox */}
            <Link href="/director/applications">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-full hover:bg-green-700 transition-colors shadow-sm">
                <PlusCircle className="w-4 h-4" /> Application Inbox
              </button>
            </Link>

            <button className="relative p-2 text-gray-500 hover:text-[var(--color-primary)] hover:bg-green-50 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1" />
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

// ─── Root export ──────────────────────────────────────────────────────────────

export default function DirectorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleProvider>
      <DirectorLayoutContent>{children}</DirectorLayoutContent>
    </RoleProvider>
  );
}
