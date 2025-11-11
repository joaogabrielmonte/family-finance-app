import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Target,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Menu from "../../components/menu";
import api from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchGoals = async () => {
    try {
      const res = await api.get("/goals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGoals(res.data);
    } catch {
      toast.error("Erro ao buscar metas");
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount) {
      toast.error("Título e valor da meta são obrigatórios!");
      return;
    }

    const data = {
      title,
      targetAmount: Number(targetAmount),
      currentAmount:
        currentAmount !== "" ? Number(currentAmount) : Number(targetAmount),
      deadline,
      userId: user.id,
    };

    try {
      if (editId) {
        await api.put(`/goals/${editId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Meta atualizada com sucesso!");
      } else {
        await api.post("/goals", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Meta criada com sucesso!");
      }

      setShowModal(false);
      setTitle("");
      setTargetAmount("");
      setCurrentAmount("");
      setDeadline("");
      setEditId(null);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao salvar meta");
    }
  };

  const handleEdit = (goal) => {
    setEditId(goal.id);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount);
    setCurrentAmount(goal.currentAmount);
    setDeadline(goal.deadline?.split("T")[0] || "");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    toast.info(
      <div className="flex flex-col gap-2">
        <span>Deseja realmente excluir esta meta?</span>
        <div className="flex justify-end gap-2 mt-2">
          <button
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => toast.dismiss()}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={async () => {
              await api.delete(`/goals/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              toast.dismiss();
              toast.success("Meta excluída!");
              fetchGoals();
            }}
          >
            Excluir
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const calcProgress = (goal) => {
    const pct = (goal.currentAmount / goal.targetAmount) * 100;
    return pct > 100 ? 100 : pct;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Menu user={user} />
      <ToastContainer position="top-right" autoClose={3000} />

      <main className="flex-1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="text-blue-600" size={28} /> Metas Financeiras
          </h2>
          <button
            onClick={() => {
              setEditId(null);
              setTitle("");
              setTargetAmount("");
              setCurrentAmount("");
              setDeadline("");
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} /> Nova Meta
          </button>
        </div>

        {goals.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Nenhuma meta cadastrada ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progress = calcProgress(goal);
              const completed = progress >= 100;

              return (
                <div
                  key={goal.id}
                  className={`relative p-5 rounded-xl shadow-lg overflow-hidden text-white transition-transform transform hover:scale-105`}
                  style={{
                    background: `linear-gradient(135deg, ${
                      completed ? "#34D399" : "#3B82F6"
                    } 0%, #1E3A8A 100%)`,
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {completed ? (
                        <CheckCircle2 className="text-white" />
                      ) : (
                        <Circle className="text-white" />
                      )}
                      {goal.title}
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(goal)} className="text-yellow-200 hover:text-yellow-100">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="text-red-200 hover:text-red-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm mb-3 space-y-1">
                    <p>
                      <strong>Meta:</strong> R$ {goal.targetAmount.toFixed(2)}
                    </p>
                    <p>
                      <strong>Atual:</strong> R$ {goal.currentAmount.toFixed(2)}
                    </p>
                    {goal.deadline && (
                      <p>
                        <strong>Prazo:</strong>{" "}
                        {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mt-2">
                    <div
                      className={`h-3 rounded-full bg-white`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1 text-right">{progress.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Target className="text-blue-600" /> {editId ? "Editar Meta" : "Nova Meta"}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <input
                  type="text"
                  placeholder="Título da meta"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Valor total da meta (R$)"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Valor atual (R$)"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-3 pt-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editId ? "Atualizar" : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
