import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function ProtectedRoute({ children, roles }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setIsAuthorized(false);
      Swal.fire({
        icon: "error",
        title: "401 - Não Autorizado",
        text: "Você precisa estar logado para acessar esta página.",
      });
      return;
    }

    const user = JSON.parse(storedUser);
    if (roles && !roles.includes(user.role)) {
      setIsAuthorized("forbidden");
      Swal.fire({
        icon: "warning",
        title: "403 - Acesso Negado",
        text: "Você não tem permissão para acessar esta área.",
      });
      return;
      
    }

    setIsAuthorized(true);
  }, [roles]);

  if (isAuthorized === null) return null; // Evita flicker

  if (isAuthorized === false) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
        <h1 className="text-6xl font-bold text-red-600">401</h1>
        <p className="text-gray-700 text-xl mt-2">
          Você precisa estar autenticado para continuar.
        </p>
        <a
          href="/login"
          className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Ir para Login
        </a>
      </div>
    );
  }

  if (isAuthorized === "forbidden") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
        <h1 className="text-6xl font-bold text-yellow-500">403</h1>
        <p className="text-gray-700 text-xl mt-2">
          Acesso negado — você não possui permissão para esta área.
        </p>
        <a
          href="/dashboard"
          className="mt-6 bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800"
        >
          Voltar ao Dashboard
        </a>
      </div>
    );
  }

  return children;
}
