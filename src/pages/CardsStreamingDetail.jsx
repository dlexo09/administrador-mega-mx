import { useEffect, useState } from "react";
import { Card, Title, Text, Button } from "@tremor/react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL, S3_BASE_URL } from "../config";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function CardsStreamingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/cardsstreaming/${id}`)
            .then(res => res.json())
            .then(data => {
                setCard(data);
                setLoading(false);
            });
    }, [id]);

    // Eliminar card
    const handleDelete = async () => {
        if (!window.confirm("¿Estás seguro que deseas eliminar esta card? Esta acción no se puede deshacer.")) {
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/cardsstreaming/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Error al eliminar la card");
            navigate("/cards-streaming");
        } catch (err) {
            alert("Error al eliminar: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !card) {
        return (
            <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
                <Title>Cargando...</Title>
            </Card>
        );
    }

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <Title>Detalle Card Streaming</Title>
            <div className="space-y-4 mt-4">
                <div>
                    <Text className="font-bold">Nombre:</Text>
                    <Text>{card.nameCard}</Text>
                </div>
                <div>
                    <Text className="font-bold">Logo:</Text>
                    <div>
                        <img
                            src={`${S3_BASE_URL}/${card.logoCard}`}
                            alt="Logo Card"
                            className="mt-2 h-20 rounded"
                            onError={e => {
                                e.target.style.display = "none";
                                const link = document.getElementById("logo-fallback-link-detail");
                                if (link) link.style.display = "inline";
                            }}
                        />
                        <a
                            id="logo-fallback-link-detail"
                            href={`${S3_BASE_URL}/${card.logoCard}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "none", color: "#2563eb", textDecoration: "underline", marginTop: "8px" }}
                        >
                            Ver logo en una pestaña nueva
                        </a>
                    </div>
                </div>
                <div>
                    <Text className="font-bold">Color de Fondo:</Text>
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-8 h-8 border rounded"
                            style={{ backgroundColor: card.backgroundCard }}
                        ></div>
                        <Text>{card.backgroundCard}</Text>
                    </div>
                </div>
                {card.backgroundImageCard && (
                    <div>
                        <Text className="font-bold">Imagen de Fondo:</Text>
                        <div>
                            <img
                                src={`${S3_BASE_URL}/${card.backgroundImageCard}`}
                                alt="Background Card"
                                className="mt-2 h-20 rounded"
                                onError={e => {
                                    e.target.style.display = "none";
                                    const link = document.getElementById("bg-fallback-link-detail");
                                    if (link) link.style.display = "inline";
                                }}
                            />
                            <a
                                id="bg-fallback-link-detail"
                                href={`${S3_BASE_URL}/${card.backgroundImageCard}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: "none", color: "#2563eb", textDecoration: "underline", marginTop: "8px" }}
                            >
                                Ver fondo en una pestaña nueva
                            </a>
                        </div>
                    </div>
                )}
                <div>
                    <Text className="font-bold">Texto del Botón:</Text>
                    <Text>{card.textButton || "Sin texto"}</Text>
                </div>
                <div>
                    <Text className="font-bold">Link del Botón:</Text>
                    <Text>{card.linkButton || "Sin link"}</Text>
                </div>
                <div>
                    <Text className="font-bold">Color del Botón:</Text>
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-8 h-8 border rounded"
                            style={{ backgroundColor: card.backgroundButton }}
                        ></div>
                        <Text>{card.backgroundButton}</Text>
                    </div>
                </div>
                <div>
                    <Text className="font-bold">Status:</Text>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${card.status === 1
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-red-100 text-red-700 border-red-300"
                        }`}>
                        {card.status === 1 ? "ACTIVO" : "INACTIVO"}
                    </span>
                </div>
                <div>
                    <Text className="font-bold">Inicio:</Text>
                    <Text>{card.fhInicio ? card.fhInicio.substring(0, 16) : "Sin fecha"}</Text>
                </div>
                <div>
                    <Text className="font-bold">Fin:</Text>
                    <Text>{card.fhFin ? card.fhFin.substring(0, 16) : "Sin fecha"}</Text>
                </div>
            </div>
            {/* Botones de acción */}
            <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                    onClick={() => navigate("/cards-streaming")}
                    variant="light"
                    className="text-blue-700"
                >
                    ← Volver a Cards Streaming
                </Button>
                <div className="flex gap-4">
                    <Link to={`/cards-streaming/editar/${card.idCardStreaming}`}>
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