import { baseApi, ApiResponse } from './baseApi';

// Interfaz para el login (coincide con LoginDto del backend)
export interface LoginDto {
  email: string;
  password: string;
}

// Interfaz para el registro (coincide con RegisterDto del backend)
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

// Interfaz para el usuario en la respuesta de autenticación
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

// Interfaz para la respuesta de autenticación (coincide con AuthResponseDto del backend)
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

// Interfaz para refresh token (coincide con RefreshTokenDto del backend)
export interface RefreshTokenDto {
  refresh_token: string;
}

// Interfaz para cambiar contraseña (coincide con ChangePasswordDto del backend)
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Interfaz para reset de contraseña
export interface ResetPasswordDto {
  email: string;
}

// Interfaz para confirmar reset de contraseña
export interface ConfirmResetPasswordDto {
  token: string;
  newPassword: string;
}

// Clase para manejar la autenticación
class AuthApi {
  private readonly baseUrl = '/auth';

  /**
   * Iniciar sesión
   * Endpoint público
   */
  async login(credentials: LoginDto): Promise<ApiResponse<AuthResponse>> {
    const response = await baseApi.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
    
    // Guardar tokens en localStorage si la respuesta es exitosa
    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // También guardar en cookies para el middleware
        document.cookie = `accessToken=${response.data.access_token}; path=/; max-age=86400`; // 24 horas
        document.cookie = `refreshToken=${response.data.refresh_token}; path=/; max-age=604800`; // 7 días
      }
    }
    
    return response;
  }

  /**
   * Registrar nuevo usuario
   * Endpoint público
   */
  async register(userData: RegisterDto): Promise<ApiResponse<AuthResponse>> {
    const response = await baseApi.post<AuthResponse>(`${this.baseUrl}/register`, userData);
    
    // Guardar tokens en localStorage si la respuesta es exitosa
    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // También guardar en cookies para el middleware
        document.cookie = `accessToken=${response.data.access_token}; path=/; max-age=86400`; // 24 horas
        document.cookie = `refreshToken=${response.data.refresh_token}; path=/; max-age=604800`; // 7 días
      }
    }
    
    return response;
  }

  /**
   * Cerrar sesión
   * Requiere autenticación
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await baseApi.post<void>(`${this.baseUrl}/logout`);
      
      // Limpiar localStorage y cookies
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Limpiar cookies
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      
      return response;
    } catch {
      // Limpiar localStorage y cookies incluso si hay error en el servidor
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Limpiar cookies
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      
      return {
        success: true,
        data: undefined,
        message: 'Sesión cerrada localmente'
      };
    }
  }

  /**
   * Refrescar token de acceso
   * Endpoint público
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ access_token: string }>> {
    const response = await baseApi.post<{ access_token: string }>(`${this.baseUrl}/refresh`, {
      refresh_token: refreshToken
    });
    
    // Actualizar token en localStorage
    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.access_token);
      }
    }
    
    return response;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    return !!(token && user);
  }

  /**
   * Obtener el usuario actual del localStorage
   */
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Obtener el token de acceso
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * Obtener el refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  /**
   * Cambiar contraseña
   * Requiere autenticación
   */
  async changePassword(passwordData: ChangePasswordDto): Promise<ApiResponse<void>> {
    return await baseApi.post<void>(`${this.baseUrl}/change-password`, passwordData);
  }

  /**
   * Solicitar reset de contraseña
   * Endpoint público
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return await baseApi.post<void>(`${this.baseUrl}/forgot-password`, { email });
  }

  /**
   * Confirmar reset de contraseña
   * Endpoint público
   */
  async confirmPasswordReset(resetData: ConfirmResetPasswordDto): Promise<ApiResponse<void>> {
    return await baseApi.post<void>(`${this.baseUrl}/reset-password`, resetData);
  }

  /**
   * Verificar token de reset
   * Endpoint público
   */
  async verifyResetToken(token: string): Promise<ApiResponse<{ valid: boolean }>> {
    return await baseApi.get<{ valid: boolean }>(`${this.baseUrl}/verify-reset-token/${token}`);
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Verificar si el usuario está activo
   */
  isActive(): boolean {
    const user = this.getCurrentUser();
    return user?.isActive === true;
  }
}

// Instancia singleton
export const authApi = new AuthApi();
export default authApi;
