import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Menu from "../components/menu";
import { Trash2, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Banks() {
  const [banks, setBanks] = useState([]);
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("corrente");
  const [logo, setLogo] = useState("");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/login");
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await api.get(`/banks/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanks(res.data);
    } catch {
      toast.error("Erro ao carregar bancos");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/banks",
        { userId: user.id, name, accountType, logo, balance: 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Banco criado!");
      setName("");
      setLogo("");
      fetchBanks();
    } catch {
      toast.error("Erro ao adicionar banco");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/banks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.info("Banco excluído");
      fetchBanks();
    } catch {
      toast.error("Erro ao excluir banco");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      <Menu user={user} />
      <main className="flex-1 p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Meus Bancos</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>

        <form
          onSubmit={handleAdd}
          className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow mb-8"
        >
          <input
            type="text"
            placeholder="Nome do banco"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border px-4 py-2 rounded-lg"
          />
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          >
            <option value="corrente">Corrente</option>
            <option value="poupança">Poupança</option>
            <option value="caixinha">Caixinha</option>
          </select>
          <input
            type="text"
            placeholder="Logo ou emoji"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="border px-4 py-2 rounded-lg"
          />
          <button
            type="submit"
            className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition"
          >
            Criar Banco
          </button>
        </form>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Bancos cadastrados</h3>
          {banks.length === 0 ? (
            <p className="text-slate-500">Nenhum banco encontrado.</p>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="text-left border-b">
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Logo</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-slate-50">
                    <td>{b.name}</td>
                    <td>{b.accountType}</td>
                    <td>{b.logo || "🏦"}</td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-rose-600 hover:text-rose-800"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
