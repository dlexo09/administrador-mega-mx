import { useEffect, useState } from "react";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { EyeIcon, PencilSquareIcon, PowerIcon } from "@heroicons/react/24/outline";

const PAGE_SIZE = 10;

export default function CisList() {
    const [cisList, setCisList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("id_cis");
    const [sortDir, setSortDir] = useState("asc");

    // Función para cargar CIS desde la API
    const loadCis = () => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/cis`)
            .then((res) => res.json())
            .then((data) => {
                setCisList(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al cargar CIS:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadCis();
    }, []);

    // Normalizar texto para búsqueda (quita acentos)
    const normalizeText = (text) => {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    };

    // Filtro por nombre, dirección, colonia e ID
    const filtered = cisList.filter((item) => {
        const searchTerm = normalizeText(search);
        return (
            normalizeText(item.nombre || '').includes(searchTerm) ||
            normalizeText(item.direccion || '').includes(searchTerm) ||
            normalizeText(item.colonia || '').includes(searchTerm) ||
            item.id_cis?.toString().includes(search)
        );
    });

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
            setSortDir("asc");
        }
        setPage(1);
    };

    // Cambiar estado (activar/desactivar)
    const handleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === "1" ? "0" : "1";
        const cis = cisList.find(c => c.id_cis === id);

        if (!cis) {
            console.error("No se encontró el CIS con ID:", id);
            alert("Error: No se encontró el CIS");
            return;
        }

        const updatedCis = {
            ...cis,
            activo: newStatus
        };

        setCisList(cisList.map(c =>
            c.id_cis === id ? updatedCis : c
        ));

        fetch(`${API_BASE_URL}/api/cis/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedCis),
        })
            .then((res) => {
                if (!res.ok) {
                    setCisList(cisList); // Revierte el cambio local
                    throw new Error(`Error ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .catch((error) => {
                console.error("Error en fetch:", error);
                alert(`No se pudo cambiar el estado del CIS: ${error.message}`);
            });
    };

    // Icono de ordenamiento
    const sortIcon = (col) =>
        sortBy === col ? (sortDir === "asc" ? "▲" : "▼") : "⇅";

    return (
        <Card className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                <div>
                    <Title>CIS</Title>
                    <Text className="text-gray-500">
                        Administración de Centros de Atención y Servicio
                    </Text>
                </div>
                <Link to="/cis/nuevo">
                    <Button color="blue" className="shadow">
                        + Nuevo CIS
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4 mt-4 mb-2">
                <TextInput
                    placeholder="Buscar por ID, nombre, dirección o colonia..."
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
                                onClick={() => handleSort("id_cis")}
                            >
                                Id {sortIcon("id_cis")}
                            </th>
                            <th
                                className="px-4 py-2 text-left cursor-pointer select-none"
                                onClick={() => handleSort("nombre")}
                            >
                                Nombre {sortIcon("nombre")}
                            </th>
                            <th
                                className="px-4 py-2 text-left cursor-pointer select-none"
                                onClick={() => handleSort("direccion")}
                            >
                                Dirección {sortIcon("direccion")}
                            </th>
                            <th
                                className="px-4 py-2 text-left cursor-pointer select-none"
                                onClick={() => handleSort("colonia")}
                            >
                                Colonia {sortIcon("colonia")}
                            </th>
                            <th
                                className="px-4 py-2 text-left cursor-pointer select-none"
                                onClick={() => handleSort("activo")}
                            >
                                Status {sortIcon("activo")}
                            </th>
                            <th
                                className="px-4 py-2 text-left cursor-pointer select-none"
                                onClick={() => handleSort("discapacidad")}
                            >
                                Accesible {sortIcon("discapacidad")}
                            </th>
                            <th className="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-4">
                                    <Text>Cargando...</Text>
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
                                    key={item.id_cis}
                                    className="border-b hover:bg-blue-50 transition-colors"
                                >
                                    <td className="px-4 py-2">{item.id_cis}</td>
                                    <td className="px-4 py-2">{item.nombre}</td>
                                    <td className="px-4 py-2">{item.direccion}</td>
                                    <td className="px-4 py-2">{item.colonia}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-bold border ${item.activo == "1"
                                                ? "bg-green-100 text-green-700 border-green-300"
                                                : "bg-red-100 text-red-700 border-red-300"
                                                }`}
                                        >
                                            {item.activo == "1" ? "ACTIVO" : "INACTIVO"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-bold border ${item.discapacidad === "1"
                                                ? "bg-green-100 text-green-700 border-green-300"
                                                : "bg-red-100 text-red-700 border-red-300"
                                                }`}
                                        >
                                            {item.discapacidad === "1" ? "Sí" : "No"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 space-x-2">
                                        <Link
                                            to={`/cis/${item.id_cis}`}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-blue-100 transition"
                                            title="Ver"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                            Ver
                                        </Link>
                                        <Link
                                            to={`/cis/editar/${item.id_cis}`}
                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                                            title="Editar"
                                        >
                                            <PencilSquareIcon className="w-4 h-4" />
                                            Editar
                                        </Link>
                                        <button
                                            onClick={() => handleStatus(item.id_cis, item.activo)}
                                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded transition ${item.activo === "1"
                                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                                }`}
                                            title={item.activo == "1" ? "Desactivar" : "Activar"}
                                        >
                                            <PowerIcon className="w-4 h-4" />
                                            {item.activo == "1" ? "Desactivar" : "Activar"}
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