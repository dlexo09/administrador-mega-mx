import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { EyeIcon, PencilSquareIcon, PowerIcon, PlusIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/outline";
import { serverAPIsLocal } from "../config";

export default function SocialMediaSection() {
  const navigate = useNavigate();
  const [redesSociales, setRedesSociales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusLoadingId, setStatusLoadingId] = useState(null);

  const fetchRedesSociales = () => {
    setLoading(true);
  // console.log('Fetching from:', `${serverAPIsLocal}/api/redesSociales`);
    fetch(`${serverAPIsLocal}/api/redesSociales`)
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
    try {
      setStatusLoadingId(red.id);
      const response = await fetch(`${serverAPIsLocal}/api/redesSociales/${red.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...red, status: nuevoStatus })
      });
      
      if (response.ok) {
        setRedesSociales(redesSociales.map(r =>
          r.id === red.id ? { ...r, status: nuevoStatus } : r
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

  const filteredRedesSociales = redesSociales.filter(red =>
    (red.titleSocialMedia || '').toLowerCase().includes(search.toLowerCase()) ||
    (red.linkSocialMedia || '').toLowerCase().includes(search.toLowerCase())
  );

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
        {/* <Button color="blue" className="shadow px-4" onClick={() => navigate("/redesSociales/nuevo")}>
          <div className="flex items-center justify-center gap-2 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Nueva Red Social</span>
          </div>
        </Button> */}
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
              <th className="px-4 py-2 text-left font-medium text-gray-600">ID</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Orden</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Estado</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Creado</th>
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
            ) : filteredRedesSociales.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <Text>No hay resultados.</Text>
                </td>
              </tr>
            ) : (
              filteredRedesSociales.map((red) => (
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
                    {/* Botón Ver (solo diseño, sin funcionalidad) */}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-blue-100 transition"
                      title="Ver"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver
                    </button>
                    {/* Botón Editar (solo diseño, sin funcionalidad) */}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                      title="Editar"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Editar
                    </button>
                    {/* Botón Desactivar (solo diseño, sin funcionalidad) */}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition border-none focus:outline-none bg-red-100 text-red-700 hover:bg-red-200"
                      title="Desactivar"
                    >
                      <PowerIcon className="w-4 h-4" />
                      Desactivar
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