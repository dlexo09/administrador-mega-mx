import { useEffect, useState } from "react";
import { Card, Title, Text, Button } from "@tremor/react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, S3_FRONT_URL } from "../config";
import "./BannerHomeDetalle.css";

export default function BannerHomeDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}banners/home/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBanner(Array.isArray(data) ? data[0] : data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Card><Text>Cargando...</Text></Card>;
  if (!banner) return <Card><Text>No se encontró el banner.</Text></Card>;

  return (
    <Card>
      <Button color="gray" onClick={() => navigate("/bannerhome")} className="mb-4">
        ← Volver a banners
      </Button>
      <Title>Detalle de Banner Home</Title>
      <div className="my-4 flex items-center gap-6">
        <div className="bannerDetalle-img-stack">
          {banner.background && (
            <img
              src={`${S3_FRONT_URL}${banner.ruta}${banner.background}`}
              alt={banner.title}
              className="bannerDetalle-img-bg"
            />
          )}
          {banner.imagenBanner && (
            <img
              src={`${S3_FRONT_URL}${banner.ruta}${banner.imagenBanner}`}
              alt={banner.title}
              className="bannerDetalle-img-fg"
            />
          )}
        </div>
        <div>
          <Text><b>ID:</b> {banner.idBannerHome}</Text>
          <Text><b>Título:</b> {banner.title}</Text>
          <Text><b>Status:</b> {banner.status === 1 ? "ACTIVO" : "INACTIVO"}</Text>
          <Text><b>Vigencia:</b> {banner.fhFin
            ? new Date(banner.fhFin).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Sin vigencia"}
          </Text>
          <Text><b>Ruta:</b> {banner.ruta}</Text>
          <Text><b>Link Button:</b> {banner.linkButton}</Text>
        </div>
      </div>
    </Card>
  );
}