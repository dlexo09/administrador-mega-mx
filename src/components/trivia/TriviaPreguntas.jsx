import React, { useState, useEffect } from "react";
import { Button, Text } from "@tremor/react";
import { API_BASE_URL } from "../../config";
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from "@heroicons/react/24/outline";

export default function TriviaPreguntas({ triviaId }) {
  const [preguntas, setPreguntas] = useState([]);
  const [loadingPreguntas, setLoadingPreguntas] = useState(false);
  const [showModalPregunta, setShowModalPregunta] = useState(false);
  const [currentPregunta, setCurrentPregunta] = useState(null);

  // Cargar preguntas de la trivia
  useEffect(() => {
    const fetchPreguntas = async () => {
      if (!triviaId) return;
      
      setLoadingPreguntas(true);
      try {
        // Filtramos por idtriviaConfig
        const res = await fetch(`${API_BASE_URL}/api/triviaspreguntas?idtriviaConfig=${triviaId}`);
        if (!res.ok) {
          console.warn("No se pudieron obtener las preguntas de la trivia");
          setPreguntas([]);
          return;
        }
        
        const data = await res.json();
        console.log("Preguntas de trivia:", data);
        
        // Ordenar las preguntas por el campo orden
        const ordenadas = Array.isArray(data) 
          ? data.sort((a, b) => a.orden - b.orden)
          : [];
          
        setPreguntas(ordenadas);
      } catch (error) {
        console.error("Error cargando preguntas:", error);
        setPreguntas([]);
      } finally {
        setLoadingPreguntas(false);
      }
    };
    
    if (triviaId) fetchPreguntas();
  }, [triviaId]);

  // Función para cambiar el estado de una pregunta (activo/inactivo)
  const handlePreguntaStatus = async (preguntaId, currentStatus) => {
    try {
      const pregunta = preguntas.find(p => p.idTriviasPreguntas === preguntaId);
      if (!pregunta) return;
      
      const nuevoStatus = currentStatus === 1 ? 0 : 1;
      
      const res = await fetch(`${API_BASE_URL}/api/triviaspreguntas/${preguntaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pregunta,
          status: nuevoStatus
        })
      });
      
      if (!res.ok) throw new Error("Error al actualizar estado de la pregunta");
      
      // Actualizar estado local
      setPreguntas(preguntas.map(p => 
        p.idTriviasPreguntas === preguntaId ? {...p, status: nuevoStatus} : p
      ));
      
    } catch (error) {
      console.error("Error al cambiar estado de pregunta:", error);
      alert("No se pudo actualizar el estado de la pregunta");
    }
  };

  // Función para eliminar una pregunta
  const handleDeletePregunta = async (preguntaId) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar esta pregunta? Esta acción no se puede deshacer.")) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/triviaspreguntas/${preguntaId}`, {
        method: "DELETE"
      });
      
      if (!res.ok) throw new Error("Error al eliminar la pregunta");
      
      // Actualizar estado local
      setPreguntas(preguntas.filter(p => p.idTriviasPreguntas !== preguntaId));
      
    } catch (error) {
      console.error("Error eliminando pregunta:", error);
      alert("No se pudo eliminar la pregunta");
    }
  };

  // Función para editar una pregunta
  const handleEditPregunta = (pregunta) => {
    setCurrentPregunta(pregunta);
    setShowModalPregunta(true);
  };

  // Función para crear una nueva pregunta
  const handleNewPregunta = () => {
    setCurrentPregunta({
      pregunta: "",
      idtriviaConfig: triviaId,
      tipoPregunta: "multiple",
      a: "",
      b: "",
      c: "",
      d: "",
      respuestaCorrecta: "",
      preguntaObligatoria: 1,
      preguntaEspecial: 0,
      status: 1,
      orden: preguntas.length > 0 ? Math.max(...preguntas.map(p => p.orden)) + 1 : 1
    });
    setShowModalPregunta(true);
  };

  // Función para manejar el envío del formulario de pregunta
  const handleSubmitPregunta = async (e) => {
    e.preventDefault();
    
    try {
      const method = currentPregunta.idTriviasPreguntas ? "PUT" : "POST";
      const endpoint = currentPregunta.idTriviasPreguntas 
        ? `${API_BASE_URL}/api/triviaspreguntas/${currentPregunta.idTriviasPreguntas}`
        : `${API_BASE_URL}/api/triviaspreguntas`;
      
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentPregunta,
          idtriviaConfig: Number(triviaId)
        })
      });
      
      if (!res.ok) throw new Error(`Error ${method === "PUT" ? "actualizando" : "creando"} pregunta`);
      
      const nuevaPregunta = await res.json();
      
      // Actualizar estado local
      if (currentPregunta.idTriviasPreguntas) {
        // Actualizar pregunta existente
        setPreguntas(preguntas.map(p => 
          p.idTriviasPreguntas === currentPregunta.idTriviasPreguntas ? nuevaPregunta : p
        ));
      } else {
        // Añadir nueva pregunta
        setPreguntas([...preguntas, nuevaPregunta]);
      }
      
      // Cerrar modal
      setShowModalPregunta(false);
      
    } catch (error) {
      console.error("Error guardando pregunta:", error);
      alert("No se pudo guardar la pregunta");
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h3 className="text-lg font-semibold">Preguntas de la trivia</h3>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-3">{preguntas.length} preguntas</span>
          <Button 
            size="xs"
            color="blue"
            onClick={handleNewPregunta}
            className="flex items-center gap-1"
          >
            <PlusIcon className="w-4 h-4" /> 
            Nueva pregunta
          </Button>
        </div>
      </div>

      {loadingPreguntas ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        preguntas.length === 0 ? (
          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mr-3 bg-gray-200 rounded-full p-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="text-gray-600">No hay preguntas configuradas para esta trivia.</div>
          </div>
        ) : (
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pregunta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {preguntas.map((pregunta) => (
                  <tr key={pregunta.idTriviasPreguntas} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pregunta.orden}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-md truncate">
                        {pregunta.pregunta}
                      </div>
                      <div className="mt-1">
                        {pregunta.preguntaObligatoria === 1 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                            Obligatoria
                          </span>
                        )}
                        {pregunta.preguntaEspecial === 1 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Especial
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pregunta.tipoPregunta === 'multiple' ? 'Opción múltiple' : 
                      pregunta.tipoPregunta === 'abierta' ? 'Respuesta abierta' : 
                      pregunta.tipoPregunta === 'si_no' ? 'Sí/No' : 
                      pregunta.tipoPregunta}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pregunta.status === 1 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {pregunta.status === 1 ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPregunta(pregunta)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar pregunta"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handlePreguntaStatus(pregunta.idTriviasPreguntas, pregunta.status)}
                          className={`${
                            pregunta.status === 1 
                              ? 'text-red-600 hover:text-red-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={pregunta.status === 1 ? "Desactivar pregunta" : "Activar pregunta"}
                        >
                          {pregunta.status === 1 ? (
                            <XMarkIcon className="h-5 w-5" />
                          ) : (
                            <CheckIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeletePregunta(pregunta.idTriviasPreguntas)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar pregunta"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal para crear/editar preguntas */}
      {showModalPregunta && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {currentPregunta.idTriviasPreguntas ? "Editar pregunta" : "Nueva pregunta"}
                </h3>
                <button
                  onClick={() => setShowModalPregunta(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitPregunta} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pregunta <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={currentPregunta.pregunta}
                    onChange={(e) => setCurrentPregunta({...currentPregunta, pregunta: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de pregunta <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentPregunta.tipoPregunta}
                      onChange={(e) => setCurrentPregunta({...currentPregunta, tipoPregunta: e.target.value})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="multiple">Opción múltiple</option>
                      <option value="abierta">Respuesta abierta</option>
                      <option value="si_no">Sí/No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orden <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={currentPregunta.orden}
                      onChange={(e) => setCurrentPregunta({...currentPregunta, orden: parseInt(e.target.value) || 0})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                {currentPregunta.tipoPregunta === 'multiple' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opción A <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentPregunta.a}
                          onChange={(e) => setCurrentPregunta({...currentPregunta, a: e.target.value})}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opción B <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentPregunta.b}
                          onChange={(e) => setCurrentPregunta({...currentPregunta, b: e.target.value})}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opción C
                        </label>
                        <input
                          type="text"
                          value={currentPregunta.c}
                          onChange={(e) => setCurrentPregunta({...currentPregunta, c: e.target.value})}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Opción D
                        </label>
                        <input
                          type="text"
                          value={currentPregunta.d}
                          onChange={(e) => setCurrentPregunta({...currentPregunta, d: e.target.value})}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Respuesta correcta <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={currentPregunta.respuestaCorrecta}
                        onChange={(e) => setCurrentPregunta({...currentPregunta, respuestaCorrecta: e.target.value})}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Seleccionar respuesta correcta</option>
                        <option value="a">A</option>
                        <option value="b">B</option>
                        {currentPregunta.c && <option value="c">C</option>}
                        {currentPregunta.d && <option value="d">D</option>}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="preguntaObligatoria"
                      checked={currentPregunta.preguntaObligatoria === 1}
                      onChange={(e) => setCurrentPregunta({
                        ...currentPregunta, 
                        preguntaObligatoria: e.target.checked ? 1 : 0
                      })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="preguntaObligatoria" className="text-sm font-medium text-gray-700">
                      Pregunta obligatoria
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="preguntaEspecial"
                      checked={currentPregunta.preguntaEspecial === 1}
                      onChange={(e) => setCurrentPregunta({
                        ...currentPregunta, 
                        preguntaEspecial: e.target.checked ? 1 : 0
                      })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="preguntaEspecial" className="text-sm font-medium text-gray-700">
                      Pregunta especial
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="preguntaStatus"
                    checked={currentPregunta.status === 1}
                    onChange={(e) => setCurrentPregunta({
                      ...currentPregunta, 
                      status: e.target.checked ? 1 : 0
                    })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="preguntaStatus" className="text-sm font-medium text-gray-700">
                    Pregunta activa
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    color="gray"
                    onClick={() => setShowModalPregunta(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    color="blue"
                  >
                    {currentPregunta.idTriviasPreguntas ? "Guardar cambios" : "Crear pregunta"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}