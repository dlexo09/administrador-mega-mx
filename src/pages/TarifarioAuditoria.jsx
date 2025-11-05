import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge, Button } from '@tremor/react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function TarifarioAuditoria() {
  const [auditoria, setAuditoria] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuditoria = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tarifarios/auditoria`);
        const data = await response.json();
        setAuditoria(data);
      } catch (error) {
        console.error("Error al cargar auditoría:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuditoria();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center py-12">
          <Text>Cargando historial...</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex items-center mb-6">
        <Link
          to="/tarifario/lista"
          className="mr-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Volver
        </Link>
        <div className="h-5 border-l border-gray-300"></div>
        <Text className="ml-4 text-gray-500">Historial de Auditoría</Text>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2">
        <div>
          <Title>Historial de Importaciones</Title>
          <Text className="text-gray-500">
            Registro de todas las importaciones de tarifarios
          </Text>
        </div>
        <Link
          to="/tarifario/importar"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-fit"
        >
          Nueva Importación
        </Link>
      </div>

      {auditoria.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay registros</h3>
          <p className="mt-1 text-sm text-gray-500">No se han realizado importaciones aún.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tabla Backup
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditoria.map((registro) => (
                <tr key={registro.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(registro.fecha)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color="blue" size="sm">
                      {registro.accion}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {registro.usuario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {registro.total_registros.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {registro.tabla_backup}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}