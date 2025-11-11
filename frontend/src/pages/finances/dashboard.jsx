import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Menu from "../../components/menu";
import "../../index.css";
import dayjs from "dayjs";
import {
  ArrowUp,
  ArrowDown,
  DollarSign,
  User,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formatCurrency = (value) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Dashboard() {
  const [finances, setFinances] = useState([]);
  const [banks, setBanks] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("entrada");
  const [selectedBank, setSelectedBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFinances();
    fetchBanks();
    fetchEvents();
  }, [token, navigate]);

  const fetchFinances = async () => {
    try {
      setLoading(true);
      const res = await api.get("/finances", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFinances(res.data);
    } catch (error) {
      console.error("Erro ao carregar finanças:", error);
      toast.error("Erro ao carregar finanças", {
        icon: <AlertTriangle className="text-rose-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await api.get(`/banks/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanks(res.data);
      if (res.data.length > 0) setSelectedBank(Number(res.data[0].id));
    } catch (error) {
      console.error("Erro ao carregar bancos:", error);
      toast.error("Erro ao carregar bancos", {
        icon: <AlertTriangle className="text-rose-500" />,
      });
    }
  };

  const fetchEvents = async () => {
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const res = await api.get(`/events?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const futureEvents = res.data.filter((e) =>
        dayjs(e.date).isAfter(dayjs())
      );
      setEvents(futureEvents);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast.error("Erro ao carregar eventos", {
        icon: <AlertTriangle className="text-rose-500" />,
      });
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!selectedBank) {
      toast.error("Selecione um banco primeiro", {
        icon: <AlertTriangle className="text-rose-500" />,
      });
      return;
    }

    try {
      const numericValue = parseFloat(
        amount.replace(/\./g, "").replace(",", ".")
      );

      if (isNaN(numericValue)) {
        toast.error("Valor inválido", {
          icon: <AlertTriangle className="text-rose-500" />,
        });
        return;
      }

      await api.post(
        "/finances",
        {
          description,
          amount: numericValue,
          type,
          bankId: selectedBank,
          userId: user.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Transação adicionada!", {
        icon: <CheckCircle className="text-emerald-500" />,
      });
      setDescription("");
      setAmount("");
      setType("entrada");
      fetchFinances();
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      toast.error("Erro ao adicionar transação", {
        icon: <AlertTriangle className="text-rose-500" />,
      });
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await api.delete(`/finances/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Transação excluída", {
        icon: <Trash2 className="text-rose-500" />,
      });
      fetchFinances();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Erro ao excluir transação", {
        icon: <AlertTriangle className="text-rose-500" />,
      });
    }
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value === "") {
      setAmount("");
      return;
    }
    value = (Number(value) / 100).toFixed(2);
    value = value.replace(".", ",");
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setAmount(value);
  };

  const totalEntrada = finances
    .filter((f) => f.type === "entrada")
    .reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalSaida = finances
    .filter((f) => f.type === "saida")
    .reduce((sum, f) => sum + (f.amount || 0), 0);
  const saldo = totalEntrada - totalSaida;

  if (!token) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Menu user={user} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 relative">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="mb-6 md:mb-8 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 flex justify-center md:justify-start items-center gap-2">
            <User className="w-6 h-6 md:w-7 md:h-7 text-blue-500" />
            Olá, {user?.name}!
          </h2>
          <p className="text-slate-500 text-sm md:text-base">
            Gerencie suas finanças e bancos de forma inteligente
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Cards resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md p-5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <ArrowUp className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">
                  Entradas
                </h3>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(totalEntrada)}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md p-5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                    <ArrowDown className="w-5 h-5 text-rose-600" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">
                  Saídas
                </h3>
                <p className="text-xl font-bold text-slate-800">
                  {formatCurrency(totalSaida)}
                </p>
              </div>

              <div
                className={`border rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${
                  saldo >= 0
                    ? "border-blue-200 bg-gradient-to-br from-white to-blue-50"
                    : "border-orange-200 bg-gradient-to-br from-white to-orange-50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      saldo >= 0 ? "bg-blue-50" : "bg-orange-50"
                    }`}
                  >
                    <DollarSign
                      className={`w-5 h-5 ${
                        saldo >= 0 ? "text-blue-600" : "text-orange-600"
                      }`}
                    />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">
                  Saldo Total
                </h3>
                <p
                  className={`text-xl font-bold ${
                    saldo >= 0 ? "text-blue-600" : "text-orange-600"
                  }`}
                >
                  {formatCurrency(saldo)}
                </p>
              </div>
            </div>

            {/* Formulário de transação */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-8 p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Nova Transação
                </h3>
                <button
                  onClick={() => navigate("/banks")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Gerenciar Bancos
                </button>
              </div>

              <form
                onSubmit={handleAddTransaction}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4"
              >
                <input
                  type="text"
                  placeholder="Descrição"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Valor (ex: 1.200,50)"
                  value={amount}
                  onChange={handleAmountChange}
                  className="border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
                <select
                  value={selectedBank || ""}
                  onChange={(e) => setSelectedBank(Number(e.target.value))}
                  className="border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Selecione um banco</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.logo ? b.logo + " " : "🏦 "} {b.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Adicionar
                </button>
              </form>
            </div>

            {/* Tabela de finanças */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
              <div className="p-4 md:p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">
                  Transações Recentes
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {finances.length} registros encontrados
                </p>
              </div>

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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {finances.length > 0 ? (
                      finances.map((f) => {
                        const bank = banks.find(
                          (b) => Number(b.id) === Number(f.bankId)
                        );
                        return (
                          <tr key={f.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">{f.description}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  f.type === "entrada"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {f.type === "entrada" ? (
                                  <ArrowUp className="w-3 h-3 mr-1" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 mr-1" />
                                )}
                                {f.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {bank
                                ? `${bank.logo ? bank.logo + " " : ""}${bank.name}`
                                : "-"}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold">
                              {formatCurrency(f.amount)}
                            </td>
                            <td className="px-6 py-4 text-left">
                              {dayjs(f.date).format("DD/MM/YYYY HH:mm")}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDeleteTransaction(f.id)}
                                className="text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg px-3 py-1.5 flex items-center justify-center mx-auto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-slate-500"
                        >
                          Nenhuma transação encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela de eventos */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">
                  Eventos Futuros
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {events.length} registros encontrados
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        Data/Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                        Local
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {events.length > 0 ? (
                      events.map((e) => (
                        <tr key={e.id} className="hover:bg-yellow-50">
                          <td className="px-6 py-4 font-medium">{e.title}</td>
                          <td className="px-6 py-4">
                            {dayjs(e.date).format("DD/MM/YYYY HH:mm")}
                          </td>
                          <td className="px-6 py-4">{e.location || "-"}</td>
                          <td className="px-6 py-4 text-center">-</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-4 text-center text-slate-500"
                        >
                          Nenhum evento futuro encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
