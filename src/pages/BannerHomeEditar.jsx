import { useEffect, useState } from "react";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL,  S3_FRONT_URL } from "../config";

// Simulación de función para subir a S3 (debes implementar la real)
async function uploadToS3(file, folder = "") {
  // Aquí deberías subir el archivo a S3 y devolver el nombre o URL
  // Por ahora, solo simula el nombre del archivo
  // Reemplaza esto por tu lógica real de subida
  return folder + file.name;
}

export default function BannerHomeEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}banners/home/${id}`)
      .then((res) => res.json())
      .then((data) => setBanner(Array.isArray(data) ? data[0] : data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setBanner({ ...banner, [e.target.name]: e.target.value });
  };

  // Maneja los cambios de archivos
  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Sube la imagen a S3 y guarda el nombre en el banner
      const uploadedFileName = await uploadToS3(files[0], banner.ruta || "");
      setBanner((prev) => ({ ...prev, [name]: uploadedFileName }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    fetch(`${S3_FRONT_URL}banners/home/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(banner),
    })
      .then((res) => res.json())
      .then(() => navigate("/bannerhome"))
      .finally(() => setSaving(false));
  };

  if (loading) return <Card><Text>Cargando...</Text></Card>;
  if (!banner) return <Card><Text>No se encontró el banner.</Text></Card>;

  return (
    <Card>
      <Title>Editar Banner Home</Title>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <TextInput
          label="Título"
          name="title"
          value={banner.title || ""}
          onChange={handleChange}
          required
        />
        <TextInput
          label="Link Button"
          name="linkButton"
          value={banner.linkButton || ""}
          onChange={handleChange}
        />
        <TextInput
          label="Vigencia (fhFin)"
          name="fhFin"
          type="date"
          value={banner.fhFin ? banner.fhFin.slice(0, 10) : ""}
          onChange={handleChange}
        />

        <Text className="font-bold mt-4">Imágenes Background</Text>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-xs mb-1">Fondo Desktop</label>
            <input type="file" name="background" accept="image/*" onChange={handleFileChange} />
            {banner.background && (
              <img
                src={`${S3_FRONT_URL}${banner.ruta}${banner.background}`}
                alt="Background"
                style={{ width: 120, marginTop: 8 }}
              />
            )}
          </div>
        </div>

        <Text className="font-bold mt-4">Imágenes Desktop</Text>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-xs mb-1">Imagen Banner Desktop</label>
            <input type="file" name="imagenBanner" accept="image/*" onChange={handleFileChange} />
            {banner.imagenBanner && (
              <img
                src={`${S3_FRONT_URL}${banner.ruta}${banner.imagenBanner}`}
                alt="Imagen Banner"
                style={{ width: 120, marginTop: 8 }}
              />
            )}
          </div>
        </div>


        <Text className="font-bold mt-4">Imágenes Mobile</Text>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-xs mb-1">Imagen Mobile</label>
            <input type="file" name="imagenMobile" accept="image/*" onChange={handleFileChange} />
            {banner.imagenMobile && (
              <img
                src={`${S3_FRONT_URL}${banner.ruta}${banner.imagenMobile}`}
                alt="Imagen Mobile"
                style={{ width: 120, marginTop: 8 }}
              />
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit" loading={saving} color="blue">
            Guardar
          </Button>
          <Button type="button" color="gray" onClick={() => navigate("/bannerhome")}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}