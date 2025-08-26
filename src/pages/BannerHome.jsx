import { useEffect, useState } from "react";
import { Card, Title, Text, TextInput } from "@tremor/react";
import { Link } from "react-router-dom";
import { API_BASE_URL, S3_FRONT_URL } from "../config";
import "./BannerHome.css";


const PAGE_SIZE = 10;

export default function BannerHome() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetch(`${API_BASE_URL}/banners/home`)
            .then((res) => res.json())
            .then((data) => {
                setBanners(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Filtro por título
    const filtered = banners.filter((item) =>
        item.title?.toLowerCase().includes(search.toLowerCase())
    );

    // Paginación
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Acción activar/desactivar
    const handleStatus = (id, action) => {
        const url =
            action === "activar"
                ? `${API_BASE_URL}negocios/banners/home/restaurar/${id}`
                : `${API_BASE_URL}negocios/banners/home/borrar/${id}`;
        fetch(url, { method: "PUT" })
            .then((res) => res.json())
            .then(() => window.location.reload());
    };

    return (
        <Card>
            <Title>Banners Home</Title>
            <Text className="mb-4">
                Aquí puedes ver los banners cargados para la página principal de Negocios.
            </Text>
            <div className="flex items-center gap-4 mt-4 mb-2">
                <TextInput
                    placeholder="Buscar banner..."
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
            <Link
                to="/bannerhome/nuevo"
                className="inline-block mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
                + Nuevo Banner
            </Link> 
            <div className="overflow-x-auto mt-2">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">ID</th>
                            <th className="px-4 py-2 text-left">Imagen</th>
                            <th className="px-4 py-2 text-left">Título</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Vigencia</th>
                            <th className="px-4 py-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">
                                    <Text>Cargando...</Text>
                                </td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">
                                    <Text>No hay resultados.</Text>
                                </td>
                            </tr>
                        ) : (
                            paginated.map((item) => (
                                <tr key={item.idBannerHome} className="border-b">
                                    <td className="px-4 py-2">{item.idBannerHome}</td>
                                    <td className="px-4 py-2">
                                        <div className="banner-img-stack">
                                            {item.background && (
                                                <img
                                                    src={`${S3_FRONT_URL}${item.ruta}${item.background}`}
                                                    alt={item.title}
                                                    className="banner-img-bg"
                                                />
                                            )}
                                            {item.imagenBanner && (
                                                <img
                                                    src={`${S3_FRONT_URL}${item.ruta}${item.imagenBanner}`}
                                                    alt={item.title}
                                                    className="banner-img-fg"
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">{item.title}</td>
                                    <td className="px-4 py-2">
                                        {item.status === 1 ? "ACTIVO" : "INACTIVO"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {item.fhFin
                                            ? new Date(item.fhFin).toLocaleDateString("es-MX", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })
                                            : "Sin vigencia"}
                                    </td>
                                    <td className="px-4 py-2 space-x-2">
                                        <Link
                                            to={`/bannerhome/${item.idBannerHome}`}
                                            className="inline-block px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                            title="Ver"
                                        >
                                            Ver
                                        </Link>
                                        <Link
                                            to={`/bannerhome/editar/${item.idBannerHome}`}
                                            className="inline-block px-2 py-1 text-xs bg-blue-200 rounded hover:bg-blue-300"
                                            title="Editar"
                                        >
                                            Editar
                                        </Link>
                                        {item.status === 1 ? (
                                            <button
                                                onClick={() => handleStatus(item.idBannerHome, "borrar")}
                                                className="inline-block px-2 py-1 text-xs bg-red-200 rounded hover:bg-red-300"
                                                title="Desactivar"
                                            >
                                                Desactivar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleStatus(item.idBannerHome, "activar")}
                                                className="inline-block px-2 py-1 text-xs bg-green-200 rounded hover:bg-green-300"
                                                title="Activar"
                                            >
                                                Activar
                                            </button>
                                        )}
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
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Anterior
                </button>
                <Text>
                    Página {page} de {totalPages}
                </Text>
                <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                >
                    Siguiente
                </button>
            </div>
        </Card>
    );
}