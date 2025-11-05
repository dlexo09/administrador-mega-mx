import React, { useState, useRef } from 'react';
import { Card, Title, Text, Button, Badge } from '@tremor/react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { ArrowLeftIcon, DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function TarifarioImportar() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(1); // 1: Upload, 2: Validate, 3: Preview, 4: Confirm
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [s3Key, setS3Key] = useState(null);

  // Paso 1: Seleccionar archivo
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        alert('Por favor selecciona un archivo CSV válido');
        return;
      }
      setFile(selectedFile);
    }
  };

  // Funciones para drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      
      // Validar que sea CSV
      if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
        alert('Por favor arrastra un archivo CSV válido');
        return;
      }
      
      setFile(droppedFile);
    }
  };

  // Función para verificar si los datos se procesaron correctamente
  const verifyProcessingSuccess = async () => {
    try {
      console.log('Verificando si el procesamiento fue exitoso...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Esperar 3 segundos
      
      const validateResponse = await fetch(`${API_BASE_URL}/api/tarifarios/validate-temp`, {
        method: 'POST'
      });
      
      if (validateResponse.ok) {
        const result = await validateResponse.json();
        console.log('¡Procesamiento exitoso detectado!', result);
        return {
          success: true,
          data: {
            message: "Archivo procesado exitosamente (verificado después de error 503)",
            totalRows: result.totalRows || "Datos cargados correctamente"
          }
        };
      }
      
      return { success: false };
    } catch (error) {
      console.log('Error verificando procesamiento:', error.message);
      return { success: false };
    }
  };

  // Subida a S3 con mejor manejo del error 503
  const uploadToS3 = async () => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        console.log(`Intento ${attempt} de ${maxRetries} para subir a S3`);

        // Paso 1: Obtener URL presignada
        setUploadProgress(10);
        const presignedResponse = await fetch(`${API_BASE_URL}/api/tarifarios/presigned-url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filename: file.name,
            filetype: file.type || 'text/csv'
          })
        });

        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `Error HTTP ${presignedResponse.status} obteniendo URL presignada`);
        }

        const { url: presignedUrl, key } = await presignedResponse.json();
        setS3Key(key);
        setUploadProgress(20);

        // Paso 2: Subir archivo a S3
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = 20 + ((event.loaded / event.total) * 50); // 20% a 70%
              setUploadProgress(Math.round(percentComplete));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadProgress(70);
              resolve();
            } else {
              reject(new Error(`Error en subida S3: ${xhr.status} ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error('Error de red durante la subida a S3'));
          };

          xhr.ontimeout = () => {
            reject(new Error('Timeout durante la subida a S3'));
          };

          xhr.open('PUT', presignedUrl);
          xhr.setRequestHeader('Content-Type', file.type || 'text/csv');
          xhr.timeout = 120000; // 2 minutos timeout
          xhr.send(file);
        });

        setUploadProgress(80);

        // Paso 3: Procesar CSV desde S3 con manejo mejorado del 503
        let processAttempt = 0;
        const maxProcessRetries = 2; // Reducido para detectar 503 más rápido
        const startTime = Date.now();
        
        while (processAttempt < maxProcessRetries) {
          try {
            processAttempt++;
            console.log(`Intento ${processAttempt} de ${maxProcessRetries} para procesar CSV`);

            // Timeout más corto para detectar problemas rápidamente
            const processResponse = await Promise.race([
              fetch(`${API_BASE_URL}/api/tarifarios/process-csv-from-s3`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  s3Key: key
                })
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout en procesamiento S3')), 45000) // 45 segundos
              )
            ]);

            console.log('Respuesta de procesamiento:', {
              status: processResponse.status,
              statusText: processResponse.statusText,
              time: Date.now() - startTime
            });

            if (processResponse.ok) {
              // Respuesta exitosa normal
              setUploadProgress(100);
              return await processResponse.json();
            } else if (processResponse.status === 503) {
              // Error 503 - pero el procesamiento podría haber funcionado
              console.log('Error 503 detectado - verificando si el procesamiento fue exitoso...');
              
              const verification = await verifyProcessingSuccess();
              if (verification.success) {
                setUploadProgress(100);
                return verification.data;
              }
              
              // Si no fue exitoso y es el último intento, fallar
              if (processAttempt >= maxProcessRetries) {
                const errorText = await processResponse.text().catch(() => 'Service Unavailable');
                throw new Error(`Error 503: ${errorText}`);
              }
              
              // Reintentar
              console.log('Reintentando procesamiento...');
              await new Promise(resolve => setTimeout(resolve, 5000 * processAttempt));
              continue;
              
            } else {
              // Otros errores HTTP
              const errorData = await processResponse.json().catch(() => ({}));
              throw new Error(errorData.message || `Error HTTP ${processResponse.status} procesando archivo desde S3`);
            }

          } catch (error) {
            if (error.message.includes('Timeout en procesamiento') && processAttempt >= maxProcessRetries) {
              // Timeout - verificar si funcionó igual
              console.log('Timeout detectado - verificando si el procesamiento fue exitoso...');
              
              const verification = await verifyProcessingSuccess();
              if (verification.success) {
                setUploadProgress(100);
                return verification.data;
              }
            }
            
            if (processAttempt >= maxProcessRetries) {
              throw error;
            }
            
            console.log(`Error en intento ${processAttempt}, reintentando:`, error.message);
            await new Promise(resolve => setTimeout(resolve, 3000 * processAttempt));
          }
        }

      } catch (error) {
        if (attempt >= maxRetries) {
          throw new Error(`Error en subida S3 después de ${maxRetries} intentos: ${error.message}`);
        }
        
        console.log(`Error en intento ${attempt}, reintentando:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        setUploadProgress(0);
      }
    }
  };

  // Paso 2: Subir archivo con verificación post-error
  const handleUpload = async () => {
    if (!file) return;

    setUploadLoading(true);
    setUploadProgress(0);

    try {
      const fileSizeMB = file.size / (1024 * 1024);
      console.log('Subiendo archivo a S3:', fileSizeMB.toFixed(2), 'MB');
      
      const result = await uploadToS3();
      
      if (result && result.message && result.message.includes('exitosamente')) {
        setUploadResult(result);
        setCurrentStep(2);
        await validateData(); // Validar automáticamente después de subir
      } else {
        throw new Error(result?.message || 'Error procesando archivo');
      }
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      
      // Verificar si el procesamiento funcionó a pesar del error
      if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
        const shouldCheck = window.confirm(
          'El servicio reportó un error, pero es posible que el archivo se haya procesado correctamente.\n\n' +
          '¿Quieres verificar si los datos se cargaron exitosamente?'
        );
        
        if (shouldCheck) {
          const verification = await verifyProcessingSuccess();
          if (verification.success) {
            setUploadResult(verification.data);
            setCurrentStep(2);
            await validateData();
            return; // Salir sin mostrar error
          }
        }
      }
      
      // Mensajes de error mejorados
      let userMessage = 'Error al subir el archivo';
      
      if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
        userMessage = 'El servicio reportó un error. Si el archivo se procesó, puedes usar el botón "Verificar Datos" para continuar.';
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        userMessage = 'La subida tomó demasiado tiempo. El archivo podría haberse procesado correctamente. Intenta "Verificar Datos".';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
      } else if (error.message.includes('presignada')) {
        userMessage = 'Error configurando la subida. Por favor, inténtalo de nuevo.';
      } else if (error.message.includes('JSON')) {
        userMessage = 'Error del servidor. Por favor, inténtalo más tarde o contacta al administrador.';
      } else {
        userMessage = `Error: ${error.message}`;
      }
      
      alert(userMessage);
    } finally {
      setUploadLoading(false);
      setUploadProgress(0);
    }
  };

  // Función para verificar datos manualmente
  const handleVerifyData = async () => {
    try {
      setUploadLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/tarifarios/validate-temp`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        setUploadResult({
          message: "Datos encontrados y verificados correctamente",
          totalRows: result.totalRows
        });
        setCurrentStep(2);
        await validateData();
        alert('¡Datos encontrados! El procesamiento anterior fue exitoso.');
      } else {
        alert('No hay datos temporales para validar. Intenta subir el archivo nuevamente.');
      }
    } catch (error) {
      alert('Error verificando datos: ' + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Paso 3: Validar datos
  const validateData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tarifarios/validate-temp`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Error en la validación');
      }
      
      const result = await response.json();
      setValidationData(result);
      
      if (result.isValid) {
        setCurrentStep(3);
        await getPreview(); // Obtener preview automáticamente si es válido
      }
    } catch (error) {
      console.error('Error validando datos:', error);
      alert('Error validando los datos');
    }
  };

  // Paso 4: Obtener preview
  const getPreview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tarifarios/preview-temp`);
      
      if (!response.ok) {
        throw new Error('Error obteniendo preview');
      }
      
      const result = await response.json();
      setPreviewData(result);
    } catch (error) {
      console.error('Error obteniendo preview:', error);
      alert('Error obteniendo vista previa');
    }
  };

  // Paso 5: Confirmar reemplazo
  const handleConfirm = async () => {
    if (!window.confirm('¿Estás seguro? Esta acción reemplazará completamente los tarifarios actuales.')) {
      return;
    }

    setConfirmLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tarifarios/confirm-replace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: 'ADMIN' })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`¡Éxito! ${result.message}\nTotal de registros: ${result.totalRows}`);
        navigate('/tarifario/lista'); // Navegar a lista de tarifarios
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error confirmando:', error);
      alert('Error al confirmar la actualización');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Cancelar proceso
  const handleCancel = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/tarifarios/cancel-upload`, { method: 'POST' });
      setCurrentStep(1);
      setFile(null);
      setValidationData(null);
      setPreviewData(null);
      setUploadResult(null);
      setS3Key(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error cancelando:', error);
    }
  };

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/tarifario/lista')}
          className="mr-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Volver
        </button>
        <div className="h-5 border-l border-gray-300"></div>
        <Text className="ml-4 text-gray-500">Importar Tarifario</Text>
      </div>

      <Title className="text-2xl font-bold mb-6">Importar Tarifario desde CSV</Title>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {[
          { step: 1, label: 'Cargar Archivo', icon: DocumentArrowUpIcon },
          { step: 2, label: 'Validar', icon: CheckCircleIcon },
          { step: 3, label: 'Previsualizar', icon: ExclamationTriangleIcon },
          { step: 4, label: 'Confirmar', icon: CheckCircleIcon }
        ].map(({ step, label, icon: Icon }, index) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > step ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            <span className={`ml-2 text-sm ${currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              {label}
            </span>
            {index < 3 && <div className="mx-4 w-8 h-px bg-gray-300"></div>}
          </div>
        ))}
      </div>

      {/* Paso 1: Cargar archivo */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Formato requerido del CSV:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div>• ID suc, ID Paquete, ID Cable, (@) Velocidad, Telefono</div>
              <div>• PP Paquete, PN Paquete, Tarifa Promocional</div>
              <div>• Simetría, (@) Promo, Periodo @ Promo, Periodo Tarifa Promo</div>
              <div>• idContrata, status, ID Página Web</div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              <CloudArrowUpIcon className="w-4 h-4 inline mr-1" />
              Subida a S3 con verificación automática de éxito
            </div>
          </div>

          {/* Área de drag & drop */}
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              dragOver 
                ? 'border-blue-400 bg-blue-50' 
                : file 
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {dragOver ? (
              <>
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-blue-500" />
                <div className="mt-4">
                  <p className="text-lg font-medium text-blue-700">¡Suelta el archivo aquí!</p>
                  <p className="text-sm text-blue-600">Archivo CSV</p>
                </div>
              </>
            ) : file ? (
              <>
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                <div className="mt-4">
                  <p className="text-lg font-medium text-green-700">Archivo seleccionado</p>
                  <p className="text-sm text-gray-600">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      <CloudArrowUpIcon className="w-3 h-3 inline mr-1" />
                      S3 Upload
                    </span>
                  </p>
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Cambiar archivo
                  </button>
                </div>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-blue-400" />
                <div className="mt-4">
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="text-lg font-medium text-gray-900 hover:text-blue-600">
                      Arrastra tu archivo CSV aquí
                    </span>
                    <p className="mt-1 text-sm text-gray-500">
                      o <span className="text-blue-600 underline">haz clic para seleccionar</span>
                    </p>
                    <input
                      ref={fileInputRef}
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    <CloudArrowUpIcon className="w-3 h-3 inline mr-1" />
                    Archivos CSV hasta 100MB - Sistema con verificación inteligente
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Barra de progreso durante la subida */}
          {uploadLoading && (
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>
                  {uploadProgress < 20 ? 'Configurando subida a S3...' :
                   uploadProgress < 70 ? 'Subiendo archivo a S3...' :
                   uploadProgress < 95 ? 'Procesando CSV desde S3...' : 'Finalizando...'}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <CloudArrowUpIcon className="w-3 h-3 mr-1" />
                  Subida segura con verificación automática
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => navigate('/tarifario/lista')}>
              Cancelar
            </Button>
            <div className="flex gap-2">
              {/* Botón para verificar datos existentes */}
              <Button 
                variant="secondary"
                onClick={handleVerifyData}
                disabled={uploadLoading}
              >
                Verificar Datos
              </Button>
              
              <Button 
                onClick={handleUpload} 
                disabled={!file || uploadLoading}
                loading={uploadLoading}
              >
                {uploadLoading ? 'Subiendo a S3...' : 'Subir y Validar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 2: Resultados de validación */}
      {currentStep === 2 && validationData && (
        <div className="space-y-6">
          <div className={`border rounded-lg p-4 ${
            validationData.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center">
              {validationData.isValid ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-600" />
              )}
              <span className={`ml-2 font-medium ${
                validationData.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationData.isValid ? 'Validación exitosa' : 'Errores encontrados'}
              </span>
            </div>
            <Text className="mt-2">Total de filas: {validationData.totalRows}</Text>
          </div>

          {!validationData.isValid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Errores encontrados:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationData.errors.slice(0, 10).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
                {validationData.errors.length > 10 && (
                  <li className="font-medium">... y {validationData.errors.length - 10} errores más</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            {validationData.isValid ? (
              <Button onClick={() => setCurrentStep(3)}>
                Continuar a Preview
              </Button>
            ) : (
              <Button onClick={() => setCurrentStep(1)}>
                Cargar Nuevo Archivo
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Paso 3: Preview de datos */}
      {currentStep === 3 && previewData && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800">Vista previa de datos</h4>
            <Text>Mostrando las primeras 10 filas de {previewData.totalRows} registros totales</Text>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo Paquete</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Velocidad</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Promo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Normal</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.preview.slice(0, 10).map((row, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm text-gray-900">{row.idSucursal}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{row.idTipoPaquete}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{row.velocidadInternet}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">${row.precioPromoPaquete}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">${row.precioNormalPaquete}</td>
                    <td className="px-3 py-2">
                      <Badge color={row.status === 1 ? 'green' : 'red'}>
                        {row.status === 1 ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={() => setCurrentStep(4)} color="red">
              Proceder a Confirmar
            </Button>
          </div>
        </div>
      )}

      {/* Paso 4: Confirmación final */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <h3 className="ml-2 text-lg font-medium text-red-800">¡Confirmación requerida!</h3>
            </div>
            <div className="mt-4 text-red-700">
              <p className="font-medium">Esta acción:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Reemplazará completamente todos los tarifarios existentes</li>
                <li>Creará un respaldo automático de los datos actuales</li>
                <li>No se puede deshacer fácilmente</li>
                <li>Afectará {previewData?.totalRows} registros</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              color="red"
              loading={confirmLoading}
              disabled={confirmLoading}
            >
              {confirmLoading ? 'Procesando...' : 'Confirmar Reemplazo'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}