import { useEffect, useState } from "react";
import { Card, Title, Text, Button } from "@tremor/react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL, S3_BASE_URL } from "../config";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function BannerAvisosDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [banner, setBanner] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/bannersfooter/${id}`)
            .then(res => res.json())
            .then(data => {
                setBanner(data);
                setLoading(false);
            });
    }, [id]);

    // Eliminar banner
    const handleDelete = async () => {
        if (!window.confirm("¿Estás seguro que deseas eliminar este banner? Esta acción no se puede deshacer.")) {
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/bannersfooter/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Error al eliminar el banner");
            navigate("/bannerAvisos");
        } catch (err) {
            alert("Error al eliminar: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !banner) {
        return (
            <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
                <Title>Cargando...</Title>
            </Card>
        );
    }

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <Title>Detalle Banner Aviso</Title>
            <div className="space-y-4 mt-4">
                <div>
                    <Text className="font-bold">Nombre:</Text>
                    <Text>{banner.nameBanner}</Text>
                </div>
                <div>
                    <Text className="font-bold">Descripción:</Text>
                    <Text>{banner.descripcion || "Sin descripción"}</Text>
                </div>
                <div>
                    <Text className="font-bold">Link:</Text>
                    <Text>{banner.link || "Sin link"}</Text>
                </div>
                <div>
                    <Text className="font-bold">Imagen Banner (PC):</Text>
                    <div>
                        <img
                            src={`${S3_BASE_URL}/uploads/bannersfooter/${banner.archivo}`}
                            alt="Banner PC"
                            className="mt-2 h-20 rounded"
                            onError={e => {
                                e.target.style.display = "none";
                                const link = document.getElementById("img-fallback-link-detail");
                                if (link) link.style.display = "inline";
                            }}
                        />
                        <a
                            id="img-fallback-link-detail"
                            href={`${S3_BASE_URL}/uploads/bannersfooter/${banner.archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "none", color: "#2563eb", textDecoration: "underline", marginTop: "8px" }}
                        >
                            Ver imagen en una pestaña nueva
                        </a>
                    </div>
                </div>
                <div>
                    <Text className="font-bold">Imagen Banner (Mobile):</Text>
                    <div>
                        <img
                            src={`${S3_BASE_URL}/uploads/bannersfooter/${banner.archivoMovil}`}
                            alt="Banner Mobile"
                            className="mt-2 h-20 rounded"
                            onError={e => {
                                e.target.style.display = "none";
                                const link = document.getElementById("img-mobile-fallback-link-detail");
                                if (link) link.style.display = "inline";
                            }}
                        />
                        <a
                            id="img-mobile-fallback-link-detail"
                            href={`${S3_BASE_URL}/uploads/bannersfooter/${banner.archivoMovil}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "none", color: "#2563eb", textDecoration: "underline", marginTop: "8px" }}
                        >
                            Ver imagen mobile en una pestaña nueva
                        </a>
                    </div>
                </div>
                <div>
                    <Text className="font-bold">Status:</Text>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${banner.status === 1
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-red-100 text-red-700 border-red-300"
                        }`}>
                        {banner.status === 1 ? "ACTIVO" : "INACTIVO"}
                    </span>
                </div>
                <div>
                    <Text className="font-bold">Inicio:</Text>
                    <Text>{banner.fhInicio ? banner.fhInicio.substring(0, 16) : "Sin fecha"}</Text>
                </div>
                <div>
                    <Text className="font-bold">Fin:</Text>
                    <Text>{banner.fhFin ? banner.fhFin.substring(0, 16) : "Sin fecha"}</Text>
                </div>
            </div>
            {/* Botones de acción */}
            <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                    onClick={() => navigate("/bannerAvisos")}
                    variant="light"
                    className="text-blue-700"
                >
                    ← Volver a Banners Avisos
                </Button>
                <div className="flex gap-4">
                    <Link to={`/bannerAvisos/editar/${banner.idBanner}`}>
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