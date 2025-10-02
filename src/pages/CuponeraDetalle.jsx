import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { API_BASE_URL } from "../config";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from "../lib/imageUtils";
import { PencilSquareIcon, PowerIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function CuponeraDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cupon, setCupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/cuponera/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener el cupón");
        return res.json();
      })
      .then((data) => {
        setCupon(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("No se pudo cargar el cupón");
        setLoading(false);
      });
  }, [id]);

  // Manejo de eliminación
  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro que deseas eliminar este cupón? Esta acción no se puede deshacer.")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/cuponera/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Error al eliminar el cupón");
      alert("Cupón eliminado exitosamente");
      navigate('/cuponera');
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

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
      <Title>Detalle del Cupón</Title>
      {loading ? (
        <Text className="mt-4">Cargando...</Text>
      ) : error ? (
        <Text className="mt-4 text-red-600">{error}</Text>
      ) : cupon ? (
        <>
          <div className="space-y-4 mt-4">
            <div><span className="font-semibold">ID:</span> {cupon.IDCuponera}</div>
            <div><span className="font-semibold">Nombre:</span> {cupon.NombreCupon}</div>
            <div><span className="font-semibold">Estatus:</span> {cupon.Status === 1 ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-300">ACTIVO</span> : <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold border border-red-300">INACTIVO</span>}</div>
            <div><span className="font-semibold">Enlace:</span> <span className="break-all">{cupon.LinkBoton}</span></div>
            <div>
              <span className="font-semibold">Imagen PC:</span><br />
              <img 
                src={getImageUrl(cupon.ImgPc)}
                alt={cupon.NombreCupon}
                className="h-24 max-w-full object-contain border rounded mt-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                style={{ display: 'none' }} 
                className="h-24 w-32 bg-gray-200 border rounded mt-1 flex items-center justify-center"
              >
                <span className="text-gray-500 text-xs">Sin imagen PC</span>
              </div>
            </div>
            <div>
              <span className="font-semibold">Imagen Móvil:</span><br />
              <img 
                src={getImageUrl(cupon.ImgMovil)}
                alt={cupon.NombreCupon}
                className="h-24 max-w-full object-contain border rounded mt-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                style={{ display: 'none' }} 
                className="h-24 w-32 bg-gray-200 border rounded mt-1 flex items-center justify-center"
              >
                <span className="text-gray-500 text-xs">Sin imagen Móvil</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <Button
              color="blue"
              className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none"
              onClick={() => navigate(`/cuponera/editar/${cupon.IDCuponera}`)}
            >
              <PencilSquareIcon className="w-5 h-5" />
              Editar
            </Button>
            <button
              type="button"
              className={`inline-flex items-center gap-1 px-3 py-2 rounded text-sm font-semibold transition border-none focus:outline-none ${cupon.Status === 1 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              onClick={async () => {
                const nuevoStatus = cupon.Status === 1 ? 0 : 1;
                const confirmMsg = nuevoStatus === 0 ? '¿Seguro que deseas desactivar este cupón?' : '¿Seguro que deseas activar este cupón?';
                if (!window.confirm(confirmMsg)) return;
                try {
                  const response = await fetch(`${API_BASE_URL}/api/cuponera/${cupon.IDCuponera}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...cupon, Status: nuevoStatus })
                  });
                  if (response.ok) {
                    window.location.reload();
                  } else {
                    alert('Error al cambiar el estatus');
                  }
                } catch (err) {
                  alert('Error al cambiar el estatus');
                }
              }}
            >
              <PowerIcon className="w-5 h-5" />
              {cupon.Status === 1 ? 'Desactivar' : 'Activar'}
            </button>
            <Button
              color="red"
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 border-none"
            >
              <TrashIcon className="w-5 h-5" />
              Eliminar
            </Button>
          </div>
        </>
      ) : null}
    </Card>
  );
}
