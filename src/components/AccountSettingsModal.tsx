"use client";

import React, { useEffect, useState } from 'react';
import { X, Mail, Lock, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

// Self-service email/password change for any signed-in account (Chairman,
// Director, Secretary, and everyone else — UserMenu, which opens this, is
// shared across every portal). Both actions re-verify the current password
// first via signInWithPassword, so a session left open on an unlocked
// device can't be used to silently take over the login.
// Rendered by UserMenu only while open, so every open is a fresh mount —
// state starts clean with no reset-on-open effect needed (same pattern as
// LeadQualificationModal).
export default function AccountSettingsModal({ onClose }: { onClose: () => void }) {
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentEmail(data.user?.email || '');
    });
  }, []);

  const reauthenticate = async () => {
    if (!currentPassword) {
      toast.error('Enter your current password first');
      return false;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: currentEmail, password: currentPassword });
    if (error) {
      toast.error('Current password is incorrect');
      return false;
    }
    return true;
  };

  const handleEmailSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail.trim() === currentEmail) return;
    setEmailSaving(true);
    try {
      if (!(await reauthenticate())) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw new Error(error.message);
      // Keep the profile's own email field in step with what the account
      // holder now expects to see — the actual login credential only
      // switches once they click the confirmation link Supabase just sent.
      if (user) {
        await supabase.from('profiles').update({ email: newEmail.trim() }).eq('id', user.id);
      }
      toast.success(`Confirmation link sent to ${newEmail.trim()}. Click it to finish the change.`);
      setNewEmail('');
      setCurrentPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      if (!(await reauthenticate())) return;
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      toast.success('Password updated');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Account Settings</h2>
          <button onClick={onClose} className="p-2 -m-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <label className="block text-xs font-bold text-amber-800 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Required to confirm either change below"
                className="w-full px-3 py-2 rounded-lg border border-amber-200 outline-none focus:ring-2 focus:ring-amber-400 text-sm bg-white"
              />
            </div>
          </div>

          <form onSubmit={handleEmailSave} className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Mail className="w-4 h-4 text-[var(--color-primary)]" /> Change Email</h3>
            <p className="text-xs text-gray-500">Current: <span className="font-medium text-gray-700">{currentEmail || '—'}</span></p>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="new.email@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
            />
            <button
              type="submit"
              disabled={emailSaving || !newEmail.trim()}
              className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {emailSaving ? 'Sending confirmation...' : 'Update Email'}
            </button>
          </form>

          <form onSubmit={handlePasswordSave} className="space-y-3 pt-2 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 pt-3"><Lock className="w-4 h-4 text-[var(--color-primary)]" /> Change Password</h3>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min. 8 characters)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
            />
            <button
              type="submit"
              disabled={passwordSaving || !newPassword || !confirmPassword}
              className="w-full py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
