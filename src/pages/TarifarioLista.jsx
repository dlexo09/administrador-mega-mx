import React, { useState, useEffect } from 'react';
import { Card, Title, Text, TextInput, Badge, Button } from '@tremor/react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const PAGE_SIZE = 20;

export default function TarifarioLista() {
  const [tarifarios, setTarifarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("idSucursal");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    const loadTarifarios = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/tarifarios`);
        const data = await response.json();
        setTarifarios(data);
      } catch (error) {
        console.error("Error al cargar tarifarios:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTarifarios();
  }, []);

  // Filtrar y ordenar
  const filtered = tarifarios.filter((item) =>
    item.velocidadInternet?.toLowerCase().includes(search.toLowerCase()) ||
    item.idSucursal.toString().includes(search) ||
    item.precioPromoPaquete.toString().includes(search)
  );

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortDir === "asc") {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const paginatedData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortIcon = (col) =>
    sortBy === col ? (sortDir === "asc" ? "▲" : "▼") : "⇅";

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center py-12">
          <Text>Cargando tarifarios...</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <div>
          <Title>Tarifarios</Title>
          <Text className="text-gray-500">
            Gestión de tarifarios y precios
          </Text>
        </div>
        <Link
          to="/tarifario/importar"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-fit"
        >
          <PlusIcon className="w-4 h-4" />
          Importar CSV
        </Link>
      </div>

      <div className="flex items-center gap-4 mt-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <TextInput
            placeholder="Buscar tarifarios..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Text className="text-gray-500">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </Text>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("idSucursal")}
              >
                Sucursal {sortIcon("idSucursal")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("idTipoPaquete")}
              >
                Tipo Paquete {sortIcon("idTipoPaquete")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Velocidad Internet
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("precioPromoPaquete")}
              >
                Precio Promo {sortIcon("precioPromoPaquete")}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("precioNormalPaquete")}
              >
                Precio Normal {sortIcon("precioNormalPaquete")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((tarifario) => (
              <tr key={tarifario.idTarifario} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tarifario.idSucursal}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tarifario.idTipoPaquete}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {tarifario.velocidadInternet}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  ${tarifario.precioPromoPaquete}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${tarifario.precioNormalPaquete}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge color={tarifario.status === 1 ? "emerald" : "red"} size="sm">
                    {tarifario.status === 1 ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <Text className="text-sm text-gray-700">
            Mostrando {(page - 1) * PAGE_SIZE + 1} a{" "}
            {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} resultados
          </Text>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="px-3 py-2 text-sm">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}