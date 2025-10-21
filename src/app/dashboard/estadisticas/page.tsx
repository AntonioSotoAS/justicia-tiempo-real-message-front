'use client';

import { useState, useEffect, useCallback } from 'react';
import { EstadisticasTable } from '@/components/estadisticas-table';
import { estadisticaJuecesApi, CuadroAnualDto, FilaDto } from '@/lib/api/estadisticaJuecesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EstadisticasPage() {
  const [cuadroAnual, setCuadroAnual] = useState<CuadroAnualDto | null>(null);
  const [filas, setFilas] = useState<FilaDto[]>([]);
  const [filasFiltradas, setFilasFiltradas] = useState<FilaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [filtroJuez, setFiltroJuez] = useState('');
  const [estadisticas, setEstadisticas] = useState({
    totalFilas: 0,
    totalResoluciones: 0,
    totalIngresos: 0,
    promedioAvance: 0,
    filasMuyBueno: 0,
    filasBueno: 0,
    filasRegular: 0
  });

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log(`📊 Cargando cuadro anual para ${anio}/${mes}`);
      console.log(`🌐 URL utilizada: http://localhost:5002/estadistica/cuadro-anual?year=${anio}&month=${mes}`);
      
      // Cargar cuadro anual
      const response = await estadisticaJuecesApi.getCuadroAnual(anio, mes);
      
      if (response.success && response.data) {
        setCuadroAnual(response.data);
        setFilas(response.data.filas);
        setFilasFiltradas(response.data.filas);
        console.log(`✅ Cargado cuadro anual con ${response.data.filas.length} filas`);
        
        // Console.log detallado de cada fila
        console.log('📊 Datos del Cuadro Anual obtenidos:');
        response.data.filas.forEach((fila, index) => {
          console.log(`📋 Fila ${index + 1}:`, {
            organizacion: fila.org_jurisd,
            instancia: fila.instancia,
            jueces: fila.jueces,
            juecesObjetos: fila.jueces_objetos?.map(juez => ({
              nombre: juez.nombre_completo,
              telefono: juez.telefono,
              mensaje: juez.l_mensaje,
              sexo: juez.sexo
            })) || [],
            resoluciones: fila.res_total,
            ingresos: fila.ing_total,
            metaPreliminar: fila.meta_preliminar,
            avanceReal: `${fila.pct_real_avance}%`,
            nivelProduccion: fila.nivel_prod,
            nivelBueno: fila.niv_bueno,
            nivelMuyBueno: fila.niv_muy_bueno,
            modulo: fila.modulo_nom
          });
        });
        
        // Calcular estadísticas del cuadro anual
        const totalFilas = response.data.filas.length;
        const totalResoluciones = response.data.filas.reduce((sum, fila) => sum + fila.res_total, 0);
        const totalIngresos = response.data.filas.reduce((sum, fila) => sum + fila.ing_total, 0);
        const avances = response.data.filas.map(fila => fila.pct_real_avance);
        const promedioAvance = avances.length > 0 ? avances.reduce((a, b) => a + b, 0) / avances.length : 0;
        
        const filasMuyBueno = response.data.filas.filter(fila => fila.nivel_prod === 'MUY BUENO').length;
        const filasBueno = response.data.filas.filter(fila => fila.nivel_prod === 'BUENO').length;
        const filasRegular = response.data.filas.filter(fila => fila.nivel_prod === 'REGULAR').length;

        setEstadisticas({
          totalFilas,
          totalResoluciones,
          totalIngresos,
          promedioAvance: Math.round(promedioAvance * 100) / 100,
          filasMuyBueno,
          filasBueno,
          filasRegular
        });

        // Console.log de resumen de estadísticas
        console.log('📈 Resumen de Estadísticas del Cuadro Anual:', {
          totalFilas,
          totalResoluciones,
          totalIngresos,
          promedioAvance: Math.round(promedioAvance * 100) / 100,
          filasMuyBueno,
          filasBueno,
          filasRegular
        });
      } else {
        console.error('❌ Error al cargar cuadro anual:', response.message);
        setFilas([]);
        setCuadroAnual(null);
      }
    } catch (error) {
      console.error('🚨 Error al cargar cuadro anual:', error);
      setFilas([]);
      setCuadroAnual(null);
    } finally {
      setIsLoading(false);
    }
  }, [anio, mes]);

  // Función para filtrar por juez
  const filtrarPorJuez = useCallback((filas: FilaDto[], filtro: string) => {
    if (!filtro.trim()) {
      return filas;
    }
    
    return filas.filter(fila => {
      // Buscar en el string de jueces
      if (fila.jueces.toLowerCase().includes(filtro.toLowerCase())) {
        return true;
      }
      
      // Buscar en los objetos de jueces
      if (fila.jueces_objetos && fila.jueces_objetos.length > 0) {
        return fila.jueces_objetos.some(juez => 
          juez.nombre_completo.toLowerCase().includes(filtro.toLowerCase())
        );
      }
      
      return false;
    });
  }, []);

  // Aplicar filtro cuando cambie el filtroJuez
  useEffect(() => {
    const filasFiltradas = filtrarPorJuez(filas, filtroJuez);
    setFilasFiltradas(filasFiltradas);
    
    // Recalcular estadísticas con las filas filtradas
    const totalFilas = filasFiltradas.length;
    const totalResoluciones = filasFiltradas.reduce((sum, fila) => sum + fila.res_total, 0);
    const totalIngresos = filasFiltradas.reduce((sum, fila) => sum + fila.ing_total, 0);
    const avances = filasFiltradas.map(fila => fila.pct_real_avance);
    const promedioAvance = avances.length > 0 ? avances.reduce((a, b) => a + b, 0) / avances.length : 0;
    
    const filasMuyBueno = filasFiltradas.filter(fila => fila.nivel_prod === 'MUY BUENO').length;
    const filasBueno = filasFiltradas.filter(fila => fila.nivel_prod === 'BUENO').length;
    const filasRegular = filasFiltradas.filter(fila => fila.nivel_prod === 'REGULAR').length;

    setEstadisticas({
      totalFilas,
      totalResoluciones,
      totalIngresos,
      promedioAvance: Math.round(promedioAvance * 100) / 100,
      filasMuyBueno,
      filasBueno,
      filasRegular
    });
  }, [filas, filtroJuez, filtrarPorJuez]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleFiltrosChange = () => {
    cargarDatos();
  };

  const handleFiltroJuezChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroJuez(e.target.value);
  };

  const limpiarFiltroJuez = () => {
    setFiltroJuez('');
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
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
          <div>
            <Label htmlFor="filtroJuez">Filtrar por Juez</Label>
            <div className="flex gap-2">
              <Input
                id="filtroJuez"
                type="text"
                placeholder="Nombre del juez..."
                value={filtroJuez}
                onChange={handleFiltroJuezChange}
                className="flex-1"
              />
              {filtroJuez && (
                <Button 
                  onClick={limpiarFiltroJuez}
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  ✕
                </Button>
              )}
            </div>
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
                <span className="text-white text-xs sm:text-sm font-bold">F</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Filas</p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">{estadisticas.totalFilas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-2 sm:p-3 lg:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-bold">R</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Resoluciones</p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">{estadisticas.totalResoluciones}</p>
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
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-900">{estadisticas.filasMuyBueno}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla del Cuadro Anual */}
      <div className="bg-white rounded-lg shadow flex flex-col min-h-0">
        <div className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold">Cuadro Anual de Estadísticas</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Mostrando {filasFiltradas.length} de {filas.length} filas para {mes}/{anio}
            {filtroJuez && (
              <span className="ml-2 text-blue-600">
                • Filtrado por: "{filtroJuez}"
              </span>
            )}
            {cuadroAnual && (
              <span className="ml-2">
                • Fecha consulta: {new Date(cuadroAnual.fecha_consulta).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <div className="p-1 sm:p-2 lg:p-6 flex-1 min-h-0 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando cuadro anual...</span>
            </div>
          ) : filasFiltradas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INSTANCIA</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JUECES</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NUMEROS</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MENSAJE</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SEXO</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RESOLUCIONES</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">INGRESOS</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">META PRELIMINAR</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AVANCE REAL</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIVEL</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIVEL BUENO</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIVEL MUY BUENO</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filasFiltradas.map((fila, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{fila.instancia}</div>
                          <div className="text-xs text-gray-500">{fila.org_jurisd}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {fila.jueces_objetos && fila.jueces_objetos.length > 0 ? (
                            fila.jueces_objetos.map((juez, juezIndex) => (
                              <div key={juezIndex} className="text-xs">
                                <div className="font-medium text-gray-900">
                                  {juez.nombre_completo.toUpperCase()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500">
                              {String(fila.jueces).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {fila.jueces_objetos && fila.jueces_objetos.length > 0 ? (
                            fila.jueces_objetos.map((juez, juezIndex) => (
                              <div key={juezIndex} className="text-xs text-gray-600">
                                {juez.telefono}
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {fila.jueces_objetos && fila.jueces_objetos.length > 0 ? (
                            fila.jueces_objetos.map((juez, juezIndex) => (
                              <div key={juezIndex} className="text-xs">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  juez.l_mensaje ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {juez.l_mensaje ? 'SÍ' : 'NO'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {fila.jueces_objetos && fila.jueces_objetos.length > 0 ? (
                            fila.jueces_objetos.map((juez, juezIndex) => (
                              <div key={juezIndex} className="text-xs">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  juez.sexo === 'MASCULINO' ? 'bg-blue-100 text-blue-800' : 
                                  juez.sexo === 'FEMENINO' ? 'bg-pink-100 text-pink-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {juez.sexo.toUpperCase()}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-600">
                        {fila.res_total.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                        {fila.ing_total.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {fila.meta_preliminar.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className={`font-medium ${
                          fila.pct_real_avance >= 100 ? 'text-green-600' : 
                          fila.pct_real_avance >= 80 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {fila.pct_real_avance.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          fila.nivel_prod === 'MUY BUENO' ? 'bg-green-100 text-green-800' :
                          fila.nivel_prod === 'BUENO' ? 'bg-blue-100 text-blue-800' :
                          fila.nivel_prod === 'REGULAR' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {fila.nivel_prod}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {fila.niv_bueno.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {fila.niv_muy_bueno.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              {filtroJuez ? (
                <div>
                  <p className="text-gray-500">No se encontraron jueces que coincidan con "{filtroJuez}"</p>
                  <Button 
                    onClick={limpiarFiltroJuez}
                    variant="outline"
                    className="mt-2"
                  >
                    Limpiar filtro
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">No hay datos disponibles para el período seleccionado</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
