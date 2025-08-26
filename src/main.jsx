import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'; // Aquí debe estar tu Tailwind
import { AuthProvider } from "./context/AuthContext"; // Ajusta la ruta si es necesario

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);