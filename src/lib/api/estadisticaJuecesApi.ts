import { baseApi, ApiResponse } from './baseApi';

// Interfaz para los datos de jueces con meta resumen
export interface JuezConMetaResumen {
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

// Interfaz para filtros de búsqueda
export interface FiltrosJueces {
  anio?: number;
  mes?: number;
  instanciaId?: number;
  tipoJuez?: number;
  activo?: boolean;
}

// DTOs para Cuadro Anual
export interface JuezObjetoDto {
  nombre_completo: string;
  telefono: string;
  l_mensaje: boolean;
  sexo: string;
}

export interface ResCellDto {
  val: number;
  cls: string;
  nivel: string;
}

export interface IngCellDto {
  val: number;
  cls: string;
  nivel: string;
}

export interface FilaDto {
  org_jurisd: string;
  instancia: string;
  jueces: string;
  jueces_objetos: JuezObjetoDto[];
  estandar: number;
  meta_preliminar: number;
  carga_inicial: number;
  pct_real_avance: number;
  pct_ideal_avance: number;
  nivel_prod: string;
  niv_bueno: number;
  niv_muy_bueno: number;
  res_cells: ResCellDto[];
  ing_cells: IngCellDto[];
  res_total: number;
  ing_total: number;
  modulo_id: number;
  modulo_nom: string;
  n_orden: number;
}

export interface CuadroAnualDto {
  anio: number;
  mes_actual: number;
  meses: string[];
  filas: FilaDto[];
  total_filas: number;
  fecha_consulta: string;
}

// Clase para manejar las operaciones de estadísticas de jueces
class EstadisticaJuecesApi {
  private readonly baseUrl = '/jueces';

  /**
   * Obtener jueces con meta resúmenes por año y mes
   */
  async getJuecesConMetaResumenes(anio: number, mes: number): Promise<ApiResponse<JuezConMetaResumen[]>> {
    console.log(`🔍 EstadisticaJuecesApi: Obteniendo jueces con meta resúmenes para ${anio}/${mes}`);
    console.log(`🌐 EstadisticaJuecesApi: URL completa: http://localhost:5002${this.baseUrl}/con-meta-resumenes/${anio}/${mes}`);
    
    const response = await baseApi.get<JuezConMetaResumen[]>(`${this.baseUrl}/con-meta-resumenes/${anio}/${mes}`);
    
    console.log(`📡 EstadisticaJuecesApi: Respuesta recibida:`, {
      success: response.success,
      dataLength: response.data?.length || 0,
      message: response.message
    });
    
    return response;
  }

  /**
   * Obtener todos los jueces activos
   */
  async getJuecesActivos(): Promise<ApiResponse<JuezConMetaResumen[]>> {
    return await baseApi.get<JuezConMetaResumen[]>(`${this.baseUrl}/activos`);
  }

  /**
   * Obtener jueces por usuario
   */
  async getJuezByUsuario(usuarioId: string): Promise<ApiResponse<JuezConMetaResumen>> {
    return await baseApi.get<JuezConMetaResumen>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  /**
   * Obtener jueces por tipo
   */
  async getJuecesByTipo(tipoId: number): Promise<ApiResponse<JuezConMetaResumen[]>> {
    return await baseApi.get<JuezConMetaResumen[]>(`${this.baseUrl}/tipo/${tipoId}`);
  }

  /**
   * Obtener meta resumen por instancia
   */
  async getMetaResumenByInstancia(
    anio: number, 
    mes: number, 
    instanciaId: number
  ): Promise<ApiResponse<JuezConMetaResumen[]>> {
    return await baseApi.get<JuezConMetaResumen[]>(`${this.baseUrl}/meta-resumen/${anio}/${mes}/${instanciaId}`);
  }

  /**
   * Obtener jueces completos
   */
  async getJuecesCompletos(): Promise<ApiResponse<JuezConMetaResumen[]>> {
    return await baseApi.get<JuezConMetaResumen[]>(`${this.baseUrl}/completos`);
  }

  /**
   * Obtener jueces con meta resúmenes (sin filtros de fecha)
   */
  async getJuecesWithMetaResumenes(): Promise<ApiResponse<JuezConMetaResumen[]>> {
    return await baseApi.get<JuezConMetaResumen[]>(`${this.baseUrl}/meta-resumenes`);
  }

  /**
   * Obtener un juez específico con meta resúmenes
   */
  async getJuezWithMetaResumenes(juezId: number): Promise<ApiResponse<JuezConMetaResumen>> {
    return await baseApi.get<JuezConMetaResumen>(`${this.baseUrl}/${juezId}/meta-resumenes`);
  }

  /**
   * Obtener estadísticas resumidas de jueces
   */
  async getEstadisticasResumen(anio: number, mes: number): Promise<ApiResponse<{
    totalJueces: number;
    juecesConMeta: number;
    promedioAvance: number;
    juecesMuyBueno: number;
    juecesBueno: number;
    juecesRegular: number;
  }>> {
    console.log(`📊 EstadisticaJuecesApi: Calculando estadísticas resumen para ${anio}/${mes}`);
    const jueces = await this.getJuecesConMetaResumenes(anio, mes);
    
    if (!jueces.success || !jueces.data) {
      return {
        success: false,
        message: 'Error al obtener datos de jueces',
        data: {
          totalJueces: 0,
          juecesConMeta: 0,
          promedioAvance: 0,
          juecesMuyBueno: 0,
          juecesBueno: 0,
          juecesRegular: 0
        }
      };
    }

    const totalJueces = jueces.data.length;
    const juecesConMeta = jueces.data.filter(j => j.tiene_meta_resumen === 1).length;
    const avances = jueces.data.map(j => parseFloat(j.m_avan_meta || '0'));
    const promedioAvance = avances.length > 0 ? avances.reduce((a, b) => a + b, 0) / avances.length : 0;
    
    const juecesMuyBueno = jueces.data.filter(j => j.x_niv_produc === 'MUY BUENO').length;
    const juecesBueno = jueces.data.filter(j => j.x_niv_produc === 'BUENO').length;
    const juecesRegular = jueces.data.filter(j => j.x_niv_produc === 'REGULAR').length;

    const estadisticasCalculadas = {
      totalJueces,
      juecesConMeta,
      promedioAvance: Math.round(promedioAvance * 100) / 100,
      juecesMuyBueno,
      juecesBueno,
      juecesRegular
    };

    console.log(`📈 EstadisticaJuecesApi: Estadísticas calculadas:`, estadisticasCalculadas);

    return {
      success: true,
      data: estadisticasCalculadas
    };
  }

  /**
   * Obtener cuadro anual de estadísticas
   */
  async getCuadroAnual(anio?: number, mes?: number): Promise<ApiResponse<CuadroAnualDto>> {
    console.log(`📊 EstadisticaJuecesApi: Obteniendo cuadro anual para ${anio || 'actual'}/${mes || 'actual'}`);
    
    let url = '/estadistica/cuadro-anual';
    const params = new URLSearchParams();
    
    if (anio) params.append('year', anio.toString());
    if (mes) params.append('month', mes.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log(`🌐 EstadisticaJuecesApi: URL completa: http://localhost:5002${url}`);
    
    const response = await baseApi.get<CuadroAnualDto>(url);
    
    console.log(`📡 EstadisticaJuecesApi: Cuadro anual recibido:`, {
      success: response.success,
      anio: response.data?.anio,
      totalFilas: response.data?.total_filas || 0,
      fechaConsulta: response.data?.fecha_consulta
    });
    
    return response;
  }

  /**
   * Obtener cuadro anual actual
   */
  async getCuadroAnualActual(): Promise<ApiResponse<CuadroAnualDto>> {
    console.log(`📊 EstadisticaJuecesApi: Obteniendo cuadro anual actual`);
    console.log(`🌐 EstadisticaJuecesApi: URL completa: http://localhost:5002/estadistica/cuadro-anual/actual`);
    
    const response = await baseApi.get<CuadroAnualDto>('/estadistica/cuadro-anual/actual');
    
    console.log(`📡 EstadisticaJuecesApi: Cuadro anual actual recibido:`, {
      success: response.success,
      anio: response.data?.anio,
      totalFilas: response.data?.total_filas || 0
    });
    
    return response;
  }

  /**
   * Obtener cuadro anual por año específico
   */
  async getCuadroAnualByYear(anio: number): Promise<ApiResponse<CuadroAnualDto>> {
    console.log(`📊 EstadisticaJuecesApi: Obteniendo cuadro anual para año ${anio}`);
    console.log(`🌐 EstadisticaJuecesApi: URL completa: http://localhost:5002/estadistica/cuadro-anual/${anio}`);
    
    const response = await baseApi.get<CuadroAnualDto>(`/estadistica/cuadro-anual/${anio}`);
    
    console.log(`📡 EstadisticaJuecesApi: Cuadro anual ${anio} recibido:`, {
      success: response.success,
      anio: response.data?.anio,
      totalFilas: response.data?.total_filas || 0
    });
    
    return response;
  }
}

// Instancia singleton
export const estadisticaJuecesApi = new EstadisticaJuecesApi();
export default estadisticaJuecesApi;
