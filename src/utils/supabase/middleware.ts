import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public paths that do not require authentication
  const isPublicPath = pathname === '/login' || 
                       pathname.startsWith('/api/') || 
                       pathname.startsWith('/_next') || 
                       pathname === '/' || 
                       pathname.startsWith('/properties') ||
                       pathname === '/contact' ||
                       pathname === '/about' ||
                       pathname === '/projects' ||
                       pathname === '/become-an-agent' ||
                       pathname === '/favicon.ico'

  if (!user && !isPublicPath) {
    // If no user and trying to access a protected route, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Basic Role-Based Routing Guard
  if (user && !isPublicPath && pathname !== '/login' && pathname !== '/unauthorized') {
    // We fetch user's role from public.profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    const roleRoutes: Record<string, string> = {
      'Chairman': '/chairman',
      'Director': '/director',
      'Secretary': '/secretary',
      'Customer Care': '/customer-care',
      'Social Media Director': '/social-media-director',
      'Admin Engineer': '/admin-engineer',
      'Super Admin': '/admin',
      'Customer': '/portal'
    }

    const isStaffRoute = ['/admin', '/chairman', '/director', '/secretary', '/customer-care', '/social-media-director', '/admin-engineer'].some(p => pathname.startsWith(p))

    if (!role && isStaffRoute) {
      // If user has no role and tries to access staff portals, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (role) {
      const allowedRolesForAdmin = ['Super Admin']
      
      const portalPath = roleRoutes[role]
      
      // If user is trying to access a root portal that is not their own, immediately redirect to their own portal
      
      if (pathname.startsWith('/admin') && role !== 'Super Admin') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/chairman') && role !== 'Chairman') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/director') && role !== 'Director') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/secretary') && role !== 'Secretary') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/customer-care') && role !== 'Customer Care') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/social-media-director') && role !== 'Social Media Director') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/admin-engineer') && role !== 'Admin Engineer') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      // Customer trying to access any staff area
      if (role === 'Customer' && isStaffRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/portal'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
