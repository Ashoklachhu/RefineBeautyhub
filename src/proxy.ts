import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/profile', '/bookings', '/dashboard']

// Routes that require admin role
const ADMIN_ROUTES = ['/admin']

// Routes only for unauthenticated users (redirect logged-in users away)
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

// ── "Coming Soon" mode ─────────────────────────────────────────
// Set COMING_SOON_MODE=true in env to hide the public site behind a
// simple coming-soon page while keeping admin/auth routes accessible
// for continued work. Toggle off (or remove) the env var to go live.
const COMING_SOON_ALLOWED_PREFIXES = [
  '/coming-soon',
  '/admin',
  '/login',
  '/register',
  '/forgot-password',
  '/api',
]

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (process.env.COMING_SOON_MODE === 'true') {
    const isAllowed = COMING_SOON_ALLOWED_PREFIXES.some((p) => path.startsWith(p))
    if (!isAllowed) {
      const url = request.nextUrl.clone()
      url.pathname = '/coming-soon'
      return NextResponse.rewrite(url)
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — MUST be called to keep session alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Redirect unauthenticated users away from protected routes ─
  const isProtected = PROTECTED_ROUTES.some((r) => path.startsWith(r))
  const isAdmin     = ADMIN_ROUTES.some((r) => path.startsWith(r))

  if ((isProtected || isAdmin) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', path)
    return NextResponse.redirect(url)
  }

  // ── Check admin role for admin routes ─────────────────────────
  // Use service-role client to bypass RLS when reading the user's role
  if (isAdmin && user) {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // ── Redirect authenticated users away from auth pages ─────────
  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r))
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = request.nextUrl.searchParams.get('redirectTo') ?? '/profile'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
