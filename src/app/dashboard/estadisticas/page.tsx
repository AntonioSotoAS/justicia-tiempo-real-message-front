'use client';

import { useState, useEffect, useCallback } from 'react';
import { estadisticaJuecesApi, CuadroAnualDto, FilaDto } from '@/lib/api/estadisticaJuecesApi';
import { solicitudesApi } from '@/lib/api/solicitudesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnviarMensajeDialog } from '@/components/enviar-mensaje-dialog';
import toast from 'react-hot-toast';

export default function EstadisticasPage() {
  const [cuadroAnual, setCuadroAnual] = useState<CuadroAnualDto | null>(null);
  const [filas, setFilas] = useState<FilaDto[]>([]);
  const [filasFiltradas, setFilasFiltradas] = useState<FilaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [filtroJuez, setFiltroJuez] = useState('');
  const [juecesSeleccionados, setJuecesSeleccionados] = useState<Set<string>>(new Set());
  const [ordenarSeleccionadosPrimero, setOrdenarSeleccionadosPrimero] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalFilas: 0,
    totalResoluciones: 0,
    totalIngresos: 0,
    promedioAvance: 0,
    filasMuyBueno: 0,
    filasBueno: 0,
    filasRegular: 0
  });
  const [mensajesEnviados, setMensajesEnviados] = useState(0);

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

  // Función para generar un ID único para cada juez
  const generarIdJuez = (filaIndex: number, juezIndex: number) => {
    return `${filaIndex}-${juezIndex}`;
  };

  // Función para verificar si un juez específico tiene mensaje
  const juezTieneMensaje = (juez: any) => {
    return juez.l_mensaje === true;
  };

  // Funciones para manejar selección de jueces individuales
  const toggleSeleccionJuez = (filaIndex: number, juezIndex: number) => {
    const fila = filasFiltradas[filaIndex];
    const juez = fila.jueces_objetos?.[juezIndex];
    
    if (!juez || !juezTieneMensaje(juez)) {
      return; // No permitir selección si el juez no tiene mensaje
    }
    
    const juezId = generarIdJuez(filaIndex, juezIndex);
    setJuecesSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(juezId)) {
        nuevo.delete(juezId);
      } else {
        nuevo.add(juezId);
      }
      return nuevo;
    });
  };

  const seleccionarTodos = () => {
    const nuevosJuecesSeleccionados = new Set<string>();
    
    filasFiltradas.forEach((fila, filaIndex) => {
      if (fila.jueces_objetos && fila.jueces_objetos.length > 0) {
        fila.jueces_objetos.forEach((juez, juezIndex) => {
          if (juezTieneMensaje(juez)) {
            const juezId = generarIdJuez(filaIndex, juezIndex);
            nuevosJuecesSeleccionados.add(juezId);
          }
        });
      }
    });
    
    setJuecesSeleccionados(nuevosJuecesSeleccionados);
  };

  const deseleccionarTodos = () => {
    setJuecesSeleccionados(new Set());
  };

  const handleEnviarMensaje = async (datos: {
    encuesta?: string;
    telefono?: string;
    whatsapp?: string;
    fechaEnvio?: string;
    horaEnvio?: string;
    fechaCorte?: string;
  }) => {
    const juecesSeleccionadosData: any[] = [];
    
    filasFiltradas.forEach((fila, filaIndex) => {
      if (fila.jueces_objetos && fila.jueces_objetos.length > 0) {
        fila.jueces_objetos.forEach((juez, juezIndex) => {
          const juezId = generarIdJuez(filaIndex, juezIndex);
          if (juecesSeleccionados.has(juezId)) {
            juecesSeleccionadosData.push({
              fila,
              juez,
              filaIndex,
              juezIndex
            });
          }
        });
      }
    });
    
    // Crear el JSON completo para envío
    const jsonEnvio = {
      mensaje: {
        encuesta: datos.encuesta,
        telefono: datos.telefono,
        whatsapp: datos.whatsapp,
        fechaEnvio: datos.fechaEnvio,
        horaEnvio: datos.horaEnvio,
        fechaCorte: datos.fechaCorte
      },
      jueces: juecesSeleccionadosData.map((item, index) => ({
        id: index + 1,
        fila: {
          org_jurisd: item.fila.org_jurisd,
          instancia: item.fila.instancia,
          modulo_nom: item.fila.modulo_nom,
          estandar: item.fila.estandar,
          meta_preliminar: item.fila.meta_preliminar,
          nivel_prod: item.fila.nivel_prod,
          carga_inicial: item.fila.carga_inicial,
          pct_real_avance: item.fila.pct_real_avance,
          pct_ideal_avance: item.fila.pct_ideal_avance,
          niv_bueno: item.fila.niv_bueno,
          niv_muy_bueno: item.fila.niv_muy_bueno,
          res_total: item.fila.res_total,
          ing_total: item.fila.ing_total
        },
        juez: {
          nombre_completo: item.juez.nombre_completo,
          telefono: item.juez.telefono,
          l_mensaje: item.juez.l_mensaje,
          sexo: item.juez.sexo
        },
        posicion: {
          filaIndex: item.filaIndex,
          juezIndex: item.juezIndex
        }
      })),
      metadata: {
        totalJueces: juecesSeleccionadosData.length,
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    };

    
    // Crear array de DTOs - un DTO por cada juez seleccionado
    const arrayDtos = juecesSeleccionadosData.map((item, index) => ({
      // Campos del mensaje (fijos para todos)
      encuesta: datos.encuesta,
      telefono: datos.telefono,
      whatsapp: datos.whatsapp,
      fechaEnvio: datos.fechaEnvio,
      horaEnvio: datos.horaEnvio,
      fechaCorte: datos.fechaCorte,
      // Resoluciones se toman automáticamente de la tabla (res_total de cada fila)
      resoluciones: item.fila.res_total.toString(),
      // Campos de jueces (específicos de cada juez)
      instancia: item.fila.instancia,
      modulo_nom: item.fila.modulo_nom,
      meta_preliminar: item.fila.meta_preliminar,
      nivel_prod: item.fila.nivel_prod,
      pct_real_avance: item.fila.pct_real_avance,
      niv_bueno: item.fila.niv_bueno,
      niv_muy_bueno: item.fila.niv_muy_bueno,
      // Campos del juez (específicos de cada juez)
      nombre_completo: item.juez.nombre_completo,
      telefono_juez: item.juez.telefono,
      l_mensaje: item.juez.l_mensaje,
      sexo: item.juez.sexo,
      estado: 'PENDIENTE', // Valor por defecto
      prioridad: 'MEDIA' // Valor por defecto
    }));

    console.log('📤 ===== ENVIANDO SOLICITUDES AL BACKEND =====');
    console.log('📦 Array de DTOs:', arrayDtos);
    
    // Enviar las solicitudes al backend
    try {
      const resultado = await solicitudesApi.createMultipleSolicitudes(arrayDtos);
      
      if (resultado.success) {
        console.log('✅ Solicitudes enviadas exitosamente:', resultado);
        setMensajesEnviados(prev => prev + resultado.totalExitosos);
        
        // Mostrar toast de éxito
        toast.success(`✅ Se enviaron ${resultado.totalExitosos} de ${resultado.totalEnviados} solicitudes exitosamente`, {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '500'
          }
        });
      } else {
        console.error('❌ Error al enviar solicitudes:', resultado);
        toast.error(`❌ Error al enviar solicitudes. ${resultado.totalFallidos} solicitudes fallaron.`, {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#fff',
            fontWeight: '500'
          }
        });
      }
    } catch (error) {
      console.error('🚨 Error general al enviar solicitudes:', error);
      toast.error('❌ Error inesperado al enviar solicitudes', {
        duration: 5000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: '500'
        }
      });
    }
    
    setJuecesSeleccionados(new Set());
  };

  // Función para ordenar las filas (seleccionadas primero si está activado)
  const obtenerFilasOrdenadas = useCallback(() => {
    if (!ordenarSeleccionadosPrimero) {
      return filasFiltradas;
    }
    
    return [...filasFiltradas].sort((a, b) => {
      const indexA = filasFiltradas.indexOf(a);
      const indexB = filasFiltradas.indexOf(b);
      
      // Verificar si alguna fila tiene jueces seleccionados
      const tieneJuecesSeleccionadosA = a.jueces_objetos?.some((_, juezIndex) => 
        juecesSeleccionados.has(generarIdJuez(indexA, juezIndex))
      ) || false;
      
      const tieneJuecesSeleccionadosB = b.jueces_objetos?.some((_, juezIndex) => 
        juecesSeleccionados.has(generarIdJuez(indexB, juezIndex))
      ) || false;
      
      if (tieneJuecesSeleccionadosA && !tieneJuecesSeleccionadosB) return -1;
      if (!tieneJuecesSeleccionadosA && tieneJuecesSeleccionadosB) return 1;
      return 0;
    });
  }, [filasFiltradas, juecesSeleccionados, ordenarSeleccionadosPrimero]);

  // Función para obtener el índice original de una fila ordenada
  const obtenerIndiceOriginal = useCallback((fila: FilaDto) => {
    return filasFiltradas.indexOf(fila);
  }, [filasFiltradas]);

  const toggleOrdenarSeleccionados = () => {
    setOrdenarSeleccionadosPrimero(!ordenarSeleccionadosPrimero);
  };

  // Contar solo los jueces seleccionados que tienen mensaje
  const juecesSeleccionadosConMensaje = Array.from(juecesSeleccionados).length;

  return (
    <div className="flex flex-1 flex-col gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-6 min-h-0">
      <div className="mb-2 sm:mb-3 lg:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Estadísticas de Jueces</h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">Análisis de rendimiento y metas de los jueces del sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-2 sm:p-3 lg:p-6 rounded-lg shadow mb-2 sm:mb-3 lg:mb-6 flex-shrink-0">
        <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
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
          <div className="flex items-end">
            <Button onClick={handleFiltrosChange} className="w-full">
              Actualizar Datos
            </Button>
          </div>
        </div>
      </div>


      {/* Tabla del Cuadro Anual */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 min-w-0">
            <div>
              <h2 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold">Cuadro Anual de Estadísticas</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Mostrando {filasFiltradas.length} de {filas.length} filas para {mes}/{anio}
                {filtroJuez && (
                  <span className="ml-2 text-blue-600">
                    • Filtrado por: &quot;{filtroJuez}&quot;
                  </span>
                )}
                {cuadroAnual && (
                  <span className="ml-2">
                    • Fecha consulta: {new Date(cuadroAnual.fecha_consulta).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2 min-w-0 flex-wrap">
              <div className="flex-1 sm:flex-none sm:w-64 min-w-0">
                <Input
                  type="text"
                  placeholder="Filtrar por juez..."
                  value={filtroJuez}
                  onChange={handleFiltroJuezChange}
                  className="w-full min-w-0"
                />
              </div>
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
              <Button 
                onClick={seleccionarTodos}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                Seleccionar Todos
              </Button>
              <Button 
                onClick={deseleccionarTodos}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                Deseleccionar
              </Button>
              <EnviarMensajeDialog
                juecesSeleccionados={juecesSeleccionadosConMensaje}
                onEnviarMensaje={handleEnviarMensaje}
              />
            </div>
          </div>
        </div>
        <div className="p-1 sm:p-2 lg:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando cuadro anual...</span>
            </div>
          ) : filasFiltradas.length > 0 ? (
            <>
              {/* Vista de Cards para móviles */}
              <div className="block md:hidden space-y-4">
                {obtenerFilasOrdenadas().map((fila, index) => {
                  const indexOriginal = obtenerIndiceOriginal(fila);
                  return (
                  <div key={index} className="rounded-lg p-4 border bg-gray-50 border-gray-200">
                    <div className="space-y-3">
                      
                      {/* Instancia */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">INSTANCIA</div>
                        <div className="font-medium text-gray-900">{fila.instancia}</div>
                        <div className="text-xs text-gray-500">{fila.org_jurisd}</div>
                      </div>

                      {/* Jueces */}
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">JUECES</div>
                        <div className="space-y-1">
                          {fila.jueces_objetos && fila.jueces_objetos.length > 0 ? (
                            fila.jueces_objetos.map((juez, juezIndex) => {
                              const juezId = generarIdJuez(indexOriginal, juezIndex);
                              const juezSeleccionado = juecesSeleccionados.has(juezId);
                              const puedeSeleccionar = juezTieneMensaje(juez);
                              
                              return (
                                <div key={juezIndex} className={`bg-white p-2 rounded border ${
                                  juezSeleccionado ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}>
                                  <div className="flex items-start gap-2">
                                    <input
                                      type="checkbox"
                                      checked={juezSeleccionado}
                                      onChange={() => toggleSeleccionJuez(indexOriginal, juezIndex)}
                                      disabled={!puedeSeleccionar}
                                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 ${
                                        !puedeSeleccionar ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 text-sm">
                                        {juez.nombre_completo.toUpperCase()}
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        📞 {juez.telefono}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                          juez.l_mensaje ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                          {juez.l_mensaje ? 'SÍ' : 'NO'}
                                        </span>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                          juez.sexo === 'MASCULINO' ? 'bg-blue-100 text-blue-800' : 
                                          juez.sexo === 'FEMENINO' ? 'bg-pink-100 text-pink-800' : 
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {juez.sexo.toUpperCase()}
                                        </span>
                                        {!puedeSeleccionar && (
                                          <span className="text-xs text-gray-400">
                                            (No seleccionable)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-sm text-gray-500">
                              {String(fila.jueces).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Métricas principales */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded border">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">RESOLUCIONES</div>
                          <div className="text-lg font-semibold text-green-600">{fila.res_total.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">INGRESOS</div>
                          <div className="text-lg font-semibold text-blue-600">{fila.ing_total.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Avance y nivel */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded border">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">AVANCE REAL</div>
                          <div className={`text-lg font-semibold ${
                            fila.pct_real_avance >= 100 ? 'text-green-600' : 
                            fila.pct_real_avance >= 80 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {fila.pct_real_avance.toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">NIVEL</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            fila.nivel_prod === 'MUY BUENO' ? 'bg-green-100 text-green-800' :
                            fila.nivel_prod === 'BUENO' ? 'bg-blue-100 text-blue-800' :
                            fila.nivel_prod === 'REGULAR' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {fila.nivel_prod}
                          </span>
                        </div>
                      </div>

                      {/* Metas */}
                      <div className="bg-white p-3 rounded border">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">METAS</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-gray-500">Preliminar</div>
                            <div className="font-medium">{fila.meta_preliminar.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Bueno</div>
                            <div className="font-medium">{fila.niv_bueno.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Muy Bueno</div>
                            <div className="font-medium">{fila.niv_muy_bueno.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Vista de tabla para tablets y desktop */}
              <div className="hidden md:block overflow-x-auto min-w-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        onClick={toggleOrdenarSeleccionados}
                        title={ordenarSeleccionadosPrimero ? "Mostrar orden normal" : "Mostrar seleccionados primero"}
                      >
                        <div className="flex items-center gap-1">
                          SELECCIÓN
                          {ordenarSeleccionadosPrimero ? (
                            <span className="text-blue-600">↑</span>
                          ) : (
                            <span className="text-gray-400">↓</span>
                          )}
                        </div>
                      </th>
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
                    {obtenerFilasOrdenadas().map((fila, index) => {
                      const indexOriginal = obtenerIndiceOriginal(fila);
                      return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            {fila.jueces_objetos && fila.jueces_objetos.length > 0 ? (
                              fila.jueces_objetos.map((juez, juezIndex) => {
                                const juezId = generarIdJuez(indexOriginal, juezIndex);
                                const juezSeleccionado = juecesSeleccionados.has(juezId);
                                const puedeSeleccionar = juezTieneMensaje(juez);
                                
                                return (
                                  <div key={juezIndex} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={juezSeleccionado}
                                      onChange={() => toggleSeleccionJuez(indexOriginal, juezIndex)}
                                      disabled={!puedeSeleccionar}
                                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                                        !puedeSeleccionar ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                    />
                                    <span className={`text-xs ${
                                      !puedeSeleccionar ? 'text-gray-400' : 'text-gray-700'
                                    }`}>
                                      {!puedeSeleccionar ? 'No disponible' : 'Seleccionar'}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-xs text-gray-400">-</div>
                            )}
                          </div>
                        </td>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              {filtroJuez ? (
                <div>
                  <p className="text-gray-500">No se encontraron jueces que coincidan con &quot;{filtroJuez}&quot;</p>
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
