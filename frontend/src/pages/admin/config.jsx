// src/pages/admin/Config.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Menu from '../../components/menu';

export default function Config() {
  const user = JSON.parse(localStorage.getItem('user'));

  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || '#2563eb');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'BRL');
  const [companyName, setCompanyName] = useState(localStorage.getItem('companyName') || 'Finanças Family');

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
  }, [themeColor]);

  const handleSave = () => {
    localStorage.setItem('themeColor', themeColor);
    localStorage.setItem('currency', currency);
    localStorage.setItem('companyName', companyName);

    Swal.fire({
      title: '🎉 Configurações salvas!',
      text: 'Suas alterações foram aplicadas com sucesso.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: themeColor,
    }).then(() => {
      window.location.reload();
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Menu user={user} />

      <main className="flex-1 p-6">
        <h2 className="text-3xl font-bold mb-6">⚙️ Configurações do Sistema</h2>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nome do sistema</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Cor principal</label>
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Moeda padrão</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar (US$)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Salvar Configurações
          </button>
        </div>
      </main>
    </div>
  );
}
