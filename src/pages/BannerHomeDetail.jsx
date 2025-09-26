import { useEffect, useState } from "react";
import { Card, Title, Text, Button } from "@tremor/react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL, S3_BASE_URL } from "../config";
import { PencilSquareIcon, TrashIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export default function BannerHomeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [sucursalesAsociadas, setSucursalesAsociadas] = useState([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/bannerhome/${id}`)
      .then(res => res.json())
      .then(data => {
        setBanner(data);
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
    fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=BannerHome&idObjeto=${id}`)
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

  // Eliminar banner
  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro que deseas eliminar este banner? Esta acción no se puede deshacer.")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bannerhome/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Error al eliminar el banner");
      navigate("/bannerhome");
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !banner) {
    return (
      <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
        <Title>Cargando...</Title>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
      <Title>Detalle Banner Home</Title>
      <div className="space-y-4 mt-4">
        <div>
          <Text className="font-bold">Título:</Text>
          <Text>{banner.title}</Text>
        </div>
        <div>
          <Text className="font-bold">Link del botón:</Text>
          <Text>{banner.linkButton}</Text>
        </div>
        <div>
          <Text className="font-bold">Imagen Banner (PC):</Text>
          <div>
            <img
              src={`${S3_BASE_URL}/${banner.imagenBanner}`}
              alt="Banner PC"
              className="mt-2 h-20 rounded"
              onError={e => {
                e.target.style.display = "none";
                const link = document.getElementById("img-fallback-link-detail");
                if (link) link.style.display = "inline";
              }}
            />
            <a
              id="img-fallback-link-detail"
              href={`${S3_BASE_URL}/${banner.imagenBanner}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "none", color: "#2563eb", textDecoration: "underline", marginTop: "8px" }}
            >
              Ver imagen en una pestaña nueva
            </a>
          </div>
        </div>
        <div>
          <Text className="font-bold">Imagen Banner (Mobile):</Text>
          <div>
            <img
              src={`${S3_BASE_URL}/${banner.imagenMobile}`}
              alt="Banner Mobile"
              className="mt-2 h-20 rounded"
              onError={e => {
                e.target.style.display = "none";
                const link = document.getElementById("img-mobile-fallback-link-detail");
                if (link) link.style.display = "inline";
              }}
            />
            <a
              id="img-mobile-fallback-link-detail"
              href={`${S3_BASE_URL}/${banner.imagenMobile}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "none", color: "#2563eb", textDecoration: "underline", marginTop: "8px" }}
            >
              Ver imagen mobile en una pestaña nueva
            </a>
          </div>
        </div>
        <div>
          <Text className="font-bold">Status:</Text>
          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${banner.status === 1
            ? "bg-green-100 text-green-700 border-green-300"
            : "bg-red-100 text-red-700 border-red-300"
            }`}>
            {banner.status === 1 ? "ACTIVO" : "INACTIVO"}
          </span>
        </div>
        <div>
          <Text className="font-bold">Inicio:</Text>
          <Text>{banner.fhInicio ? banner.fhInicio.substring(0, 16) : ""}</Text>
        </div>
        <div>
          <Text className="font-bold">Fin:</Text>
          <Text>{banner.fhFin ? banner.fhFin.substring(0, 16) : ""}</Text>
        </div>
        {/* Sucursales donde aplica */}
        <div>
          <div className="flex items-center justify-between mb-2 border-b pb-2">
            <h3 className="text-lg font-semibold">Sucursales donde aplica</h3>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">{sucursalesAsociadas.length} sucursales</span>
              <div className="group relative ml-1">
                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                <div className="absolute right-0 top-full mt-1 hidden w-64 rounded bg-gray-800 p-2 text-xs text-white group-hover:block z-10">
                  {sucursalesAsociadas.length === 0
                    ? "Este banner aplica a todas las sucursales."
                    : "Este banner solo aplica a las sucursales mostradas."}
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
      </div>
      {/* Botones de acción */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button
          onClick={() => navigate("/bannerhome")}
          variant="light"
          className="text-blue-700"
        >
          ← Volver a Banners Home
        </Button>
        <div className="flex gap-4">
          <Link to={`/bannerhome/editar/${banner.idBannerHome}`}>
            <Button color="blue" className="flex items-center gap-2">
              <span className="flex items-center gap-2">
                <PencilSquareIcon className="w-5 h-5" />
                Editar
              </span>
            </Button>
          </Link>
          <Button
            color="red"
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-none"
          >
            <span className="flex items-center gap-2">
              <TrashIcon className="w-5 h-5" />
              Eliminar
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
}