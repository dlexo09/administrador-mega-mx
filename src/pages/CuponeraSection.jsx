import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { EyeIcon, PencilSquareIcon, PowerIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../config";
import { getImageUrl } from "../lib/imageUtils";

export default function CuponeraSection() {
  const navigate = useNavigate();
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoadingId, setStatusLoadingId] = useState(null);

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
                      src={getImageUrl(item.ImgPc)} 
                      alt={item.NombreCupon} 
                      className="h-12 max-w-[100px] object-contain border rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      style={{ display: 'none' }} 
                      className="h-12 max-w-[100px] bg-gray-200 border rounded flex items-center justify-center"
                    >
                      <span className="text-gray-500 text-xs">Sin imagen</span>
                    </div>
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
    </Card>
  );
}
