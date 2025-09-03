import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Card, Title, Text, Badge, TextInput, Button } from "@tremor/react";
import { API_BASE_URL } from "../config";
import { ArrowLeftIcon, DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function LegalTerminosDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [termino, setTermino] = useState(null);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [contenido, setContenido] = useState("");
  const [status, setStatus] = useState(1);

  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]); // { idSucursal, sucursalName, value, label }
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [filtroSucursales, setFiltroSucursales] = useState("");
  const [seleccionarTodas, setSeleccionarTodas] = useState(false);

  // importador
  const [mostrarModalImportar, setMostrarModalImportar] = useState(false);
  const [textoImportacion, setTextoImportacion] = useState("");
  const [resultadosImportacion, setResultadosImportacion] = useState(null);
  const [procesandoImportacion, setProcesandoImportacion] = useState(false);
  const textareaRef = useRef(null);

  const sucursalesFiltradas = filtroSucursales
    ? sucursalesDisponibles.filter(s => s.label.toLowerCase().includes(filtroSucursales.toLowerCase()))
    : sucursalesDisponibles;

  useEffect(() => {
    setSeleccionarTodas(false);
  }, [filtroSucursales]);

  useEffect(() => {
    console.log("[LOG] LegalTerminosDetalle mount/update id:", id, "editando:", editando);
  }, [id, editando]);

  // fetchTermino
  useEffect(() => {
    const fetchTermino = async () => {
      setLoading(true);
      try {
        console.log("[LOG] Fetching termino id:", id);
        const res = await fetch(`${API_BASE_URL}/api/terminos-condiciones/${id}`);
        console.log("[LOG] termino status:", res.status);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        console.log("[LOG] termino data:", data);
        setTermino(data);
        setNombre(data.nombre || "");
        setContenido(data.texto || "");
        setStatus(data.status ?? 1);
      } catch (e) {
        console.error("[ERROR] cargar término:", e);
        setTermino(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTermino();
  }, [id]);

  // fetchSucursales — devuelve array normalizado y setea sucursalesDisponibles
  const fetchSucursales = async () => {
    setLoadingSucursales(true);
    try {
      console.log("[LOG] Fetching todas sucursales");
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

  // fetch permisos y mapear a sucursales asociadas
  useEffect(() => {
    const fetchSucursalesAsociadas = async () => {
      try {
        console.log("[LOG] Fetch permisosSucursal for TerminosCondiciones idObjeto=", id);
        const res = await fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=TerminosCondiciones&idObjeto=${id}`);
        console.log("[LOG] permisosSucursal status:", res.status);
        if (!res.ok) {
          console.warn("[WARN] permisosSucursal no OK -> termino.sucursales = []");
          setTermino(prev => ({ ...prev, sucursales: [] }));
          return;
        }
        const permisos = await res.json();
        console.log("[LOG] permisos raw:", permisos);

        if (!Array.isArray(permisos) || permisos.length === 0) {
          console.log("[LOG] No hay permisos -> termino.sucursales = []");
          setTermino(prev => ({ ...prev, sucursales: [] }));
          return;
        }

        const ids = permisos.map(p => Number(p.idSucursal));
        console.log("[LOG] permisos ids:", ids);

        // Obtener todas las sucursales (usa fetchSucursales para consistencia)
        const todasNorm = await fetchSucursales(); // devuelve objetos con idSucursal, sucursalName, value, label
        const asociadas = todasNorm.filter(s => ids.includes(s.idSucursal));
        console.log("[LOG] sucursales asociadas encontradas:", asociadas.length, asociadas);

        // setear en termino
        setTermino(prev => ({ ...prev, sucursales: asociadas.map(s => ({ idSucursal: s.idSucursal, sucursalName: s.sucursalName })) }));

        // si estamos en edición, setea selección
        if (editando) {
          setSucursalesSeleccionadas(asociadas.map(s => ({ value: s.idSucursal, label: s.sucursalName })));
          console.log("[LOG] sucursalesSeleccionadas set:", asociadas.map(s => s.idSucursal));
        }
      } catch (e) {
        console.error("[ERROR] cargar sucursales asociadas:", e);
        setTermino(prev => ({ ...prev, sucursales: [] }));
      }
    };

    if (id) fetchSucursalesAsociadas();
  }, [id, editando]); // re-run si cambia id o editando

  useEffect(() => {
    console.log("[LOG] termino change:", termino);
  }, [termino]);

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
      setResultadosImportacion({
        porId: Array.from(byId.values()),
        porNombre: Array.from(byName.values()),
        noEncontrados: noFound,
        total: byId.size + byName.size
      });
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

  const toggleSeleccionarTodas = () => {
    if (seleccionarTodas) {
      const ids = new Set(sucursalesFiltradas.map(s => s.value));
      setSucursalesSeleccionadas(prev => prev.filter(s => !ids.has(s.value)));
    } else {
      const ya = new Set(sucursalesSeleccionadas.map(s => s.value));
      const nuevas = sucursalesFiltradas.filter(s => !ya.has(s.value));
      setSucursalesSeleccionadas(prev => [...prev, ...nuevas]);
    }
    setSeleccionarTodas(!seleccionarTodas);
  };

  const handleGuardar = async () => {
    try {
      console.log("[LOG] Guardando termino id:", id, { nombre, contenido, status });
      const res = await fetch(`${API_BASE_URL}/api/terminos-condiciones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, texto: contenido, status })
      });

      console.log("[LOG] PUT termino status:", res.status);
      if (!res.ok) {
        console.warn(`[WARN] PUT /terminos-condiciones/${id} falló (${res.status}).`);
        throw new Error(`PUT fallo ${res.status}`);
      }

      // actualizar permisos: obtener actuales, eliminar no seleccionados, crear nuevos
      try {
        const permisosRes = await fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=TerminosCondiciones&idObjeto=${id}`);
        let permisosActuales = [];
        if (permisosRes.ok) permisosActuales = await permisosRes.json();
        console.log("[LOG] permisosActuales on save:", permisosActuales);

        const seleccionadosIds = new Set(sucursalesSeleccionadas.map(s => Number(s.value)));
        const permisosIds = new Set(permisosActuales.map(p => Number(p.idSucursal)));

        for (const p of permisosActuales) {
          const pid = Number(p.idSucursal);
          if (!seleccionadosIds.has(pid)) {
            console.log("[LOG] Deleting permiso for idSucursal:", pid);
            await fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=TerminosCondiciones&idObjeto=${id}&idSucursal=${pid}`, { method: "DELETE" });
          }
        }

        for (const s of sucursalesSeleccionadas) {
          const sid = Number(s.value);
          if (!permisosIds.has(sid)) {
            console.log("[LOG] Creating permiso for idSucursal:", sid);
            await fetch(`${API_BASE_URL}/api/permisosSucursal`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                objetoName: "TerminosCondiciones",
                idObjeto: Number(id),
                idSucursal: sid
              })
            });
          }
        }
      } catch (e) {
        console.error("[ERROR] actualizar permisos:", e);
        alert("Término guardado, pero hubo un problema actualizando sucursales.");
      }

      setEditando(false);
      setTermino(prev => ({
        ...prev,
        nombre,
        texto: contenido,
        status,
        sucursales: sucursalesSeleccionadas.map(s => ({ idSucursal: Number(s.value), sucursalName: s.label }))
      }));

      alert("Cambios guardados correctamente");
    } catch (e) {
      console.error("[ERROR] guardar:", e);
      alert("Error al guardar: " + e.message);
    }
  };

  if (loading) return (
    <Card className="bg-white shadow-lg rounded-lg">
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
      </div>
    </Card>
  );

  if (!termino) return (
    <Card className="bg-white shadow-lg rounded-lg">
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <div className="text-red-500 text-xl font-medium">Término no encontrado</div>
        <p className="text-gray-500">No se encontró el documento solicitado o no tienes permisos para verlo.</p>
        <button onClick={() => navigate("/legal/terminos")} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          <ArrowLeftIcon className="h-5 w-5" /> Volver a la lista
        </button>
      </div>
    </Card>
  );

  return (
    <>
      <Card className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate("/legal/terminos")} className="mr-4 text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <ArrowLeftIcon className="h-4 w-4" /> Volver
          </button>
          <div className="h-5 border-l border-gray-300"></div>
          <Text className="ml-4 text-gray-500">Detalle de Términos y Condiciones</Text>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <Title className="text-2xl font-bold">{nombre || `Términos #${termino.id}`}</Title>
            <div className="text-sm text-gray-500 mt-1">ID: {termino.id}</div>
          </div>
          <Badge color={status === 1 ? "emerald" : "red"} size="lg" className="uppercase font-semibold">
            {status === 1 ? "Activo" : "Inactivo"}
          </Badge>
        </div>

        {!editando ? (
          <>
            <div className="space-y-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="text-lg font-semibold">Contenido</h3>
                  <button onClick={() => setExpandido(!expandido)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    {expandido ? "Contraer" : "Expandir"}
                  </button>
                </div>
                <div className={`prose max-w-none border rounded-lg p-6 bg-white overflow-y-auto ${!expandido ? 'max-h-[400px]' : ''}`}>
                  <div dangerouslySetInnerHTML={{ __html: contenido }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="text-lg font-semibold">Sucursales donde aplica</h3>
                  <span className="text-sm text-gray-500">{termino.sucursales?.length || 0} sucursales</span>
                </div>

                {Array.isArray(termino.sucursales) && termino.sucursales.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {termino.sucursales.map(s => (
                        <div key={s.idSucursal} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm truncate">
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
                    <div className="text-gray-600">No aplica en ninguna sucursal.</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
                onClick={async () => {
                  try {
                    // precargar sucursales y preparar selección basada en termino.sucursales
                    const todas = await fetchSucursales();
                    if (termino?.sucursales && termino.sucursales.length > 0) {
                      const seleccion = termino.sucursales.map(s => ({ value: Number(s.idSucursal), label: s.sucursalName }));
                      setSucursalesSeleccionadas(seleccion);
                      console.log("[LOG] setSucursalesSeleccionadas al entrar a editar:", seleccion);
                    } else {
                      setSucursalesSeleccionadas([]);
                      console.log("[LOG] no hay sucursales asociadas al entrar a editar");
                    }
                  } catch (e) {
                    console.error("[ERROR] precargar sucursales antes de editar:", e);
                  } finally {
                    setEditando(true);
                  }
                }}
              >
                Editar
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Título:</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5" placeholder="Título del documento" />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Estado:</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center"><input type="radio" value="1" checked={status === 1} onChange={() => setStatus(1)} /> <span className="ml-2">Activo</span></label>
                  <label className="inline-flex items-center"><input type="radio" value="0" checked={status === 0} onChange={() => setStatus(0)} /> <span className="ml-2">Inactivo</span></label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-2 text-gray-700">Contenido:</label>
                <div className="border rounded-lg overflow-hidden h-[250px]">
                  <ReactQuill value={contenido} onChange={setContenido} className="bg-white h-full" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-700">Sucursales donde aplica:</label>
                {loadingSucursales ? (
                  <div className="flex items-center space-x-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div><Text>Cargando sucursales...</Text></div>
                ) : (
                  <>
                    <div className="mb-3 space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <TextInput placeholder="Buscar sucursales..." value={filtroSucursales} onChange={(e) => setFiltroSucursales(e.target.value)} className="max-w-md" />
                        <Button color="blue" variant="secondary" onClick={() => setMostrarModalImportar(true)} icon={DocumentTextIcon}>Importar desde texto</Button>
                      </div>
                      <div className="flex items-center justify-between bg-gray-50 p-3 border rounded-lg">
                        <div>
                          <span className="text-sm font-medium">{sucursalesFiltradas.length} sucursales mostradas</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-blue-600 font-medium">{sucursalesSeleccionadas.length} seleccionadas</span>
                        </div>
                        <button onClick={toggleSeleccionarTodas} className="text-sm text-blue-600 hover:text-blue-800">{seleccionarTodas ? 'Deseleccionar todas' : 'Seleccionar todas las filtradas'}</button>
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
                    <Text className="text-xs text-gray-500 mt-2">Si no seleccionas sucursales, estos términos aplicarán a todas.</Text>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition" onClick={handleGuardar}>Guardar cambios</button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition" onClick={() => setEditando(false)}>Cancelar</button>
              </div>
            </div>
          </>
        )}
      </Card>

      {mostrarModalImportar && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Importar sucursales desde texto</h3>
                <button onClick={cerrarModalImportacion} className="text-gray-500 hover:text-gray-700"><XMarkIcon className="h-5 w-5" /></button>
              </div>

              {!resultadosImportacion ? (
                <>
                  <div className="mb-4">
                    <p className="text-gray-600 mb-2">Pega el listado de sucursales (IDs o nombres) separados por comas, saltos de línea o cualquier otro separador.</p>
                    <textarea ref={textareaRef} value={textoImportacion} onChange={(e) => setTextoImportacion(e.target.value)} className="w-full h-48 p-3 border border-gray-300 rounded-lg" placeholder="Ejemplo: 1, 2, 3, Sucursal Principal..." />
                    <div className="text-xs text-gray-500 mt-1">Tip: Puedes copiar directamente desde Excel y pegar aquí.</div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg" onClick={cerrarModalImportacion}>Cancelar</button>
                    <button className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${!textoImportacion.trim() || procesandoImportacion ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={procesarImportacion} disabled={!textoImportacion.trim() || procesandoImportacion}>{procesandoImportacion ? 'Procesando...' : 'Procesar'}</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"><p className="font-medium text-blue-800">Se encontraron {resultadosImportacion.total} coincidencias</p></div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Por ID ({resultadosImportacion.porId.length}):</h4>
                      {resultadosImportacion.porId.length > 0 ? (
                        <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                          {resultadosImportacion.porId.map(s => (<div key={s.value} className="text-sm py-1"><span className="font-mono bg-blue-100 text-blue-800 px-1 rounded">ID {s.value}</span><span className="ml-2">{s.label}</span></div>))}
                        </div>
                      ) : <p className="text-sm text-gray-500">No se encontraron coincidencias por ID</p>}
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Por Nombre ({resultadosImportacion.porNombre.length}):</h4>
                      {resultadosImportacion.porNombre.length > 0 ? (
                        <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                          {resultadosImportacion.porNombre.map(s => (<div key={s.value} className="text-sm py-1"><span className="ml-2">{s.label}</span><span className="font-mono bg-blue-100 text-blue-800 px-1 rounded ml-2">ID {s.value}</span></div>))}
                        </div>
                      ) : <p className="text-sm text-gray-500">No se encontraron coincidencias por nombre</p>}
                    </div>

                    {resultadosImportacion.noEncontrados.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">No encontrados ({resultadosImportacion.noEncontrados.length}):</h4>
                        <div className="max-h-24 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                          {resultadosImportacion.noEncontrados.map((item, i) => (<div key={i} className="text-sm py-1 text-red-600">{item}</div>))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg" onClick={cerrarModalImportacion}>Cancelar</button>
                    <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg" onClick={() => setResultadosImportacion(null)}>Modificar lista</button>
                    <button className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${resultadosImportacion.total === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={aplicarImportacion} disabled={resultadosImportacion.total === 0}>Añadir {resultadosImportacion.total} sucursales</button>
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