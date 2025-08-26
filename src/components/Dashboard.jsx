import { Card, Title, Text } from "@tremor/react";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Sucursales from "../pages/Sucursales";
import NuevaSucursal from "../pages/NuevaSucursal";
import DetalleSucursal from "../pages/DetalleSucursal";
import EditarSucursal from "../pages/EditarSucursal";
import LegalSecciones from "../pages/LegalSecciones";
import LegalSeccionForm from "../pages/LegalSeccionForm";
import LegalSeccionDetalle from "../pages/LegalSeccionDetalle";


// Importamos componentes placeholder para los que aún no existen
// Esto evita errores 500 por componentes no encontrados
const PlaceholderComponent = ({ name }) => (
  <Card>
    <Title>Componente {name}</Title>
    <Text>Este componente está en desarrollo</Text>
  </Card>
);

// Componentes placeholder para las rutas
const SucursalDetalle = () => <PlaceholderComponent name="SucursalDetalle" />;
const SucursalEditar = () => <PlaceholderComponent name="SucursalEditar" />;
const BannerHome = () => <PlaceholderComponent name="BannerHome" />;
const BannerHomeDetalle = () => <PlaceholderComponent name="BannerHomeDetalle" />;
const BannerHomeEditar = () => <PlaceholderComponent name="BannerHomeEditar" />;
const BannerHomeNuevo = () => <PlaceholderComponent name="BannerHomeNuevo" />;
const BannerAvisosNuevo = () => <PlaceholderComponent name="BannerAvisosNuevo" />;

function SidebarMenu({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="w-full flex justify-between items-center text-left px-2 py-2 rounded hover:bg-gray-100 font-medium"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span>{title}</span>
        <span className="ml-2">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ onLogout, userRole = "admin" }) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <div className="mb-8">
          <img src="/mega.svg" alt="Logo" className="h-10 mx-auto" />
        </div>
        <nav className="space-y-2">
          <button
            className="w-full text-left px-2 py-2 rounded hover:bg-gray-100 font-medium"
            onClick={() => navigate("/")}
          >
            Inicio
          </button>

          {/* Menú visible para todos los perfiles */}
          <div className="py-2 border-t border-gray-200">
            <Text className="text-xs text-gray-500 px-2 mb-2">GENERAL</Text>
          </div>

          {/* Secciones para Administrador y Marketing */}
          {(userRole === "admin" || userRole === "marketing") && (
            <>
              <SidebarMenu title="Catálogos Generales">
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/sucursales")}
                >
                  Sucursales
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/regiones")}
                >
                  Regiones
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/cis")}
                >
                  CIS
                </button>
              </SidebarMenu>

              <SidebarMenu title="Menú Tarifario">
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/tarifario/importar")}
                >
                  Importar Tarifario
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/tarifario/paquetes")}
                >
                  Tipos de Paquete
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/tarifario/streaming")}
                >
                  Tipos de Streaming
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/tarifario/telefonia")}
                >
                  Tipos de Telefonía
                </button>
              </SidebarMenu>

              <SidebarMenu title="Banners">
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/bannerhome")}
                >
                  Banners Home
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/bannerAvisos/nuevo")}
                >
                  Banners Avisos
                </button>
              </SidebarMenu>
            </>
          )}

          {/* Secciones para Administrador y equipo de Redes Sociales */}
          {(userRole === "admin" || userRole === "social") && (
            <>
              <SidebarMenu title="Trivias">
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/trivias/gestionar")}
                >
                  Gestionar Trivias
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/trivias/redes")}
                >
                  Redes Sociales
                </button>
              </SidebarMenu>
            </>
          )}

          {/* Secciones para Administrador y equipo Legal */}
          {(userRole === "admin" || userRole === "legal") && (
            <>
              <SidebarMenu title="Legal">
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/legal/documentos")}
                >
                  Documentos Legales
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/legal/terminos")}
                >
                  Términos y Condiciones
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/legal/secciones")}
                >
                  Secciones
                </button>
              </SidebarMenu>
            </>
          )}

          {/* Sección solo visible para administradores */}
          {userRole === "admin" && (
            <>
              <div className="py-2 border-t border-gray-200">
                <Text className="text-xs text-gray-500 px-2 mb-2">ADMINISTRACIÓN</Text>
              </div>
              <SidebarMenu title="Configuración">
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/usuarios")}
                >
                  Usuarios
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/permisos")}
                >
                  Permisos
                </button>
              </SidebarMenu>
            </>
          )}
        </nav>

        <div className="mt-8 border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-600 mb-2 px-2">
            Perfil: {userRole === "admin" ? "Administrador" : userRole === "marketing" ? "Marketing" : userRole === "legal" ? "Legal" : "Redes Sociales"}
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={
            <Card>
              <Title>Panel de Administración</Title>
              <Text>¡Bienvenido al dashboard principal!</Text>
            </Card>
          } />
          <Route path="/sucursales" element={<Sucursales />} />
          <Route path="/sucursales/nueva" element={<NuevaSucursal />} />
          <Route path="/sucursales/:id" element={<DetalleSucursal />} />
          <Route path="/sucursales/editar/:id" element={<EditarSucursal />} />
          <Route path="/bannerhome" element={<BannerHome />} />
          <Route path="/bannerhome/:id" element={<BannerHomeDetalle />} />
          <Route path="/bannerhome/editar/:id" element={<BannerHomeEditar />} />
          <Route path="/bannerhome/nuevo" element={<BannerHomeNuevo />} />
          <Route path="/bannerAvisos/nuevo" element={<BannerAvisosNuevo />} />
          <Route path="/legal/documentos" element={<PlaceholderComponent name="Documentos Legales" />} />
          <Route path="/legal/terminos" element={<PlaceholderComponent name="Términos y Condiciones" />} />
          <Route path="/legal/secciones" element={<LegalSecciones />} />
          <Route path="/secciones-legales" element={<LegalSecciones />} />
          <Route path="/secciones-legales/nueva" element={<LegalSeccionForm />} />
          <Route path="/secciones-legales/editar/:idSeccionLegal" element={<LegalSeccionForm isEdit={true} />} />
          <Route path="/secciones-legales/:idSeccionLegal" element={<LegalSeccionDetalle />} />
          {/* Ruta para cualquier otra dirección no definida */}
          <Route path="*" element={
            <Card>
              <Title>Página no encontrada</Title>
              <Text>La página que buscas no existe o está en desarrollo.</Text>
            </Card>
          } />
        </Routes>
      </main>
    </div>
  );
}