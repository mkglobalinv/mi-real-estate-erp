"use client";

import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export function SubmitButton() {
  const { pending } = useFormStatus();

  useEffect(() => {
    if (pending) {
      toast.loading('Signing in...', { id: 'login-toast' });
    } else {
      toast.dismiss('login-toast');
    }
    // On successful login the server action redirects immediately, which
    // unmounts this component before `pending` ever transitions back to
    // false - so the dismiss above never runs, and the toast (a global
    // singleton that survives navigation) stays stuck on screen on every
    // page afterward. Dismissing on unmount covers that case too.
    return () => toast.dismiss('login-toast');
  }, [pending]);

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  );
}
