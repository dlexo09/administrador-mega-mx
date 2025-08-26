import { useState } from "react";
import { Card, Title, Text, TextInput, Button, Switch } from "@tremor/react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NuevaSucursal() {
    const navigate = useNavigate();
    const [sucursalData, setSucursalData] = useState({
        sucursalName: "",
        status: 1,
        latitud: "",
        longitud: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSucursalData({
            ...sucursalData,
            [name]: value
        });
    };

    const handleStatusChange = (value) => {
        setSucursalData({
            ...sucursalData,
            status: value ? 1 : 0
        });
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

            const response = await fetch(`${API_BASE_URL}/api/sucursales`, {
                method: "POST",
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
                throw new Error("Error al crear la sucursal");
            }

            navigate("/sucursales");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                <Title className="text-2xl">Nueva Sucursal</Title>
            </div>
            <Text className="mb-6 text-gray-500">Completa el formulario para crear una nueva sucursal</Text>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
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
                    <div>
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
                    <div>
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

                <div
                    className="flex items-center gap-3 mt-2 cursor-pointer select-none"
                    onClick={() => handleStatusChange(!(sucursalData.status === 1))}
                >
                    <Switch
                        color="green"
                        checked={sucursalData.status === 1}
                        onChange={handleStatusChange}
                    />
                    <span
                        className={`font-semibold text-base ${sucursalData.status === 1
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                    >
                        {sucursalData.status === 1 ? "Activo" : "Inactivo"}
                    </span>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/sucursales")}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="blue"
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : "Guardar Sucursal"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}