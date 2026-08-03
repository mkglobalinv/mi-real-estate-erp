import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/chairman/:path*',
    '/director/:path*',
    '/secretary/:path*',
    '/customer-care/:path*',
    '/social-media-director/:path*',
    '/admin-engineer/:path*',
    '/portal/:path*'
  ],
}
