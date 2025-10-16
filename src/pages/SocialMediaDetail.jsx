import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";

import { API_BASE_URL } from "../config";
import { ArrowLeftIcon, PencilSquareIcon, TrashIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { getImageUrl } from '../lib/imageUtils';

export default function SocialMediaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [socialMedia, setSocialMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);



  useEffect(() => {
    setLoading(true);
  fetch(`${API_BASE_URL}/api/redesSociales/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener la red social");
        return res.json();
      })
      .then((data) => {
        setSocialMedia(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("No se pudo cargar la red social");
        setLoading(false);
      });
  }, [id]);

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
      <Title>Detalle de Red Social</Title>
      {loading ? (
        <Text className="mt-4">Cargando...</Text>
      ) : error ? (
        <Text className="mt-4 text-red-600">{error}</Text>
      ) : socialMedia ? (
        <>
          <div className="space-y-4 mt-4">
            <div><span className="font-semibold">ID:</span> {socialMedia.idSocialMedia}</div>
            <div><span className="font-semibold">Nombre:</span> {socialMedia.titleSocialMedia || socialMedia.nombre || socialMedia.nombreRed}</div>
            <div><span className="font-semibold">URL:</span> <a href={socialMedia.url || socialMedia.linkSocialMedia} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{socialMedia.url || socialMedia.linkSocialMedia}</a></div>
            {socialMedia.iconSocialMedia && (
              <div>
                <span className="font-semibold">Icono:</span><br />
                <div className="mt-2">
                  <img
                    src={getImageUrl(socialMedia.iconSocialMedia)}
                    alt="icono red social"
                    className="h-16 w-16 object-contain bg-gray-100 border rounded p-1"
                    onError={e => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <a
                    href={getImageUrl(socialMedia.iconSocialMedia)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                    style={{ display: 'none' }}
                  >
                    Ver imagen en una pestaña nueva
                  </a>
                </div>
              </div>
            )}
            <div><span className="font-semibold">Orden:</span> {socialMedia.orderSocialMedia}</div>
            <div><span className="font-semibold">Estatus:</span> {socialMedia.status === 1 ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-300">ACTIVO</span> : <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold border border-red-300">INACTIVO</span>}</div>
            <div><span className="font-semibold">Fecha de creación:</span> {socialMedia.CreateAt ? new Date(socialMedia.CreateAt).toLocaleString() : '-'}</div>

            {socialMedia.imgSocialMedia && (
              <div>
                <span className="font-semibold">Imagen:</span><br />
                <img
                  src={resolveS3(socialMedia.imgSocialMedia)}
                  alt={socialMedia.titleSocialMedia}
                  className="h-24 max-w-full object-contain border rounded mt-1"
                  onError={e => e.target.style.display = "none"}
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end mt-6">
            <Button icon={PencilSquareIcon} color="blue" onClick={() => navigate(`/redesSociales/editar/${socialMedia.idSocialMedia}`)}>
              Editar
            </Button>
            <Button icon={TrashIcon} color="red" onClick={async () => {
              if (!window.confirm('¿Estás seguro que deseas eliminar esta red social? Esta acción no se puede deshacer.')) return;
              try {
                setDeleting(true);
                const res = await fetch(`${API_BASE_URL}/api/redesSociales/${socialMedia.idSocialMedia}`, { method: 'DELETE' });
                if (res.status === 204 || res.ok) {
                  alert('Red social eliminada');
                  navigate('/redesSociales');
                } else if (res.status === 404) {
                  alert('Red social no encontrada');
                } else {
                  const txt = await res.text();
                  throw new Error(txt || 'Error al eliminar');
                }
              } catch (err) {
                console.error('Error eliminando red social:', err);
                alert('Error al eliminar: ' + err.message);
              } finally {
                setDeleting(false);
              }
            }}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </>
      ) : null}
    </Card>
  );
}
