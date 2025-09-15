import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { serverAPIsLocal } from '../config';

const CuponeraEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    NombreCupon: '',
    LinkBoton: '',
    Status: 'Activo',
    FechaInicio: '',
    FechaFin: '',
    ImgPc: '',
    ImgMovil: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${serverAPIsLocal}/api/cuponera/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo obtener el cupón');
        return res.json();
      })
      .then((data) => {
        setFormData({
          NombreCupon: data.NombreCupon || '',
          LinkBoton: data.LinkBoton || '',
          Status: data.Status === 1 ? 'Activo' : 'Inactivo',
          FechaInicio: data.FechaInicio ? data.FechaInicio.slice(0, 16) : '',
          FechaFin: data.FechaFin ? data.FechaFin.slice(0, 16) : '',
          ImgPc: data.ImgPc || '',
          ImgMovil: data.ImgMovil || ''
        });
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar el cupón');
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'Status' && type === 'checkbox') {
      setFormData(prevState => ({
        ...prevState,
        Status: checked ? 'Activo' : 'Inactivo'
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const statusValue = formData.Status === 'Activo' ? 1 : 0;
      const dataToSend = {
        ...formData,
        Status: statusValue,
        CreateAt: new Date().toISOString()
      };
      const response = await fetch(`${serverAPIsLocal}/api/cuponera/${id}` , {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        alert('Cupón editado exitosamente');
        navigate('/cuponera');
      } else {
        setError('Error al editar el cupón');
      }
    } catch (err) {
      setError('Error al editar el cupón');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/cuponera');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Editar Cupón</h1>
        {loading ? (
          <div className="text-gray-500">Cargando...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre del Cupón */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Cupón *
                </label>
                <input
                  type="text"
                  name="NombreCupon"
                  value={formData.NombreCupon}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese el nombre del cupón"
                />
              </div>
              {/* Link del Botón */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link del Botón *
                </label>
                <input
                  type="url"
                  name="LinkBoton"
                  value={formData.LinkBoton}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://ejemplo.com"
                />
              </div>
              {/* Status Switch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-semibold ${formData.Status === 'Activo' ? 'text-green-600' : 'text-gray-400'}`}>Activo</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="Status"
                      checked={formData.Status === 'Activo'}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all duration-200"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                  </label>
                  <span className={`text-sm font-semibold ${formData.Status === 'Inactivo' ? 'text-red-600' : 'text-gray-400'}`}>Inactivo</span>
                </div>
              </div>
              {/* Fecha de Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="datetime-local"
                  name="FechaInicio"
                  value={formData.FechaInicio}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Fecha de Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin *
                </label>
                <input
                  type="datetime-local"
                  name="FechaFin"
                  value={formData.FechaFin}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Imagen PC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Imagen PC *
                </label>
                <input
                  type="url"
                  name="ImgPc"
                  value={formData.ImgPc}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://ejemplo.com/imagen-pc.jpg"
                />
              </div>
              {/* Imagen Móvil */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Imagen Móvil *
                </label>
                <input
                  type="url"
                  name="ImgMovil"
                  value={formData.ImgMovil}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://ejemplo.com/imagen-movil.jpg"
                />
              </div>
            </div>
            {/* Preview de imágenes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.ImgPc && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview PC:</h3>
                  <img 
                    src={formData.ImgPc} 
                    alt="Preview PC" 
                    className="w-full h-32 object-cover border rounded-md"
                  />
                </div>
              )}
              {formData.ImgMovil && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview Móvil:</h3>
                  <img 
                    src={formData.ImgMovil} 
                    alt="Preview Móvil" 
                    className="w-full h-32 object-cover border rounded-md"
                  />
                </div>
              )}
            </div>
            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleCancel}
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
    </div>
  );
};
 
export default CuponeraEditar;
