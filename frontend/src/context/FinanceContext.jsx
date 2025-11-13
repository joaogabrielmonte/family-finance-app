// src/context/FinanceContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [saldo, setSaldo] = useState(0);
  const [entradas, setEntradas] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchFinance = async () => {
    if (!user || !token) return;
    try {
      const res = await api.get(`/finance/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaldo(res.data.saldo);
      setEntradas(res.data.entradas);
      setSaidas(res.data.saidas);
    } catch (err) {
      console.error("Erro ao buscar finanças:", err);
    }
  };

  // função que podemos chamar após adicionar/despesa para atualizar os dados
  const refreshFinance = () => fetchFinance();

  useEffect(() => {
    fetchFinance();
  }, []);

  return (
    <FinanceContext.Provider
      value={{ saldo, entradas, saidas, refreshFinance }}
    >
      {children}
    </FinanceContext.Provider>
  );
}
