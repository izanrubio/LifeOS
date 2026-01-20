import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Permitir acceso a rutas de autenticación
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Permitir acceso a la raíz (redirige a /today)
  if (pathname === '/') {
    return NextResponse.next()
  }

  // El resto de la verificación se hace client-side en cada página
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
