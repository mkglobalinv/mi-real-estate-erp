'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/login?message=Could not authenticate user')
  }

  // Get user role
  const { data: userData } = await supabase.auth.getUser()
  if (userData.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()

    const role = profile?.role


    if (role) {
      if (role === 'Chairman') return redirect('/chairman')
      if (role === 'Director') return redirect('/director')
      if (role === 'Secretary') return redirect('/secretary')
      if (role === 'Customer Care') return redirect('/customer-care')
      if (role === 'Social Media Director') return redirect('/social-media-director')
      if (role === 'Admin Engineer') return redirect('/admin-engineer')
      if (role === 'Super Admin') return redirect('/admin')
      if (role === 'Customer') return redirect('/portal')
      if (role === 'Agent') return redirect('/agent')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Role not found or unassigned')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return redirect('/login?message=Could not sign up user')
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check email to continue sign in process')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
