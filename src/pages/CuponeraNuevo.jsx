import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { getImageUrl } from '../lib/imageUtils';

const CuponeraNuevo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    NombreCupon: '',
    LinkBoton: '',
    Status: 'Activo',
    FechaInicio: '',
    FechaFin: '',
    ImgPc: '', // S3 key
    ImgMovil: '' // S3 key
  });
  const [previewPc, setPreviewPc] = useState(null);
  const [previewMovil, setPreviewMovil] = useState(null);
  const [uploadingPc, setUploadingPc] = useState(false);
  const [uploadingMovil, setUploadingMovil] = useState(false);

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

  // Subida de imagen PC
  const handleFilePc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPc(true);
    setPreviewPc(URL.createObjectURL(file));
    try {
      // Solicitar presigned-url
      const presignedRes = await fetch(`${API_BASE_URL}/api/cuponera/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, filetype: file.type })
      });
      const { url, key } = await presignedRes.json();
      // Subir a S3
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      setFormData(prev => ({ ...prev, ImgPc: key }));
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
      const presignedRes = await fetch(`${API_BASE_URL}/api/cuponera/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, filetype: file.type })
      });
      const { url, key } = await presignedRes.json();
      // Subir a S3
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      setFormData(prev => ({ ...prev, ImgMovil: key }));
    } catch (err) {
      alert('Error subiendo imagen móvil');
    }
    setUploadingMovil(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convertir Status a 1 o 0
      const statusValue = formData.Status === 'Activo' ? 1 : 0;
      const dataToSend = {
        ...formData,
        Status: statusValue,
        CreateAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/api/cuponera`, {
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
                Imagen PC *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFilePc}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {uploadingPc && <span className="text-blue-500">Subiendo imagen...</span>}
            </div>

            {/* Imagen Móvil */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen Móvil *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileMovil}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {uploadingMovil && <span className="text-blue-500">Subiendo imagen...</span>}
            </div>
          </div>

          {/* Preview de imágenes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {previewPc && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview PC (local):</h3>
                <img src={previewPc} alt="Preview PC" className="w-full h-32 object-cover border rounded-md" />
              </div>
            )}
            {formData.ImgPc && !previewPc && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview PC (S3):</h3>
                <img 
                  src={getImageUrl(formData.ImgPc)} 
                  alt="Preview PC S3" 
                  className="w-full h-32 object-cover border rounded-md" 
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
            {previewMovil && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview Móvil (local):</h3>
                <img src={previewMovil} alt="Preview Móvil" className="w-full h-32 object-cover border rounded-md" />
              </div>
            )}
            {formData.ImgMovil && !previewMovil && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview Móvil (S3):</h3>
                <img 
                  src={getImageUrl(formData.ImgMovil)} 
                  alt="Preview Móvil S3" 
                  className="w-full h-32 object-cover border rounded-md" 
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