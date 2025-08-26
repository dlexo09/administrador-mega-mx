import { useState, useEffect } from "react";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function EditarSucursal() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sucursalData, setSucursalData] = useState({
        sucursalName: "",
        status: 1,
        latitud: "",
        longitud: ""
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchSucursal = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/sucursales/${id}`);
                if (!response.ok) {
                    throw new Error("No se pudo cargar la información de la sucursal");
                }
                const data = await response.json();
                setSucursalData({
                    sucursalName: data.sucursalName,
                    status: data.status,
                    latitud: data.latitud || "",
                    longitud: data.longitud || ""
                });
            } catch (err) {
                setError("Error al cargar la sucursal: " + err.message);
                console.error(err);
            } finally {
                setLoadingData(false);
            }
        };

        fetchSucursal();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSucursalData({
            ...sucursalData,
            [name]: value
        });
    };

    // Botón de status
    const toggleStatus = () => {
        setSucursalData(s => ({
            ...s,
            status: s.status === 1 ? 0 : 1
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!sucursalData.sucursalName) {
                throw new Error("El nombre de sucursal es obligatorio");
            }
            if (sucursalData.latitud && isNaN(parseFloat(sucursalData.latitud))) {
                throw new Error("La latitud debe ser un número válido");
            }
            if (sucursalData.longitud && isNaN(parseFloat(sucursalData.longitud))) {
                throw new Error("La longitud debe ser un número válido");
            }

            const response = await fetch(`${API_BASE_URL}/api/sucursales/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...sucursalData,
                    latitud: sucursalData.latitud ? parseFloat(sucursalData.latitud) : null,
                    longitud: sucursalData.longitud ? parseFloat(sucursalData.longitud) : null
                }),
            });

            if (!response.ok) {
                throw new Error("Error al actualizar la sucursal");
            }

            navigate("/sucursales");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <Card>
                <Text>Cargando datos de la sucursal...</Text>
            </Card>
        );
    }

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <Button
                    variant="light"
                    className="mr-3"
                    onClick={() => navigate("/sucursales")}
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-1" />
                    Volver
                </Button>
                <Title className="text-2xl">Editar Sucursal</Title>
            </div>
            <Text className="mb-6 text-gray-500">Modifica la información de la sucursal</Text>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de sucursal
                    </label>
                    <TextInput
                        name="sucursalName"
                        value={sucursalData.sucursalName}
                        onChange={handleChange}
                        placeholder="Ej. Sucursal Centro"
                        className="mt-1"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitud
                        </label>
                        <TextInput
                            name="latitud"
                            value={sucursalData.latitud}
                            onChange={handleChange}
                            placeholder="Ej. 19.432608"
                            className="mt-1"
                        />
                    </div>
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitud
                        </label>
                        <TextInput
                            name="longitud"
                            value={sucursalData.longitud}
                            onChange={handleChange}
                            placeholder="Ej. -99.133209"
                            className="mt-1"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <Button
                        type="button"
                        onClick={toggleStatus}
                        className={`px-4 py-2 rounded font-bold border-none shadow-sm transition-colors
                            ${sucursalData.status === 1
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                    >
                        {sucursalData.status === 1 ? "Activo" : "Inactivo"}
                    </Button>
                    <Text className="text-gray-500 text-sm">
                        Haz clic para cambiar el estado
                    </Text>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/sucursales")}
                    >
                        Cancelar
                    </Button>
                    <Button color="blue" type="submit" loading={loading} disabled={loading}>
                        {loading ? "Guardando..." : "Actualizar Sucursal"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}