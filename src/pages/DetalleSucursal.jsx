import { useState, useEffect } from "react";
import { Card, Title, Text, Metric, Button } from "@tremor/react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function DetalleSucursal() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sucursal, setSucursal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Validar coordenadas
    const lat = parseFloat(sucursal?.latitud);
    const lng = parseFloat(sucursal?.longitud);
    const hasCoords = !isNaN(lat) && !isNaN(lng);

    useEffect(() => {
        const fetchSucursal = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/sucursales/${id}`);
                if (!response.ok) {
                    throw new Error("No se pudo cargar la información de la sucursal");
                }
                const data = await response.json();
                setSucursal(data);
            } catch (err) {
                setError("Error al cargar la sucursal: " + err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSucursal();
    }, [id]);

    // Función para eliminar sucursal
    const handleDelete = async () => {
        if (!window.confirm("¿Estás seguro que deseas eliminar esta sucursal? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/sucursales/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Error al eliminar la sucursal");
            }

            navigate("/sucursales");
        } catch (err) {
            setError("Error al eliminar: " + err.message);
        }
    };

    if (loading) {
        return (
            <Card>
                <Text>Cargando datos de la sucursal...</Text>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <Title>Error</Title>
                <Text className="text-red-600">{error}</Text>
                <div className="mt-4">
                    <Button onClick={() => navigate("/sucursales")}>Volver a Sucursales</Button>
                </div>
            </Card>
        );
    }

    if (!sucursal) {
        return (
            <Card>
                <Title>Sucursal no encontrada</Title>
                <Text>La sucursal que buscas no existe o ha sido eliminada.</Text>
                <div className="mt-4">
                    <Button onClick={() => navigate("/sucursales")}>Volver a Sucursales</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <Title className="text-2xl">Detalle de Sucursal</Title>
                    <Metric className="mt-2 text-blue-700">{sucursal.sucursalName}</Metric>
                </div>
                <div className="flex gap-4">
                    <Link to={`/sucursales/editar/${id}`}>
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

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">ID</Text>
                    <Text className="text-lg font-semibold">{sucursal.idSucursal}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Estado</Text>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1 ${sucursal.status === 1
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-red-100 text-red-700 border-red-300"
                            }`}
                    >
                        {sucursal.status === 1 ? "ACTIVO" : "INACTIVO"}
                    </span>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Latitud</Text>
                    <Text className="text-lg font-semibold">{sucursal.latitud || "No definida"}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Longitud</Text>
                    <Text className="text-lg font-semibold">{sucursal.longitud || "No definida"}</Text>
                </div>
            </div>

            {/* Mapa */}
            {hasCoords ? (
                <div className="mt-8">
                    <Text className="font-medium mb-2">Ubicación en mapa</Text>
                    <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center shadow-inner">
                        <iframe
                            title="Mapa"
                            width="100%"
                            height="100%"
                            style={{ border: 0, borderRadius: "0.75rem" }}
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
                        ></iframe>
                    </div>
                </div>
            ) : (
                <Text className="mt-4 text-red-500">No hay coordenadas para mostrar el mapa.</Text>
            )}

            <div className="mt-8 pt-6 border-t flex justify-end">
                <Button onClick={() => navigate("/sucursales")} variant="light" className="text-blue-700">
                    ← Volver a Sucursales
                </Button>
            </div>
        </Card>
    );
}