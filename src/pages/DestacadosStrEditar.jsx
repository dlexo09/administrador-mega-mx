  // Función para cancelar y volver atrás
  const handleCancel = () => {
    navigate(-1);
  };
import { useEffect, useState } from "react";
import { getImageUrl } from "../lib/imageUtils";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { API_BASE_URL } from "../config";
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
  fetch(`${API_BASE_URL}/api/destacadosStreaming/${id}`)
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
  const res = await fetch(`${API_BASE_URL}/api/destacadosStreaming/${id}`, {
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

  // Función para cancelar y volver atrás
  const handleCancel = () => {
    navigate(-1);
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
          {/* Ocultamos campos no editables para evitar confusión */}
          <div>
            <label className="font-semibold">Título:</label>
            <input name="tituloImg" value={form.tituloImg} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
            <div className="mt-2 p-2 bg-gray-50 border rounded">
              <span className="font-semibold text-xs text-gray-500">Vista previa del título:</span>
              <div className="mt-1 text-base" dangerouslySetInnerHTML={{ __html: form.tituloImg }} />
            </div>
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
          {/* Ocultamos campos no editables para evitar confusión */}
          {/* Botones de acción */}
            <div className="flex justify-end gap-2 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#6B7280] text-white rounded border border-[#E3E8F0] hover:bg-[#4B5563] transition font-normal shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#3973E7] text-white rounded border border-[#E3E8F0] hover:bg-[#2C5CB8] transition font-normal shadow-sm"
                disabled={loading}
              >
                <PencilSquareIcon className="w-5 h-5" />
                Guardar cambios
              </button>
            </div>
          {error && <Text className="mt-2 text-red-600">{error}</Text>}
          {success && <Text className="mt-2 text-green-600">¡Banner editado correctamente!</Text>}
        </form>
      )}
    </Card>
  );
}
