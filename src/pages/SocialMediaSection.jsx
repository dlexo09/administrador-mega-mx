import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { EyeIcon, PencilSquareIcon, PowerIcon, PlusIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config";

export default function SocialMediaSection() {
  const navigate = useNavigate();
  const [redesSociales, setRedesSociales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [sortBy, setSortBy] = useState("idSocialMedia");
  const [sortDir, setSortDir] = useState("asc");

  const fetchRedesSociales = () => {
    setLoading(true);
  // console.log('Fetching from:', `${API_BASE_URL}/api/redesSociales`);
  fetch(`${API_BASE_URL}/api/redesSociales`)
      .then((res) => {
  // console.log('Response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {

        setRedesSociales(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching redes sociales:', err);
        alert(`Error: ${err.message}`);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRedesSociales();
  }, []);

  const handleToggleStatus = async (red) => {
    const nuevoStatus = red.status === 1 ? 0 : 1;
    const key = red.id || red.idSocialMedia;
    try {
      setStatusLoadingId(key);
  const response = await fetch(`${API_BASE_URL}/api/redesSociales/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...red, status: nuevoStatus })
      });

      if (response.ok) {
        setRedesSociales(redesSociales.map(r =>
          (r.id === key || r.idSocialMedia === key) ? { ...r, status: nuevoStatus } : r
        ));
        alert(`Red social ${nuevoStatus === 1 ? "activada" : "desactivada"} correctamente`);
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

  // Filtro por nombre, id, status, orden, fecha
  const filteredRedesSociales = redesSociales.filter(red => {
    const searchLower = search.toLowerCase();
    return (
      (red.titleSocialMedia || '').toLowerCase().includes(searchLower) ||
      (red.linkSocialMedia || '').toLowerCase().includes(searchLower) ||
      String(red.idSocialMedia || '').includes(searchLower) ||
      String(red.orderSocialMedia || '').includes(searchLower) ||
      (red.status === 1 ? 'activo' : 'inactivo').includes(searchLower) ||
      (red.CreateAt ? new Date(red.CreateAt).toLocaleString().toLowerCase().includes(searchLower) : false)
    );
  });

  // Ordenamiento
  const sortedRedesSociales = [...filteredRedesSociales].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === "orderSocialMedia") {
      aValue = aValue === undefined || aValue === null ? 9999 : Number(aValue);
      bValue = bValue === undefined || bValue === null ? 9999 : Number(bValue);
    } else if (sortBy === "CreateAt") {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    } else if (sortBy === "status") {
      aValue = aValue === 1 ? "activo" : "inactivo";
      bValue = bValue === 1 ? "activo" : "inactivo";
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

  if (loading) {
    return (
      <Card>
        <Title>Redes Sociales</Title>
        <Text>Cargando...</Text>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <div>
          <Title>Redes Sociales</Title>
          <Text className="text-gray-500">
            Administración de redes sociales del footer
          </Text>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          onClick={() => navigate("/redesSociales/nuevo")}
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Red Social
        </button>
      </div>

      <div className="flex items-center gap-4 mt-4 mb-2">
        <TextInput
          placeholder="Buscar por nombre o URL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="overflow-x-auto mt-2 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("idSocialMedia")}>ID {sortBy === "idSocialMedia" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("orderSocialMedia")}>Orden {sortBy === "orderSocialMedia" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("titleSocialMedia")}>Nombre {sortBy === "titleSocialMedia" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("status")}>Estatus {sortBy === "status" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left cursor-pointer select-none" onClick={() => handleSort("CreateAt")}>Creado {sortBy === "CreateAt" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                  </div>
                </td>
              </tr>
            ) : sortedRedesSociales.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <Text>No hay resultados.</Text>
                </td>
              </tr>
            ) : (
              sortedRedesSociales.map((red) => (
                <tr
                  key={red.idSocialMedia}
                  className="border-b hover:bg-blue-50 transition-colors"
                >
                  <td className="px-4 py-2">{red.idSocialMedia}</td>
                  <td className="px-4 py-2">{red.orderSocialMedia}</td>
                  <td className="px-4 py-2">{red.titleSocialMedia}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        red.status === 1
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-red-100 text-red-700 border-red-300"
                      }`}
                    >
                      {red.status === 1 ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-2">{red.CreateAt ? new Date(red.CreateAt).toLocaleString() : '-'}</td>
                  <td className="px-2 py-2 space-x-2 text-left">

                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-blue-100 transition"
                      title="Ver"
                      onClick={() => navigate(`/redesSociales/${red.idSocialMedia}`)}
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver
                    </button>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 rounded hover:bg-blue-200 transition text-blue-700"
                      title="Editar"
                      onClick={() => navigate(`/redesSociales/editar/${red.idSocialMedia}`)}
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Editar
                    </button>

                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition border-none focus:outline-none ${red.status === 1 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      title={red.status === 1 ? 'Desactivar' : 'Activar'}
                      onClick={() => handleToggleStatus({ id: red.idSocialMedia || red.id, status: red.status, ...red })}
                      disabled={statusLoadingId === (red.idSocialMedia || red.id)}
                    >
                      {statusLoadingId === (red.idSocialMedia || red.id) ? (
                        <span className="animate-spin h-4 w-4 mr-1 border-b-2 border-blue-700 rounded-full"></span>
                      ) : (
                        <PowerIcon className="w-4 h-4" />
                      )}
                      {red.status === 1 ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}