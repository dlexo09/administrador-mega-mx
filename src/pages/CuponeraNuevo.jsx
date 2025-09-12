import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverAPIsLocal } from '../config';

const CuponeraNuevo = () => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        CreateAt: new Date().toISOString()
      };

      const response = await fetch(`${serverAPIsLocal}/api/cuponera`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (response.status === 201) {
        alert('Cupón creado exitosamente');
        navigate('/cuponera');
      }
    } catch (error) {
      console.error('Error creando cupón:', error);
      alert('Error al crear el cupón');
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
        <h1 className="text-2xl font-bold mb-6">Crear Nuevo Cupón</h1>
        
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

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="Status"
                value={formData.Status}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
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
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
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
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
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
              {loading ? 'Creando...' : 'Crear Cupón'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CuponeraNuevo;