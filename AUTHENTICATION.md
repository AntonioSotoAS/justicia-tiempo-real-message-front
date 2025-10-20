# Sistema de Autenticación - Justicia Tiempo Real

## 🚀 Funcionalidades Implementadas

### ✅ Autenticación Completa
- **Login funcional** con validación de credenciales
- **Protección de rutas** automática
- **Redirección inteligente** según estado de autenticación
- **Logout seguro** con limpieza de tokens
- **Manejo de errores** y estados de carga

### ✅ Flujo de Navegación
- **Página principal (`/`)**: 
  - Si NO está autenticado → Muestra formulario de login
  - Si SÍ está autenticado → Redirige automáticamente a `/dashboard`
- **Dashboard (`/dashboard`)**: 
  - Protegido con `AuthGuard`
  - Solo usuarios autenticados pueden acceder
  - Incluye menú de usuario con opción de logout

### ✅ Componentes Creados

#### 1. **Hook de Autenticación** (`use-auth.ts`)
```typescript
const { 
  user,           // Usuario actual
  isAuthenticated, // Estado de autenticación
  isLoading,      // Estado de carga
  login,          // Función de login
  logout,         // Función de logout
  hasRole,        // Verificar rol
  isAdmin         // Verificar si es admin
} = useAuth();
```

#### 2. **Componente de Protección** (`auth-guard.tsx`)
```tsx
<AuthGuard requireAuth={true} requireRole="admin">
  <ComponenteProtegido />
</AuthGuard>
```

#### 3. **Middleware de Rutas** (`middleware.ts`)
- Protección automática de rutas
- Redirección basada en autenticación
- Manejo de tokens en cookies

## 🔧 Configuración Requerida

### Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Estructura de la API Backend
El sistema espera que tu backend NestJS tenga estos endpoints:

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh` - Refrescar token

#### Respuesta de Login/Register
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "role": "user",
      "isActive": true
    }
  }
}
```

## 🎯 Cómo Usar

### 1. **Login de Usuario**
```typescript
import { useAuth } from '@/hooks/use-auth';

function LoginComponent() {
  const { login, isLoading } = useAuth();
  
  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      // Usuario autenticado, redirigido automáticamente
    } else {
      // Mostrar error
      console.error(result.message);
    }
  };
}
```

### 2. **Proteger Componentes**
```tsx
import { AuthGuard } from '@/components/auth-guard';

function ProtectedPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div>Contenido protegido</div>
    </AuthGuard>
  );
}
```

### 3. **Verificar Autenticación**
```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { isAuthenticated, user, hasRole } = useAuth();
  
  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }
  
  return (
    <div>
      <h1>Hola {user?.name}</h1>
      {hasRole('admin') && <div>Panel de administración</div>}
    </div>
  );
}
```

## 🔄 Flujo de Autenticación

1. **Usuario accede a `/`**
   - Sistema verifica si está autenticado
   - Si NO → Muestra formulario de login
   - Si SÍ → Redirige a `/dashboard`

2. **Usuario hace login**
   - Envía credenciales a `/auth/login`
   - Backend valida y retorna tokens
   - Tokens se guardan en localStorage
   - Usuario es redirigido a `/dashboard`

3. **Usuario accede a `/dashboard`**
   - `AuthGuard` verifica autenticación
   - Si autenticado → Muestra dashboard
   - Si no autenticado → Redirige a `/`

4. **Usuario hace logout**
   - Se llama a `/auth/logout`
   - Se limpian tokens del localStorage
   - Usuario es redirigido a `/`

## 🛡️ Seguridad Implementada

- **Tokens JWT** con refresh automático
- **Interceptores de axios** para manejo automático de tokens
- **Protección de rutas** a nivel de middleware
- **Limpieza automática** de tokens expirados
- **Redirección segura** en caso de errores de autenticación

## 🚨 Solución de Problemas

### Error: "Cannot find module 'axios'"
```bash
npm install axios
```

### Error de conexión con la API
1. Verifica que tu backend esté corriendo en `http://localhost:3001`
2. Confirma que la variable `NEXT_PUBLIC_API_URL` esté configurada
3. Revisa que los endpoints de autenticación estén funcionando

### Usuario no se redirige después del login
1. Verifica que el hook `useAuth` esté funcionando correctamente
2. Confirma que el estado `isAuthenticated` se actualiza
3. Revisa la consola del navegador para errores

## 📝 Próximos Pasos

1. **Configurar variables de entorno** en `.env.local`
2. **Iniciar tu backend NestJS** en el puerto 3001
3. **Probar el flujo completo**:
   - Ir a `/` (debería mostrar login)
   - Hacer login con credenciales válidas
   - Verificar redirección a `/dashboard`
   - Probar logout desde el menú de usuario

¡El sistema de autenticación está completamente funcional y listo para usar! 🎉
