import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC = [/^\/sign-in/, /^\/sign-up/, /^\/api\/auth\//, /^\/api\/webhooks\//]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    },
  )

  // IMPORTANTE: getUser() revalida e renova a sessão (grava cookies em `res`)
  const { data: { user } } = await supabase.auth.getUser()

  const isPublic = PUBLIC.some((re) => re.test(path))
  if (!user && !isPublic) {
    if (path.startsWith('/api') || path.startsWith('/trpc')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('redirect_url', path)
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
