'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi, LoginDto, RegisterDto, AuthUser } from '@/lib/api';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const router = useRouter();

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authApi.isAuthenticated();
      const user = authApi.getCurrentUser();
      
      setAuthState({
        user: isAuth ? user : null,
        isAuthenticated: isAuth,
        isLoading: false,
      });
    };

    checkAuth();
  }, []);

  // Función de login
  const login = useCallback(async (credentials: LoginDto) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      console.log('🔐 Intentando login con:', credentials);
      const response = await authApi.login(credentials);
      console.log('📡 Respuesta del backend:', response);
      
      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        console.log('✅ Login exitoso, usuario:', response.data.user);
        toast.success(`¡Bienvenido ${response.data.user.name}!`);
        // Redirigir al dashboard
        console.log('🔄 Redirigiendo al dashboard...');
        router.push('/dashboard');
        console.log('✅ Redirección enviada');
        return { success: true, message: 'Login exitoso' };
      } else {
        console.log('❌ Login fallido:', response);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        const errorMessage = response.message || 'Error en el login';
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error: unknown) {
      console.log('🚨 Error en login:', error);
      console.log('🔍 Detalles del error:', {
        message: (error as any)?.message,
        response: (error as any)?.response,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = (error as any)?.response?.data?.message || 'Error de conexión';
      toast.error(errorMessage);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  }, [router]);

  // Función de registro
  const register = useCallback(async (userData: RegisterDto) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authApi.register(userData);
      
      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        toast.success(`¡Registro exitoso! Bienvenido ${response.data.user.name}`);
        // Redirigir al dashboard
        router.push('/dashboard');
        return { success: true, message: 'Registro exitoso' };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        const errorMessage = response.message || 'Error en el registro';
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error: unknown) {
      console.log('🚨 Error en login:', error);
      console.log('🔍 Detalles del error:', {
        message: (error as any)?.message,
        response: (error as any)?.response,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = (error as any)?.response?.data?.message || 'Error de conexión';
      toast.error(errorMessage);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  }, [router]);

  // Función de logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error en logout:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // Redirigir al login
      router.push('/');
    }
  }, [router]);

  // Verificar si el usuario tiene un rol específico
  const hasRole = useCallback((role: string) => {
    return authState.user?.role === role;
  }, [authState.user]);

  // Verificar si es administrador
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  return {
    ...authState,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
  };
}
