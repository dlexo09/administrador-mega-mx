import { useEffect, useState } from "react";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CisEditar() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cisData, setCisData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/cis/${id}`)
            .then(res => res.json())
            .then(data => {
                setCisData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCisData({
            ...cisData,
            [name]: value
        });
    };

    const toggleActivo = () => {
        setCisData(c => ({
            ...c,
            activo: c.activo == "1" ? "0" : "1"
        }));
    };

    const toggleDiscapacidad = () => {
        setCisData(c => ({
            ...c,
            discapacidad: c.discapacidad === "1" ? "0" : "1"
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                ...cisData,
                latitud: cisData.latitud ? cisData.latitud : "0",
                longitud: cisData.longitud ? cisData.longitud : "0"
            };

            const response = await fetch(`${API_BASE_URL}/api/cis/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch {
                errorData = { message: responseText || 'Error desconocido' };
            }

            if (!response.ok) {
                throw new Error(errorData.message || "Error al editar el CIS");
            }

            navigate(`/cis/${id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Card><Text>Cargando...</Text></Card>;
    }
    if (!cisData) {
        return <Card><Text>No se encontró el CIS.</Text></Card>;
    }

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <Button
                    variant="light"
                    className="mr-3"
                    onClick={() => navigate(`/cis/${id}`)}
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-1" />
                    Volver
                </Button>
                <Title className="text-2xl">Editar CIS</Title>
            </div>
            <Text className="mb-6 text-gray-500">Modifica los datos del CIS</Text>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border p-4 rounded-lg bg-blue-50 border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                        ID de CIS
                    </label>
                    <TextInput
                        name="id_cis"
                        value={cisData.id_cis}
                        disabled
                        className="mt-1"
                        type="number"
                    />
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID de Sucursal
                    </label>
                    <TextInput
                        name="id_sucursal"
                        value={cisData.id_sucursal}
                        onChange={handleChange}
                        className="mt-1"
                        type="number"
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID Ciudad
                        </label>
                        <TextInput
                            name="id_ciudad"
                            value={cisData.id_ciudad}
                            onChange={handleChange}
                            className="mt-1"
                            type="number"
                        />
                    </div>
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID Estado
                        </label>
                        <TextInput
                            name="id_estado"
                            value={cisData.id_estado}
                            onChange={handleChange}
                            className="mt-1"
                            type="number"
                        />
                    </div>
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                    </label>
                    <TextInput
                        name="nombre"
                        value={cisData.nombre}
                        onChange={handleChange}
                        className="mt-1"
                    />
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                    </label>
                    <TextInput
                        name="direccion"
                        value={cisData.direccion}
                        onChange={handleChange}
                        className="mt-1"
                    />
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Colonia
                    </label>
                    <TextInput
                        name="colonia"
                        value={cisData.colonia}
                        onChange={handleChange}
                        className="mt-1"
                    />
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Horario
                    </label>
                    <TextInput
                        name="horario"
                        value={cisData.horario}
                        onChange={handleChange}
                        className="mt-1"
                    />
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                    </label>
                    <TextInput
                        name="telefono"
                        value={cisData.telefono}
                        onChange={handleChange}
                        className="mt-1"
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitud (opcional)
                        </label>
                        <TextInput
                            name="latitud"
                            value={cisData.latitud}
                            onChange={handleChange}
                            className="mt-1"
                            type="number"
                            step="any"
                        />
                        <Text className="text-xs text-gray-500 mt-1">
                            Si no se especifica, se usará 0 por defecto
                        </Text>
                    </div>
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitud (opcional)
                        </label>
                        <TextInput
                            name="longitud"
                            value={cisData.longitud}
                            onChange={handleChange}
                            className="mt-1"
                            type="number"
                            step="any"
                        />
                        <Text className="text-xs text-gray-500 mt-1">
                            Si no se especifica, se usará 0 por defecto
                        </Text>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <Button
                        type="button"
                        onClick={toggleActivo}
                        className={`px-4 py-2 rounded font-bold border-none shadow-sm transition-colors
                            ${cisData.activo == "1"
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                    >
                        {cisData.activo == "1" ? "Activo" : "Inactivo"}
                    </Button>
                    <Text className="text-gray-500 text-sm">
                        Haz clic para cambiar el estado
                    </Text>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <Button
                        type="button"
                        onClick={toggleDiscapacidad}
                        className={`px-4 py-2 rounded font-bold border-none shadow-sm transition-colors
                            ${cisData.discapacidad === "1"
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                    >
                        {cisData.discapacidad === "1" ? "Accesible" : "No accesible"}
                    </Button>
                    <Text className="text-gray-500 text-sm">
                        Haz clic para cambiar accesibilidad
                    </Text>
                </div>
                <div className="flex justify-end space-x-4 pt-6">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate(`/cis/${id}`)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        color="blue"
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}