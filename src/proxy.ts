import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Rotas públicas (sem login necessário)
const publicRoutes = ['/login', '/setup', '/orcamento'];

// Rotas exclusivas de Admin
const adminOnlyRoutes = ['/dashboard', '/configuracoes'];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Permitir rotas de detalhes de orçamento público (ex: /orcamento/abc123)
  if (path.startsWith('/orcamento/')) {
    return NextResponse.next();
  }

  // Checar se é rota pública
  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route));

  const sessionCookie = request.cookies.get('session')?.value;
  const session = await decrypt(sessionCookie);

  // Sem sessão e rota protegida → vai para login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Já logado tentando acessar login/setup → vai para home
  if (session && (path === '/login' || path === '/setup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Operador tentando acessar área de Admin → volta para home
  if (session && session.role !== 'admin') {
    const isAdminRoute = adminOnlyRoutes.some(route => path.startsWith(route));
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
