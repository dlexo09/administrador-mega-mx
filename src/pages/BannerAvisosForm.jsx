import { useState, useEffect } from "react";
import { Card, Title, TextInput, Button, Text, Textarea } from "@tremor/react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, S3_BASE_URL } from "../config";
import { PencilSquareIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

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

    // Cargar datos si es edición
    useEffect(() => {
        if (id) {
            fetch(`${API_BASE_URL}/api/bannersfooter/${id}`)
                .then(res => res.json())
                .then(data => {
                    setForm(data);
                    setStatusBtn(data.status === 1);
                });
        }
    }, [id]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            navigate("/bannerAvisos");
        } else {
            alert("Error al guardar el banner");
        }
        setLoading(false);
    };

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <Title>{id ? "Editar Banner Aviso" : "Nuevo Banner Aviso"}</Title>
            <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
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
                                src={`${S3_BASE_URL}/uploads/bannersfooter/${form.archivo}`}
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
                                href={`${S3_BASE_URL}/uploads/bannersfooter/${form.archivo}`}
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
                                src={`${S3_BASE_URL}/uploads/bannersfooter/${form.archivoMovil}`}
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
                                href={`${S3_BASE_URL}/uploads/bannersfooter/${form.archivoMovil}`}
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
                            loading={loading}
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
        </Card>
    );
}