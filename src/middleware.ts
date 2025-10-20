import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard'];
  
  // Rutas públicas (comentado para evitar warning)
  // const publicRoutes = ['/', '/login'];
  
  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar si la ruta actual es pública (comentado para evitar warning)
  // const isPublicRoute = publicRoutes.includes(pathname);
  
  // Obtener token del localStorage (solo en el cliente)
  // En el middleware no podemos acceder al localStorage directamente
  // Por eso usamos cookies o headers
  const token = request.cookies.get('accessToken')?.value;
  
  console.log('🔍 Middleware - Ruta:', pathname, 'Token:', token ? 'Presente' : 'No presente');
  
  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !token) {
    console.log('🚫 Acceso denegado a ruta protegida, redirigiendo al login');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Si está en login y ya tiene token, redirigir al dashboard
  if (pathname === '/' && token) {
    console.log('🔄 Usuario autenticado en /, redirigiendo al dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Si está en login y ya tiene token, redirigir al dashboard
  if (pathname === '/login' && token) {
    console.log('🔄 Usuario autenticado en /login, redirigiendo al dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
