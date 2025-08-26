import { useState } from "react";
import { Card, Title, Text, TextInput } from "@tremor/react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, S3_FRONT_URL } from "../config";

// import config from "../config";

export default function NuevoBanner() {
    const [form, setForm] = useState({
        title: "",
        sku: "",
        fhInicio: "",
        fhFin: "",
        status: "1",
        image: "", // Aquí guardaremos el nombre seguro en S3
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [preview, setPreview] = useState("");
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleFileChange = e => {
        const file = e.target.files[0];
        if (!file) return;
        setFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (!file) throw new Error("Debes seleccionar una imagen");

            // 1. Pide la presigned URL
            const filename = `bannerAvisos/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
            const resPresign = await fetch(
                `${API_BASE_URL}s3/presign?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(file.type)}`
            );
            if (!resPresign.ok) throw new Error("Error obteniendo presigned URL");
            const { url, safeFilename } = await resPresign.json();

            // 2. Sube la imagen a S3
            const resS3 = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!resS3.ok) throw new Error("Error subiendo imagen a S3");

            // 3. Guarda solo la ruta/nombre en el backend
            const formToSend = {
                ...form,
                image: safeFilename, // o filename, según lo que devuelva tu backend
            };
            const res = await fetch(`${API_BASE_URL}api/banners`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formToSend),
            });
            if (!res.ok) throw new Error("Error al crear el banner");
            navigate("/bannerhome");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-xl mx-auto">
            <Title>Nuevo Banner</Title>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="title">Título del banner *</label>
                    <TextInput
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        placeholder="Ejemplo: Promoción verano"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="sku">SKU relacionado</label>
                    <TextInput
                        id="sku"
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        placeholder="Ejemplo: SCF570LA"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Imagen del banner *</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full"
                    />
                    {preview && (
                        <img src={preview} alt="preview" className="h-24 mt-2 rounded shadow" />
                    )}
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1" htmlFor="fhInicio">Fecha de inicio</label>
                        <input
                            type="date"
                            id="fhInicio"
                            name="fhInicio"
                            value={form.fhInicio}
                            onChange={handleChange}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1" htmlFor="fhFin">Fecha de fin</label>
                        <input
                            type="date"
                            id="fhFin"
                            name="fhFin"
                            value={form.fhFin}
                            onChange={handleChange}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="status">¿Activo?</label>
                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full border rounded px-2 py-1"
                    >
                        <option value="1">Sí</option>
                        <option value="0">No</option>
                    </select>
                </div>
                {error && <Text className="text-red-600">{error}</Text>}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                        type="button"
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                        onClick={() => navigate("/bannerhome")}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </Card>
    );
}