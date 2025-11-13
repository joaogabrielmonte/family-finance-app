import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../index.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 🔹 Validação simples no front
    if (!name || !email || !password) {
      toast.warning("Preencha todos os campos!");
      setLoading(false);
      return;
    }

    // 🔹 Validação extra de senha no front
    if (
      password.length < 8 ||
      !/\d/.test(password) ||
      !/[A-Za-z]/.test(password)
    ) {
      toast.warning(
        "A senha deve ter ao menos 8 caracteres, com letras e números."
      );
      setLoading(false);
      return;
    }

    // 🔹 Validação básica de formato de e-mail (cliente)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.warning("Digite um e-mail válido.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", { name, email, password });
      toast.success("Conta criada com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao registrar.");
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      {/* Overlay de Loading */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/images/logo2.png"
            alt="Kingslytic Logo"
            className="h-20 w-auto object-contain"
          />
        </div>

        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Criar Conta
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Preencha os dados para começar
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome completo
            </label>
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition 
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Já tem conta?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Entrar
          </a>
        </p>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            Produzido pela Kingslytic Enterprise Solutions
          </p>
          <p className="text-center text-xs text-gray-400 mt-1">
            © {currentYear} - Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </div>
  );
}
