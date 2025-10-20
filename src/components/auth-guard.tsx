'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireRole,
  redirectTo = '/' 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Si requiere autenticación y no está autenticado
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Si requiere un rol específico
    if (requireRole && !hasRole(requireRole)) {
      router.push(redirectTo);
      return;
    }
  }, [isAuthenticated, isLoading, requireAuth, requireRole, hasRole, router, redirectTo]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si requiere autenticación y no está autenticado, no mostrar contenido
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si requiere un rol específico y no lo tiene, no mostrar contenido
  if (requireRole && !hasRole(requireRole)) {
    return null;
  }

  return <>{children}</>;
}
