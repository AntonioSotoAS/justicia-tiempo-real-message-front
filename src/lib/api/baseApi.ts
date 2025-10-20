import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

// Interfaz para la respuesta de la API
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// Clase base para la configuración de la API
class BaseApi {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor para requests
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Obtener token del localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error: unknown) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para responses
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: unknown) => {
        const originalRequest = (error as any).config;

        // Si el error es 401 y no hemos intentado refrescar el token
        if ((error as any).response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
            
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken
              });

              const { access_token } = response.data;
              
              if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', access_token);
              }

              // Reintentar la petición original con el nuevo token
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.axiosInstance(originalRequest);
            }
          } catch {
            // Si falla el refresh, redirigir al login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP básicos
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    console.log(`🌐 GET ${url}`, config);
    const response = await this.axiosInstance.get(url, config);
    console.log(`📥 Respuesta GET ${url}:`, response.data);
    
    // Si la respuesta es un array directo, lo envolvemos en la estructura esperada
    if (Array.isArray(response.data)) {
      console.log('🔄 Envolviendo array directo del backend...');
      return {
        success: true,
        data: response.data as T,
        message: 'Operación exitosa'
      };
    }
    
    // Si la respuesta no tiene la estructura esperada, la envolvemos
    if (response.data && !response.data.success && !response.data.data) {
      console.log('🔄 Envolviendo respuesta del backend...');
      return {
        success: true,
        data: response.data as T,
        message: 'Operación exitosa'
      };
    }
    
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    console.log(`🌐 POST ${url}`, { data, config });
    const response = await this.axiosInstance.post(url, data, config);
    console.log(`📥 Respuesta POST ${url}:`, response.data);
    
    // Si la respuesta no tiene la estructura esperada, la envolvemos
    if (response.data && !response.data.success && !response.data.data) {
      console.log('🔄 Envolviendo respuesta del backend...');
      return {
        success: true,
        data: response.data as T,
        message: 'Operación exitosa'
      };
    }
    
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  // Método para obtener la instancia de axios (por si necesitas acceso directo)
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Instancia singleton
export const baseApi = new BaseApi();
export default baseApi;
