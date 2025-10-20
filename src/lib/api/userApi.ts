import { baseApi, ApiResponse } from './baseApi';

// Interfaz para el usuario (basada en la entidad User de NestJS)
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Solo para creación/actualización
  role: string;
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para crear un usuario
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
  isActive?: boolean;
}

// Interfaz para actualizar un usuario
export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}

// Interfaz para la respuesta del perfil del usuario
export interface UserProfile {
  message: string;
  user: User;
  timestamp: string;
}

// Clase para manejar las operaciones de usuarios
class UserApi {
  private readonly baseUrl = '/users';

  /**
   * Obtener todos los usuarios
   * Requiere autenticación
   */
  async findAll(): Promise<ApiResponse<User[]>> {
    return await baseApi.get<User[]>(this.baseUrl);
  }

  /**
   * Obtener un usuario por ID
   * Requiere autenticación
   */
  async findOne(id: number): Promise<ApiResponse<User>> {
    return await baseApi.get<User>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crear un nuevo usuario
   * Endpoint público (no requiere autenticación)
   */
  async create(userData: CreateUserDto): Promise<ApiResponse<User>> {
    return await baseApi.post<User>(this.baseUrl, userData);
  }

  /**
   * Actualizar un usuario
   * Requiere rol de administrador
   */
  async update(id: number, userData: UpdateUserDto): Promise<ApiResponse<User>> {
    return await baseApi.patch<User>(`${this.baseUrl}/${id}`, userData);
  }

  /**
   * Eliminar un usuario
   * Requiere rol de administrador
   */
  async remove(id: number): Promise<ApiResponse<void>> {
    return await baseApi.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtener el perfil del usuario autenticado
   * Requiere autenticación
   */
  async getMyProfile(): Promise<ApiResponse<UserProfile>> {
    return await baseApi.get<UserProfile>(`${this.baseUrl}/profile/me`);
  }

  /**
   * Buscar usuarios por email
   * Método auxiliar para búsquedas
   */
  async findByEmail(email: string): Promise<ApiResponse<User[]>> {
    return await baseApi.get<User[]>(`${this.baseUrl}/search?email=${encodeURIComponent(email)}`);
  }

  /**
   * Obtener usuarios por rol
   * Método auxiliar para filtros
   */
  async findByRole(role: string): Promise<ApiResponse<User[]>> {
    return await baseApi.get<User[]>(`${this.baseUrl}/search?role=${encodeURIComponent(role)}`);
  }

  /**
   * Activar/desactivar usuario
   * Requiere rol de administrador
   */
  async toggleActive(id: number, isActive: boolean): Promise<ApiResponse<User>> {
    return await baseApi.patch<User>(`${this.baseUrl}/${id}`, { isActive });
  }

  /**
   * Cambiar rol de usuario
   * Requiere rol de administrador
   */
  async changeRole(id: number, role: string): Promise<ApiResponse<User>> {
    return await baseApi.patch<User>(`${this.baseUrl}/${id}`, { role });
  }
}

// Instancia singleton
export const userApi = new UserApi();
export default userApi;
