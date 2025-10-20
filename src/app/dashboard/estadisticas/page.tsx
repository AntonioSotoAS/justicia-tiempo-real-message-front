'use client';

import { useState, useEffect, useCallback } from 'react';
import { EstadisticasTable } from '@/components/estadisticas-table';
import { estadisticaJuecesApi, JuezConMetaResumen } from '@/lib/api/estadisticaJuecesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EstadisticasPage() {
  const [jueces, setJueces] = useState<JuezConMetaResumen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [estadisticas, setEstadisticas] = useState({
    totalJueces: 0,
    juecesConMeta: 0,
    promedioAvance: 0,
    juecesMuyBueno: 0,
    juecesBueno: 0,
    juecesRegular: 0
  });

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log(`📊 Cargando estadísticas para ${anio}/${mes}`);
      console.log(`🌐 URL utilizada: http://localhost:5002/jueces/con-meta-resumenes/${anio}/${mes}`);
      
      // Cargar jueces con meta resúmenes
      const response = await estadisticaJuecesApi.getJuecesConMetaResumenes(anio, mes);
      
      if (response.success && response.data) {
        setJueces(response.data);
        console.log(`✅ Cargados ${response.data.length} jueces`);
        
        // Console.log detallado de cada juez (sin IDs)
        console.log('📊 Datos de Jueces obtenidos:');
        response.data.forEach((juez, index) => {
          console.log(`👨‍⚖️ Juez ${index + 1}:`, {
            nombre: `${juez.x_nombres} ${juez.x_app_paterno} ${juez.x_app_materno}`,
            dni: juez.x_dni,
            email: juez.email,
            telefono: juez.x_telefono,
            username: juez.username,
            activo: juez.l_activo,
            tipoJuez: juez.x_juez_tipo_descripcion,
            sexo: juez.x_sexo_descripcion,
            instancia: juez.x_nom_instancia,
            avanceMeta: `${juez.m_avan_meta}%`,
            nivelProduccion: juez.x_niv_produc,
            metaPreliminar: juez.m_meta_preliminar,
            totalResuelto: juez.m_t_resuelto,
            nivelBueno: juez.m_niv_bueno,
            nivelMuyBueno: juez.m_niv_muy_bueno,
            tieneMetaResumen: juez.tiene_meta_resumen === 1 ? 'Sí' : 'No',
            mensaje: juez.l_mensaje === 1 ? 'Sí' : 'No',
            año: juez.n_anio_est,
            mes: juez.n_mes_est
          });
        });
        
        // Calcular estadísticas
        const totalJueces = response.data.length;
        const juecesConMeta = response.data.filter(j => j.tiene_meta_resumen === 1).length;
        const avances = response.data.map(j => parseFloat(j.m_avan_meta || '0'));
        const promedioAvance = avances.length > 0 ? avances.reduce((a, b) => a + b, 0) / avances.length : 0;
        
        const juecesMuyBueno = response.data.filter(j => j.x_niv_produc === 'MUY BUENO').length;
        const juecesBueno = response.data.filter(j => j.x_niv_produc === 'BUENO').length;
        const juecesRegular = response.data.filter(j => j.x_niv_produc === 'REGULAR').length;

        setEstadisticas({
          totalJueces,
          juecesConMeta,
          promedioAvance: Math.round(promedioAvance * 100) / 100,
          juecesMuyBueno,
          juecesBueno,
          juecesRegular
        });

        // Console.log de resumen de estadísticas
        console.log('📈 Resumen de Estadísticas:', {
          totalJueces,
          juecesConMeta,
          promedioAvance: Math.round(promedioAvance * 100) / 100,
          juecesMuyBueno,
          juecesBueno,
          juecesRegular
        });
      } else {
        console.error('❌ Error al cargar datos:', response.message);
        setJueces([]);
      }
    } catch (error) {
      console.error('🚨 Error al cargar estadísticas:', error);
      setJueces([]);
    } finally {
      setIsLoading(false);
    }
  }, [anio, mes]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleFiltrosChange = () => {
    cargarDatos();
  };

  return (
    <div className="flex flex-1 flex-col gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-6 min-h-0 overflow-auto">
      <div className="mb-2 sm:mb-3 lg:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Estadísticas de Jueces</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Análisis de rendimiento y metas de los jueces del sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-2 sm:p-3 lg:p-6 rounded-lg shadow mb-2 sm:mb-3 lg:mb-6">
        <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          <div>
            <Label htmlFor="anio">Año</Label>
            <Input
              id="anio"
              type="number"
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value))}
              min="2020"
              max="2030"
            />
          </div>
          <div>
            <Label htmlFor="mes">Mes</Label>
            <Input
              id="mes"
              type="number"
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              min="1"
              max="12"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <Button onClick={handleFiltrosChange} className="w-full">
              Actualizar Datos
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 mb-2 sm:mb-3 lg:mb-6">
        <div className="bg-white p-2 sm:p-3 lg:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">J</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Jueces</p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">{estadisticas.totalJueces}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-2 sm:p-3 lg:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">M</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Con Meta</p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">{estadisticas.juecesConMeta}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-2 sm:p-3 lg:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">%</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Promedio Avance</p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">{estadisticas.promedioAvance}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-2 sm:p-3 lg:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">★</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Muy Bueno</p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">{estadisticas.juecesMuyBueno}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Jueces */}
      <div className="bg-white rounded-lg shadow flex flex-col min-h-0">
        <div className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold">Lista de Jueces</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Mostrando {jueces.length} jueces para {mes}/{anio}
          </p>
        </div>
        <div className="p-1 sm:p-2 lg:p-6 flex-1 min-h-0 overflow-auto">
          <EstadisticasTable jueces={jueces} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
