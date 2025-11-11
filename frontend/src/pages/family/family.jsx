import { useState, useEffect } from "react";
import api from "../../services/api";
import Menu from "../../components/menu";
import {
  UserPlus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Users,
  Image as ImageIcon,
  X,
  DollarSign,
  Plus,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Family() {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: "", role: "viewer", avatar: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  // Avatar picker
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarOptions, setAvatarOptions] = useState([]);
  const [avatarPickerTarget, setAvatarPickerTarget] = useState({ type: "new", index: null });

  // Transactions
  const [showTxModal, setShowTxModal] = useState(false);
  const [txTargetMember, setTxTargetMember] = useState(null);
  const [txForm, setTxForm] = useState({ description: "", amount: 0, type: "entrada" });

  // Load members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/family");
        setMembers(res.data);
      } catch (err) {
        toast.error("Erro ao carregar membros.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Add member
  const addMember = async () => {
    if (!newMember.name.trim()) return toast.info("Informe um nome!");
    if (!newMember.avatar) return toast.info("Escolha um avatar!");

    try {
      const res = await api.post("/family", newMember);
      setMembers([...members, res.data]);
      setNewMember({ name: "", role: "viewer", avatar: "" });
      toast.success("Membro adicionado com sucesso!");
    } catch (err) {
      toast.error("Erro ao adicionar membro!");
      console.error(err);
    }
  };

  // Update member
  const updateMember = async (id) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    try {
      const res = await api.put(`/family/${id}`, member);
      setMembers(members.map((m) => (m.id === id ? res.data : m)));
      setEditing(null);
      toast.success("Membro atualizado!");
    } catch (err) {
      toast.error("Erro ao atualizar membro!");
      console.error(err);
    }
  };

  // Delete member
  const deleteMember = async (id) => {
    toast.info("Removendo membro...");
    try {
      await api.delete(`/family/${id}`);
      setMembers(members.filter((m) => m.id !== id));
      toast.success("Membro removido!");
    } catch (err) {
      toast.error("Erro ao remover membro!");
      console.error(err);
    }
  };

  // Avatar picker
  const openAvatarPicker = ({ type = "new", index = null } = {}) => {
    const randomAvatars = Array.from({ length: 12 }, (_, i) => {
      const seed = Math.random().toString(36).substring(2, 8);
      return `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
    });
    setAvatarOptions(randomAvatars);
    setAvatarPickerTarget({ type, index });
    setShowAvatarPicker(true);
  };

  const selectAvatar = async (url) => {
    if (avatarPickerTarget.type === "new") {
      setNewMember((prev) => ({ ...prev, avatar: url }));
      toast.info("Avatar selecionado!");
    } else if (avatarPickerTarget.type === "edit" && Number.isInteger(avatarPickerTarget.index)) {
      const idx = avatarPickerTarget.index;
      const updated = [...members];
      const member = updated[idx];
      if (!member) return;

      updated[idx] = { ...member, avatar: url };
      setMembers(updated);

      try {
        await api.put(`/family/${member.id}`, { ...member, avatar: url });
        toast.success("Avatar atualizado com sucesso!");
      } catch (err) {
        toast.error("Erro ao atualizar avatar!");
        console.error(err);
      }
    }

    setShowAvatarPicker(false);
    setAvatarPickerTarget({ type: "new", index: null });
  };

  const onMemberAvatarClick = (index) => {
    const member = members[index];
    if (!member) return;
    openAvatarPicker({ type: "edit", index });
  };

  // Transactions
  const openTxModalHandler = (member) => {
    setTxTargetMember(member);
    setTxForm({ description: "", amount: 0, type: "entrada" });
    setShowTxModal(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (parseInt(value) || 0) / 100;
    setTxForm({ ...txForm, amount: value });
  };

  const addTransaction = async () => {
    if (!txForm.description.trim() || !txForm.amount)
      return toast.info("Preencha descrição e valor!");
    try {
      await api.post(
        `/family/${txTargetMember.familyId}/member/${txTargetMember.id}/finance`,
        { ...txForm }
      );

      const updated = members.map((m) => {
        if (m.id === txTargetMember.id) {
          const delta = txForm.type === "entrada" ? txForm.amount : -txForm.amount;
          return { ...m, partialBalance: m.partialBalance + delta };
        }
        return m;
      });
      setMembers(updated);
      setShowTxModal(false);
      toast.success("Transação adicionada!");
    } catch (err) {
      toast.error("Erro ao adicionar transação!");
      console.error(err);
    }
  };

  return (
    <div className="flex">
      <Menu />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        {/* Título */}
        <div className="flex items-center gap-2 mb-6">
          <Users size={28} className="text-blue-600" />
          <h1 className="text-2xl font-bold">Membros da Família</h1>
        </div>

        {/* Novo membro */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex gap-3 items-center flex-wrap">
          <input
            className="border rounded-lg px-3 py-2 flex-1"
            placeholder="Nome do membro"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
          />
          <select
            className="border rounded-lg px-3 py-2"
            value={newMember.role}
            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
          >
            <option value="admin">Admin</option>
            <option value="collaborator">Colaborador</option>
            <option value="viewer">Visualizador</option>
          </select>
          <button
            onClick={() => openAvatarPicker({ type: "new" })}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            <ImageIcon size={18} /> Escolher avatar
          </button>
          {newMember.avatar && (
            <img src={newMember.avatar} alt="avatar preview" className="w-12 h-12 rounded-full border" />
          )}
          <button
            onClick={addMember}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <UserPlus size={18} /> Adicionar
          </button>
        </div>

        {/* Lista de membros */}
        {loading ? (
          <p>Carregando...</p>
        ) : members.length === 0 ? (
          <p className="text-gray-500">Nenhum membro cadastrado.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((member, index) => (
              <li
                key={member.id}
                className="bg-white rounded-xl p-4 shadow flex flex-col items-center text-center relative"
              >
                <img
                  src={member.avatar}
                  alt="avatar"
                  className="w-20 h-20 rounded-full mb-2 border cursor-pointer"
                  onClick={() => onMemberAvatarClick(index)}
                />
                {editing === member.id ? (
                  <>
                    <input
                      className="border rounded px-2 py-1 w-full mb-2 text-center"
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...members];
                        updated[index].name = e.target.value;
                        setMembers(updated);
                      }}
                    />
                    <select
                      className="border rounded px-2 py-1 w-full mb-2 text-center"
                      value={member.role}
                      onChange={(e) => {
                        const updated = [...members];
                        updated[index].role = e.target.value;
                        setMembers(updated);
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="collaborator">Colaborador</option>
                      <option value="viewer">Visualizador</option>
                    </select>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(null);
                          updateMember(member.id);
                        }}
                        className="bg-green-600 text-white rounded-full p-2 hover:bg-green-700"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="bg-gray-300 rounded-full p-2 hover:bg-gray-400"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-gray-500 text-sm mb-1">{member.role}</p>
                    <p className="text-gray-700 font-medium mb-3">
                      Saldo: {formatCurrency(member.partialBalance)}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(member.id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                      {member.role !== "viewer" && (
                        <button
                          onClick={() => openTxModalHandler(member)}
                          className="text-green-500 hover:text-green-700 flex items-center gap-1"
                        >
                          <Plus size={16} /> <DollarSign size={16} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Avatar Picker */}
        {showAvatarPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[90%] max-w-2xl shadow-xl relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
                onClick={() => setShowAvatarPicker(false)}
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center">Escolha um avatar</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {avatarOptions.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`avatar-${i}`}
                    className="w-16 h-16 rounded-full border cursor-pointer hover:scale-110 transition"
                    onClick={() => selectAvatar(url)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTxModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
                onClick={() => setShowTxModal(false)}
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Nova Transação - {txTargetMember.name}
              </h2>
              <input
                type="text"
                placeholder="Descrição"
                className="border rounded px-3 py-2 w-full mb-3"
                value={txForm.description}
                onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Valor"
                className="border rounded px-3 py-2 w-full mb-3"
                value={txForm.amount ? formatCurrency(txForm.amount) : ""}
                onChange={handleAmountChange}
              />
              <select
                className="border rounded px-3 py-2 w-full mb-3"
                value={txForm.type}
                onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
              <button
                onClick={addTransaction}
                className="bg-green-600 text-white px-4 py-2 rounded-lg w-full hover:bg-green-700"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={2500} />
      </div>
    </div>
  );
}
