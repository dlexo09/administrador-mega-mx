import React, { useState } from "react";
import { Card, Title, Text } from "@tremor/react";
import LegalTerminosForm from "./LegalTerminosForm";

export default function LegalTerminos() {
  const [contenido, setContenido] = useState(localStorage.getItem("terminos") || "");
  const [editando, setEditando] = useState(false);

  const handleSave = (nuevoContenido) => {
    setContenido(nuevoContenido);
    localStorage.setItem("terminos", nuevoContenido);
    setEditando(false);
  };

  return (
    <Card>
      <Title>Términos y Condiciones</Title>
      {!editando ? (
        <>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: contenido }} />
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setEditando(true)}
          >
            Editar
          </button>
        </>
      ) : (
        <LegalTerminosForm initialValue={contenido} onSave={handleSave} />
      )}
    </Card>
  );
}