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
                       pathname.startsWith('/r/') ||
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
      'Finance': '/finance',
      'Super Admin': '/admin',
      'Customer': '/portal',
      'Agent': '/agent'
    }

    const isStaffRoute = ['/admin', '/chairman', '/director', '/secretary', '/customer-care', '/social-media-director', '/admin-engineer', '/finance', '/archive'].some(p => pathname.startsWith(p))

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
      
      if ((pathname === '/admin' || pathname.startsWith('/admin/')) && role !== 'Super Admin') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/chairman') && role !== 'Chairman') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      // Chairman additionally gets read/act access into the 7 staff
      // portals below (Director through Agent) for direct oversight from
      // the Executive Dashboard's Portal Access links — same pattern
      // already used for /archive further down. Does NOT extend to the
      // Super Admin console (/admin) or the Customer self-service portal
      // (/portal), which stay unchanged.
      if (pathname.startsWith('/director') && role !== 'Director' && role !== 'Chairman') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/secretary') && role !== 'Secretary' && role !== 'Chairman') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/customer-care') && role !== 'Customer Care' && role !== 'Chairman') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/social-media-director') && role !== 'Social Media Director' && role !== 'Chairman') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/admin-engineer') && role !== 'Admin Engineer' && role !== 'Chairman') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/finance') && role !== 'Finance' && role !== 'Chairman') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/archive') && role !== 'Super Admin' && role !== 'Chairman') {
        const url = request.nextUrl.clone()
        url.pathname = portalPath || '/portal'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/agent') && role !== 'Agent' && role !== 'Chairman') {
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

      // Agent trying to access any staff area
      if (role === 'Agent' && isStaffRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/agent'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
