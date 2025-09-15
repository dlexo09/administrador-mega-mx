import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { serverAPIsLocal } from "../config";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CuponeraDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cupon, setCupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${serverAPIsLocal}/api/cuponera/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener el cupón");
        return res.json();
      })
      .then((data) => {
        setCupon(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("No se pudo cargar el cupón");
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
      <Title>Detalle del Cupón</Title>
      {loading ? (
        <Text className="mt-4">Cargando...</Text>
      ) : error ? (
        <Text className="mt-4 text-red-600">{error}</Text>
      ) : cupon ? (
        <div className="space-y-4 mt-4">
          <div><span className="font-semibold">ID:</span> {cupon.IDCuponera}</div>
          <div><span className="font-semibold">Nombre:</span> {cupon.NombreCupon}</div>
          <div><span className="font-semibold">Estatus:</span> {cupon.Status === 1 ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-300">ACTIVO</span> : <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold border border-red-300">INACTIVO</span>}</div>
          <div><span className="font-semibold">Enlace:</span> <span className="break-all">{cupon.LinkBoton}</span></div>
          <div>
            <span className="font-semibold">Imagen PC:</span><br />
            <img 
              src={cupon.ImgPc} 
              alt={cupon.NombreCupon} 
              className="h-24 max-w-full object-contain border rounded mt-1"
            />
          </div>
          <div>
            <span className="font-semibold">Imagen Móvil:</span><br />
            <img 
              src={cupon.ImgMovil} 
              alt={cupon.NombreCupon} 
              className="h-24 max-w-full object-contain border rounded mt-1"
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
