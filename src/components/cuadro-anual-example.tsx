'use client';

import { useState, useEffect } from 'react';
import { estadisticaJuecesApi, CuadroAnualDto, FilaDto } from '@/lib/api/estadisticaJuecesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CuadroAnualExample() {
  const [cuadroAnual, setCuadroAnual] = useState<CuadroAnualDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  // Cargar cuadro anual actual al montar el componente
  useEffect(() => {
    cargarCuadroAnualActual();
  }, []);

  const cargarCuadroAnualActual = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Cargando cuadro anual actual...');
      const response = await estadisticaJuecesApi.getCuadroAnualActual();
      
      if (response.success && response.data) {
        setCuadroAnual(response.data);
        console.log('✅ Cuadro anual actual cargado:', response.data);
      }
    } catch (error) {
      console.error('❌ Error al cargar cuadro anual actual:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarCuadroAnualConFiltros = async () => {
    setIsLoading(true);
    try {
      console.log(`📊 Cargando cuadro anual para ${anio}/${mes}...`);
      const response = await estadisticaJuecesApi.getCuadroAnual(anio, mes);
      
      if (response.success && response.data) {
        setCuadroAnual(response.data);
        console.log('✅ Cuadro anual cargado:', response.data);
      }
    } catch (error) {
      console.error('❌ Error al cargar cuadro anual:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarCuadroAnualPorAño = async (año: number) => {
    setIsLoading(true);
    try {
      console.log(`📊 Cargando cuadro anual para año ${año}...`);
      const response = await estadisticaJuecesApi.getCuadroAnualByYear(año);
      
      if (response.success && response.data) {
        setCuadroAnual(response.data);
        console.log('✅ Cuadro anual por año cargado:', response.data);
      }
    } catch (error) {
      console.error('❌ Error al cargar cuadro anual por año:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFila = (fila: FilaDto, index: number) => (
    <div key={index} className="border-b p-4 hover:bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-900">{fila.org_jurisd}</h4>
          <p className="text-xs text-gray-600">{fila.instancia}</p>
          <p className="text-xs text-gray-500">{fila.jueces}</p>
        </div>
        
        <div className="text-sm">
          <div className="flex justify-between">
            <span>Estandar:</span>
            <span className="font-medium">{fila.estandar}</span>
          </div>
          <div className="flex justify-between">
            <span>Meta Preliminar:</span>
            <span className="font-medium">{fila.meta_preliminar}</span>
          </div>
          <div className="flex justify-between">
            <span>Carga Inicial:</span>
            <span className="font-medium">{fila.carga_inicial}</span>
          </div>
        </div>
        
        <div className="text-sm">
          <div className="flex justify-between">
            <span>Avance Real:</span>
            <span className={`font-medium ${fila.pct_real_avance >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {fila.pct_real_avance.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Avance Ideal:</span>
            <span className="font-medium">{fila.pct_ideal_avance.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Nivel:</span>
            <span className={`font-medium ${
              fila.nivel_prod === 'MUY BUENO' ? 'text-green-600' :
              fila.nivel_prod === 'BUENO' ? 'text-blue-600' :
              'text-orange-600'
            }`}>
              {fila.nivel_prod}
            </span>
          </div>
        </div>
        
        <div className="text-sm">
          <div className="flex justify-between">
            <span>Resoluciones:</span>
            <span className="font-medium text-green-600">{fila.res_total}</span>
          </div>
          <div className="flex justify-between">
            <span>Ingresos:</span>
            <span className="font-medium text-blue-600">{fila.ing_total}</span>
          </div>
          <div className="flex justify-between">
            <span>Módulo:</span>
            <span className="font-medium text-xs">{fila.modulo_nom}</span>
          </div>
        </div>
      </div>
      
      {/* Celdas de resolución e ingreso */}
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <h5 className="text-xs font-semibold text-gray-700 mb-2">Resoluciones por Mes</h5>
          <div className="flex flex-wrap gap-1">
            {fila.res_cells.map((cell, cellIndex) => (
              <span
                key={cellIndex}
                className={`text-xs px-2 py-1 rounded ${
                  cell.cls === 'excelente' ? 'bg-green-100 text-green-800' :
                  cell.cls === 'bueno' ? 'bg-blue-100 text-blue-800' :
                  cell.cls === 'regular' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}
                title={`${cell.nivel}: ${cell.val}`}
              >
                {cell.val}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <h5 className="text-xs font-semibold text-gray-700 mb-2">Ingresos por Mes</h5>
          <div className="flex flex-wrap gap-1">
            {fila.ing_cells.map((cell, cellIndex) => (
              <span
                key={cellIndex}
                className={`text-xs px-2 py-1 rounded ${
                  cell.cls === 'excelente' ? 'bg-green-100 text-green-800' :
                  cell.cls === 'bueno' ? 'bg-blue-100 text-blue-800' :
                  cell.cls === 'regular' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}
                title={`${cell.nivel}: ${cell.val}`}
              >
                {cell.val}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Cuadro Anual de Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              onClick={cargarCuadroAnualActual}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Cargando...' : 'Cargar Actual'}
            </Button>
            
            <div className="flex gap-2">
              <div>
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(parseInt(e.target.value))}
                  className="w-20"
                />
              </div>
              <div>
                <Label htmlFor="mes">Mes</Label>
                <Input
                  id="mes"
                  type="number"
                  min="1"
                  max="12"
                  value={mes}
                  onChange={(e) => setMes(parseInt(e.target.value))}
                  className="w-20"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={cargarCuadroAnualConFiltros}
                  disabled={isLoading}
                >
                  Cargar
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => cargarCuadroAnualPorAño(2023)}
                disabled={isLoading}
                variant="secondary"
              >
                2023
              </Button>
              <Button 
                onClick={() => cargarCuadroAnualPorAño(2024)}
                disabled={isLoading}
                variant="secondary"
              >
                2024
              </Button>
            </div>
          </div>

          {cuadroAnual && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  Cuadro Anual {cuadroAnual.anio}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mes Actual:</span>
                    <span className="ml-2 font-medium">{cuadroAnual.mes_actual}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Filas:</span>
                    <span className="ml-2 font-medium">{cuadroAnual.total_filas}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha Consulta:</span>
                    <span className="ml-2 font-medium">{cuadroAnual.fecha_consulta}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Meses:</span>
                    <span className="ml-2 font-medium">{cuadroAnual.meses.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Filas de Datos ({cuadroAnual.filas.length})</h4>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  {cuadroAnual.filas.map((fila, index) => renderFila(fila, index))}
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando cuadro anual...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
