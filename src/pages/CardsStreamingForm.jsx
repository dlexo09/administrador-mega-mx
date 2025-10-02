import { useState, useEffect } from "react";
import { Card, Title, TextInput, Button, Text } from "@tremor/react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, S3_BASE_URL } from "../config";
import { PencilSquareIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function CardsStreamingForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nameCard: "",
        logoCard: "",
        backgroundCard: "",
        textButton: "",
        linkButton: "",
        backgroundButton: "",
        backgroundImageCard: "",
        status: 1,
        fhInicio: "",
        fhFin: ""
    });
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [backgroundFile, setBackgroundFile] = useState(null);
    const [statusBtn, setStatusBtn] = useState(true);

    // Cargar datos si es edición
    useEffect(() => {
        if (id) {
            fetch(`${API_BASE_URL}/api/cardsstreaming/${id}`)
                .then(res => res.json())
                .then(data => {
                    setForm(data);
                    setStatusBtn(data.status === 1);
                });
        }
    }, [id]);

    // Subir imagen a S3 usando presigned URL
    const uploadToS3 = async (file) => {
        const res = await fetch(`${API_BASE_URL}/api/cardsstreaming/presigned-url`, {
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

        let logoCard = form.logoCard;
        let backgroundImageCard = form.backgroundImageCard;

        if (logoFile) logoCard = await uploadToS3(logoFile);
        if (backgroundFile) backgroundImageCard = await uploadToS3(backgroundFile);

        const payload = {
            ...form,
            logoCard,
            backgroundImageCard,
            status: statusBtn ? 1 : 0
        };

        const method = id ? "PUT" : "POST";
        const endpoint = id
            ? `${API_BASE_URL}/api/cardsstreaming/${id}`
            : `${API_BASE_URL}/api/cardsstreaming`;

        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            navigate("/cards-streaming");
        } else {
            alert("Error al guardar la card");
        }
        setLoading(false);
    };

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <Title>{id ? "Editar Card Streaming" : "Nueva Card Streaming"}</Title>
            <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                <div>
                    <Text>Nombre de la Card</Text>
                    <TextInput
                        value={form.nameCard}
                        onChange={e => setForm({ ...form, nameCard: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Text>Logo de la Card</Text>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setLogoFile(e.target.files[0])}
                    />
                    {form.logoCard && (
                        <div>
                            <img
                                src={`${S3_BASE_URL}/${form.logoCard}`}
                                alt="Logo Card"
                                className="mt-2 h-20 rounded"
                                onError={e => {
                                    e.target.style.display = "none";
                                    const link = document.getElementById("logo-fallback-link");
                                    if (link) link.style.display = "inline";
                                }}
                            />
                            <a
                                id="logo-fallback-link"
                                href={`${S3_BASE_URL}/${form.logoCard}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "none", color: "#2563eb", textDecoration: "underline", marginTop: "8px" }}
                            >
                                Ver logo en una pestaña nueva
                            </a>
                        </div>
                    )}
                </div>
                <div>
                    <Text>Color de Fondo de la Card</Text>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={form.backgroundCard || "#ffffff"}
                            onChange={e => setForm({ ...form, backgroundCard: e.target.value })}
                            className="w-12 h-10 border rounded"
                        />
                        <TextInput
                            value={form.backgroundCard}
                            onChange={e => setForm({ ...form, backgroundCard: e.target.value })}
                            placeholder="#ffffff"
                        />
                    </div>
                </div>
                <div>
                    <Text>Imagen de Fondo (opcional)</Text>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setBackgroundFile(e.target.files[0])}
                    />
                    {form.backgroundImageCard && (
                        <div>
                            <img
                                src={`${S3_BASE_URL}/${form.backgroundImageCard}`}
                                alt="Background Card"
                                className="mt-2 h-20 rounded"
                                onError={e => {
                                    e.target.style.display = "none";
                                    const link = document.getElementById("bg-fallback-link");
                                    if (link) link.style.display = "inline";
                                }}
                            />
                            <a
                                id="bg-fallback-link"
                                href={`${S3_BASE_URL}/${form.backgroundImageCard}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "none", color: "#2563eb", textDecoration: "underline", marginTop: "8px" }}
                            >
                                Ver fondo en una pestaña nueva
                            </a>
                        </div>
                    )}
                </div>
                <div>
                    <Text>Texto del Botón</Text>
                    <TextInput
                        value={form.textButton}
                        onChange={e => setForm({ ...form, textButton: e.target.value })}
                    />
                </div>
                <div>
                    <Text>Link del Botón</Text>
                    <TextInput
                        value={form.linkButton}
                        onChange={e => setForm({ ...form, linkButton: e.target.value })}
                    />
                </div>
                <div>
                    <Text>Color de Fondo del Botón</Text>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={form.backgroundButton || "#0000ff"}
                            onChange={e => setForm({ ...form, backgroundButton: e.target.value })}
                            className="w-12 h-10 border rounded"
                        />
                        <TextInput
                            value={form.backgroundButton}
                            onChange={e => setForm({ ...form, backgroundButton: e.target.value })}
                            placeholder="#0000ff"
                        />
                    </div>
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
                            {statusBtn ? "La card está publicada y visible" : "La card está en modo borrador (no visible)"}
                        </Text>
                    </div>
                </div>
                {/* Botones */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                        type="button"
                        onClick={() => navigate("/cards-streaming")}
                        variant="light"
                        className="text-blue-700"
                    >
                        ← Volver a Cards Streaming
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
                                        Crear card
                                    </>
                                )}
                            </span>
                        </Button>
                        <Button
                            type="button"
                            color="gray"
                            onClick={() => navigate("/cards-streaming")}
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