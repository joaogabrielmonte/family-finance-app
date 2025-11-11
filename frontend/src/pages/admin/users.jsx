import { useState, useEffect } from "react";
import api from "../../services/api";
import Menu from "../../components/menu";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  UserPlus,
  Edit,
  Trash2,
  Shield,
  XCircle,
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // 🔹 Buscar usuários
  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("Erro ao buscar usuários");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Adicionar / Editar
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(
          `/admin/users/${editId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await api.post(
          "/admin/users",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Usuário criado com sucesso!");
      }

      setForm({ name: "", email: "", password: "" });
      setEditId(null);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error("Erro ao salvar usuário");
      console.error(err);
    }
  };

  // 🔹 Editar
  const handleEdit = (u) => {
    setEditId(u.id);
    setForm({ name: u.name, email: u.email, password: "" });
    setShowModal(true);
  };

  // 🔹 Excluir
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Usuário excluído!");
      fetchUsers();
    } catch (err) {
      toast.error("Erro ao excluir usuário");
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // 🔹 Alterar Role
  const changeRole = async (id, newRole) => {
    try {
      await api.put(
        `/admin/users/${id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Permissão alterada!");
      fetchUsers();
    } catch (err) {
      toast.error("Erro ao alterar role");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Menu user={user} />
      <ToastContainer />

      <main className="flex-1 p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-blue-600" /> Gerenciar Usuários
          </h2>
          <button
            onClick={() => {
              setEditId(null);
              setForm({ name: "", email: "", password: "" });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            <UserPlus size={18} /> Novo Usuário
          </button>
        </div>

        {/* Tabela */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Permissão</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => confirmDelete(u.id)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() =>
                        changeRole(u.id, u.role === "admin" ? "user" : "admin")
                      }
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Shield size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Criar/Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 relative animate-fadeIn">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
              >
                <XCircle size={22} />
              </button>

              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                {editId ? "Editar Usuário" : "Novo Usuário"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="password"
                  placeholder={
                    editId ? "Nova senha (opcional)" : "Senha"
                  }
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required={!editId}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {editId ? "Atualizar" : "Salvar"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Excluir */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-80">
              <p className="text-slate-700 mb-4">
                Tem certeza que deseja excluir este usuário?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
