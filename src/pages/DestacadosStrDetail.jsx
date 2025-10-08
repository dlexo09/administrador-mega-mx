import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { API_BASE_URL } from "../config";
import { getImageUrl } from "../lib/imageUtils";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function DestacadosStrDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
  fetch(`${API_BASE_URL}/api/destacadosStreaming/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener el banner");
        return res.json();
      })
      .then((data) => {
        setBanner(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("No se pudo cargar el banner");
        setLoading(false);
      });
  }, [id]);

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mt-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-blue-700 font-semibold"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Volver
        </button>
      </div>
      <Title>Detalle Destacado Streaming</Title>
      {loading ? (
        <Text className="mt-4">Cargando...</Text>
      ) : error ? (
        <Text className="mt-4 text-red-600">{error}</Text>
      ) : banner ? (
        <div className="space-y-4 mt-4">
          <div><span className="font-semibold">ID:</span> {banner.IDBannerStreaming}</div>
          <div><span className="font-semibold">Partner:</span> {banner.partnerName}</div>
          <div><span className="font-semibold">Tipo de Imagen:</span> {banner.tipoImg}</div>
          <div><span className="font-semibold">Título:</span> {banner.tituloImg}</div>
          <div><span className="font-semibold">Status:</span> {banner.status === 1 ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-300">ACTIVO</span> : <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold border border-red-300">INACTIVO</span>}</div>
          <div><span className="font-semibold">Última Actualización:</span> {banner.ultimaActualizacion ? new Date(banner.ultimaActualizacion).toLocaleString() : '-'}</div>
          <div>
            <span className="font-semibold">Imagen PC:</span><br />
                {banner.imagenPC ? (
                  <ImageWithFallback src={getImageUrl(banner.imagenPC)} alt={banner.tituloImg} tipo="PC" />
                ) : (
                  <div className="h-24 w-32 bg-gray-200 border rounded mt-1 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Sin imagen PC</span>
                  </div>
                )}
          </div>
          <div>
            <span className="font-semibold">Imagen Móvil:</span><br />
                {banner.imagenMobile ? (
                  <ImageWithFallback src={getImageUrl(banner.imagenMobile)} alt={banner.tituloImg} tipo="Móvil" />
                ) : (
                  <div className="h-24 w-32 bg-gray-200 border rounded mt-1 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Sin imagen Móvil</span>
                  </div>
                )}
          </div>
          <div className="flex gap-4 mt-8">
            <Button
              color="blue"
              className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"
              onClick={() => navigate(`/destacados-streamings/editar/${banner.IDBannerStreaming}`)}
            >
              <PencilSquareIcon className="w-5 h-5" />
              Editar
            </Button>
            <Button
              color="red"
              className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 border-none"
              onClick={async () => {
                if (window.confirm('¿Seguro que deseas eliminar este destacado?')) {
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/destacadosStreaming/${banner.IDBannerStreaming}`, {
                      method: 'DELETE'
                    });
                    if (res.status === 204) {
                      navigate('/destacados-streamings');
                    } else {
                      alert('No se pudo eliminar el destacado');
                    }
                  } catch {
                    alert('Error eliminando destacado');
                  }
                }
              }}
            >
              <TrashIcon className="w-5 h-5" />
              Eliminar
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
  
  // Componente para manejar error de carga de imagen y mostrar enlace externo
  function ImageWithFallback({ src, alt, tipo }) {
    const [error, setError] = useState(false);
    if (error) {
      return (
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-blue-600 underline text-sm"
        >
          {`Ver imagen ${tipo} en una pestaña nueva`}
        </a>
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        className="h-40 max-w-full object-contain border rounded mt-1"
        onError={() => setError(true)}
      />
    );
  }
