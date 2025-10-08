import { useEffect, useState } from "react";
import { Card, Title, Text } from "@tremor/react";
import { API_BASE_URL } from "../config";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function DestacadosStreamings() {
  const [streamings, setStreamings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
  fetch(`${API_BASE_URL}/api/destacadosStreaming`)
      .then((res) => res.json())
      .then((data) => {
        setStreamings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError("No se pudo cargar la información");
        setLoading(false);
      });
  }, []);

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <Title>Destacados Streamings</Title>
        <button
          onClick={() => navigate('/destacados-streamings/nuevo')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Nuevo destacado
        </button>
      </div>
      <Text className="text-gray-500 mb-4">Administración de banners destacados de streaming</Text>
      <div className="overflow-x-auto mt-2 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Partner</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Título</th>
              <th className="px-4 py-2 text-left">Última Actualización</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  <Text>Cargando...</Text>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-red-600">
                  <Text>{error}</Text>
                </td>
              </tr>
            ) : streamings.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  <Text>No hay destacados.</Text>
                </td>
              </tr>
            ) : (
              streamings.map((item) => (
                <tr key={item.IDBannerStreaming} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2">{item.IDBannerStreaming}</td>
                  <td className="px-4 py-2">{item.partnerName}</td>
                  <td className="px-4 py-2">{item.tipoImg}</td>
                  <td className="px-4 py-2">{item.tituloImg}</td>
                  <td className="px-4 py-2">{item.ultimaActualizacion ? new Date(item.ultimaActualizacion).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2 space-x-2 text-left">
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-blue-100 transition"
                      title="Ver"
                      onClick={() => navigate(`/destacados-streamings/${item.IDBannerStreaming}`)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Ver
                    </button>
                    <button
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                      title="Editar"
                      onClick={() => navigate(`/destacados-streamings/editar/${item.IDBannerStreaming}`)}
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Actualizar Imagen
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
