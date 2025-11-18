import { useEffect, useState } from "react";
import { Card, Title, Text, Metric, Button } from "@tremor/react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export default function CisDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cis, setCis] = useState(null);
    const [loading, setLoading] = useState(true);

    // Validar coordenadas
    const lat = parseFloat(cis?.latitud);
    const lng = parseFloat(cis?.longitud);
    const hasCoords = !isNaN(lat) && !isNaN(lng);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/cis/${id}`)
            .then(res => res.json())
            .then(data => {
                setCis(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <Card>
                <Text>Cargando datos del CIS...</Text>
            </Card>
        );
    }
    if (!cis) {
        return (
            <Card>
                <Title>CIS no encontrado</Title>
                <Text>El CIS que buscas no existe o ha sido eliminado.</Text>
                <div className="mt-4">
                    <Button onClick={() => navigate("/cis")}>Volver a CIS</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <Title className="text-2xl">Detalle de CIS</Title>
                    <Metric className="mt-2 text-blue-700">{cis.nombre}</Metric>
                </div>
                <div className="flex gap-4">
                    <Link to={`/cis/editar/${id}`}>
                        <Button color="blue" className="flex items-center gap-2">
                            <span className="flex items-center gap-2">
                                <PencilSquareIcon className="w-5 h-5" />
                                Editar
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">ID</Text>
                    <Text className="text-lg font-semibold">{cis.id_cis}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Sucursal</Text>
                    <Text className="text-lg font-semibold">{cis.id_sucursal}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Ciudad</Text>
                    <Text className="text-lg font-semibold">{cis.id_ciudad}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Estado</Text>
                    <Text className="text-lg font-semibold">{cis.id_estado}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50 md:col-span-2">
                    <Text className="text-xs text-gray-500">Dirección</Text>
                    <Text className="text-lg font-semibold">{cis.direccion}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Colonia</Text>
                    <Text className="text-lg font-semibold">{cis.colonia}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Horario</Text>
                    <Text className="text-lg font-semibold">{cis.horario}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Teléfono</Text>
                    <Text className="text-lg font-semibold">{cis.telefono}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Latitud</Text>
                    <Text className="text-lg font-semibold">{cis.latitud || "No definida"}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Longitud</Text>
                    <Text className="text-lg font-semibold">{cis.longitud || "No definida"}</Text>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Status</Text>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1 ${cis.activo == "1"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-red-100 text-red-700 border-red-300"
                            }`}
                    >
                        {cis.activo == "1" ? "ACTIVO" : "INACTIVO"}
                    </span>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <Text className="text-xs text-gray-500">Accesible</Text>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-1 ${cis.discapacidad === "1"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-red-100 text-red-700 border-red-300"
                            }`}
                    >
                        {cis.discapacidad === "1" ? "Sí" : "No"}
                    </span>
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
                <Button onClick={() => navigate("/cis")} variant="light" className="text-blue-700">
                    ← Volver a CIS
                </Button>
            </div>
        </Card>
    );
}