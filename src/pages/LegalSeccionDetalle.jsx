import { useEffect, useState, Fragment } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { API_BASE_URL, S3_BASE_URL } from "../config";
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    TrashIcon,
    IdentificationIcon,
    UserIcon,
    CalendarIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon
} from "@heroicons/react/24/outline";

export default function LegalSeccionDetalle() {
    const { idSeccionLegal } = useParams();
    const navigate = useNavigate();
    const [seccion, setSeccion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [file, setFile] = useState(null);

    // Links
    const [links, setLinks] = useState([]);
    const [linksLoading, setLinksLoading] = useState(true);

    // Formulario de nuevo link
    const [newLink, setNewLink] = useState({
        titulo: "",
        tipo: "pdf",
        url: "",
        orden: 1
    });
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState("");

    // Barra de progreso
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    // Edición
    const [editId, setEditId] = useState(null);
    const [editLink, setEditLink] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editError, setEditError] = useState("");
    const [editUploadProgress, setEditUploadProgress] = useState(0);
    const [editUploading, setEditUploading] = useState(false);

    // Cargar sección
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/seccioneslegal/${idSeccionLegal}`)
            .then(res => res.json())
            .then(data => {
                setSeccion(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [idSeccionLegal]);

    // Cargar links
    useEffect(() => {
        setLinksLoading(true);
        fetch(`${API_BASE_URL}/api/seccioneslegal/${idSeccionLegal}/links`)
            .then(res => res.json())
            .then(data => setLinks(Array.isArray(data) ? data : []))
            .catch(() => setLinks([]))
            .finally(() => setLinksLoading(false));
    }, [idSeccionLegal]);

    // Eliminar sección legal
    const handleDelete = async () => {
        if (!window.confirm("¿Seguro que deseas eliminar esta sección legal?")) return;
        setDeleting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/seccioneslegal/${idSeccionLegal}`, {
                method: "DELETE"
            });
            if (res.ok) {
                navigate("/secciones-legales");
            } else {
                alert("No se pudo eliminar");
            }
        } finally {
            setDeleting(false);
        }
    };

    // Eliminar link
    const handleDeleteLink = async (idLink) => {
        if (!window.confirm("¿Eliminar este enlace?")) return;
        await fetch(`${API_BASE_URL}/api/seccioneslegal/links/${idLink}`, { method: "DELETE" });
        setLinks(links.filter(l => l.idLink !== idLink));
    };

    // Agregar link o etiqueta (con presigned URL y barra de progreso)
    const handleAddLink = async (e) => {
        e.preventDefault();
        setAddError("");
        setAdding(true);

        try {
            let url = newLink.url;

            if (newLink.tipo === "etiqueta") {
                url = ""; // No requiere URL ni archivo
            } else if (["pdf", "xls", "mp3"].includes(newLink.tipo)) {
                if (!file) {
                    setAddError("Selecciona un archivo");
                    setAdding(false);
                    return;
                }
                // 1. Solicita la URL prefirmada
                const presignedRes = await fetch(`${API_BASE_URL}/api/s3/presigned-url`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filename: file.name,
                        filetype: file.type
                    })
                });
                if (!presignedRes.ok) throw new Error("No se pudo obtener URL prefirmada");
                const { url: presignedUrl, key } = await presignedRes.json();

                // 2. Sube el archivo directo a S3 con barra de progreso
                setUploading(true);
                setUploadProgress(0);
                await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("PUT", presignedUrl);
                    xhr.setRequestHeader("Content-Type", file.type);
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            setUploadProgress(Math.round((e.loaded / e.total) * 100));
                        }
                    };
                    xhr.onload = () => {
                        setUploading(false);
                        setUploadProgress(0);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve();
                        } else {
                            reject(new Error("Error al subir archivo a S3"));
                        }
                    };
                    xhr.onerror = () => {
                        setUploading(false);
                        setUploadProgress(0);
                        reject(new Error("Error al subir archivo a S3"));
                    };
                    xhr.send(file);
                });

                // 3. Construye la URL pública
                url = S3_BASE_URL + key;
            } else {
                if (!url) {
                    setAddError("La URL es obligatoria");
                    setAdding(false);
                    return;
                }
            }

            // Ahora guarda el link o etiqueta en la base de datos
            const res = await fetch(`${API_BASE_URL}/api/seccioneslegal/${idSeccionLegal}/links`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newLink,
                    url,
                    orden: links.length + 1
                })
            });
            if (!res.ok) throw new Error("No se pudo agregar el enlace");
            const data = await res.json();
            setLinks([...links, data]);
            setNewLink({ titulo: "", tipo: "pdf", url: "", orden: links.length + 2 });
            setFile(null);
        } catch (err) {
            setAddError(err.message);
        } finally {
            setAdding(false);
        }
    };

    // Edición
    const startEdit = (link) => {
        setEditId(link.idLink);
        setEditLink({ ...link });
        setEditFile(null);
        setEditError("");
        setEditUploadProgress(0);
        setEditUploading(false);
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditLink(null);
        setEditFile(null);
        setEditError("");
        setEditUploadProgress(0);
        setEditUploading(false);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        setEditError("");
        setEditing(true);

        try {
            let url = editLink.url;

            if (editLink.tipo === "etiqueta") {
                url = "";
            } else if (["pdf", "xls", "mp3"].includes(editLink.tipo) && editFile) {
                // Subir nuevo archivo si se seleccionó
                const presignedRes = await fetch(`${API_BASE_URL}/api/s3/presigned-url`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filename: editFile.name,
                        filetype: editFile.type
                    })
                });
                if (!presignedRes.ok) throw new Error("No se pudo obtener URL prefirmada");
                const { url: presignedUrl, key } = await presignedRes.json();

                setEditUploading(true);
                setEditUploadProgress(0);
                await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("PUT", presignedUrl);
                    xhr.setRequestHeader("Content-Type", editFile.type);
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            setEditUploadProgress(Math.round((e.loaded / e.total) * 100));
                        }
                    };
                    xhr.onload = () => {
                        setEditUploading(false);
                        setEditUploadProgress(0);
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve();
                        } else {
                            reject(new Error("Error al subir archivo a S3"));
                        }
                    };
                    xhr.onerror = () => {
                        setEditUploading(false);
                        setEditUploadProgress(0);
                        reject(new Error("Error al subir archivo a S3"));
                    };
                    xhr.send(editFile);
                });

                url = S3_BASE_URL + key;
            } else if (["pdf", "xls", "mp3"].includes(editLink.tipo) && !editLink.url) {
                setEditError("Debes seleccionar un archivo");
                setEditing(false);
                return;
            } else if (!url && editLink.tipo !== "etiqueta") {
                setEditError("La URL es obligatoria");
                setEditing(false);
                return;
            }

            // Actualiza el link en la base de datos
            const res = await fetch(`${API_BASE_URL}/api/seccioneslegal/links/${editLink.idLink}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...editLink,
                    url
                })
            });
            if (!res.ok) throw new Error("No se pudo actualizar el enlace");
            const data = await res.json();
            setLinks(links.map(l => l.idLink === data.idLink ? data : l));
            cancelEdit();
        } catch (err) {
            setEditError(err.message);
        } finally {
            setEditing(false);
        }
    };

    if (loading) return (
        <Card>
            <Text>Cargando detalle...</Text>
        </Card>
    );
    if (!seccion) return (
        <Card>
            <Text>No encontrada</Text>
        </Card>
    );

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Button
                    variant="light"
                    className="mr-3"
                    onClick={() => navigate("/secciones-legales")}
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-1" />
                    Volver
                </Button>
                <Title className="text-2xl">Detalle de Sección Legal</Title>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 border">
                    <IdentificationIcon className="w-6 h-6 text-blue-400" />
                    <div>
                        <Text className="font-semibold text-gray-700">ID</Text>
                        <Text>{seccion.idSeccionLegal}</Text>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 border">
                    <DocumentTextIcon className="w-6 h-6 text-blue-400" />
                    <div>
                        <Text className="font-semibold text-gray-700">Nombre</Text>
                        <Text>{seccion.seccionLegalname}</Text>
                    </div>
                </div>
                <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 flex items-start gap-3 border">
                    <DocumentTextIcon className="w-6 h-6 text-blue-400 mt-1" />
                    <div>
                        <Text className="font-semibold text-gray-700">Descripción</Text>
                        <Text>{seccion.descripcion || "-"}</Text>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 border">
                    {seccion.status === 1
                        ? <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        : <XCircleIcon className="w-6 h-6 text-red-500" />}
                    <div>
                        <Text className="font-semibold text-gray-700">Status</Text>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${seccion.status === 1
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-red-100 text-red-700 border-red-300"
                            }`}>
                            {seccion.status === 1 ? "ACTIVO" : "INACTIVO"}
                        </span>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 border">
                    <UserIcon className="w-6 h-6 text-blue-400" />
                    <div>
                        <Text className="font-semibold text-gray-700">Creado por</Text>
                        <Text>{seccion.create_user || "-"}</Text>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 border">
                    <CalendarIcon className="w-6 h-6 text-blue-400" />
                    <div>
                        <Text className="font-semibold text-gray-700">Fecha creación</Text>
                        <Text>{seccion.create_at ? new Date(seccion.create_at).toLocaleString() : "-"}</Text>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 mt-8 justify-end">
                <Link to={`/secciones-legales/editar/${seccion.idSeccionLegal}`}>
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
                    disabled={deleting}
                >
                    <span className="flex items-center gap-2">
                        <TrashIcon className="w-5 h-5" />
                        Eliminar
                    </span>
                </Button>
            </div>

            {/* Sección de links */}
            <div className="mt-10">
                <Title className="text-lg mb-2">Enlaces / Archivos de la sección</Title>
                {/* Formulario para agregar link o etiqueta */}
                <form
                    onSubmit={handleAddLink}
                    className="flex flex-wrap gap-2 mb-4"
                >
                    <input
                        type="text"
                        placeholder="Título"
                        value={newLink.titulo}
                        onChange={e => setNewLink({ ...newLink, titulo: e.target.value })}
                        className="border rounded px-2 py-1 flex-1 min-w-[160px]"
                        required
                    />
                    <select
                        value={newLink.tipo}
                        onChange={e => {
                            setNewLink({ ...newLink, tipo: e.target.value, url: "" });
                            setFile(null);
                        }}
                        className="border rounded px-2 py-1 min-w-[120px]"
                    >
                        <option value="pdf">PDF</option>
                        <option value="xls">XLS</option>
                        <option value="mp3">MP3</option>
                        <option value="interno">Interno</option>
                        <option value="externo">Externo</option>
                        <option value="etiqueta">Etiqueta</option>
                    </select>
                    {/* Solo pide archivo o URL si no es etiqueta */}
                    {newLink.tipo === "etiqueta" ? null : (
                        ["pdf", "xls", "mp3"].includes(newLink.tipo) ? (
                            <input
                                type="file"
                                accept={
                                    newLink.tipo === "pdf"
                                        ? ".pdf"
                                        : newLink.tipo === "xls"
                                            ? ".xls,.xlsx"
                                            : ".mp3"
                                }
                                onChange={e => setFile(e.target.files[0])}
                                className="border rounded px-2 py-1 flex-1 min-w-[180px]"
                                required
                            />
                        ) : (
                            <input
                                type="text"
                                placeholder="URL o ruta"
                                value={newLink.url}
                                onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                                className="border rounded px-2 py-1 flex-1 min-w-[180px]"
                                required
                            />
                        )
                    )}
                    <Button color="blue" type="submit" loading={adding} disabled={adding}>
                        Agregar
                    </Button>
                </form>
                {/* Barra de progreso de subida */}
                {uploading && (
                    <div className="w-full mb-2">
                        <div className="bg-gray-200 rounded h-3">
                            <div
                                className="bg-blue-600 h-3 rounded"
                                style={{ width: `${uploadProgress}%`, transition: "width 0.2s" }}
                            />
                        </div>
                        <Text className="text-xs text-gray-600 mt-1">{uploadProgress}%</Text>
                    </div>
                )}
                {addError && (
                    <Text className="text-red-500 mb-2">{addError}</Text>
                )}
                {/* Lista de links y etiquetas */}
                {linksLoading ? (
                    <Text>Cargando enlaces...</Text>
                ) : links.length === 0 ? (
                    <Text className="text-gray-400">No hay enlaces asociados.</Text>
                ) : (
                    <ul className="space-y-2">
                        {links.map(link =>
                            <li key={link.idLink} className="flex items-center justify-between bg-gray-50 rounded p-3 border">
                                {editId === link.idLink ? (
                                    <form
                                        onSubmit={handleEditSave}
                                        className="flex flex-1 flex-wrap items-center gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={editLink.titulo}
                                            onChange={e => setEditLink({ ...editLink, titulo: e.target.value })}
                                            className="border rounded px-2 py-1 flex-1 min-w-[120px]"
                                            required
                                        />
                                        <select
                                            value={editLink.tipo}
                                            onChange={e => setEditLink({ ...editLink, tipo: e.target.value, url: "" })}
                                            className="border rounded px-2 py-1 min-w-[100px]"
                                        >
                                            <option value="pdf">PDF</option>
                                            <option value="xls">XLS</option>
                                            <option value="mp3">MP3</option>
                                            <option value="interno">Interno</option>
                                            <option value="externo">Externo</option>
                                            <option value="etiqueta">Etiqueta</option>
                                        </select>
                                        {editLink.tipo === "etiqueta" ? null : (
                                            ["pdf", "xls", "mp3"].includes(editLink.tipo) ? (
                                                <input
                                                    type="file"
                                                    accept={
                                                        editLink.tipo === "pdf"
                                                            ? ".pdf"
                                                            : editLink.tipo === "xls"
                                                                ? ".xls,.xlsx"
                                                                : ".mp3"
                                                    }
                                                    onChange={e => setEditFile(e.target.files[0])}
                                                    className="border rounded px-2 py-1 flex-1 min-w-[120px]"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={editLink.url}
                                                    onChange={e => setEditLink({ ...editLink, url: e.target.value })}
                                                    className="border rounded px-2 py-1 flex-1 min-w-[120px]"
                                                    required
                                                />
                                            )
                                        )}
                                        <Button
                                            color="blue"
                                            size="xs"
                                            type="submit"
                                            loading={editing}
                                            disabled={editing}
                                        >
                                            Guardar
                                        </Button>
                                        <Button
                                            color="gray"
                                            size="xs"
                                            type="button"
                                            onClick={cancelEdit}
                                            className="ml-1"
                                        >
                                            Cancelar
                                        </Button>
                                        {editUploading && (
                                            <div className="w-full">
                                                <div className="bg-gray-200 rounded h-2 mt-1">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded"
                                                        style={{ width: `${editUploadProgress}%`, transition: "width 0.2s" }}
                                                    />
                                                </div>
                                                <Text className="text-xs text-gray-600">{editUploadProgress}%</Text>
                                            </div>
                                        )}
                                        {editError && (
                                            <Text className="text-red-500">{editError}</Text>
                                        )}
                                    </form>
                                ) : (
                                    <Fragment>
                                        {link.tipo === "etiqueta" ? (
                                            <span className="py-2 px-2 bg-gray-200 font-bold rounded text-gray-700 uppercase tracking-wider flex-1">{link.titulo}</span>
                                        ) : (
                                            <a
                                                href={link.url}
                                                target={link.tipo === "interno" ? "_self" : "_blank"}
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-700 hover:underline flex-1"
                                            >
                                                {link.tipo === "pdf" && <span>📄</span>}
                                                {link.tipo === "xls" && <span>📊</span>}
                                                {link.tipo === "mp3" && <span>🎧</span>}
                                                {link.tipo === "interno" && <span>🔗</span>}
                                                {link.tipo === "externo" && <span>🌐</span>}
                                                {link.titulo}
                                            </a>
                                        )}
                                        <Button
                                            color="blue"
                                            size="xs"
                                            className="ml-2"
                                            onClick={() => startEdit(link)}
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            color="red"
                                            size="xs"
                                            className="ml-2 bg-red-600 hover:bg-red-700 text-white border-none"
                                            onClick={() => handleDeleteLink(link.idLink)}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                    </Fragment>
                                )}
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </Card>
    );
}