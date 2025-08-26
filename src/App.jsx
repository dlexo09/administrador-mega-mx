import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!user) return <Login onLogin={(userData, token) => login(userData, token)} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Dashboard onLogout={logout} userRole={user.role} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;