import { useState } from "react";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function BannerHomeNuevo() {
  const navigate = useNavigate();
  const [banner, setBanner] = useState({
    title: "",
    linkButton: "",
    textButton: "",
    fhInicio: "",
    fhFin: "",
    create_user: "",
  });
  const [saving, setSaving] = useState(false);

  // Estados para imágenes base64 y contentType
  const [images, setImages] = useState({
    backgroundBase64: "",
    backgroundContentType: "",
    imagenBannerBase64: "",
    imagenBannerContentType: "",
    imagenMobileBase64: "",
    imagenMobileContentType: "",
  });

  // Para mostrar vista previa
  const [previews, setPreviews] = useState({
    background: "",
    imagenBanner: "",
    imagenMobile: "",
  });

  const handleChange = (e) => {
    setBanner({ ...banner, [e.target.name]: e.target.value });
  };

  // Convierte imagen a base64 y guarda contentType y preview
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => ({
          ...prev,
          [`${name}Base64`]: reader.result,
          [`${name}ContentType`]: file.type,
        }));
        setPreviews((prev) => ({
          ...prev,
          [name]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    fetch(`${API_BASE_URL}banners/home`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...banner,
        backgroundBase64: images.backgroundBase64,
        backgroundContentType: images.backgroundContentType,
        imagenBannerBase64: images.imagenBannerBase64,
        imagenBannerContentType: images.imagenBannerContentType,
        imagenMobileBase64: images.imagenMobileBase64,
        imagenMobileContentType: images.imagenMobileContentType,
      }),
    })
      .then((res) => res.json())
      .then(() => navigate("/bannerhome"))
      .finally(() => setSaving(false));
  };

  return (
    <Card>
      <Title>Nuevo Banner Home</Title>
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div>
          <label className="block font-semibold mb-1">Título</label>
          <TextInput
            name="title"
            value={banner.title}
            onChange={handleChange}
            required
            placeholder="Ej: Promoción de verano"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Texto del botón</label>
          <TextInput
            name="textButton"
            value={banner.textButton}
            onChange={handleChange}
            placeholder="Ej: ¡Compra ahora!"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Link del botón</label>
          <TextInput
            name="linkButton"
            value={banner.linkButton}
            onChange={handleChange}
            placeholder="https://mega.mx/promo"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Fecha de inicio</label>
            <TextInput
              name="fhInicio"
              type="date"
              value={banner.fhInicio}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">Fecha de fin</label>
            <TextInput
              name="fhFin"
              type="date"
              value={banner.fhFin}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Usuario creador</label>
          <TextInput
            name="create_user"
            value={banner.create_user}
            onChange={handleChange}
            placeholder="Tu usuario"
          />
        </div>

        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <Text className="font-bold mb-2">Imágenes del Banner</Text>
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="block text-xs font-semibold mb-1">Fondo Desktop</label>
              <input type="file" name="background" accept="image/*" onChange={handleFileChange} />
              {previews.background && (
                <img
                  src={previews.background}
                  alt="Background"
                  className="rounded mt-2 border"
                  style={{ width: 120, height: 60, objectFit: "cover" }}
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Imagen Banner Desktop</label>
              <input type="file" name="imagenBanner" accept="image/*" onChange={handleFileChange} />
              {previews.imagenBanner && (
                <img
                  src={previews.imagenBanner}
                  alt="Imagen Banner"
                  className="rounded mt-2 border"
                  style={{ width: 120, height: 60, objectFit: "contain", background: "#fff" }}
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Imagen Mobile</label>
              <input type="file" name="imagenMobile" accept="image/*" onChange={handleFileChange} />
              {previews.imagenMobile && (
                <img
                  src={previews.imagenMobile}
                  alt="Imagen Mobile"
                  className="rounded mt-2 border"
                  style={{ width: 80, height: 80, objectFit: "contain", background: "#fff" }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
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