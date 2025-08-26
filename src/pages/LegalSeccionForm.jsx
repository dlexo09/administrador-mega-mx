import { useState, useEffect } from "react";
import { Card, Title, Text, TextInput, Textarea, Button } from "@tremor/react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function LegalSeccionForm({ isEdit = false }) {
    const navigate = useNavigate();
    const { idSeccionLegal } = useParams();
    const [form, setForm] = useState({
        seccionLegalname: "",
        descripcion: "",
        status: 1
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [error, setError] = useState("");

    // Cargar datos si es edición
    useEffect(() => {
        if (isEdit && idSeccionLegal) {
            fetch(`${API_BASE_URL}/api/seccioneslegal/${idSeccionLegal}`)
                .then(res => res.json())
                .then(data => {
                    setForm({
                        seccionLegalname: data.seccionLegalname || "",
                        descripcion: data.descripcion || "",
                        status: data.status ?? 1
                    });
                })
                .catch(() => setError("No se pudo cargar la sección legal"))
                .finally(() => setLoadingData(false));
        }
    }, [isEdit, idSeccionLegal]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    // Botón de status
    const toggleStatus = () => {
        setForm(f => ({ ...f, status: f.status === 1 ? 0 : 1 }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (!form.seccionLegalname) throw new Error("El nombre es obligatorio");
            const url = isEdit
                ? `${API_BASE_URL}/api/seccioneslegal/${idSeccionLegal}`
                : `${API_BASE_URL}/api/seccioneslegal`;
            const method = isEdit ? "PUT" : "POST";
            // Agrega create_user solo en creación
            const body = isEdit
                ? form
                : { ...form, create_user: 1 };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error("Error al guardar");
            navigate("/secciones-legales");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <Card>
                <Text>Cargando datos...</Text>
            </Card>
        );
    }

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
                <Button
                    variant="light"
                    className="mr-3"
                    onClick={() => navigate("/secciones-legales")}
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-1" />
                    Volver
                </Button>
                <Title className="text-2xl">{isEdit ? "Editar" : "Nueva"} Sección Legal</Title>
            </div>
            <Text className="mb-6 text-gray-500">
                {isEdit
                    ? "Modifica la información de la sección legal"
                    : "Completa la información para crear una nueva sección legal"}
            </Text>
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la sección
                    </label>
                    <TextInput
                        name="seccionLegalname"
                        value={form.seccionLegalname}
                        onChange={handleChange}
                        placeholder="Ej. Aviso de Privacidad"
                        className="mt-1"
                    />
                </div>
                <div className="border p-4 rounded-lg bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                    </label>
                    <Textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        placeholder="Descripción breve de la sección legal"
                        rows={3}
                        className="mt-1"
                    />
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <Button
                        type="button"
                        onClick={toggleStatus}
                        className={`px-4 py-2 rounded font-bold border-none shadow-sm transition-colors
                            ${form.status === 1
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }`}
                    >
                        {form.status === 1 ? "Activo" : "Inactivo"}
                    </Button>
                    <Text className="text-gray-500 text-sm">
                        Haz clic para cambiar el estado
                    </Text>
                </div>
                <div className="flex justify-end space-x-4 pt-6">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/secciones-legales")}
                    >
                        Cancelar
                    </Button>
                    <Button color="blue" type="submit" loading={loading} disabled={loading}>
                        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear sección"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}