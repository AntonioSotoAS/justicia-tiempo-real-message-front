'use client';

import { useState } from 'react';
import { JuezConMetaResumen } from '@/lib/api/estadisticaJuecesApi';

interface EstadisticasTableProps {
  jueces: JuezConMetaResumen[];
  isLoading?: boolean;
}

export function EstadisticasTable({ jueces, isLoading = false }: EstadisticasTableProps) {
  const [sortField, setSortField] = useState<keyof JuezConMetaResumen>('x_nombres');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof JuezConMetaResumen) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedJueces = [...jueces].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // Detectar jueces duplicados
  const duplicateIds = sortedJueces.reduce((acc, juez, index) => {
    if (acc[juez.n_id_juez]) {
      acc[juez.n_id_juez].push(index);
    } else {
      acc[juez.n_id_juez] = [index];
    }
    return acc;
  }, {} as Record<number, number[]>);

  const duplicates = Object.entries(duplicateIds).filter(([, indices]) => indices.length > 1);
  if (duplicates.length > 0) {
    console.warn('⚠️ Jueces duplicados encontrados:', duplicates.map(([id, indices]) => 
      `ID ${id} aparece en posiciones: ${indices.join(', ')}`
    ));
  }

  const getAvanceColor = (avance: string | null) => {
    if (!avance) return 'text-gray-600 bg-gray-50';
    const numAvance = parseFloat(avance);
    if (numAvance >= 100) return 'text-green-600 bg-green-50';
    if (numAvance >= 80) return 'text-blue-600 bg-blue-50';
    if (numAvance >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getNivelColor = (nivel: string | null) => {
    if (!nivel) return 'text-gray-600 bg-gray-50';
    switch (nivel) {
      case 'MUY BUENO':
        return 'text-green-600 bg-green-50';
      case 'BUENO':
        return 'text-blue-600 bg-blue-50';
      case 'REGULAR':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className="overflow-y-auto shadow-sm h-full">
        <table className="w-full bg-white border border-gray-200 rounded-lg table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="w-1/4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('x_nombres')}
            >
              Juez {sortField === 'x_nombres' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="hidden md:table-cell w-1/4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('x_nom_instancia')}
            >
              Instancia {sortField === 'x_nom_instancia' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="hidden lg:table-cell w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('x_juez_tipo_descripcion')}
            >
              Tipo {sortField === 'x_juez_tipo_descripcion' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="hidden lg:table-cell w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('x_sexo_descripcion')}
            >
              Sexo {sortField === 'x_sexo_descripcion' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('m_avan_meta')}
            >
              Avance {sortField === 'm_avan_meta' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('x_niv_produc')}
            >
              Nivel {sortField === 'x_niv_produc' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedJueces.map((juez, index) => (
            <tr key={`${juez.n_id_juez}-${index}`} className="hover:bg-gray-50">
              <td className="w-1/4 px-3 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8">
                    <img
                      className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                      src={juez.profile_image || '/default-avatar.png'}
                      alt={`${juez.x_nombres} ${juez.x_app_paterno}`}
                    />
                  </div>
                  <div className="ml-2 min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {juez.x_nombres} {juez.x_app_paterno} {juez.x_app_materno}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      DNI: {juez.x_dni}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {juez.email}
                    </div>
                    {/* Mostrar instancia en móvil */}
                    <div className="md:hidden text-xs text-gray-400 truncate" title={juez.x_nom_instancia}>
                      {juez.x_nom_instancia}
                    </div>
                  </div>
                </div>
              </td>
              <td className="hidden md:table-cell w-1/4 px-3 py-4 text-xs sm:text-sm text-gray-900">
                <div className="truncate" title={juez.x_nom_instancia}>
                  {juez.x_nom_instancia}
                </div>
              </td>
              <td className="hidden lg:table-cell w-1/6 px-3 py-4 text-xs sm:text-sm text-gray-900">
                <div className="truncate">
                  {juez.x_juez_tipo_descripcion}
                </div>
              </td>
              <td className="hidden lg:table-cell w-1/6 px-3 py-4 text-xs sm:text-sm text-gray-900">
                <div className="truncate">
                  {juez.x_sexo_descripcion}
                </div>
              </td>
              <td className="w-1/6 px-3 py-4">
                {juez.m_avan_meta ? (
                  <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${getAvanceColor(juez.m_avan_meta)}`}>
                    {juez.m_avan_meta}%
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Sin datos</span>
                )}
              </td>
              <td className="w-1/6 px-3 py-4">
                {juez.x_niv_produc ? (
                  <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${getNivelColor(juez.x_niv_produc)}`}>
                    {juez.x_niv_produc}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Sin datos</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      
      {jueces.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron jueces con los filtros aplicados</p>
        </div>
      )}
    </div>
  );
}
