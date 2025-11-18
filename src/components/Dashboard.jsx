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
import LegalTerminos from "../pages/LegalTerminos";
import LegalTerminosList from "../pages/LegalTerminosList";
import LegalTerminosDetalle from "../pages/LegalTerminosDetalle";
import LegalTerminosForm from "../pages/LegalTerminosForm";
import TriviasList from "../pages/TriviasList";
import TriviasForm from "../pages/TriviasForm";
import TriviasDetalle from "../pages/TriviasDetalle";
import BannerHomeList from "../pages/BannerHomeList";
import BannerHomeForm from "../pages/BannerHomeForm";
import BannerHomeDetail from "../pages/BannerHomeDetail";
import BannerAvisosList from "../pages/BannerAvisosList";
import BannerAvisosForm from "../pages/BannerAvisosForm";
import BannerAvisosDetail from "../pages/BannerAvisosDetail";
import CardsStreamingList from "../pages/CardsStreamingList";
import CardsStreamingForm from "../pages/CardsStreamingForm";
import CardsStreamingDetail from "../pages/CardsStreamingDetail";
import TarifarioImportar from "../pages/TarifarioImportar";
import TarifarioLista from "../pages/TarifarioLista";
import TarifarioAuditoria from "../pages/TarifarioAuditoria";
import CisList from "../pages/CisList";
import CisNuevo from "../pages/CisNuevo";
import CisDetalle from "../pages/CisDetalle";
import CisEditar from "../pages/CisEditar";


import CuponeraSection from "../pages/CuponeraSection";
import CuponeraDetalle from "../pages/CuponeraDetalle";
import CuponeraNuevo from "../pages/CuponeraNuevo";
import CuponeraEditar from "../pages/CuponeraEditar";
import DestacadosStreamings from "../pages/DestacadosStrSection";
import DestacadosStrEditar from "../pages/DestacadosStrEditar";
import DestacadosStrDetail from "../pages/DestacadosStrDetail";
import DestacadosStrNuevo from "../pages/DestacadosStrNuevo";
import SocialMediaDetail from "../pages/SocialMediaDetail";
import SocialMediaEditar from "../pages/SocialMediaEditar";
import SocialMediaNuevo from "../pages/SocialMediaNuevo";
import SocialMediaSection from "../pages/SocialMediaSection";

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
          <img src="/mega-logo.png" alt="Logo" className="h-10 mx-auto" />
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

                {/* <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/regiones")}
                >
                  Regiones
                </button>*/}
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
                  onClick={() => navigate("/tarifario/lista")}
                >
                  Ver Tarifarios
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/tarifario/auditoria")}
                >
                  Historial de Importaciones
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
                  onClick={() => navigate("/bannerAvisos")}
                >
                  Banners Avisos
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/cards-streaming")}
                >
                  Banners card streaming
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/cuponera")}
                >
                  Cuponera
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/destacados-streamings")}
                >
                  Destacados Streamings
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
              </SidebarMenu>

              <SidebarMenu title="Footer">
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/redesSociales")}
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
                  onClick={() => navigate("/legal/secciones")}
                >
                  Secciones
                </button>
                <button
                  className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => navigate("/legal/terminos")}
                >
                  Términos y Condiciones
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
          <Route path="/bannerhome" element={<BannerHomeList />} />
          <Route path="/bannerhome/nuevo" element={<BannerHomeForm />} />
          <Route path="/bannerhome/editar/:id" element={<BannerHomeForm />} />
          <Route path="/bannerhome/:id" element={<BannerHomeDetail />} />
          <Route path="/bannerAvisos" element={<BannerAvisosList />} />
          <Route path="/bannerAvisos/nuevo" element={<BannerAvisosForm />} />
          <Route path="/bannerAvisos/editar/:id" element={<BannerAvisosForm />} />
          <Route path="/bannerAvisos/:id" element={<BannerAvisosDetail />} />
          <Route path="/legal/secciones" element={<LegalSecciones />} />
          <Route path="/secciones-legales" element={<LegalSecciones />} />
          <Route path="/secciones-legales/nueva" element={<LegalSeccionForm />} />
          <Route path="/secciones-legales/editar/:idSeccionLegal" element={<LegalSeccionForm isEdit={true} />} />
          <Route path="/secciones-legales/:idSeccionLegal" element={<LegalSeccionDetalle />} />
          <Route path="/legal/terminos" element={<LegalTerminosList />} />
          <Route path="/legal/terminos/nuevo" element={<LegalTerminosForm />} />
          <Route path="/legal/terminos/:id" element={<LegalTerminosDetalle />} />
          <Route path="/trivias/gestionar" element={<TriviasList />} />
          <Route path="/trivias/nueva" element={<TriviasForm />} />
          <Route path="/trivias/editar/:id" element={<TriviasForm />} />
          <Route path="/trivias/:id" element={<TriviasDetalle />} />
          <Route path="/cards-streaming" element={<CardsStreamingList />} />
          <Route path="/cards-streaming/nuevo" element={<CardsStreamingForm />} />
          <Route path="/cards-streaming/editar/:id" element={<CardsStreamingForm />} />
          <Route path="/cards-streaming/:id" element={<CardsStreamingDetail />} />
          <Route path="/tarifario/importar" element={<TarifarioImportar />} />
          <Route path="/tarifario/lista" element={<TarifarioLista />} />
          <Route path="/tarifario/auditoria" element={<TarifarioAuditoria />} />


          {/* Cuponera */}
          <Route path="/cuponera" element={<CuponeraSection />} />
          <Route path="/cuponera/nuevo" element={<CuponeraNuevo />} />
          <Route path="/cuponera/:id" element={<CuponeraDetalle />} />
          <Route path="/cuponera/editar/:id" element={<CuponeraEditar />} />

          {/* Destacados Streamings */}
          <Route path="/destacados-streamings" element={<DestacadosStreamings />} />
          <Route path="/destacados-streamings/nuevo" element={<DestacadosStrNuevo />} />
          <Route path="/destacados-streamings/editar/:id" element={<DestacadosStrEditar />} />
          <Route path="/destacados-streamings/:id" element={<DestacadosStrDetail />} />

          {/* Redes Sociales */}
          <Route path="/redesSociales" element={<SocialMediaSection />} />
          <Route path="/redesSociales/:id" element={<SocialMediaDetail />} />
          <Route path="/redesSociales/editar/:id" element={<SocialMediaEditar />} />
          <Route path="/redesSociales/nuevo" element={<SocialMediaNuevo />} />

          {/* CIS */}
          <Route path="/cis" element={<CisList />} />
          <Route path="/cis/nuevo" element={<CisNuevo />} />
          <Route path="/cis/:id" element={<CisDetalle />} />
          <Route path="/cis/editar/:id" element={<CisEditar />} />

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