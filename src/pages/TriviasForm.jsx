import React, { useState, useRef, useEffect, forwardRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { API_BASE_URL, S3_BASE_URL } from "../config";
import { ArrowLeftIcon, DocumentTextIcon, XMarkIcon, InformationCircleIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";

// Componente personalizado para solucionar warning de findDOMNode
const QuillWrapper = forwardRef(({ value, onChange, modules, className }, ref) => {
  return (
    <ReactQuill
      ref={ref}
      value={value}
      onChange={onChange}
      modules={modules}
      className={className}
    />
  );
});

// Componente para etiqueta de campo
const FieldLabel = ({ text, required = true }) => (
  <label className="block font-medium mb-2 text-gray-700">
    {text} {required ? (
      <span className="text-red-500">*</span>
    ) : (
      <span className="text-xs text-gray-500 ml-1">(opcional)</span>
    )}
  </label>
);

export default function TriviasForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estado de campos - iniciamos colores con un valor por defecto para evitar error
  const [urlEndPoint, setUrlEndPoint] = useState("");
  const [bannerPrincipal, setBannerPrincipal] = useState(null);
  const [bannerMovil, setBannerMovil] = useState(null);
  const [logoMarca, setLogoMarca] = useState(null);
  const [colorFooter, setColorFooter] = useState("#ffffff"); // Valor por defecto blanco
  const [colorHeader, setColorHeader] = useState("#ffffff"); // Valor por defecto blanco
  const [legal, setLegal] = useState(null);
  const [fhInicio, setFhInicio] = useState("");
  const [fhFin, setFhFin] = useState("");
  const [emailStatus, setEmailStatus] = useState(false);
  const [visaStatus, setVisaStatus] = useState(false);
  const [pasaporteStatus, setPasaporteStatus] = useState(false); // Nuevo campo
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [status, setStatus] = useState(true); // Nuevo campo, activo por defecto
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [initialData, setInitialData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  // Estados para sucursales
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = useState([]);
  const [filtroSucursales, setFiltroSucursales] = useState("");
  const [seleccionarTodas, setSeleccionarTodas] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [mostrarModalImportar, setMostrarModalImportar] = useState(false);
  const [textoImportacion, setTextoImportacion] = useState("");
  const [resultadosImportacion, setResultadosImportacion] = useState(null);
  const [procesandoImportacion, setProcesandoImportacion] = useState(false);
  const textareaRef = useRef(null);

  // Refs para archivos
  const bannerPrincipalRef = useRef();
  const bannerMovilRef = useRef();
  const logoMarcaRef = useRef();
  const legalRef = useRef();

  // Referencia para ReactQuill (soluciona warning findDOMNode)
  const quillRef = useRef(null);

  // Cargar sucursales disponibles
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sucursales`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setSucursalesDisponibles(data.map(s => ({ value: Number(s.idSucursal), label: s.sucursalName })));
      } catch (e) {
        console.error("Error al cargar sucursales:", e);
        setSucursalesDisponibles([]);
      }
    };
    fetchSucursales();
  }, []);

  // Si es edición, carga datos iniciales y sucursales asociadas
  useEffect(() => {
    if (id && sucursalesDisponibles.length > 0) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/triviasconfig/${id}`)
        .then(res => res.json())
        .then(data => {
          setInitialData(data);
          setUrlEndPoint(data.urlEndPoint || "");
          setColorFooter(data.colorFooter || "#ffffff");  // Valor por defecto si está vacío
          setColorHeader(data.colorHeader || "#ffffff");  // Valor por defecto si está vacío
          setFhInicio(data.fhInicio ? data.fhInicio.substring(0, 16) : "");
          setFhFin(data.fhFin ? data.fhFin.substring(0, 16) : "");
          setEmailStatus(data.emailStatus === 1);
          setVisaStatus(data.visaStatus === 1);
          setStatus(data.status !== 0); // Si es 0 está inactivo, cualquier otro valor es activo
          setPasaporteStatus(data.pasaporteStatus === 1);
          setTitulo(data.titulo || "");
          setDescripcion(data.descripcion || "");
        })
        .finally(() => setLoading(false));

      // Cargar sucursales asociadas usando el nuevo endpoint batch
      fetch(`${API_BASE_URL}/api/permisosSucursal/batch/Trivias/${id}`)
        .then(res => res.json())
        .then(sucursalIds => {
          // Convertir IDs a objetos con label
          const asociadas = sucursalIds.map(idSucursal => {
            const sucursal = sucursalesDisponibles.find(s => s.value === idSucursal);
            return {
              value: Number(idSucursal),
              label: sucursal ? sucursal.label : `Sucursal ${idSucursal}`
            };
          });
          setSucursalesSeleccionadas(asociadas);
        })
        .catch(error => {
          console.error('Error cargando sucursales asociadas:', error);
          setSucursalesSeleccionadas([]);
        });
    }
  }, [id, sucursalesDisponibles.length]);

  useEffect(() => setSeleccionarTodas(false), [filtroSucursales]);

  const sucursalesFiltradas = filtroSucursales ? sucursalesDisponibles.filter(s => s.label.toLowerCase().includes(filtroSucursales.toLowerCase())) : sucursalesDisponibles;

  const toggleSeleccionarTodas = () => {
    if (seleccionarTodas) {
      const ids = new Set(sucursalesFiltradas.map(s => s.value));
      setSucursalesSeleccionadas(prev => prev.filter(s => !ids.has(s.value)));
    } else {
      const existingIds = new Set(sucursalesSeleccionadas.map(s => s.value));
      const nuevasSucursales = sucursalesFiltradas.filter(s => !existingIds.has(s.value));
      setSucursalesSeleccionadas(prev => [...prev, ...nuevasSucursales]);
    }
    setSeleccionarTodas(!seleccionarTodas);
  };

  const procesarImportacion = () => {
    setProcesandoImportacion(true);
    try {
      const texto = textoImportacion.trim();
      const items = texto.split(/[\n\r,;\t]+/).map(i => i.trim()).filter(Boolean);
      const byId = new Map();
      const byName = new Map();
      const noFound = [];
      items.forEach(it => {
        if (/^\d+$/.test(it)) {
          const idS = Number(it);
          const s = sucursalesDisponibles.find(x => x.value === idS);
          if (s) byId.set(s.value, s); else noFound.push(it);
        } else {
          const low = it.toLowerCase();
          const s = sucursalesDisponibles.find(x => x.label.toLowerCase().includes(low) || low.includes(x.label.toLowerCase()));
          if (s) byName.set(s.value, s); else noFound.push(it);
        }
      });
      setResultadosImportacion({ porId: Array.from(byId.values()), porNombre: Array.from(byName.values()), noEncontrados: noFound, total: byId.size + byName.size });
    } catch (e) {
      console.error(e);
      setResultadosImportacion({ porId: [], porNombre: [], noEncontrados: ["Error procesando"], total: 0 });
    }
    setProcesandoImportacion(false);
  };

  const aplicarImportacion = () => {
    if (!resultadosImportacion) return;
    const nuevas = [...resultadosImportacion.porId, ...resultadosImportacion.porNombre];
    const ids = new Set(sucursalesSeleccionadas.map(s => s.value));
    const únicas = nuevas.filter(s => !ids.has(s.value));
    setSucursalesSeleccionadas(prev => [...prev, ...únicas]);
    cerrarModalImportacion();
  };

  const cerrarModalImportacion = () => {
    setMostrarModalImportar(false);
    setTextoImportacion("");
    setResultadosImportacion(null);
  };

  // Validación mejorada
  const validate = () => {
    const errs = {};

    // Validar URL EndPoint (obligatorio, sin espacios ni caracteres especiales)
    if (!urlEndPoint) {
      errs.urlEndPoint = "URL de acceso obligatoria";
    } else if (!/^[a-zA-Z0-9-_]+$/.test(urlEndPoint)) {
      errs.urlEndPoint = "Solo letras, números, guiones (-) y guiones bajos (_)";
    }

    // Validar campos obligatorios
    if (!bannerPrincipal && !initialData?.bannerPrincipal) errs.bannerPrincipal = "Banner principal obligatorio";
    if (!bannerMovil && !initialData?.bannerMovil) errs.bannerMovil = "Banner móvil obligatorio";
    if (!legal && !initialData?.legal) errs.legal = "Archivo legal obligatorio";
    if (!fhInicio) errs.fhInicio = "Fecha/hora de inicio obligatoria";
    if (!fhFin) errs.fhFin = "Fecha/hora de fin obligatoria";
    if (!titulo) errs.titulo = "Título obligatorio";

    // Descripción ahora es opcional
    // if (!descripcion) errs.descripcion = "Descripción obligatoria";

    setErrors(errs);

    // Mostrar alerta si hay errores
    if (Object.keys(errs).length > 0) {
      // Crear mensaje de alerta con campos faltantes
      const camposFaltantes = Object.keys(errs).map(key => {
        switch (key) {
          case 'urlEndPoint': return 'URL de acceso';
          case 'bannerPrincipal': return 'Banner principal';
          case 'bannerMovil': return 'Banner móvil';
          case 'legal': return 'Archivo legal';
          case 'fhInicio': return 'Fecha de inicio';
          case 'fhFin': return 'Fecha de fin';
          case 'titulo': return 'Título';
          default: return key;
        }
      });

      alert(`Por favor, completa correctamente los siguientes campos:\n• ${camposFaltantes.join('\n• ')}`);
    }

    return Object.keys(errs).length === 0;
  };

  // Función para validar archivos antes de subirlos
  const validateFile = (file, maxSizeMB = 5, allowedTypes = null) => {
    if (!file) return true;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`);
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido. Permitidos: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`);
    }

    return true;
  };

  // Función para subir archivos a S3 mediante URL presignada
  const uploadToS3 = async (file, tipo) => {
    try {
      console.log(`Iniciando subida de archivo ${tipo}:`, file.name);

      // Actualizar estado de progreso
      setUploadProgress(prev => ({
        ...prev,
        [tipo]: {
          status: 'requesting',
          progress: 0
        }
      }));

      // Paso 1: Solicitar una URL presignada al backend
      const uploadUrlResponse = await fetch(`${API_BASE_URL}/api/trivias/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,  // Cambiado a filename para coincidir con el backend
          filetype: file.type   // Cambiado a filetype para coincidir con el backend
          // Omitimos folder ya que el backend no lo usa
        })
      });

      if (!uploadUrlResponse.ok) {
        const errorData = await uploadUrlResponse.json().catch(() => ({}));
        throw new Error(`Error al obtener URL para subir: ${errorData.message || uploadUrlResponse.statusText}`);
      }

      // Extraer datos en el formato que devuelve el backend
      const { url: presignedUrl, key } = await uploadUrlResponse.json();
      console.log("URL presignada obtenida correctamente");

      // Construir la URL final basada en la clave devuelta
      const finalUrl = `${S3_BASE_URL}/${key}`;
      // Actualizar progreso
      setUploadProgress(prev => ({
        ...prev,
        [tipo]: {
          status: 'uploading',
          progress: 10
        }
      }));

      // Paso 2: Subir el archivo usando XMLHttpRequest para monitorear el progreso
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = 10 + ((event.loaded / event.total) * 90);
            setUploadProgress(prev => ({
              ...prev,
              [tipo]: {
                status: 'uploading',
                progress: percentComplete
              }
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(prev => ({
              ...prev,
              [tipo]: {
                status: 'completed',
                progress: 100
              }
            }));
            resolve();
          } else {
            setUploadProgress(prev => ({
              ...prev,
              [tipo]: {
                status: 'error',
                progress: 0
              }
            }));
            reject(new Error(`Error en la subida: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          setUploadProgress(prev => ({
            ...prev,
            [tipo]: {
              status: 'error',
              progress: 0
            }
          }));
          reject(new Error('Error de red durante la subida'));
        };

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      console.log(`Archivo ${tipo} subido exitosamente:`, finalUrl);
      return finalUrl; // Devuelve la URL pública final del archivo

    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [tipo]: {
          status: 'error',
          progress: 0,
          error: error.message
        }
      }));
      console.error("Error en uploadToS3:", error);
      throw error; // Re-lanzar el error para manejarlo en handleSubmit
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (loadingSucursales) {
      alert('Espera a que termine de procesar las sucursales');
      return;
    }
    setLoading(true);

    try {
      // Subir archivos si hay nuevos
      let bannerPrincipalUrl = initialData?.bannerPrincipal || "";
      let bannerMovilUrl = initialData?.bannerMovil || "";
      let logoMarcaUrl = initialData?.logoMarca || "";
      let legalUrl = initialData?.legal || "";

      try {
        // Validar archivos antes de subirlos
        if (bannerPrincipal) {
          validateFile(bannerPrincipal, 5, ['image/jpeg', 'image/png', 'image/webp']);
          bannerPrincipalUrl = await uploadToS3(bannerPrincipal, "bannerPrincipal");
        }

        if (bannerMovil) {
          validateFile(bannerMovil, 5, ['image/jpeg', 'image/png', 'image/webp']);
          bannerMovilUrl = await uploadToS3(bannerMovil, "bannerMovil");
        }

        if (logoMarca) {
          validateFile(logoMarca, 2, ['image/jpeg', 'image/png', 'image/webp']);
          logoMarcaUrl = await uploadToS3(logoMarca, "logoMarca");
        }

        if (legal) {
          validateFile(legal, 10, ['application/pdf']);
          legalUrl = await uploadToS3(legal, "legal");
        }
      } catch (uploadError) {
        console.error("Error subiendo archivos:", uploadError);
        alert(`Error al subir archivos: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      // Objeto completo para enviar al servidor
      const body = {
        urlEndPoint,
        bannerPrincipal: bannerPrincipalUrl,
        bannerMovil: bannerMovilUrl,
        logoMarca: logoMarcaUrl || "",
        colorFooter,
        colorHeader,
        legal: legalUrl,
        fhInicio,
        fhFin,
        emailStatus: emailStatus ? 1 : 0,
        visaStatus: visaStatus ? 1 : 0,
        pasaporteStatus: pasaporteStatus ? 1 : 0,
        titulo,
        descripcion: descripcion || "",
        status: status ? 1 : 0
      };

      console.log("Enviando datos al servidor:", body);

      const method = initialData ? "PUT" : "POST";
      const endpoint = initialData
        ? `${API_BASE_URL}/api/triviasconfig/${id}`
        : `${API_BASE_URL}/api/triviasconfig`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(body),
      });

      // Verificar si la respuesta es exitosa
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
      }

      const nuevo = await res.json();
      console.log("Trivia guardada correctamente:", nuevo);

      // Asegurarse de que hay un ID válido antes de guardar permisos
      if (!nuevo.idTriviaConfig && !nuevo.id) {
        throw new Error("No se recibió un ID válido del servidor");
      }

      const idObjeto = nuevo.idTriviaConfig || nuevo.id;
      
      // Guardar sucursales usando el nuevo método batch
      await guardarSucursalesBatch(idObjeto);

      // Redirigir al listado después de guardar exitosamente
      navigate("/trivias/gestionar");
    } catch (e) {
      console.error("Error guardando trivia:", e);
      alert(`No se pudo guardar la trivia: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !initialData) return (
    <Card className="bg-white shadow-lg rounded-lg">
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
      </div>
    </Card>
  );

  // Configuraciones del editor
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  // Función para renderizar barra de progreso
  const renderProgressBar = (tipo) => {
    const progress = uploadProgress[tipo];
    if (!progress) return null;

    return (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${progress.status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${progress.progress}%` }}
          ></div>
        </div>
        <div className="text-xs mt-1">
          {progress.status === 'requesting' && 'Solicitando URL de subida...'}
          {progress.status === 'uploading' && `Subiendo: ${Math.round(progress.progress)}%`}
          {progress.status === 'completed' && 'Subida completada'}
          {progress.status === 'error' && `Error: ${progress.error || 'No se pudo subir el archivo'}`}
        </div>
      </div>
    );
  };

  // NUEVA FUNCIÓN: Guardar sucursales en batch (mucho más rápido)
  const guardarSucursalesBatch = async (idObjeto) => {
    try {
      setLoadingSucursales(true);

      const sucursalIds = sucursalesSeleccionadas.map(s => s.value);

      const response = await fetch(`${API_BASE_URL}/api/permisosSucursal/batch-replace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objetoName: "Trivias",
          idObjeto: Number(idObjeto),
          sucursalIds: sucursalIds
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar permisos de sucursales');
      }

      const result = await response.json();
      console.log('Sucursales actualizadas:', result);

    } catch (error) {
      console.error("Error al gestionar permisos de sucursales:", error);
      throw error; // Re-throw para manejar en handleSubmit
    } finally {
      setLoadingSucursales(false);
    }
  };

  return (
    <>
      <Card className="bg-white shadow-lg rounded-xl p-6 max-w-4xl mx-auto mt-8">
        <Title className="text-2xl font-bold mb-6">{initialData ? "Editar Trivia" : "Nueva Trivia"}</Title>

        {/* Leyenda de campos */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 bg-gray-100 text-sm rounded-md">
            <span className="text-red-500 mr-1">*</span> Campo obligatorio
          </span>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          
          {/* Indicador de carga para sucursales */}
          {loadingSucursales && (
            <div className="w-full my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 font-medium">Actualizando permisos de sucursales...</span>
              </div>
            </div>
          )}

          {/* Sección: Información Básica */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FieldLabel text="URL EndPoint" />
                <TextInput
                  value={urlEndPoint}
                  onChange={e => setUrlEndPoint(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                  placeholder="Ejemplo: mi-trivia-2025"
                  error={!!errors.urlEndPoint}
                />
                {errors.urlEndPoint ? (
                  <Text className="text-red-600 text-xs mt-1">{errors.urlEndPoint}</Text>
                ) : (
                  <Text className="text-gray-500 text-xs mt-1">Solo letras, números, guiones (-) y guiones bajos (_)</Text>
                )}
              </div>
              <div>
                <FieldLabel text="Título" />
                <TextInput
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  error={!!errors.titulo}
                />
                {errors.titulo && <Text className="text-red-600 text-xs mt-1">{errors.titulo}</Text>}
              </div>
              <div>
                <FieldLabel text="Fecha/Hora de Inicio" />
                <TextInput
                  type="datetime-local"
                  value={fhInicio}
                  onChange={e => setFhInicio(e.target.value)}
                  error={!!errors.fhInicio}
                />
                {errors.fhInicio && <Text className="text-red-600 text-xs mt-1">{errors.fhInicio}</Text>}
              </div>
              <div>
                <FieldLabel text="Fecha/Hora de Fin" />
                <TextInput
                  type="datetime-local"
                  value={fhFin}
                  onChange={e => setFhFin(e.target.value)}
                  error={!!errors.fhFin}
                />
                {errors.fhFin && <Text className="text-red-600 text-xs mt-1">{errors.fhFin}</Text>}
              </div>
            </div>
          </div>

          {/* Sección: Imágenes */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Imágenes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FieldLabel text="Banner Principal (desktop)" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={bannerPrincipalRef}
                  onChange={e => setBannerPrincipal(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                />
                {renderProgressBar("bannerPrincipal")}
                {initialData?.bannerPrincipal && (
                  <div className="mt-2">
                    <img
                      src={initialData.bannerPrincipal}
                      alt="Banner principal"
                      className="h-16 rounded"
                      onError={(e) => {
                        console.log("Error cargando imagen de banner principal");
                        e.target.src = "https://via.placeholder.com/400x150?text=Banner+no+disponible";
                      }}
                    />
                  </div>
                )}
                {errors.bannerPrincipal && <Text className="text-red-600 text-xs mt-1">{errors.bannerPrincipal}</Text>}
              </div>
              <div>
                <FieldLabel text="Banner Móvil" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={bannerMovilRef}
                  onChange={e => setBannerMovil(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                />
                {renderProgressBar("bannerMovil")}
                {initialData?.bannerMovil && (
                  <div className="mt-2">
                    <img
                      src={initialData.bannerMovil}
                      alt="Banner móvil"
                      className="h-16 rounded"
                      onError={(e) => {
                        console.log("Error cargando imagen de banner móvil");
                        e.target.src = "https://via.placeholder.com/400x150?text=Banner+no+disponible";
                      }}
                    />
                  </div>
                )}
                {errors.bannerMovil && <Text className="text-red-600 text-xs mt-1">{errors.bannerMovil}</Text>}
              </div>
              <div>
                <FieldLabel text="Logo Marca" required={false} />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={logoMarcaRef}
                  onChange={e => setLogoMarca(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                />
                {renderProgressBar("logoMarca")}
                {initialData?.logoMarca && (
                  <div className="mt-2">
                    <img
                      src={initialData.logoMarca}
                      alt="Logo marca"
                      className="h-12 rounded"
                      onError={(e) => {
                        console.log("Error cargando imagen de logo");
                        e.target.src = "https://via.placeholder.com/150x150?text=Logo+no+disponible";
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <FieldLabel text="Legal (PDF)" />
                <input
                  type="file"
                  accept="application/pdf"
                  ref={legalRef}
                  onChange={e => setLegal(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white"
                />
                {renderProgressBar("legal")}
                {initialData?.legal && (
                  <a href={initialData.legal} target="_blank" rel="noopener noreferrer" className="block mt-2 text-blue-700 underline">Ver PDF actual</a>
                )}
                {errors.legal && <Text className="text-red-600 text-xs mt-1">{errors.legal}</Text>}
              </div>
            </div>
          </div>

          {/* Sección: Colores y Opciones */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Colores y Opciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FieldLabel text="Color Header" required={false} />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHeader}
                    onChange={e => setColorHeader(e.target.value)}
                    className="w-12 h-8 p-0 border-0 rounded"
                  />
                  <span className="text-sm text-gray-600">{colorHeader}</span>
                </div>
              </div>
              <div>
                <FieldLabel text="Color Footer" required={false} />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorFooter}
                    onChange={e => setColorFooter(e.target.value)}
                    className="w-12 h-8 p-0 border-0 rounded"
                  />
                  <span className="text-sm text-gray-600">{colorFooter}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={emailStatus}
                  onChange={(e) => setEmailStatus(e.target.checked)}
                  id="emailStatus"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="emailStatus" className="font-medium text-gray-700">Solicitar correo electrónico</label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={visaStatus}
                  onChange={(e) => setVisaStatus(e.target.checked)}
                  id="visaStatus"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="visaStatus" className="font-medium text-gray-700">Solicitar visa</label>
              </div>

              {/* Nuevos checkboxes */}
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={pasaporteStatus}
                  onChange={(e) => setPasaporteStatus(e.target.checked)}
                  id="pasaporteStatus"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="pasaporteStatus" className="font-medium text-gray-700">Solicitar pasaporte</label>
              </div>

            </div>
          </div>


          {/* Sección: Descripción */}
          <div className="border-b pb-4">
            <FieldLabel text="Descripción" required={false} />
            <div className="border rounded-lg overflow-hidden h-[250px]">
              <QuillWrapper
                ref={quillRef}
                value={descripcion}
                onChange={setDescripcion}
                modules={quillModules}
                className="bg-white h-full"
              />
            </div>
            {errors.descripcion && <Text className="text-red-600 text-xs mt-1">{errors.descripcion}</Text>}
          </div>



          {/* Sección: Sucursales */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FieldLabel text="Sucursales donde aplica" required={false} />
              <div className="group relative cursor-help">
                <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                <div className="absolute left-full top-0 ml-2 hidden w-64 rounded bg-gray-800 p-2 text-xs text-white group-hover:block z-10">
                  Si no seleccionas sucursales, esta trivia aplicará a todas.
                </div>
              </div>
            </div>
            <div className="mb-3 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <TextInput placeholder="Buscar sucursales..." value={filtroSucursales} onChange={(e) => setFiltroSucursales(e.target.value)} className="max-w-md" />
                <Button type="button" color="blue" variant="secondary" onClick={() => setMostrarModalImportar(true)} icon={DocumentTextIcon}>Importar desde texto</Button>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-3 border rounded-lg">
                <div>
                  <span className="text-sm font-medium">{sucursalesFiltradas.length} sucursales mostradas</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-sm text-blue-600 font-medium">{sucursalesSeleccionadas.length} seleccionadas</span>
                </div>
                <button
                  type="button"
                  onClick={toggleSeleccionarTodas}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  disabled={loadingSucursales}
                >
                  {seleccionarTodas ? 'Deseleccionar todas' : 'Seleccionar todas las filtradas'}
                </button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y">
                {sucursalesFiltradas.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 col-span-3">No se encontraron sucursales con ese filtro</div>
                ) : (
                  sucursalesFiltradas.map(sucursal => {
                    const isSelected = sucursalesSeleccionadas.some(s => s.value === sucursal.value);
                    return (
                      <div key={sucursal.value} className={`p-2 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" checked={isSelected} onChange={() => {
                            if (isSelected) setSucursalesSeleccionadas(prev => prev.filter(s => s.value !== sucursal.value));
                            else setSucursalesSeleccionadas(prev => [...prev, sucursal]);
                          }} className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2" disabled={loadingSucursales} />
                          <div className="text-sm truncate"><span className="text-gray-500 mr-1">{sucursal.value}:</span>{sucursal.label}</div>
                        </label>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <Text className="text-xs text-gray-500 mt-2">Si no seleccionas sucursales, esta trivia aplicará a todas.</Text>
          </div>

          {/* Sección: Estado de la trivia (separada) */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-4">Estado de la trivia</h3>
            <div className="border p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  onClick={() => setStatus(!status)}
                  className={`px-4 py-2 rounded font-bold border-none shadow-sm transition-colors
        ${status
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                >
                  {status ? "Activa" : "Inactiva"}
                </Button>
                <Text className="text-gray-500 text-sm">
                  {status ? "La trivia está publicada y visible para los usuarios" : "La trivia está en modo borrador (no visible)"}
                </Text>
              </div>
            </div>
          </div>

          {/* Botones - actualizado al estilo de TriviasDetalle */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              onClick={() => navigate("/trivias/gestionar")}
              variant="light"
              className="text-blue-700"
            >
              ← Volver a Trivias
            </Button>

            <div className="flex gap-4">
              <Button
                type="submit"
                color="blue"
                loading={loading || loadingSucursales}
                disabled={loading || loadingSucursales}
                className="flex items-center gap-2"
              >
                <span className="flex items-center gap-2">
                  {initialData ? (
                    <>
                      <PencilSquareIcon className="w-5 h-5" />
                      Guardar cambios
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      Crear trivia
                    </>
                  )}
                </span>
              </Button>

              <Button
                type="button"
                color="gray"
                onClick={() => navigate("/trivias/gestionar")}
                className="flex items-center gap-2"
              >
                <span className="flex items-center gap-2">
                  <XMarkIcon className="w-5 h-5" />
                  Cancelar
                </span>
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {mostrarModalImportar && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Importar sucursales desde texto</h3>
                <button
                  type="button"
                  onClick={cerrarModalImportacion}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {!resultadosImportacion ? (
                <>
                  <div className="mb-4">
                    <p className="text-gray-600 mb-2">Pega el listado de sucursales (IDs o nombres) separados por comas, saltos de línea o cualquier otro separador.</p>
                    <textarea ref={textareaRef} value={textoImportacion} onChange={(e) => setTextoImportacion(e.target.value)} className="w-full h-48 p-3 border border-gray-300 rounded-lg" placeholder="Ejemplo: 1, 2, 3, Sucursal Principal..." />
                    <div className="text-xs text-gray-500 mt-1">Tip: Puedes copiar directamente desde Excel y pegar aquí.</div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                      onClick={cerrarModalImportacion}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${!textoImportacion.trim() || procesandoImportacion ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={procesarImportacion}
                      disabled={!textoImportacion.trim() || procesandoImportacion}
                    >
                      {procesandoImportacion ? 'Procesando...' : 'Procesar'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="font-medium text-blue-800">
                        Se encontraron {resultadosImportacion.total} coincidencias
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Por ID ({resultadosImportacion.porId.length}):</h4>
                      {resultadosImportacion.porId.length > 0 ? (
                        <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                          {resultadosImportacion.porId.map(s => (
                            <div key={s.value} className="text-sm py-1">
                              <span className="font-mono bg-blue-100 text-blue-800 px-1 rounded">ID {s.value}</span>
                              <span className="ml-2">{s.label}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-500">No se encontraron coincidencias por ID</p>}
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Por Nombre ({resultadosImportacion.porNombre.length}):</h4>
                      {resultadosImportacion.porNombre.length > 0 ? (
                        <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                          {resultadosImportacion.porNombre.map(s => (
                            <div key={s.value} className="text-sm py-1">
                              <span className="ml-2">{s.label}</span>
                              <span className="font-mono bg-blue-100 text-blue-800 px-1 rounded ml-2">ID {s.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-500">No se encontraron coincidencias por nombre</p>}
                    </div>

                    {resultadosImportacion.noEncontrados.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">No encontrados ({resultadosImportacion.noEncontrados.length}):</h4>
                        <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                          {resultadosImportacion.noEncontrados.map((item, i) => (
                            <div key={i} className="text-sm py-1 text-red-600">{item}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                      onClick={cerrarModalImportacion}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                      onClick={() => setResultadosImportacion(null)}
                    >
                      Modificar lista
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${resultadosImportacion.total === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={aplicarImportacion}
                      disabled={resultadosImportacion.total === 0}
                    >
                      Añadir {resultadosImportacion.total} sucursales
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}