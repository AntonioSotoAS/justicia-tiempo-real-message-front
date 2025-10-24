'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from '@/components/login-form';
import { GalleryVerticalEnd } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Si está autenticado, no mostrar nada (se redirigirá)
  if (isAuthenticated) {
    return null;
  }

  // Mostrar formulario de login si no está autenticado
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Justicia Tiempo Real
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 relative hidden lg:block">
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <img 
              src="/logo-derecha.png" 
              alt="Logo Sistema de Justicia" 
              className="mx-auto max-w-lg w-full h-auto"
              style={{ maxHeight: '70vh' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
