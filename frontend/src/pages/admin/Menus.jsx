import { useState, useEffect } from "react";
import Menu from "../../components/menu";
import api from "../../services/api";
import Swal from "sweetalert2";
import * as LucideIcons from "lucide-react";

export default function Menus() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [menus, setMenus] = useState([]);
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Função para pegar componente do ícone
  const getIconComponent = (iconName) => {
    if (!iconName) return null;
    const Icon = LucideIcons[iconName];
    return Icon || null;
  };

  const fetchMenus = () => {
    api
      .get("/menus")
      .then((res) => setMenus(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const resetForm = () => {
    setName("");
    setPath("");
    setIcon("");
    setParentId(null);
    setIsActive(true);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Swal.fire("Atenção!", "O nome do menu é obrigatório", "warning");
      return;
    }

    const payload = {
      name: name.trim(),
      path: path.trim() || null,
      icon: icon || null,
      parentId: parentId ?? null,
      isActive,
    };

    try {
      if (editingId) {
        await api.put(`/menus/${editingId}`, payload);
        Swal.fire("Sucesso!", "Menu atualizado com sucesso", "success");
      } else {
        await api.post("/menus", payload);
        Swal.fire("Sucesso!", "Menu criado com sucesso", "success");
      }
      resetForm();
      fetchMenus();
    } catch (err) {
      console.error(err);
      Swal.fire("Erro!", "Não foi possível salvar o menu", "error");
    }
  };

  const handleEdit = (menu) => {
    setName(menu.name);
    setPath(menu.path || "");
    setIcon(menu.icon || "");
    setParentId(menu.parentId);
    setIsActive(menu.isActive);
    setEditingId(menu.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, menuName) => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: `Deseja excluir o menu "${menuName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/menus/${id}`);
        Swal.fire("Deletado!", "Menu excluído com sucesso", "success");
        if (editingId === id) resetForm();
        fetchMenus();
      } catch (err) {
        console.error(err);
        Swal.fire("Erro!", "Não foi possível excluir o menu", "error");
      }
    }
  };

  // Renderiza menus e submenus recursivamente
  const renderMenu = (menuList) => {
    return menuList.map((menu) => {
      const Icon = getIconComponent(menu.icon);
      return (
        <li
          key={menu.id}
          className="mb-2 border border-gray-200 p-3 rounded-lg bg-white hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && <Icon size={20} className="text-blue-600" />}
              <div>
                <strong className="text-gray-800">{menu.name}</strong>
                {menu.path && (
                  <span className="text-gray-500 ml-2 text-sm">{menu.path}</span>
                )}
                {!menu.isActive && (
                  <span className="text-red-500 ml-2 text-xs font-medium">
                    (Inativo)
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(menu)}
                className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(menu.id, menu.name)}
                className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition text-sm"
              >
                Excluir
              </button>
            </div>
          </div>

          {menu.submenus?.length > 0 && (
            <ul className="ml-6 mt-2 border-l-2 border-gray-200 pl-4">
              {renderMenu(menu.submenus)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Menu user={user} />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-8 text-gray-800 flex items-center gap-2">
            <LucideIcons.FolderTree className="text-blue-600" size={30} />
            Administração de Menus
          </h2>

          {/* Formulário */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
              {editingId ? (
                <>
                  <LucideIcons.Pencil className="text-yellow-500" />
                  Editar Menu
                </>
              ) : (
                <>
                  <LucideIcons.PlusCircle className="text-blue-500" />
                  Novo Menu
                </>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Nome do Menu *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Path (rota)
                </label>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Ícone
                </label>
                <select
                  value={icon || ""}
                  onChange={(e) => setIcon(e.target.value || "")}
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nenhum</option>
                  {Object.keys(LucideIcons).map((iconName) => (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-600">
                  Menu Pai
                </label>
                <select
                  value={parentId || ""}
                  onChange={(e) =>
                    setParentId(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nenhum</option>
                  {menus
                    .filter((m) => m.parentId === null && m.id !== editingId)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700 text-sm">Ativo</span>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                className={`${
                  editingId
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white px-5 py-2 rounded-lg transition font-medium`}
              >
                {editingId ? "Atualizar" : "Salvar"}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition font-medium"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* Lista de Menus */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
              <LucideIcons.List className="text-blue-500" />
              Menus Existentes
            </h3>
            <ul>{renderMenu(menus.filter((m) => m.parentId === null))}</ul>
          </div>
        </div>
      </main>
    </div>
  );
}
