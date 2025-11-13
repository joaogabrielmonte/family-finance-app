import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ adicionado useLocation
import api from "../services/api";
import * as LucideIcons from "lucide-react";
import {
  Menu as MenuIcon,
  X,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar({ user }) {
  const [menus, setMenus] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [themeColor, setThemeColor] = useState(
    localStorage.getItem("themeColor") || "#2563eb"
  );

  const navigate = useNavigate();
  const location = useLocation(); // ✅ pega a rota atual

  // Detecta se é mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Carrega menus
  useEffect(() => {
    api
      .get("/menus")
      .then((res) => setMenus(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Aplica o tema global
  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", themeColor);
  }, [themeColor]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setIsOpen(false);
  };

  const getIconComponent = (iconName) => {
    if (!iconName) return null;
    const formattedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
    return LucideIcons[formattedName] || null;
  };

  return (
    <>
      {/* Botão Mobile */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed z-50 p-2 rounded-lg text-white hover:opacity-90 transition-all shadow-lg
            ${isOpen ? "left-56 top-4" : "left-4 top-4"}`}
          style={{ backgroundColor: themeColor }}
          aria-label="Abrir menu"
        >
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      )}

      {/* Overlay Mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? "fixed" : "sticky top-0"}
          left-0 min-h-screen flex flex-col justify-between
          transition-all duration-300 ease-in-out transform 
          ${
            isMobile
              ? `w-64 transform transition-transform duration-300 ease-in-out ${
                  isOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : isOpen
              ? "w-64"
              : "w-20"
          }
          ${isMobile ? "shadow-2xl z-40" : "z-0"}
        `}
        style={{
          background: `linear-gradient(to bottom, ${themeColor}, ${darkenColor(
            themeColor,
            30
          )})`,
        }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-blue-600/50">
          {isOpen && (
            <h1 className="text-lg font-bold tracking-wide">Finanças Family</h1>
          )}
          {!isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-black/10 transition-colors"
              aria-label="Alternar menu"
            >
              {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {menus
            .filter((item) => item.parentId === null)
            .map((item, index) => {
              if (item.role && item.role !== user?.role) return null;
              const Icon = getIconComponent(item.icon);
              const hasSubmenus = item.submenus && item.submenus.length > 0;
              const isActive = location.pathname === item.path; // ✅ verifica se o menu está ativo

              return (
                <div key={index}>
                  <button
                    onClick={() =>
                      hasSubmenus
                        ? setOpenSubMenu(openSubMenu === index ? null : index)
                        : handleNavigation(item.path)
                    }
                    className={`flex items-center justify-between w-full px-4 py-2 transition-all
                      ${
                        isActive
                          ? "bg-black/30 text-white font-semibold" // ✅ ativo fixo
                          : "hover:bg-black/20"
                      }
                    `}
                  >
                    <div className="flex items-center">
                      {Icon && <Icon className="mr-3 flex-shrink-0" size={18} />}
                      {isOpen && <span>{item.name}</span>}
                    </div>
                    {isOpen && hasSubmenus && (
                      <ChevronDown
                        className={`transition-transform duration-200 ${
                          openSubMenu === index ? "rotate-180" : ""
                        }`}
                        size={16}
                      />
                    )}
                  </button>

                  {/* Submenus */}
                  {hasSubmenus && isOpen && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openSubMenu === index
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-10 space-y-1 py-1">
                        {item.submenus.map((sub, i) => {
                          const SubIcon = getIconComponent(sub.icon);
                          const isSubActive = location.pathname === sub.path; // ✅ submenu ativo

                          return (
                            <button
                              key={i}
                              onClick={() => handleNavigation(sub.path)}
                              className={`flex items-center w-full px-3 py-2 text-sm rounded transition
                                ${
                                  isSubActive
                                    ? "bg-black/30 text-white font-semibold" // submenu ativo
                                    : "text-gray-300 hover:bg-black/20"
                                }
                              `}
                            >
                              {SubIcon && <SubIcon className="mr-2" size={16} />}
                              {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </nav>

        {/* Rodapé */}
        <div className="p-4 border-t border-blue-600/40">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 text-white px-3 py-2 rounded-lg transition ${
              isOpen ? "justify-start" : "justify-center"
            }`}
            style={{ backgroundColor: "#e11d48" }}
          >
            <LogOut size={18} />
            {isOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

/**
 * Escurece uma cor HEX
 * Ex: darkenColor("#2563eb", 20)
 */
function darkenColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
  const b = Math.max(0, (num & 0x0000ff) - percent);
  return `rgb(${r},${g},${b})`;
}
