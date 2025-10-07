import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { serverAPIsLocal } from "../config";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function DestacadosStrEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    partnerName: "",
    tipoImg: "",
    tituloImg: "",
    imagenPC: "",
    imagenMobile: "",
    status: 1,
    createUser: "",
    ultimaActualizacion: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${serverAPIsLocal}/api/destacadosStreaming/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener el banner");
        return res.json();
      })
      .then((data) => {
        setForm({ ...data });
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudo cargar el banner");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`${serverAPIsLocal}/api/destacadosStreaming/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ultimaActualizacion: new Date().toISOString() })
      });
      if (!res.ok) throw new Error("No se pudo editar el banner");
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate(-1), 1200);
    } catch {
      setError("Error al editar el banner");
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mt-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-blue-700 font-semibold"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Volver
        </button>
      </div>
      <Title>Editar Destacado Streaming</Title>
      {loading ? (
        <Text className="mt-4">Cargando...</Text>
      ) : (
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="font-semibold">Partner:</label>
            <input name="partnerName" value={form.partnerName} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="font-semibold">Tipo de Imagen:</label>
            <input name="tipoImg" value={form.tipoImg} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="font-semibold">Título:</label>
            <input name="tituloImg" value={form.tituloImg} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="font-semibold">Imagen PC (URL):</label>
            <input name="imagenPC" value={form.imagenPC} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="font-semibold">Imagen Móvil (URL):</label>
            <input name="imagenMobile" value={form.imagenMobile} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="font-semibold">Status:</label>
            <select name="status" value={form.status} onChange={handleChange} className="border rounded px-2 py-1 w-full">
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>
          <div>
            <label className="font-semibold">Usuario que crea:</label>
            <input name="createUser" value={form.createUser} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div className="pt-4">
            <Button type="submit" color="blue" className="w-full">Guardar cambios</Button>
          </div>
          {error && <Text className="mt-2 text-red-600">{error}</Text>}
          {success && <Text className="mt-2 text-green-600">¡Banner editado correctamente!</Text>}
        </form>
      )}
    </Card>
  );
}
