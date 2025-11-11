import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../index.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // ✅ estado de loading
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // 🔥 ativa loading
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro no login');
    } finally {
      setLoading(false); // 🔥 desativa loading
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
          Bem-vindo
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Entre com suas credenciais
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-lg hover:shadow-xl"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Não tem conta?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Registrar-se
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
    </div>
  );
}
