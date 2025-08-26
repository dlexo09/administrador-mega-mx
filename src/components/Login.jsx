import { useState } from "react";
import { Card, Title, Text, TextInput } from "@tremor/react";

// Usuarios temporales (puedes agregar más)
const USERS = [
  { email: "admin@megacable.com.mx", password: "admin123", name: "Administrador", role: "admin" },
  { email: "marketing@megacable.com.mx", password: "marketing123", name: "Marketing", role: "marketing" },
  { email: "legal@megacable.com.mx", password: "legal123", name: "Legal", role: "legal" },
];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Busca el usuario en el JSON local
    const user = USERS.find(
      (u) => u.email === email && u.password === password
    );

    setTimeout(() => {
      if (user) {
        onLogin(
          { email: user.email, name: user.name, role: user.role },
          "fake-token"
        );
      } else {
        setError("Credenciales inválidas");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
            <img src="mega.svg" alt="Logo" className="h-10" />
          </div>
        </div>
        <Title className="text-center mb-2">Iniciar sesión</Title>
        <Text className="text-center mb-6">Accede con tus credenciales temporales</Text>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Email
            </label>
            <TextInput
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="usuario@megacable.com.mx"
              className="mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
              Contraseña
            </label>
            <TextInput
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="********"
              className="mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full whitespace-nowrap rounded-tremor-default bg-blue-600 py-2 text-center text-white font-medium shadow-tremor-input hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? "Procesando..." : "Entrar"}
          </button>
        </form>
        <Text className="mt-4 text-center text-tremor-label">
          Usa: <b>admin@megacable.com.mx / admin123</b> <br />
          o <b>marketing@megacable.com.mx / marketing123</b>
        </Text>
      </Card>
    </div>
  );
}