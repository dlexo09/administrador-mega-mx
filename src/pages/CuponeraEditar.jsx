import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { getImageUrl } from '../lib/imageUtils';

const CuponeraEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // Sucursales
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = useState([]);
  const [filtroSucursales, setFiltroSucursales] = useState("");
  const [seleccionarTodas, setSeleccionarTodas] = useState(false);
  const [actualizandoSucursales, setActualizandoSucursales] = useState(false);
  const [progresoSucursales, setProgresoSucursales] = useState({ total: 0, actual: 0, visible: false, mensaje: "" });
  const [mostrarModalImportar, setMostrarModalImportar] = useState(false);
  const [textoImportacion, setTextoImportacion] = useState("");
  const [resultadosImportacion, setResultadosImportacion] = useState(null);
  const [procesandoImportacion, setProcesandoImportacion] = useState(false);
  const textareaRef = useRef(null);
  // Cargar sucursales disponibles
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sucursales`)
      .then(res => res.json())
      .then(data => setSucursalesDisponibles(data.map(s => ({ value: Number(s.idSucursal), label: s.sucursalName })))
      );
  }, []);

  // Cargar sucursales asociadas
  useEffect(() => {
    if (id) {
      fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=Cuponera&idObjeto=${id}`)
        .then(res => res.json())
        .then(permisos => {
          const asociadas = permisos.map(p => ({ value: Number(p.idSucursal), label: p.sucursalName || `Sucursal ${p.idSucursal}` }));
          setSucursalesSeleccionadas(asociadas);
        })
        .catch(() => setSucursalesSeleccionadas([]));
    }
  }, [id]);
  // Guardar permisos sucursal en lotes con barra de progreso
  const guardarSucursalesBatch = async (idObjeto, sucursales, batchSize = 100) => {
    setProgresoSucursales({ total: sucursales.length, actual: 0, visible: true, mensaje: "Guardando sucursales..." });
    for (let i = 0; i < sucursales.length; i += batchSize) {
      const lote = sucursales.slice(i, i + batchSize);
      await Promise.allSettled(
        lote.map(s =>
          fetch(`${API_BASE_URL}/api/permisosSucursal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              objetoName: "Cuponera",
              idObjeto: Number(idObjeto),
              idSucursal: Number(s.value)
            })
          })
        )
      );
      setProgresoSucursales(prev => ({
        ...prev,
        actual: Math.min(prev.actual + lote.length, prev.total)
      }));
    }
    setProgresoSucursales({ total: 0, actual: 0, visible: false, mensaje: "" });
  };

  // Guardar permisos sucursal (usa batch)
  const guardarSucursales = async (idObjeto) => {
    try {
      // Eliminar permisos anteriores en lotes
      const permisosRes = await fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=Cuponera&idObjeto=${idObjeto}`);
      if (permisosRes.ok) {
        const permisosActuales = await permisosRes.json();
        await eliminarSucursalesBatch(idObjeto, permisosActuales.map(p => ({ value: Number(p.idSucursal) })));
      }
      // Crear nuevos permisos en lotes
      if (sucursalesSeleccionadas.length > 0) {
        await guardarSucursalesBatch(idObjeto, sucursalesSeleccionadas);
      }
    } catch (error) {
      console.error("Error al gestionar permisos de sucursales:", error);
    }
  };

  // Eliminar permisos sucursal en lotes
  const eliminarSucursalesBatch = async (idObjeto, sucursales, batchSize = 100) => {
    setProgresoSucursales({ total: sucursales.length, actual: 0, visible: true, mensaje: "Quitando sucursales..." });
    for (let i = 0; i < sucursales.length; i += batchSize) {
      const lote = sucursales.slice(i, i + batchSize);
      await Promise.allSettled(
        lote.map(s =>
          fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=Cuponera&idObjeto=${idObjeto}&idSucursal=${s.value}`, {
            method: "DELETE"
          })
        )
      );
      setProgresoSucursales(prev => ({
        ...prev,
        actual: Math.min(prev.actual + lote.length, prev.total)
      }));
    }
    setProgresoSucursales({ total: 0, actual: 0, visible: false, mensaje: "" });
  };

  // Botón seleccionar todas/deseleccionar (optimizado)
  const sucursalesFiltradas = filtroSucursales
    ? sucursalesDisponibles.filter(s => s.label.toLowerCase().includes(filtroSucursales.toLowerCase()))
    : sucursalesDisponibles;

  const toggleSeleccionarTodas = () => {
    setActualizandoSucursales(true);
    setProgresoSucursales({ total: sucursalesFiltradas.length, actual: 0, visible: true, mensaje: seleccionarTodas ? "Quitando sucursales..." : "Seleccionando sucursales..." });
    setTimeout(() => {
      if (seleccionarTodas) {
        // Deseleccionar todas las filtradas
        const ids = new Set(sucursalesFiltradas.map(s => s.value));
        setSucursalesSeleccionadas(prev => prev.filter(s => !ids.has(s.value)));
      } else {
        // Seleccionar todas las filtradas
        setSucursalesSeleccionadas(sucursalesFiltradas);
      }
      setSeleccionarTodas(!seleccionarTodas);
      setActualizandoSucursales(false);
      setProgresoSucursales({ total: 0, actual: 0, visible: false, mensaje: "" });
    }, 400);
  };

  // Importar sucursales desde texto
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
  const [formData, setFormData] = useState({
    NombreCupon: '',
    LinkBoton: '',
    Status: 'Activo',
    FechaInicio: '',
    FechaFin: '',
    ImgPc: '', // S3 key
    ImgMovil: '', // S3 key
    orden: 1
  });
  const [previewPc, setPreviewPc] = useState(null);
  const [previewMovil, setPreviewMovil] = useState(null);
  const [uploadingPc, setUploadingPc] = useState(false);
  const [uploadingMovil, setUploadingMovil] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/cuponera/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo obtener el cupón');
        return res.json();
      })
      .then((data) => {
        setFormData({
          NombreCupon: data.NombreCupon || '',
          LinkBoton: data.LinkBoton || '',
          Status: data.Status === 1 ? 'Activo' : 'Inactivo',
          FechaInicio: data.FechaInicio ? data.FechaInicio.slice(0, 16) : '',
          FechaFin: data.FechaFin ? data.FechaFin.slice(0, 16) : '',
          ImgPc: data.ImgPc || '',
          ImgMovil: data.ImgMovil || '',
          orden: typeof data.orden === 'number' ? data.orden : (data.orden ? Number(data.orden) : 1)
        });
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el cupón');
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'Status' && type === 'checkbox') {
      setFormData(prevState => ({
        ...prevState,
        Status: checked ? 'Activo' : 'Inactivo'
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  // Subida de imagen PC
  const handleFilePc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPc(true);
    setPreviewPc(URL.createObjectURL(file));
    try {
      // Solicitar presigned-url
      const presignedRes = await fetch(`${API_BASE_URL}/api/cuponera/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, filetype: file.type })
      });
      const { url, key } = await presignedRes.json();
      // Subir a S3
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      setFormData(prev => ({ ...prev, ImgPc: key }));
    } catch (err) {
      alert('Error subiendo imagen PC');
    }
    setUploadingPc(false);
  };

  // Subida de imagen Móvil
  const handleFileMovil = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingMovil(true);
    setPreviewMovil(URL.createObjectURL(file));
    try {
      // Solicitar presigned-url
      const presignedRes = await fetch(`${API_BASE_URL}/api/cuponera/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, filetype: file.type })
      });
      const { url, key } = await presignedRes.json();
      // Subir a S3
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      setFormData(prev => ({ ...prev, ImgMovil: key }));
    } catch (err) {
      alert('Error subiendo imagen móvil');
    }
    setUploadingMovil(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (actualizandoSucursales || progresoSucursales.visible) return;
    setLoading(true);
    setError('');
    try {
      const statusValue = formData.Status === 'Activo' ? 1 : 0;
      const dataToSend = {
        ...formData,
        Status: statusValue,
        CreateAt: new Date().toISOString()
      };
      const response = await fetch(`${API_BASE_URL}/api/cuponera/${id}` , {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dataToSend,
          orden: formData.orden || 1
        }),
      });
      if (response.ok) {
        await guardarSucursales(id);
        alert('Cupón editado exitosamente');
        navigate('/cuponera');
      } else {
        setError('Error al editar el cupón');
      }
    } catch (err) {
      setError('Error al editar el cupón');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/cuponera');
  };

  // Barra de progreso visual
  const ProgresoBarra = ({ progreso }) => {
    if (!progreso.visible || progreso.total === 0) return null;
    const porcentaje = Math.round((progreso.actual / progreso.total) * 100);
    return (
      <div className="w-full my-4">
        <div className="mb-1 text-sm text-blue-700 font-medium">{progreso.mensaje} ({progreso.actual}/{progreso.total})</div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all"
            style={{ width: `${porcentaje}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Editar Cupón</h1>
        {loading ? (
          <div className="text-gray-500">Cargando...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <ProgresoBarra progreso={progresoSucursales} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Orden */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orden *
                      </label>
                      <input
                        type="number"
                        name="orden"
                        min={1}
                        value={formData.orden}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ejemplo: 1"
                      />
                      <span className="text-xs text-gray-500">El cupón con menor número aparecerá primero.</span>
                    </div>
            {/* Permisos por sucursal */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Sucursales donde aplica</span>
                <span className="text-xs text-gray-500">(opcional)</span>
              </div>
              <div className="mb-3 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <input type="text" placeholder="Buscar sucursales..." value={filtroSucursales} onChange={(e) => setFiltroSucursales(e.target.value)} className="max-w-md border rounded px-2 py-1" />
                  <button type="button" className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm" onClick={() => setMostrarModalImportar(true)}>
                    Importar desde texto
                  </button>
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
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={actualizandoSucursales || progresoSucursales.visible}
                  >
                    {seleccionarTodas ? 'Deseleccionar todas' : 'Seleccionar todas las filtradas'}
                  </button>
                  {(actualizandoSucursales || progresoSucursales.visible) && (
                    <span className="ml-2 text-blue-600 animate-pulse">Procesando...</span>
                  )}
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
                            }} className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2" />
                            <div className="text-sm truncate"><span className="text-gray-500 mr-1">{sucursal.value}:</span>{sucursal.label}</div>
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-2 block">Si no seleccionas sucursales, este cupón aplicará a todas.</span>
            </div>
          {/* Modal importar sucursales */}
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
                      ×
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
              {/* Nombre del Cupón */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Cupón *
                </label>
                <input
                  type="text"
                  name="NombreCupon"
                  value={formData.NombreCupon}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese el nombre del cupón"
                />
              </div>
              {/* Link del Botón */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link del Botón *
                </label>
                <input
                  type="url"
                  name="LinkBoton"
                  value={formData.LinkBoton}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://ejemplo.com"
                />
              </div>
              {/* Status Switch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-semibold ${formData.Status === 'Activo' ? 'text-green-600' : 'text-gray-400'}`}>Activo</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="Status"
                      checked={formData.Status === 'Activo'}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all duration-200"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                  </label>
                  <span className={`text-sm font-semibold ${formData.Status === 'Inactivo' ? 'text-red-600' : 'text-gray-400'}`}>Inactivo</span>
                </div>
              </div>
              {/* Fecha de Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="datetime-local"
                  name="FechaInicio"
                  value={formData.FechaInicio}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Fecha de Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin *
                </label>
                <input
                  type="datetime-local"
                  name="FechaFin"
                  value={formData.FechaFin}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Imagen PC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen PC *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFilePc}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {uploadingPc && <span className="text-blue-500">Subiendo imagen...</span>}
              </div>
              {/* Imagen Móvil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen Móvil *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileMovil}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {uploadingMovil && <span className="text-blue-500">Subiendo imagen...</span>}
              </div>
            </div>
            {/* Preview de imágenes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(previewPc || formData.ImgPc) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {previewPc ? 'Preview PC (nuevo):' : 'Imagen PC actual:'}
                  </h3>
                  <img 
                    src={previewPc || getImageUrl(formData.ImgPc)} 
                    alt="Preview PC" 
                    className="w-full h-32 object-cover border rounded-md" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    style={{ display: 'none' }} 
                    className="w-full h-32 bg-gray-200 border rounded-md flex items-center justify-center"
                  >
                    <span className="text-gray-500 text-sm">Error cargando imagen PC</span>
                  </div>
                </div>
              )}
              {(previewMovil || formData.ImgMovil) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {previewMovil ? 'Preview Móvil (nuevo):' : 'Imagen Móvil actual:'}
                  </h3>
                  <img 
                    src={previewMovil || getImageUrl(formData.ImgMovil)} 
                    alt="Preview Móvil" 
                    className="w-full h-32 object-cover border rounded-md" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    style={{ display: 'none' }} 
                    className="w-full h-32 bg-gray-200 border rounded-md flex items-center justify-center"
                  >
                    <span className="text-gray-500 text-sm">Error cargando imagen Móvil</span>
                  </div>
                </div>
              )}
            </div>
            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
 
export default CuponeraEditar;
