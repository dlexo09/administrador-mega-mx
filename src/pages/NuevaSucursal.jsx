import { useState } from "react";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NuevaSucursal() {
    const navigate = useNavigate();
    const [sucursalData, setSucursalData] = useState({
        idSucursal: "",
        sucursalName: "",
        status: 1,
        latitud: "",
        longitud: "",
        mascara: "",
        online: 0
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

    // Botón de status
    const toggleStatus = () => {
        setSucursalData(s => ({
            ...s,
            status: s.status === 1 ? 0 : 1
        }));
    };

    // Botón de venta en línea
    const toggleOnline = () => {
        setSucursalData(s => ({
            ...s,
            online: s.online === 1 ? 0 : 1
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Validaciones actualizadas (sin latitud y longitud obligatorias)
            if (!sucursalData.idSucursal) {
                throw new Error("El ID de sucursal es obligatorio");
            }
            if (isNaN(parseInt(sucursalData.idSucursal))) {
                throw new Error("El ID de sucursal debe ser un número válido");
            }
            if (!sucursalData.sucursalName) {
                throw new Error("El nombre de sucursal es obligatorio");
            }
            if (sucursalData.latitud && isNaN(parseFloat(sucursalData.latitud))) {
                throw new Error("La latitud debe ser un número válido");
            }
            if (sucursalData.longitud && isNaN(parseFloat(sucursalData.longitud))) {
                throw new Error("La longitud debe ser un número válido");
            }
            if (!sucursalData.mascara) {
                throw new Error("La máscara es obligatoria");
            }

            // Preparar payload con valores por defecto para coordenadas vacías
            const payload = {
                ...sucursalData,
                idSucursal: parseInt(sucursalData.idSucursal),
                latitud: sucursalData.latitud ? parseFloat(sucursalData.latitud) : 0, // Cambiar null por 0
                longitud: sucursalData.longitud ? parseFloat(sucursalData.longitud) : 0, // Cambiar null por 0
                online: sucursalData.online === 1 ? 1 : 0
            };

            console.log('📤 Enviando datos a la API:');
            console.log('URL:', `${API_BASE_URL}/api/sucursales`);
            console.log('Payload:', JSON.stringify(payload, null, 2));
            console.log('Tipos de datos:');
            console.log('- idSucursal:', typeof payload.idSucursal, '=', payload.idSucursal);
            console.log('- sucursalName:', typeof payload.sucursalName, '=', payload.sucursalName);
            console.log('- status:', typeof payload.status, '=', payload.status);
            console.log('- latitud:', typeof payload.latitud, '=', payload.latitud);
            console.log('- longitud:', typeof payload.longitud, '=', payload.longitud);
            console.log('- mascara:', typeof payload.mascara, '=', payload.mascara);
            console.log('- online:', typeof payload.online, '=', payload.online);

            const response = await fetch(`${API_BASE_URL}/api/sucursales`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            console.log('📥 Respuesta del servidor:');
            console.log('Status:', response.status);
            console.log('StatusText:', response.statusText);
            console.log('Headers:', Object.fromEntries(response.headers.entries()));

            // Intentar leer la respuesta como texto primero
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            let errorData;
            try {
                errorData = JSON.parse(responseText);
                console.log('Parsed response:', errorData);
            } catch (parseError) {
                console.log('No se pudo parsear como JSON:', parseError);
                errorData = { message: responseText || 'Error desconocido' };
            }

            if (!response.ok) {
                // Manejo específico de errores con más detalle
                if (response.status === 409) {
                    throw new Error("El ID de sucursal ya existe. Por favor, usa otro ID.");
                } else if (response.status === 400) {
                    throw new Error(`Error en los datos: ${errorData.message || 'Datos inválidos'}`);
                } else if (response.status === 500) {
                    throw new Error(`Error interno del servidor: ${errorData.message || 'Error desconocido'}`);
                } else {
                    throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
                }
            }

            console.log('✅ Sucursal creada exitosamente');
            navigate("/sucursales");
        } catch (err) {
            console.error('❌ Error completo:', err);
            console.error('Error stack:', err.stack);
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
                {/* CAMPO ID SUCURSAL */}
                <div className="border p-4 rounded-lg bg-blue-50 border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                        ID de Sucursal *
                    </label>
                    <TextInput
                        name="idSucursal"
                        value={sucursalData.idSucursal}
                        onChange={handleChange}
                        placeholder="Ej. 123"
                        className="mt-1"
                        type="number"
                    />
                    <Text className="text-xs text-blue-600 mt-1">
                        ID único proporcionado por el sistema. Debe ser numérico.
                    </Text>
                </div>

                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de sucursal *
                    </label>
                    <TextInput
                        name="sucursalName"
                        value={sucursalData.sucursalName}
                        onChange={handleChange}
                        placeholder="Ej. Sucursal Centro"
                        className="mt-1"
                    />
                </div>

                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mascara (nombre mostrado) *
                    </label>
                    <TextInput
                        name="mascara"
                        value={sucursalData.mascara}
                        onChange={handleChange}
                        placeholder="Ej. Sucursal Centro"
                        className="mt-1"
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                        Nombre alternativo que se mostrará en la aplicación
                    </Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitud (opcional)
                        </label>
                        <TextInput
                            name="latitud"
                            value={sucursalData.latitud}
                            onChange={handleChange}
                            placeholder="Ej. 19.432608"
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
                            value={sucursalData.longitud}
                            onChange={handleChange}
                            placeholder="Ej. -99.133209"
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

                <div className="flex items-center gap-4 mt-2">
                    <Button
                        type="button"
                        onClick={toggleOnline}
                        className={`px-4 py-2 rounded font-bold border-none shadow-sm transition-colors
                            ${sucursalData.online === 1
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                    >
                        {sucursalData.online === 1 ? "Venta en línea activa" : "Venta en línea inactiva"}
                    </Button>
                    <Text className="text-gray-500 text-sm">
                        Haz clic para cambiar venta en línea
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