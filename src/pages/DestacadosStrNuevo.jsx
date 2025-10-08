import { useState } from "react";
import { getImageUrl } from "../lib/imageUtils";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { Card, Title, Text, Button } from "@tremor/react";

export default function DestacadosStrNuevo() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    partnerName: "",
    tipoImg: "",
    tituloImg: "",
    imagenPC: "",
    imagenMobile: "",
    status: 1,
    createUser: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadingPc, setUploadingPc] = useState(false);
  const [uploadingMovil, setUploadingMovil] = useState(false);
  const [previewPc, setPreviewPc] = useState("");
  const [previewMovil, setPreviewMovil] = useState("");
  // Subida de imagen PC
  const handleFilePc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPc(true);
    setPreviewPc(URL.createObjectURL(file));
    try {
      // Solicitar presigned-url
      const presignedRes = await fetch(`${API_BASE_URL}/api/destacadosStreaming/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, filetype: file.type, folder: 'uploads/destacados-streaming/' })
      });
      const { url, key } = await presignedRes.json();
      // Subir a S3
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      setForm(prev => ({ ...prev, imagenPC: key }));
    } catch (err) {
      alert('Error subiendo imagen PC');
    }
    setUploadingPc(false);
  };

  // Subida de imagen Móvil
  const handleFileMovil = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingMovil(true);
    setPreviewMovil(URL.createObjectURL(file));
    try {
      // Solicitar presigned-url
      const presignedRes = await fetch(`${API_BASE_URL}/api/destacadosStreaming/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, filetype: file.type, folder: 'uploads/destacados-streaming/' })
      });
      const { url, key } = await presignedRes.json();
      // Subir a S3
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      setForm(prev => ({ ...prev, imagenMobile: key }));
    } catch (err) {
      alert('Error subiendo imagen móvil');
    }
    setUploadingMovil(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/destacadosStreaming`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Error creando destacado");
      setSuccess(true);
      setTimeout(() => navigate("/destacados-streamings"), 1200);
    } catch (err) {
      setError("No se pudo crear el destacado");
    }
    setLoading(false);
  };

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mt-8">
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={() => navigate('/destacados-streamings')}
          className="flex items-center gap-2 text-blue-600 hover:underline font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Volver a Destacados
        </button>
      </div>
      <Title>Nuevo Destacado Streaming</Title>
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
        {/* Imagen PC */}
        <div>
          <label className="font-semibold">Imagen PC:</label>
          <input type="file" accept="image/*" onChange={handleFilePc} className="border rounded px-2 py-1 w-full" />
          {uploadingPc && <span className="text-blue-500">Subiendo imagen...</span>}
        </div>
        {/* Imagen Móvil */}
        <div>
          <label className="font-semibold">Imagen Móvil:</label>
          <input type="file" accept="image/*" onChange={handleFileMovil} className="border rounded px-2 py-1 w-full" />
          {uploadingMovil && <span className="text-blue-500">Subiendo imagen...</span>}
        </div>
        {/* Preview de imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(previewPc || form.imagenPC) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {previewPc ? 'Preview PC (nuevo):' : 'Imagen PC actual:'}
              </h3>
              <img 
                src={previewPc || getImageUrl(form.imagenPC)} 
                alt="Preview PC" 
                className="h-72 max-w-full object-contain border rounded mt-2" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                style={{ display: 'none' }} 
                className="w-full h-32 bg-gray-200 border rounded-md flex items-center justify-center"
              >
                <span className="text-gray-500 text-sm">Error cargando imagen PC</span>
              </div>
            </div>
          )}
          {(previewMovil || form.imagenMobile) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                {previewMovil ? 'Preview Móvil (nuevo):' : 'Imagen Móvil actual:'}
              </h3>
              <img 
                src={previewMovil || getImageUrl(form.imagenMobile)} 
                alt="Preview Móvil" 
                className="h-72 max-w-full object-contain border rounded mt-2" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                style={{ display: 'none' }} 
                className="w-full h-32 bg-gray-200 border rounded-md flex items-center justify-center"
              >
                <span className="text-gray-500 text-sm">Error cargando imagen Móvil</span>
              </div>
            </div>
          )}
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
        <div className="flex gap-4 pt-4">
          <Button type="submit" color="blue" className="inline-flex items-center gap-2" disabled={loading}>
            <span className="inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Crear destacado
            </span>
          </Button>
          <Button type="button" color="gray" className="inline-flex items-center gap-2" onClick={() => navigate('/destacados-streamings')}>
            <span className="inline-flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </span>
          </Button>
        </div>
        {error && <Text className="mt-2 text-red-600">{error}</Text>}
        {success && <Text className="mt-2 text-green-600">¡Destacado creado correctamente!</Text>}
      </form>
    </Card>
  );
}
