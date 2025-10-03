import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { API_BASE_URL } from "../config";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from "../lib/imageUtils";
import { PencilSquareIcon, PowerIcon, TrashIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

export default function CuponeraDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cupon, setCupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [sucursalesAsociadas, setSucursalesAsociadas] = useState([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

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

  // Cargar todas las sucursales disponibles
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sucursales`)
      .then(res => res.json())
      .then(data => {
        const norm = Array.isArray(data)
          ? data.map(s => ({
            idSucursal: Number(s.idSucursal),
            sucursalName: s.sucursalName,
            value: Number(s.idSucursal),
            label: s.sucursalName
          }))
          : [];
        setSucursalesDisponibles(norm);
      });
  }, []);

  // Cargar sucursales asociadas
  useEffect(() => {
    if (!id) return;
    setLoadingSucursales(true);
    fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=Cuponera&idObjeto=${id}`)
      .then(res => res.json())
      .then(permisos => {
        const ids = permisos.map(p => Number(p.idSucursal));
        const asociadas = sucursalesDisponibles.filter(s => ids.includes(s.idSucursal));
        setSucursalesAsociadas(asociadas);
        setLoadingSucursales(false);
      })
      .catch(() => {
        setSucursalesAsociadas([]);
        setLoadingSucursales(false);
      });
  }, [id, sucursalesDisponibles]);

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
             <div className="mb-4">
               <span className="font-semibold">Orden:</span> {cupon.orden}
             </div>
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
          {/* Sucursales donde aplica */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2 border-b pb-2">
              <h3 className="text-lg font-semibold">Sucursales donde aplica</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">{sucursalesAsociadas.length} sucursales</span>
                <div className="group relative ml-1">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                  <div className="absolute right-0 top-full mt-1 hidden w-64 rounded bg-gray-800 p-2 text-xs text-white group-hover:block z-10">
                    {sucursalesAsociadas.length === 0
                      ? "Este cupón aplica a todas las sucursales."
                      : "Este cupón solo aplica a las sucursales mostradas."}
                  </div>
                </div>
              </div>
            </div>
            {loadingSucursales ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              Array.isArray(sucursalesAsociadas) && sucursalesAsociadas.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {sucursalesAsociadas.map(s => (
                      <div key={s.idSucursal} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
                        {s.sucursalName}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="mr-3 bg-gray-200 rounded-full p-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="text-gray-600">Aplica en todas las sucursales.</div>
                </div>
              )
            )}
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
