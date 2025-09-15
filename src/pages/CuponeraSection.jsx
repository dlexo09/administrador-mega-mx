import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { serverAPIsLocal } from "../config";

export default function CuponeraSection() {
  const navigate = useNavigate();
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCupones = () => {
    setLoading(true);
    fetch(`${serverAPIsLocal}/api/cuponera?all=true`)
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

  const handleEliminarCupon = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cupón?')) return;
    try {
      const response = await fetch(`${serverAPIsLocal}/api/cuponera/${id}`, {
        method: 'DELETE',
      });
      if (response.status === 204) {
        alert('Cupón eliminado exitosamente');
        fetchCupones(); // Recargar la lista
      } else if (response.status === 404) {
        alert('Cupón no encontrado');
      } else {
        alert('Error al eliminar el cupón');
      }
    } catch (err) {
      console.error('Error eliminando cupón:', err);
      alert('Error al eliminar el cupón');
    }
  };

  const handleNuevoCupon = () => {
    navigate('/cuponera/nuevo');
  };


  return (
    <Card className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <div>
          <Title>Cuponera</Title>
          <Text className="text-gray-500">Administración de cupones</Text>
        </div>
        <Button color="blue" className="shadow" onClick={handleNuevoCupon}>+ Nuevo Cupón</Button>
      </div>
      <div className="overflow-x-auto mt-2 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Imagen</th>
              <th className="px-4 py-2 text-left">Estatus</th>
              <th className="px-2 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  <Text>Cargando...</Text>
                </td>
              </tr>
            ) : cupones.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  <Text>No hay cupones.</Text>
                </td>
              </tr>
            ) : (
              cupones.map((item) => (
                <tr key={item.IDCuponera} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2">{item.IDCuponera}</td>
                  <td className="px-4 py-2">{item.NombreCupon}</td>
                  <td className="px-4 py-2">
                    <img 
                      src={item.ImgPc} 
                      alt={item.NombreCupon} 
                      className="h-12 max-w-[100px] object-contain border rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold border ${item.Status === 1
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-red-100 text-red-700 border-red-300"
                      }`}
                    >
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
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      title="Eliminar"
                      onClick={() => handleEliminarCupon(item.IDCuponera)}
                    >
                      <TrashIcon className="w-4 h-4" />
                      Eliminar
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
