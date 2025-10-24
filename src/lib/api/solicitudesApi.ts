import { baseApi } from './baseApi';

export interface CreateSolicitudDto {
  // Campos del mensaje
  encuesta?: string;
  telefono?: string;
  whatsapp?: string;
  fechaEnvio?: string;
  horaEnvio?: string;
  fechaCorte?: string;
  // Campos de jueces
  instancia?: string;
  modulo_nom?: string;
  meta_preliminar?: number;
  nivel_prod?: string;
  pct_real_avance?: number;
  niv_bueno?: number;
  niv_muy_bueno?: number;
  // Campos del juez
  nombre_completo?: string;
  telefono_juez?: string;
  l_mensaje?: boolean;
  sexo?: string;
  estado?: string;
  prioridad?: string;
}

export interface SolicitudResponse {
  success: boolean;
  data?: any;
  message?: string;
  solicitudId?: number;
  messageId?: string;
  estado?: string;
  timestamp?: string;
}

export const solicitudesApi = {
  // Crear una solicitud individual
  async createSolicitud(datos: CreateSolicitudDto): Promise<SolicitudResponse> {
    try {
      console.log('📤 Enviando solicitud individual:', datos);
      
      const response = await baseApi.post('/solicitudes', datos);
      
      console.log('✅ Respuesta del servidor:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Solicitud creada exitosamente'
      };
    } catch (error: any) {
      console.error('❌ Error al crear solicitud:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear solicitud'
      };
    }
  },

  // Crear múltiples solicitudes (array de DTOs)
  async createMultipleSolicitudes(arrayDtos: CreateSolicitudDto[]): Promise<{
    success: boolean;
    results: SolicitudResponse[];
    totalEnviados: number;
    totalExitosos: number;
    totalFallidos: number;
  }> {
    try {
      console.log('📤 ===== ENVIANDO MÚLTIPLES SOLICITUDES =====');
      console.log('📦 Total de solicitudes a enviar:', arrayDtos.length);
      console.log('📋 Array de DTOs:', arrayDtos);

      const results: SolicitudResponse[] = [];
      let totalExitosos = 0;
      let totalFallidos = 0;

      // Enviar cada solicitud individualmente
      for (let i = 0; i < arrayDtos.length; i++) {
        const dto = arrayDtos[i];
        console.log(`📤 Enviando solicitud ${i + 1}/${arrayDtos.length}: ${dto.nombre_completo}`);
        
        const resultado = await this.createSolicitud(dto);
        results.push(resultado);
        
        if (resultado.success) {
          totalExitosos++;
          console.log(`✅ Solicitud ${i + 1} enviada exitosamente`);
        } else {
          totalFallidos++;
          console.log(`❌ Error en solicitud ${i + 1}:`, resultado.message);
        }
      }

      console.log('📊 ===== RESUMEN DE ENVÍO =====');
      console.log(`📤 Total enviados: ${arrayDtos.length}`);
      console.log(`✅ Exitosos: ${totalExitosos}`);
      console.log(`❌ Fallidos: ${totalFallidos}`);
      console.log('📊 ===== FIN RESUMEN =====');

      return {
        success: totalExitosos > 0,
        results,
        totalEnviados: arrayDtos.length,
        totalExitosos,
        totalFallidos
      };
    } catch (error: any) {
      console.error('🚨 Error general al enviar múltiples solicitudes:', error);
      return {
        success: false,
        results: [],
        totalEnviados: arrayDtos.length,
        totalExitosos: 0,
        totalFallidos: arrayDtos.length
      };
    }
  },

  // Obtener todas las solicitudes
  async getAllSolicitudes(): Promise<SolicitudResponse> {
    try {
      const response = await baseApi.get('/solicitudes');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ Error al obtener solicitudes:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener solicitudes'
      };
    }
  },

  // Obtener estadísticas de solicitudes
  async getEstadisticas(): Promise<SolicitudResponse> {
    try {
      const response = await baseApi.get('/solicitudes/estadisticas');
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ Error al obtener estadísticas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener estadísticas'
      };
    }
  }
};
