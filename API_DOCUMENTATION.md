# 📚 Documentación de API - Justicia Tiempo Real

## 🚀 Información General

**Nombre del Proyecto:** Justicia Tiempo Real Message  
**Versión:** 1.0.0  
**Framework:** Next.js + TypeScript  
**Base de Datos:** MySQL  
**Autenticación:** JWT + Refresh Token  

## 🔧 Configuración Base

### Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:5002
```

### Instalación y Uso

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm run start
```

## 🏗️ BaseApi - Clase Base

### Configuración

La clase `BaseApi` es la base para todas las operaciones HTTP en la aplicación.

```typescript
import { baseApi } from './lib/api/baseApi';
```

### Características Principales

- ✅ **Interceptores automáticos** para autenticación JWT
- ✅ **Renovación automática** de tokens
- ✅ **Manejo de errores** centralizado
- ✅ **Logging detallado** para debugging
- ✅ **Timeout configurado** (10 segundos)
- ✅ **Headers automáticos** (Content-Type: application/json)

### Métodos HTTP Disponibles

#### GET
```typescript
async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
```

#### POST
```typescript
async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
```

#### PUT
```typescript
async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
```

#### PATCH
```typescript
async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
```

#### DELETE
```typescript
async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
```

### Interfaz ApiResponse

```typescript
interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}
```

### Manejo Automático de Autenticación

1. **Interceptor de Request**: Añade automáticamente el token JWT a todas las peticiones
2. **Interceptor de Response**: Maneja errores 401 y renueva tokens automáticamente
3. **Redirección automática**: Redirige al login si falla la renovación del token

### Ejemplo de Uso

```typescript
import { baseApi } from './lib/api/baseApi';

// GET request
const response = await baseApi.get<User[]>('/users');

// POST request
const newUser = await baseApi.post<User>('/users', {
  name: 'Juan Pérez',
  email: 'juan@example.com'
});
```

## 🔐 AuthApi - Autenticación

### Configuración

```typescript
import { authApi } from './lib/api/authApi';
```

### Interfaces Principales

#### LoginDto
```typescript
interface LoginDto {
  email: string;
  password: string;
}
```

#### RegisterDto
```typescript
interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}
```

#### AuthResponse
```typescript
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}
```

#### AuthUser
```typescript
interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}
```

### Métodos Disponibles

#### 🔑 Login
```typescript
async login(credentials: LoginDto): Promise<ApiResponse<AuthResponse>>
```
- **Endpoint**: `POST /auth/login`
- **Autenticación**: No requerida
- **Funcionalidad**: Inicia sesión y guarda tokens automáticamente

#### 📝 Registro
```typescript
async register(userData: RegisterDto): Promise<ApiResponse<AuthResponse>>
```
- **Endpoint**: `POST /auth/register`
- **Autenticación**: No requerida
- **Funcionalidad**: Registra nuevo usuario y guarda tokens automáticamente

#### 🚪 Logout
```typescript
async logout(): Promise<ApiResponse<void>>
```
- **Endpoint**: `POST /auth/logout`
- **Autenticación**: Requerida
- **Funcionalidad**: Cierra sesión y limpia tokens localmente

#### 🔄 Refresh Token
```typescript
async refreshToken(refreshToken: string): Promise<ApiResponse<{ access_token: string }>>
```
- **Endpoint**: `POST /auth/refresh`
- **Autenticación**: No requerida
- **Funcionalidad**: Renueva el token de acceso

#### 👤 Obtener Usuario Actual
```typescript
getCurrentUser(): AuthUser | null
```
- **Funcionalidad**: Obtiene el usuario del localStorage

#### 🔍 Verificar Autenticación
```typescript
isAuthenticated(): boolean
```
- **Funcionalidad**: Verifica si el usuario está autenticado

#### 🔑 Obtener Tokens
```typescript
getAccessToken(): string | null
getRefreshToken(): string | null
```

#### 🔒 Cambiar Contraseña
```typescript
async changePassword(passwordData: ChangePasswordDto): Promise<ApiResponse<void>>
```
- **Endpoint**: `POST /auth/change-password`
- **Autenticación**: Requerida

#### 🔄 Reset de Contraseña
```typescript
async requestPasswordReset(email: string): Promise<ApiResponse<void>>
async confirmPasswordReset(resetData: ConfirmResetPasswordDto): Promise<ApiResponse<void>>
async verifyResetToken(token: string): Promise<ApiResponse<{ valid: boolean }>>
```

#### 👥 Verificaciones de Rol
```typescript
hasRole(role: string): boolean
isAdmin(): boolean
isActive(): boolean
```

### Ejemplos de Uso

#### Login
```typescript
import { authApi } from './lib/api/authApi';

const loginUser = async (email: string, password: string) => {
  try {
    const response = await authApi.login({ email, password });
    
    if (response.success) {
      console.log('Usuario autenticado:', response.data.user);
      // Los tokens se guardan automáticamente
    }
  } catch (error) {
    console.error('Error en login:', error);
  }
};
```

#### Verificar Autenticación
```typescript
if (authApi.isAuthenticated()) {
  const user = authApi.getCurrentUser();
  console.log('Usuario actual:', user);
}
```

## 📊 EstadisticaJuecesApi - Estadísticas de Jueces

### Configuración

```typescript
import { estadisticaJuecesApi } from './lib/api/estadisticaJuecesApi';
```

### Interfaces Principales

#### JuezConMetaResumen
```typescript
interface JuezConMetaResumen {
  n_id_juez: number;
  l_activo: string;
  usuario_id: string;
  n_id_juez_tipo_id: number;
  x_juez_tipo_descripcion: string;
  x_nombres: string;
  x_app_paterno: string;
  x_app_materno: string;
  x_dni: string;
  x_telefono: string | null;
  email: string;
  username: string;
  profile_image: string;
  l_mensaje: number;
  n_id_sexo_id: number;
  x_sexo_descripcion: string;
  n_instancia_id: number;
  x_nom_instancia: string;
  n_id_meta_resumen_mod: number;
  m_niv_bueno: number;
  m_niv_muy_bueno: number;
  m_avan_meta: string;
  x_niv_produc: string;
  m_meta_preliminar: number;
  m_t_resuelto: number;
  n_anio_est: number;
  n_mes_est: number;
  tiene_meta_resumen: number;
}
```

#### FiltrosJueces
```typescript
interface FiltrosJueces {
  anio?: number;
  mes?: number;
  instanciaId?: number;
  tipoJuez?: number;
  activo?: boolean;
}
```

### Métodos Disponibles

#### 📈 Obtener Jueces con Meta Resúmenes
```typescript
async getJuecesConMetaResumenes(anio: number, mes: number): Promise<ApiResponse<JuezConMetaResumen[]>>
```
- **Endpoint**: `GET /jueces/con-meta-resumenes/{anio}/{mes}`
- **Funcionalidad**: Obtiene jueces con meta resúmenes por año y mes

#### 👥 Obtener Jueces Activos
```typescript
async getJuecesActivos(): Promise<ApiResponse<JuezConMetaResumen[]>>
```
- **Endpoint**: `GET /jueces/activos`
- **Funcionalidad**: Obtiene todos los jueces activos

#### 🔍 Obtener Juez por Usuario
```typescript
async getJuezByUsuario(usuarioId: string): Promise<ApiResponse<JuezConMetaResumen>>
```
- **Endpoint**: `GET /jueces/usuario/{usuarioId}`
- **Funcionalidad**: Obtiene un juez específico por ID de usuario

#### 🏛️ Obtener Jueces por Tipo
```typescript
async getJuecesByTipo(tipoId: number): Promise<ApiResponse<JuezConMetaResumen[]>>
```
- **Endpoint**: `GET /jueces/tipo/{tipoId}`
- **Funcionalidad**: Obtiene jueces filtrados por tipo

#### 📊 Obtener Meta Resumen por Instancia
```typescript
async getMetaResumenByInstancia(anio: number, mes: number, instanciaId: number): Promise<ApiResponse<JuezConMetaResumen[]>>
```
- **Endpoint**: `GET /jueces/meta-resumen/{anio}/{mes}/{instanciaId}`
- **Funcionalidad**: Obtiene meta resúmenes filtrados por instancia

#### 📋 Obtener Jueces Completos
```typescript
async getJuecesCompletos(): Promise<ApiResponse<JuezConMetaResumen[]>>
```
- **Endpoint**: `GET /jueces/completos`
- **Funcionalidad**: Obtiene todos los jueces con información completa

#### 📈 Obtener Jueces con Meta Resúmenes (Sin Filtros)
```typescript
async getJuecesWithMetaResumenes(): Promise<ApiResponse<JuezConMetaResumen[]>>
```
- **Endpoint**: `GET /jueces/meta-resumenes`
- **Funcionalidad**: Obtiene jueces con meta resúmenes sin filtros de fecha

#### 🔍 Obtener Juez Específico con Meta Resúmenes
```typescript
async getJuezWithMetaResumenes(juezId: number): Promise<ApiResponse<JuezConMetaResumen>>
```
- **Endpoint**: `GET /jueces/{juezId}/meta-resumenes`
- **Funcionalidad**: Obtiene un juez específico con sus meta resúmenes

#### 📊 Obtener Estadísticas Resumen
```typescript
async getEstadisticasResumen(anio: number, mes: number): Promise<ApiResponse<{
  totalJueces: number;
  juecesConMeta: number;
  promedioAvance: number;
  juecesMuyBueno: number;
  juecesBueno: number;
  juecesRegular: number;
}>>
```
- **Funcionalidad**: Calcula estadísticas resumidas de jueces

#### 📈 Obtener Cuadro Anual
```typescript
async getCuadroAnual(anio?: number, mes?: number): Promise<ApiResponse<CuadroAnualDto>>
```
- **Endpoint**: `GET /estadistica/cuadro-anual?year={anio}&month={mes}`
- **Funcionalidad**: Obtiene cuadro anual con filtros opcionales

#### 📅 Obtener Cuadro Anual Actual
```typescript
async getCuadroAnualActual(): Promise<ApiResponse<CuadroAnualDto>>
```
- **Endpoint**: `GET /estadistica/cuadro-anual/actual`
- **Funcionalidad**: Obtiene cuadro anual del período actual

#### 📆 Obtener Cuadro Anual por Año
```typescript
async getCuadroAnualByYear(anio: number): Promise<ApiResponse<CuadroAnualDto>>
```
- **Endpoint**: `GET /estadistica/cuadro-anual/{anio}`
- **Funcionalidad**: Obtiene cuadro anual de un año específico

### Ejemplos de Uso

#### Obtener Estadísticas por Año y Mes
```typescript
import { estadisticaJuecesApi } from './lib/api/estadisticaJuecesApi';

const obtenerEstadisticas = async (anio: number, mes: number) => {
  try {
    // Obtener jueces con meta resúmenes
    const jueces = await estadisticaJuecesApi.getJuecesConMetaResumenes(anio, mes);
    
    if (jueces.success) {
      console.log(`Jueces encontrados: ${jueces.data.length}`);
      
      // Obtener estadísticas resumen
      const estadisticas = await estadisticaJuecesApi.getEstadisticasResumen(anio, mes);
      
      if (estadisticas.success) {
        console.log('Estadísticas:', estadisticas.data);
      }
    }
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
  }
};

// Uso
obtenerEstadisticas(2024, 6);
```

#### Filtrar Jueces por Instancia
```typescript
const obtenerJuecesPorInstancia = async (anio: number, mes: number, instanciaId: number) => {
  try {
    const response = await estadisticaJuecesApi.getMetaResumenByInstancia(anio, mes, instanciaId);
    
    if (response.success) {
      console.log(`Jueces en instancia ${instanciaId}:`, response.data);
    }
  } catch (error) {
    console.error('Error al obtener jueces por instancia:', error);
  }
};
```

#### Obtener Juez por Usuario
```typescript
const obtenerJuezPorUsuario = async (usuarioId: string) => {
  try {
    const response = await estadisticaJuecesApi.getJuezByUsuario(usuarioId);
    
    if (response.success) {
      console.log('Juez encontrado:', response.data);
    }
  } catch (error) {
    console.error('Error al obtener juez:', error);
  }
};
```

#### Obtener Cuadro Anual
```typescript
const obtenerCuadroAnual = async (anio: number, mes: number) => {
  try {
    // Obtener cuadro anual con filtros
    const response = await estadisticaJuecesApi.getCuadroAnual(anio, mes);
    
    if (response.success) {
      console.log('Cuadro anual:', response.data);
      console.log(`Año: ${response.data.anio}`);
      console.log(`Total filas: ${response.data.total_filas}`);
      console.log(`Meses: ${response.data.meses.join(', ')}`);
      
      // Procesar cada fila
      response.data.filas.forEach((fila, index) => {
        console.log(`Fila ${index + 1}:`, {
          organizacion: fila.org_jurisd,
          instancia: fila.instancia,
          jueces: fila.jueces,
          avanceReal: `${fila.pct_real_avance}%`,
          nivelProduccion: fila.nivel_prod,
          totalResoluciones: fila.res_total,
          totalIngresos: fila.ing_total
        });
      });
    }
  } catch (error) {
    console.error('Error al obtener cuadro anual:', error);
  }
};

// Obtener cuadro anual actual
const obtenerCuadroAnualActual = async () => {
  try {
    const response = await estadisticaJuecesApi.getCuadroAnualActual();
    
    if (response.success) {
      console.log('Cuadro anual actual:', response.data);
    }
  } catch (error) {
    console.error('Error al obtener cuadro anual actual:', error);
  }
};

// Obtener cuadro anual por año específico
const obtenerCuadroAnualPorAño = async (anio: number) => {
  try {
    const response = await estadisticaJuecesApi.getCuadroAnualByYear(anio);
    
    if (response.success) {
      console.log(`Cuadro anual ${anio}:`, response.data);
    }
  } catch (error) {
    console.error('Error al obtener cuadro anual por año:', error);
  }
};
```

## 🛡️ Manejo de Errores

### Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado |
| `400` | Bad Request - Datos inválidos |
| `401` | Unauthorized - No autenticado |
| `403` | Forbidden - Sin permisos |
| `404` | Not Found - Recurso no encontrado |
| `500` | Internal Server Error - Error del servidor |

### Manejo Automático de Errores

1. **Error 401**: Renovación automática de token
2. **Error de renovación**: Redirección automática al login
3. **Logging detallado**: Todos los requests y responses se registran en consola

### Ejemplo de Manejo de Errores

```typescript
try {
  const response = await baseApi.get('/endpoint');
  
  if (response.success) {
    console.log('Datos:', response.data);
  } else {
    console.error('Error:', response.message);
  }
} catch (error) {
  console.error('Error de red:', error);
}
```

## 🔧 Configuración Avanzada

### Timeout Personalizado

```typescript
const response = await baseApi.get('/endpoint', {
  timeout: 5000 // 5 segundos
});
```

### Headers Personalizados

```typescript
const response = await baseApi.post('/endpoint', data, {
  headers: {
    'Custom-Header': 'valor'
  }
});
```

### Acceso Directo a Axios

```typescript
const axiosInstance = baseApi.getAxiosInstance();
// Usar axiosInstance directamente si necesitas funcionalidades específicas
```

## 📝 Notas Importantes

1. **Autenticación Automática**: Todos los requests incluyen automáticamente el token JWT
2. **Renovación de Tokens**: Se maneja automáticamente en caso de expiración
3. **Logging**: Todos los requests se registran en consola para debugging
4. **Estructura de Respuesta**: Todas las respuestas siguen el formato `ApiResponse<T>`
5. **Manejo de Arrays**: Los arrays directos del backend se envuelven automáticamente en la estructura esperada

## 🚀 Próximos Pasos

- [ ] Implementar cache de respuestas
- [ ] Añadir retry automático para requests fallidos
- [ ] Implementar métricas de performance
- [ ] Añadir validación de esquemas de respuesta
- [ ] Implementar paginación automática

---

**Desarrollado con ❤️ para el sistema de Justicia Tiempo Real**
