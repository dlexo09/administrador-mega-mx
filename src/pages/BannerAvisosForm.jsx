import { useState, useEffect, useRef } from "react";
import { Card, Title, TextInput, Button, Text, Textarea } from "@tremor/react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, S3_BASE_URL } from "../config";
import { PencilSquareIcon, PlusIcon, XMarkIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export default function BannerAvisosForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nameBanner: "",
        descripcion: "",
        archivo: "",
        archivoMovil: "",
        link: "",
        status: 1,
        fhInicio: "",
        fhFin: ""
    });
    const [loading, setLoading] = useState(false);
    const [bannerFile, setBannerFile] = useState(null);
    const [mobileFile, setMobileFile] = useState(null);
    const [statusBtn, setStatusBtn] = useState(true);

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

    // Cargar datos si es edición
    useEffect(() => {
        if (id) {
            fetch(`${API_BASE_URL}/api/bannersfooter/${id}`)
                .then(res => res.json())
                .then(data => {
                    setForm(data);
                    setStatusBtn(data.status === 1);
                });
            // Cargar sucursales asociadas
            fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=BannerAvisosHome&idObjeto=${id}`)
                .then(res => res.json())
                .then(permisos => {
                    const asociadas = permisos.map(p => ({ value: Number(p.idSucursal), label: p.sucursalName || `Sucursal ${p.idSucursal}` }));
                    setSucursalesSeleccionadas(asociadas);
                })
                .catch(() => setSucursalesSeleccionadas([]));
        }
    }, [id]);

    // Cargar sucursales disponibles
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/sucursales`)
            .then(res => res.json())
            .then(data => setSucursalesDisponibles(data.map(s => ({ value: Number(s.idSucursal), label: s.sucursalName })))
            );
    }, []);

    // Subir imagen a S3 usando presigned URL
    const uploadToS3 = async (file) => {
        const res = await fetch(`${API_BASE_URL}/api/bannersfooter/presigned-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name, filetype: file.type })
        });
        const { url, key } = await res.json();
        await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file
        });
        return key;
    };

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
                            objetoName: "BannerAvisosHome",
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

    // Eliminar permisos sucursal en lotes con barra de progreso
    const eliminarSucursalesBatch = async (idObjeto, sucursales, batchSize = 100) => {
        setProgresoSucursales({ total: sucursales.length, actual: 0, visible: true, mensaje: "Quitando sucursales..." });
        for (let i = 0; i < sucursales.length; i += batchSize) {
            const lote = sucursales.slice(i, i + batchSize);
            await Promise.allSettled(
                lote.map(s =>
                    fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=BannerAvisosHome&idObjeto=${idObjeto}&idSucursal=${s.value}`, {
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

    // Guardar permisos sucursal (usa batch)
    const guardarSucursales = async (idObjeto) => {
        try {
            if (id) {
                // Eliminar permisos anteriores en lotes
                const permisosRes = await fetch(`${API_BASE_URL}/api/permisosSucursal?objetoName=BannerAvisosHome&idObjeto=${idObjeto}`);
                if (permisosRes.ok) {
                    const permisosActuales = await permisosRes.json();
                    await eliminarSucursalesBatch(idObjeto, permisosActuales.map(p => ({ value: Number(p.idSucursal) })));
                }
            }
            // Crear nuevos permisos en lotes
            if (sucursalesSeleccionadas.length > 0) {
                await guardarSucursalesBatch(idObjeto, sucursalesSeleccionadas);
            }
        } catch (error) {
            console.error("Error al gestionar permisos de sucursales:", error);
        }
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
        }, 400); // delay para mostrar la barra
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (actualizandoSucursales || progresoSucursales.visible) return; // Bloquea el submit si está actualizando
        setLoading(true);

        let archivo = form.archivo;
        let archivoMovil = form.archivoMovil;

        if (bannerFile) archivo = await uploadToS3(bannerFile);
        if (mobileFile) archivoMovil = await uploadToS3(mobileFile);

        const payload = {
            ...form,
            archivo,
            archivoMovil,
            status: statusBtn ? 1 : 0
        };

        const method = id ? "PUT" : "POST";
        const endpoint = id
            ? `${API_BASE_URL}/api/bannersfooter/${id}`
            : `${API_BASE_URL}/api/bannersfooter`;

        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const nuevo = await res.json();
            const idObjeto = nuevo.idBanner || id;
            await guardarSucursales(idObjeto);
            navigate("/bannerAvisos");
        } else {
            alert("Error al guardar el banner");
        }
        setLoading(false);
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
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <Title>{id ? "Editar Banner Aviso" : "Nuevo Banner Aviso"}</Title>
            <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                <ProgresoBarra progreso={progresoSucursales} />
                <div>
                    <Text>Nombre del Banner</Text>
                    <TextInput
                        value={form.nameBanner}
                        onChange={e => setForm({ ...form, nameBanner: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Text>Descripción</Text>
                    <Textarea
                        value={form.descripcion}
                        onChange={e => setForm({ ...form, descripcion: e.target.value })}
                        rows={3}
                    />
                </div>
                <div>
                    <Text>Link del banner</Text>
                    <TextInput
                        value={form.link}
                        onChange={e => setForm({ ...form, link: e.target.value })}
                    />
                </div>
                <div>
                    <Text>Imagen Banner (PC)</Text>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setBannerFile(e.target.files[0])}
                    />
                    {form.archivo && (
                        <div>
                            <img
                                src={`${S3_BASE_URL}/${form.archivo}`}
                                alt="Banner PC"
                                className="mt-2 h-20 rounded"
                                onError={e => {
                                    e.target.style.display = "none";
                                    const link = document.getElementById("img-fallback-link");
                                    if (link) link.style.display = "inline";
                                }}
                            />
                            <a
                                id="img-fallback-link"
                                href={`${S3_BASE_URL}/${form.archivo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "none", color: "#2563eb", textDecoration: "underline", marginTop: "8px" }}
                            >
                                Ver imagen en una pestaña nueva
                            </a>
                        </div>
                    )}
                </div>
                <div>
                    <Text>Imagen Banner (Mobile)</Text>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setMobileFile(e.target.files[0])}
                    />
                    {form.archivoMovil && (
                        <div>
                            <img
                                src={`${S3_BASE_URL}/${form.archivoMovil}`}
                                alt="Banner Mobile"
                                className="mt-2 h-20 rounded"
                                onError={e => {
                                    e.target.style.display = "none";
                                    const link = document.getElementById("img-mobile-fallback-link");
                                    if (link) link.style.display = "inline";
                                }}
                            />
                            <a
                                id="img-mobile-fallback-link"
                                href={`${S3_BASE_URL}/${form.archivoMovil}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "none", color: "#2563eb", textDecoration: "underline", marginTop: "8px" }}
                            >
                                Ver imagen mobile en una pestaña nueva
                            </a>
                        </div>
                    )}
                </div>
                <div>
                    <Text>Fecha/Hora de Inicio</Text>
                    <input
                        type="datetime-local"
                        value={form.fhInicio ? form.fhInicio.substring(0, 16) : ""}
                        onChange={e => setForm({ ...form, fhInicio: e.target.value })}
                        className="border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <Text>Fecha/Hora de Fin</Text>
                    <input
                        type="datetime-local"
                        value={form.fhFin ? form.fhFin.substring(0, 16) : ""}
                        onChange={e => setForm({ ...form, fhFin: e.target.value })}
                        className="border rounded px-2 py-1"
                    />
                </div>
                {/* Botón de status */}
                <div className="border p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            onClick={() => setStatusBtn(!statusBtn)}
                            className={`px-4 py-2 rounded font-bold border-none shadow-sm transition-colors
                ${statusBtn
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                        >
                            {statusBtn ? "Activo" : "Inactivo"}
                        </Button>
                        <Text className="text-gray-500 text-sm">
                            {statusBtn ? "El banner está publicado y visible" : "El banner está en modo borrador (no visible)"}
                        </Text>
                    </div>
                </div>
                {/* Permisos por sucursal */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Text className="font-medium">Sucursales donde aplica</Text>
                        <div className="group relative cursor-help">
                            <InformationCircleIcon className="h-5 w-5 text-blue-500" />
                            <div className="absolute left-full top-0 ml-2 hidden w-64 rounded bg-gray-800 p-2 text-xs text-white group-hover:block z-10">
                                Si no seleccionas sucursales, este banner aplicará a todas.
                            </div>
                        </div>
                    </div>
                    <div className="mb-3 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <TextInput placeholder="Buscar sucursales..." value={filtroSucursales} onChange={(e) => setFiltroSucursales(e.target.value)} className="max-w-md" />
                            <Button
                                type="button"
                                color="blue"
                                variant="secondary"
                                onClick={() => setMostrarModalImportar(true)}
                            >
                                Importar desde texto
                            </Button>
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
                    <Text className="text-xs text-gray-500 mt-2">Si no seleccionas sucursales, este banner aplicará a todas.</Text>
                </div>
                {/* Botones */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                        type="button"
                        onClick={() => navigate("/bannerAvisos")}
                        variant="light"
                        className="text-blue-700"
                    >
                        ← Volver a Banners Avisos
                    </Button>
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            color="blue"
                            loading={loading || actualizandoSucursales || progresoSucursales.visible}
                            disabled={actualizandoSucursales || progresoSucursales.visible}
                            className="flex items-center gap-2"
                        >
                            <span className="flex items-center gap-2">
                                {id ? (
                                    <>
                                        <PencilSquareIcon className="w-5 h-5" />
                                        Guardar cambios
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-5 h-5" />
                                        Crear banner
                                    </>
                                )}
                            </span>
                        </Button>
                        <Button
                            type="button"
                            color="gray"
                            onClick={() => navigate("/bannerAvisos")}
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
        </Card>
    );
}