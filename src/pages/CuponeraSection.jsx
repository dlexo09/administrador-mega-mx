import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { EyeIcon, PencilSquareIcon, PowerIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config";
import { getImageUrl } from "../lib/imageUtils";

export default function CuponeraSection() {
  const navigate = useNavigate();
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("IDCuponera");
  const [sortDir, setSortDir] = useState("asc");

  const PAGE_SIZE = 10;

  const fetchCupones = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/cuponera?all=true`)
      .then((res) => res.json())
      .then((data) => {
        setCupones(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching cupones:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCupones();
  }, []);

  const handleToggleStatus = async (cupon) => {
    const nuevoStatus = cupon.Status === 1 ? 0 : 1;
    try {
      setStatusLoadingId(cupon.IDCuponera);
      const response = await fetch(`${API_BASE_URL}/api/cuponera/${cupon.IDCuponera}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cupon, Status: nuevoStatus })
      });
      
      if (response.ok) {
        // Actualizar solo el cupón específico en el estado local
        setCupones(cupones.map(c =>
          c.IDCuponera === cupon.IDCuponera ? { ...c, Status: nuevoStatus } : c
        ));
        alert(`Cupón ${nuevoStatus === 1 ? "activado" : "desactivado"} correctamente`);
      } else {
        alert('Error al cambiar el estatus');
      }
    } catch (err) {
      console.error('Error cambiando estatus:', err);
      alert('Error al cambiar el estatus');
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleNuevoCupon = () => {
    navigate('/cuponera/nuevo');
  };

  // Filtro por nombre de cupón
  const filtered = cupones.filter((item) =>
    (item.NombreCupon || "").toLowerCase().includes(search.toLowerCase())
  );

  // Ordenamiento
  const sorted = [...filtered].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === "orden") {
      aValue = aValue === undefined || aValue === null ? 9999 : Number(aValue);
      bValue = bValue === undefined || bValue === null ? 9999 : Number(bValue);
    } else if (sortBy === "FechaInicio" || sortBy === "FechaFin") {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    } else {
      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();
    }
    if (aValue < bValue) return sortDir === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  // Paginación
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <div>
          <Title>Cuponera</Title>
          <Text className="text-gray-500">Administración de cupones</Text>
        </div>
        <Button color="blue" className="shadow" onClick={handleNuevoCupon}>+ Nuevo Cupón</Button>
      </div>
      <div className="mb-4">
        <TextInput
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="overflow-x-auto mt-2 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("IDCuponera")}>ID {sortBy === "IDCuponera" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("orden")}>Orden {sortBy === "orden" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("NombreCupon")}>Nombre {sortBy === "NombreCupon" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("FechaInicio")}>Inicio {sortBy === "FechaInicio" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("FechaFin")}>Fin {sortBy === "FechaFin" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("Status")}>Estatus {sortBy === "Status" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  <Text>Cargando...</Text>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  <Text>No hay cupones.</Text>
                </td>
              </tr>
            ) : (
              sorted
                .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                .map((item) => (
                  <tr key={item.IDCuponera} className="border-b hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-2">{item.IDCuponera}</td>
                    <td className="px-4 py-2">{item.orden}</td>
                    <td className="px-4 py-2">{item.NombreCupon}</td>
                    <td className="px-4 py-2">{item.FechaInicio ? new Date(item.FechaInicio).toLocaleString() : '-'}</td>
                    <td className="px-4 py-2">{item.FechaFin ? new Date(item.FechaFin).toLocaleString() : '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${item.Status === 1 ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}>
                        {item.Status === 1 ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td className="px-2 py-2 space-x-2 text-left">
                      <Link
                        to={`/cuponera/${item.IDCuponera}`}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-blue-100 transition"
                        title="Ver"
                      >
                        <EyeIcon className="w-4 h-4" />
                        Ver
                      </Link>
                      <button
                        onClick={() => navigate(`/cuponera/editar/${item.IDCuponera}`)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                        title="Editar"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition border-none focus:outline-none ${item.Status === 1 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        title={item.Status === 1 ? 'Desactivar' : 'Activar'}
                        onClick={() => handleToggleStatus(item)}
                        disabled={statusLoadingId === item.IDCuponera}
                      >
                        {statusLoadingId === item.IDCuponera ? (
                          <span className="animate-spin h-4 w-4 mr-1 border-b-2 border-blue-700 rounded-full"></span>
                        ) : (
                          <PowerIcon className="w-4 h-4" />
                        )}
                        {item.Status === 1 ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <Text>
          Página <span className="font-bold">{page}</span> de <span className="font-bold">{totalPages || 1}</span>
        </Text>
        <button
          className="px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          Siguiente
        </button>
      </div>
    </Card>
  );
}
