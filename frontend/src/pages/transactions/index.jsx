import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Menu from "../../components/menu";

import {
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Search,
  Filter,
  Trash2,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../index.css";

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [banks, setBanks] = useState([]);
  const [filters, setFilters] = useState({
    bankId: "",
    type: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchBanks();
    fetchTransactions();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await api.get(`/banks/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanks(res.data);
    } catch (error) {
      console.error("Erro ao carregar bancos:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/finances", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast.error("Erro ao carregar transações", {
        icon: <AlertTriangle className="text-rose-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchBank =
      !filters.bankId || Number(t.bankId) === Number(filters.bankId);
    const matchType = !filters.type || t.type === filters.type;
    const matchSearch =
      !filters.search ||
      t.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchStart =
      !filters.startDate ||
      new Date(t.date) >= new Date(filters.startDate + "T00:00:00");

    const matchEnd =
      !filters.endDate ||
      new Date(t.date) <= new Date(filters.endDate + "T23:59:59");

    return matchBank && matchType && matchSearch && matchStart && matchEnd;
  });

  const handleDelete = async (id) => {
    try {
      await api.delete(`/finances/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Transação excluída", {
        icon: <Trash2 className="text-rose-500" />,
      });
      fetchTransactions();
    } catch (error) {
      toast.error("Erro ao excluir transação", {
        icon: <AlertTriangle className="text-rose-500" />,
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Menu user={user} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Filter className="text-blue-600" /> Transações
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Visualize e filtre todas as suas movimentações financeiras
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ← Voltar ao Dashboard
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <input
              type="text"
              name="search"
              placeholder="Buscar por descrição"
              value={filters.search}
              onChange={handleFilter}
              className="border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <select
              name="bankId"
              value={filters.bankId}
              onChange={handleFilter}
              className="border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Todos os Bancos</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.logo ? b.logo + " " : "🏦 "} {b.name}
                </option>
              ))}
            </select>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilter}
              className="border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Todos os Tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
            </select>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilter}
              className="border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilter}
              className="border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">
              {filteredTransactions.length} transações encontradas
            </h3>
            <Search className="text-slate-400" />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Banco
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                      Data
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTransactions.map((t) => {
                    const bank = banks.find(
                      (b) => Number(b.id) === Number(t.bankId)
                    );
                    const data = new Date(t.date).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">{t.description}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              t.type === "entrada"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {t.type === "entrada" ? (
                              <ArrowUp className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDown className="w-3 h-3 mr-1" />
                            )}
                            {t.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {bank
                            ? `${bank.logo ? bank.logo + " " : ""}${bank.name}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500">
                          {data}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg px-3 py-1.5 flex items-center justify-center mx-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-500 py-6">
              Nenhuma transação encontrada com os filtros aplicados
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
