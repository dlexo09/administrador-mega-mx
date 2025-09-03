import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { API_BASE_URL } from "../config";
import { ArrowLeftIcon, DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function LegalTerminosForm() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [contenido, setContenido] = useState("");
  const [status, setStatus] = useState(1);
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [filtroSucursales, setFiltroSucursales] = useState("");
  const [seleccionarTodas, setSeleccionarTodas] = useState(false);

  const [mostrarModalImportar, setMostrarModalImportar] = useState(false);
  const [textoImportacion, setTextoImportacion] = useState("");
  const [resultadosImportacion, setResultadosImportacion] = useState(null);
  const [procesandoImportacion, setProcesandoImportacion] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const fetchSucursales = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/sucursales`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setSucursalesDisponibles(data.map(s => ({ value: Number(s.idSucursal), label: s.sucursalName })));
      } catch (e) {
        console.error("Error al cargar sucursales:", e);
        setSucursalesDisponibles([]);
      }
      setLoading(false);
    };
    fetchSucursales();
  }, []);

  useEffect(() => setSeleccionarTodas(false), [filtroSucursales]);

  const sucursalesFiltradas = filtroSucursales ? sucursalesDisponibles.filter(s => s.label.toLowerCase().includes(filtroSucursales.toLowerCase())) : sucursalesDisponibles;

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

  const handleGuardar = async () => {
    if (!nombre.trim() || !contenido.trim()) {
      alert("Título y contenido obligatorios");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/terminos-condiciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, texto: contenido, status })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const nuevo = await res.json();

      // Crear permisos para sucursales seleccionadas (POST). NO envío `status` si tu tabla no lo tiene.
      if (sucursalesSeleccionadas.length > 0 && nuevo.id) {
        for (const s of sucursalesSeleccionadas) {
          await fetch(`${API_BASE_URL}/api/permisosSucursal`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              objetoName: "TerminosCondiciones",
              idObjeto: Number(nuevo.id),
              idSucursal: Number(s.value)
              // agrega create_user si lo usas
            })
          });
        }
      }

      navigate("/legal/terminos");
    } catch (e) {
      console.error("Error al guardar:", e);
      alert("Error al guardar el término y condición");
    } finally {
      setGuardando(false);
    }
  };

  if (loading && !guardando) return (
    <Card className="bg-white shadow-lg rounded-lg">
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
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
          <Text className="ml-4 text-gray-500">Crear nuevo término y condición</Text>
        </div>

        <div className="mb-6">
          <Title className="text-2xl font-bold">Nuevo Término y Condición</Title>
          <Text className="text-gray-500">Ingrese la información del nuevo documento</Text>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block font-medium mb-2 text-gray-700">Título:</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5" placeholder="Ej: Términos y condiciones generales" />
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
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t">
            <button className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition ${guardando ? 'opacity-70 cursor-not-allowed' : ''}`} onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg transition" onClick={() => navigate("/legal/terminos")} disabled={guardando}>Cancelar</button>
          </div>
        </div>
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