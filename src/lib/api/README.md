# API Client para Justicia Tiempo Real

Este directorio contiene la configuración de la API client para comunicarse con el backend de NestJS.

## Estructura

- `baseApi.ts` - Configuración base de axios con interceptores
- `userApi.ts` - API para operaciones de usuarios
- `authApi.ts` - API para autenticación
- `index.ts` - Exportaciones centralizadas

## Uso

### Autenticación

```typescript
import { authApi, LoginDto } from '@/lib/api';

// Login
const loginData: LoginDto = {
  email: 'usuario@ejemplo.com',
  password: 'contraseña123'
};

try {
  const response = await authApi.login(loginData);
  if (response.success) {
    console.log('Usuario autenticado:', response.data.user);
    console.log('Access Token:', response.data.access_token);
    console.log('Refresh Token:', response.data.refresh_token);
  }
} catch (error) {
  console.error('Error en login:', error);
}

// Verificar autenticación
if (authApi.isAuthenticated()) {
  const user = authApi.getCurrentUser();
  console.log('Usuario actual:', user);
}

// Logout
await authApi.logout();
```

### Operaciones de Usuarios

```typescript
import { userApi, CreateUserDto } from '@/lib/api';

// Obtener todos los usuarios
try {
  const response = await userApi.findAll();
  console.log('Usuarios:', response.data);
} catch (error) {
  console.error('Error al obtener usuarios:', error);
}

// Crear usuario
const newUser: CreateUserDto = {
  name: 'Juan Pérez',
  email: 'juan@ejemplo.com',
  password: 'contraseña123',
  role: 'user'
};

try {
  const response = await userApi.create(newUser);
  console.log('Usuario creado:', response.data);
} catch (error) {
  console.error('Error al crear usuario:', error);
}

// Obtener perfil del usuario actual
try {
  const response = await userApi.getMyProfile();
  console.log('Mi perfil:', response.data);
} catch (error) {
  console.error('Error al obtener perfil:', error);
}
```

### Configuración

La API se conecta automáticamente al backend configurado en la variable de entorno `NEXT_PUBLIC_API_URL` (por defecto: `http://localhost:5002`).

### Características

- **Interceptores automáticos**: Manejo automático de tokens de autenticación
- **Refresh token**: Renovación automática de tokens expirados
- **Gestión de localStorage**: Almacenamiento automático de tokens y datos de usuario
- **Tipado completo**: Interfaces TypeScript para todas las operaciones
- **Manejo de errores**: Gestión centralizada de errores de autenticación

### Variables de Entorno

Asegúrate de configurar en tu archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5002
```

### Endpoints Soportados

#### Autenticación (`/auth`)
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh` - Refrescar token
- `POST /auth/change-password` - Cambiar contraseña
- `POST /auth/forgot-password` - Solicitar reset de contraseña
- `POST /auth/reset-password` - Confirmar reset de contraseña

#### Usuarios (`/users`)
- `GET /users` - Obtener todos los usuarios (requiere auth)
- `GET /users/:id` - Obtener usuario por ID (requiere auth)
- `POST /users` - Crear usuario (público)
- `PATCH /users/:id` - Actualizar usuario (requiere admin)
- `DELETE /users/:id` - Eliminar usuario (requiere admin)
- `GET /users/profile/me` - Obtener perfil actual (requiere auth)
