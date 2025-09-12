import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Title, Text, Badge, Button } from "@tremor/react";
import { API_BASE_URL, S3_BASE_URL } from "../config";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import TriviaPreguntas from "../components/trivia/TriviaPreguntas";

// Función para determinar si una cadena es una URL completa
const isFullUrl = (str) => {
  return str && (str.startsWith('http://') || str.startsWith('https://'));
};

export default function TriviasDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trivia, setTrivia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [expandido, setExpandido] = useState(false);
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [sucursalesAsociadas, setSucursalesAsociadas] = useState([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  // Cargar datos de la trivia
  useEffect(() => {
    const fetchTrivia = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/triviasconfig/${id}`);
        if (!res.ok) throw new Error("Error al cargar trivia");
        const data = await res.json();
        console.log("Datos de trivia:", data); // Para depuración
        setTrivia(data);
      } catch (e) {
        console.error("Error cargando trivia:", e);
        setTrivia(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrivia();
  }, [id]);

  // Cargar todas las sucursales disponibles
  const fetchSucursales = async () => {
    setLoadingSucursales(true);
    try {
      console.log("[LOG] Fetching todas las sucursales");
      const res = await fetch(`${API_BASE_URL}/api/sucursales`);
      console.log("[LOG] sucursales status:", res.status);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      
      const data = await res.json();
      const norm = Array.isArray(data)
        ? data.map(s => ({
          idSucursal: Number(s.idSucursal),
          sucursalName: s.sucursalName,
          value: Number(s.idSucursal),
          label: s.sucursalName
        }))
        : [];
        
      console.log("[LOG] sucursales fetched count:", norm.length);
      setSucursalesDisponibles(norm);
      return norm;
    } catch (e) {
      console.error("[ERROR] cargar sucursales:", e);
      setSucursalesDisponibles([]);
      return [];
    } finally {
      setLoadingSucursales(false);
    }
  };

  // Cargar sucursales asociadas
  useEffect(() => {
    const fetchSucursalesAsociadas = async () => {
      if (!id) return;
      
      setLoadingSucursales(true);
      try {
        console.log("[LOG] Fetch permisosSucursal for Trivias idObjeto=", id);
        const res = await fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=Trivias&idObjeto=${id}`);
        console.log("[LOG] permisosSucursal status:", res.status);
        
        if (!res.ok) {
          console.warn("[WARN] permisosSucursal no OK -> sucursalesAsociadas = []");
          setSucursalesAsociadas([]);
          return;
        }
        
        const permisos = await res.json();
        console.log("[LOG] permisos raw:", permisos);

        if (!Array.isArray(permisos) || permisos.length === 0) {
          console.log("[LOG] No hay permisos -> sucursalesAsociadas = []");
          setSucursalesAsociadas([]);
          return;
        }

        const ids = permisos.map(p => Number(p.idSucursal));
        console.log("[LOG] permisos ids:", ids);

        // Obtener todas las sucursales (usa fetchSucursales para consistencia)
        const todasNorm = await fetchSucursales(); // devuelve objetos con idSucursal, sucursalName, value, label
        const asociadas = todasNorm.filter(s => ids.includes(s.idSucursal));
        console.log("[LOG] sucursales asociadas encontradas:", asociadas.length, asociadas);

        // setear sucursales asociadas
        setSucursalesAsociadas(asociadas.map(s => ({ 
          idSucursal: s.idSucursal, 
          sucursalName: s.sucursalName 
        })));
        
      } catch (e) {
        console.error("[ERROR] cargar sucursales asociadas:", e);
        setSucursalesAsociadas([]);
      } finally {
        setLoadingSucursales(false);
      }
    };
    
    if (id) fetchSucursalesAsociadas();
  }, [id]);

  const handleImageError = (field) => {
    setImageErrors(prev => ({...prev, [field]: true}));
  };

  // Función para eliminar trivia
  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro que deseas eliminar esta trivia? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/triviasconfig/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la trivia");
      }

      navigate("/trivias/gestionar");
    } catch (err) {
      console.error("Error al eliminar trivia:", err);
      alert("Error al eliminar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-lg rounded-lg">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
        </div>
      </Card>
    );
  }

  if (!trivia) {
    return (
      <Card className="bg-white shadow-lg rounded-lg">
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="text-red-500 text-xl font-medium">Trivia no encontrada</div>
          <p className="text-gray-500">No se encontró la trivia solicitada o no tienes permisos para verla.</p>
          <button
            onClick={() => navigate("/trivias/gestionar")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            <ArrowLeftIcon className="h-5 w-5" /> Volver a la lista
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <Title className="text-2xl font-bold">{trivia.titulo || `Trivia #${trivia.idTriviaConfig}`}</Title>
          <div className="text-sm text-gray-500 mt-1">ID: {trivia.idTriviaConfig}</div>
        </div>
      </div>

      {/* Estado de la trivia - Estilo destacado */}
      <div className="mb-8 border rounded-lg overflow-hidden">
        <div className="border-b bg-gray-50 px-4 py-3">
          <h3 className="text-lg font-semibold">Estado de la trivia</h3>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4">
            <span 
              className={`px-4 py-2 rounded-md text-white font-bold ${
                trivia.status === 1 ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {trivia.status === 1 ? "ACTIVA" : "INACTIVA"}
            </span>
            <span className="text-gray-600">
              {trivia.status === 1 
                ? "La trivia está publicada y visible para los usuarios" 
                : "La trivia está en modo borrador (no visible)"
              }
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Información básica */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold">Información Básica</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text className="font-medium">URL EndPoint:</Text>
              <Text>{trivia.urlEndPoint}</Text>
            </div>
            <div>
              <Text className="font-medium">Fecha/Hora de Inicio:</Text>
              <Text>{trivia.fhInicio ? trivia.fhInicio.substring(0, 16) : ""}</Text>
            </div>
            <div>
              <Text className="font-medium">Fecha/Hora de Fin:</Text>
              <Text>{trivia.fhFin ? trivia.fhFin.substring(0, 16) : ""}</Text>
            </div>
            <div>
              <Text className="font-medium">Solicitar Correo:</Text>
              <Text>{trivia.emailStatus === 1 ? "Sí" : "No"}</Text>
            </div>
            <div>
              <Text className="font-medium">Solicitar Visa:</Text>
              <Text>{trivia.visaStatus === 1 ? "Sí" : "No"}</Text>
            </div>
            <div>
              <Text className="font-medium">Solicitar Pasaporte:</Text>
              <Text>{trivia.pasaporteStatus === 1 ? "Sí" : "No"}</Text>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {trivia.descripcion && (
          <div>
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-lg font-semibold">Descripción</h3>
              <button onClick={() => setExpandido(!expandido)} className="text-sm text-blue-600 hover:text-blue-800">
                {expandido ? "Contraer" : "Expandir"}
              </button>
            </div>
            <div className={`prose max-w-none border rounded-lg p-6 bg-white ${!expandido ? 'max-h-[300px]' : ''} overflow-y-auto`}>
              <div dangerouslySetInnerHTML={{ __html: trivia.descripcion }} />
            </div>
          </div>
        )}

        {/* Imágenes y colores */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold">Imágenes y Colores</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trivia.bannerPrincipal && (
              <div>
                <Text className="font-medium">Banner Principal:</Text>
                <div className="relative">
                  <img 
                    src={isFullUrl(trivia.bannerPrincipal) ? trivia.bannerPrincipal : `${S3_BASE_URL}/uploads/bannerTrivias/${trivia.bannerPrincipal}`} 
                    alt="Banner principal" 
                    className="w-full h-32 object-cover rounded mt-2" 
                    onError={() => handleImageError('bannerPrincipal')}
                  />
                  {imageErrors.bannerPrincipal && (
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center">
                      <Text className="text-gray-600">Imagen no disponible</Text>
                    </div>
                  )}
                </div>
                <Text className="text-xs text-gray-500 mt-1 break-all">
                  {isFullUrl(trivia.bannerPrincipal) ? trivia.bannerPrincipal : `${S3_BASE_URL}/uploads/bannerTrivias/${trivia.bannerPrincipal}`}
                </Text>
              </div>
            )}
            
            {trivia.bannerMovil && (
              <div>
                <Text className="font-medium">Banner Móvil:</Text>
                <div className="relative">
                  <img 
                    src={isFullUrl(trivia.bannerMovil) ? trivia.bannerMovil : `${S3_BASE_URL}/uploads/bannerTrivias/${trivia.bannerMovil}`} 
                    alt="Banner móvil" 
                    className="w-full h-32 object-cover rounded mt-2"
                    onError={() => handleImageError('bannerMovil')}
                  />
                  {imageErrors.bannerMovil && (
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center">
                      <Text className="text-gray-600">Imagen no disponible</Text>
                    </div>
                  )}
                </div>
                <Text className="text-xs text-gray-500 mt-1 break-all">
                  {isFullUrl(trivia.bannerMovil) ? trivia.bannerMovil : `${S3_BASE_URL}/uploads/bannerTrivias/${trivia.bannerMovil}`}
                </Text>
              </div>
            )}
            
            {trivia.logoMarca && (
              <div>
                <Text className="font-medium">Logo Marca:</Text>
                <div className="relative">
                  <img 
                    src={isFullUrl(trivia.logoMarca) ? trivia.logoMarca : `${S3_BASE_URL}/uploads/bannerTrivias/${trivia.logoMarca}`} 
                    alt="Logo marca" 
                    className="w-24 h-24 object-cover rounded mt-2"
                    onError={() => handleImageError('logoMarca')}
                  />
                  {imageErrors.logoMarca && (
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center">
                      <Text className="text-xs text-gray-600">No disponible</Text>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <Text className="font-medium">Color Header:</Text>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: trivia.colorHeader || "#ffffff" }}
                ></div>
                <Text>{trivia.colorHeader || "No definido"}</Text>
              </div>
            </div>
            <div>
              <Text className="font-medium">Color Footer:</Text>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: trivia.colorFooter || "#ffffff" }}
                ></div>
                <Text>{trivia.colorFooter || "No definido"}</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Legal */}
        {trivia.legal && (
          <div>
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-lg font-semibold">Legal</h3>
            </div>
            <a
              href={trivia.legal}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Ver PDF Legal
            </a>
          </div>
        )}

        {/* MOVIDO: Sucursales donde aplica - Ahora al final antes de los botones */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="text-lg font-semibold">Sucursales donde aplica</h3>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">{sucursalesAsociadas.length} sucursales</span>
              <div className="group relative ml-1">
                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                <div className="absolute right-0 top-full mt-1 hidden w-64 rounded bg-gray-800 p-2 text-xs text-white group-hover:block z-10">
                  {sucursalesAsociadas.length === 0 
                    ? "Esta trivia aplica a todas las sucursales." 
                    : "Esta trivia solo aplica a las sucursales mostradas."}
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

      <TriviaPreguntas triviaId={id} />

      {/* Botones de acción - actualizado para que se parezca a DetalleSucursal */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button
          onClick={() => navigate("/trivias/gestionar")}
          variant="light"
          className="text-blue-700"
        >
          ← Volver a Trivias
        </Button>
        
        <div className="flex gap-4">
          <Link to={`/trivias/editar/${trivia.idTriviaConfig}`}>
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