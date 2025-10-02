import { useEffect, useState } from "react";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { EyeIcon, PencilSquareIcon, PowerIcon } from "@heroicons/react/24/outline";

const PAGE_SIZE = 10;

export default function CardsStreamingList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // Ordena por idCardStreaming descendente por defecto
  const [sortBy, setSortBy] = useState("idCardStreaming");
  const [sortDir, setSortDir] = useState("desc");
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const navigate = useNavigate();

  // Cargar cards
  const loadCards = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/cardsstreaming`)
      .then((res) => res.json())
      .then((data) => {
        setCards(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setCards([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCards();
  }, []);

  // Filtro por nombre de la card
  const filtered = cards.filter((item) =>
    (item.nameCard || "").toLowerCase().includes(search.toLowerCase())
  );

  // Ordenamiento
  const sorted = [...filtered].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();
    if (aValue < bValue) return sortDir === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir(col === "idCardStreaming" ? "desc" : "asc"); // idCardStreaming siempre inicia descendente
    }
    setPage(1);
  };

  // Cambiar estado (activar/desactivar)
  const handleStatus = async (id, currentStatus) => {
    try {
      setStatusLoadingId(id);
      const getResponse = await fetch(`${API_BASE_URL}/api/cardsstreaming/${id}`);
      if (!getResponse.ok) throw new Error("Error al obtener card");
      const cardCompleta = await getResponse.json();
      const nuevoStatus = currentStatus === 1 ? 0 : 1;
      const datosActualizados = {
        ...cardCompleta,
        status: nuevoStatus
      };
      const updateResponse = await fetch(`${API_BASE_URL}/api/cardsstreaming/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosActualizados),
      });
      if (!updateResponse.ok) throw new Error("Error al actualizar status");
      setCards(cards.map(c =>
        c.idCardStreaming === id ? { ...c, status: nuevoStatus } : c
      ));
      alert(`Card ${nuevoStatus === 1 ? "activada" : "desactivada"} correctamente`);
    } catch (e) {
      console.error("Error al actualizar status:", e);
      alert("No se pudo actualizar el status de la card.");
    } finally {
      setStatusLoadingId(null);
    }
  };

  // Icono de ordenamiento
  const sortIcon = (col) =>
    sortBy === col ? (sortDir === "asc" ? "▲" : "▼") : "⇅";

  return (
    <Card className="bg-white shadow-lg rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
        <div>
          <Title>Cards Streaming</Title>
          <Text className="text-gray-500">
            Administración de tarjetas de streaming
          </Text>
        </div>
        <Button color="blue" className="shadow px-4" onClick={() => navigate("/cards-streaming/nuevo")}>
          <div className="flex items-center justify-center gap-2 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Nueva Card</span>
          </div>
        </Button>
      </div>

      <div className="flex items-center gap-4 mt-4 mb-2">
        <TextInput
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Text className="ml-auto">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </Text>
      </div>
      <div className="overflow-x-auto mt-2 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("idCardStreaming")}
              >
                Id {sortIcon("idCardStreaming")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("nameCard")}
              >
                Nombre {sortIcon("nameCard")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("textButton")}
              >
                Texto Botón {sortIcon("textButton")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("status")}
              >
                Status {sortIcon("status")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("fhInicio")}
              >
                Inicio {sortIcon("fhInicio")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("fhFin")}
              >
                Fin {sortIcon("fhFin")}
              </th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  <Text>No hay resultados.</Text>
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr
                  key={item.idCardStreaming}
                  className="border-b hover:bg-blue-50 transition-colors"
                >
                  <td className="px-4 py-2">{item.idCardStreaming}</td>
                  <td className="px-4 py-2">{item.nameCard}</td>
                  <td className="px-4 py-2">{item.textButton || "Sin texto"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold border ${item.status === 1
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-red-100 text-red-700 border-red-300"
                        }`}
                    >
                      {item.status === 1 ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{item.fhInicio ? item.fhInicio.substring(0, 16) : ""}</td>
                  <td className="px-4 py-2">{item.fhFin ? item.fhFin.substring(0, 16) : ""}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/cards-streaming/${item.idCardStreaming}`}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-blue-100 transition"
                      title="Ver"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Ver
                    </Link>
                    <Link
                      to={`/cards-streaming/editar/${item.idCardStreaming}`}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                      title="Editar"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleStatus(item.idCardStreaming, item.status)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition ${item.status === 1
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      title={item.status === 1 ? "Desactivar" : "Activar"}
                      disabled={statusLoadingId === item.idCardStreaming}
                    >
                      {statusLoadingId === item.idCardStreaming ? (
                        <span className="animate-spin h-4 w-4 mr-1 border-b-2 border-blue-700 rounded-full"></span>
                      ) : (
                        <PowerIcon className="w-4 h-4" />
                      )}
                      {item.status === 1 ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <Text>
          Página <span className="font-bold">{page}</span> de <span className="font-bold">{totalPages || 1}</span>
        </Text>
        <button
          className="px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          Siguiente
        </button>
      </div>
    </Card>
  );
}