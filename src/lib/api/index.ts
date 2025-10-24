// Exportar APIs (valores)
export { baseApi } from './baseApi';
export { userApi } from './userApi';
export { authApi } from './authApi';
export { estadisticaJuecesApi } from './estadisticaJuecesApi';
export { solicitudesApi } from './solicitudesApi';

// Exportar tipos
export type { ApiResponse } from './baseApi';
export type { User, CreateUserDto, UpdateUserDto, UserProfile } from './userApi';
export type { 
  LoginDto, 
  RegisterDto, 
  AuthResponse, 
  AuthUser,
  RefreshTokenDto, 
  ChangePasswordDto, 
  ResetPasswordDto, 
  ConfirmResetPasswordDto 
} from './authApi';
export type { JuezConMetaResumen, FiltrosJueces } from './estadisticaJuecesApi';
export type { CreateSolicitudDto, SolicitudResponse } from './solicitudesApi';

// Re-exportar las instancias principales para uso directo
export { baseApi as api } from './baseApi';
export { userApi as users } from './userApi';
export { authApi as auth } from './authApi';
export { estadisticaJuecesApi as estadisticas } from './estadisticaJuecesApi';
export { solicitudesApi as solicitudes } from './solicitudesApi';
