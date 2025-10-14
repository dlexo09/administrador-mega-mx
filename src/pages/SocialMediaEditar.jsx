import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Title, Text, Button } from "@tremor/react";
import { serverAPIsLocal } from "../config";

const SocialMediaEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
  titleSocialMedia: "",
  tipo: "",
  usuario: "",
  linkSocialMedia: "",
  iconSocialMedia: "",
  orderSocialMedia: 1,
  status: 1,
  imgSocialMedia: "",
  createUser: ""
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${serverAPIsLocal}/api/redesSociales/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo obtener la red social");
        return res.json();
      })
      .then((data) => {
        setFormData({
          titleSocialMedia: data.titleSocialMedia || "",
          tipo: data.tipo || "",
          usuario: data.usuario || "",
          linkSocialMedia: data.linkSocialMedia || "",
          iconSocialMedia: data.iconSocialMedia || "",
          orderSocialMedia: data.orderSocialMedia || 1,
          status: data.status || 1,
          imgSocialMedia: data.imgSocialMedia || "",
          createUser: data.createUser || ""
        });
        setLoading(false);
      })
      .catch((err) => {
        setError("No se pudo cargar la red social");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${serverAPIsLocal}/api/redesSociales/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error("Error al actualizar la red social");
        navigate("/redesSociales");
      } catch (err) {
        setError("No se pudo actualizar la red social");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mt-8">
        <h2 className="text-xl font-bold mb-4">Editar Red Social</h2>
        {loading ? (
          <p className="mt-4">Cargando...</p>
        ) : error ? (
          <p className="mt-4 text-red-600">{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="font-semibold">Nombre:</label>
              <input type="text" name="titleSocialMedia" value={formData.titleSocialMedia} onChange={handleChange} className="border rounded px-2 py-1 w-full" required />
            </div>
            <div>
              <label className="font-semibold">URL:</label>
              <input type="text" name="linkSocialMedia" value={formData.linkSocialMedia} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
              <label className="font-semibold">Icono:</label>
              <input type="text" name="iconSocialMedia" value={formData.iconSocialMedia} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
              <label className="font-semibold">Orden:</label>
              <input type="number" name="orderSocialMedia" value={formData.orderSocialMedia} onChange={handleChange} className="border rounded px-2 py-1 w-full" min={1} />
            </div>
            <div>
              <label className="font-semibold">Estatus:</label>
              <select name="status" value={formData.status} onChange={handleChange} className="border rounded px-2 py-1 w-full">
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
  );
}
export default SocialMediaEditar;
